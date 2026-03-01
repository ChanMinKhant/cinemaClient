-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    balance BIGINT DEFAULT 0,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MOVIES TABLE
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    duration INT NOT NULL, -- minutes
    income BIGINT DEFAULT 0 -- total revenue in Kyats
);

-- SHOWTIMES TABLE
CREATE TABLE showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    room CHAR(1) NOT NULL,          -- Room A/B/C
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (room, show_date, show_time),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- SEATS TABLE
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room CHAR(1) NOT NULL,          -- Room A/B/C
    seat_row CHAR(1) NOT NULL,      -- Row A-J
    seat_number INT NOT NULL,        -- 1-10
    price BIGINT NOT NULL,
    UNIQUE (room, seat_row, seat_number)
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    showtime_id INT NOT NULL,
    total_price BIGINT NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);

-- BOOKING_SEATS TABLE
CREATE TABLE booking_seats (
    booking_id INT NOT NULL,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    PRIMARY KEY (booking_id, seat_id),
    UNIQUE (showtime_id, seat_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id)
);

-- DEPOSITS TABLE
CREATE TABLE deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount BIGINT NOT NULL,
    payment_method ENUM('Wave Pay', 'KBZ Pay', 'AYA Pay', 'uabpay') NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    transaction_last_6 VARCHAR(6) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_note VARCHAR(255), -- Reason for rejection if applicable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- create_booking
-- CALL create_booking(1, 3, '5,6,7');
DELIMITER $$

CREATE PROCEDURE create_booking (
    IN p_user_id INT,
    IN p_showtime_id INT,
    IN p_seat_ids TEXT   -- example: '5,6,7'
)
BEGIN
    DECLARE v_total_price INT DEFAULT 0;
    DECLARE v_user_balance INT;
    DECLARE v_booking_id INT;

    START TRANSACTION;

    -- Calculate total price from seats
    SELECT SUM(price)
    INTO v_total_price
    FROM seats
    WHERE FIND_IN_SET(id, p_seat_ids);

    IF v_total_price IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid seat selection';
    END IF;

    -- Check if seats already booked
    IF EXISTS (
        SELECT 1
        FROM booking_seats
        WHERE showtime_id = p_showtime_id
        AND FIND_IN_SET(seat_id, p_seat_ids)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'One or more seats already booked';
    END IF;

    -- Check user balance
    SELECT balance INTO v_user_balance
    FROM users
    WHERE id = p_user_id;

    IF v_user_balance < v_total_price THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient balance';
    END IF;

    -- Insert booking
    INSERT INTO bookings (user_id, showtime_id, total_price)
    VALUES (p_user_id, p_showtime_id, v_total_price);

    SET v_booking_id = LAST_INSERT_ID();

    -- Insert selected seats
    INSERT INTO booking_seats (booking_id, showtime_id, seat_id)
    SELECT v_booking_id, p_showtime_id, id
    FROM seats
    WHERE FIND_IN_SET(id, p_seat_ids);

    COMMIT;

END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_update_movie_income
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE movies m
    JOIN showtimes s ON s.movie_id = m.id
    SET m.income = m.income + NEW.total_price
    WHERE s.id = NEW.showtime_id;
END$$

DELIMITER ;

-- Validate User Balance Before Booking
DELIMITER $$

CREATE TRIGGER trg_validate_balance_before_booking
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_current_balance BIGINT;

    -- Get the user's current balance
    SELECT balance INTO v_current_balance 
    FROM users 
    WHERE id = NEW.user_id;

    -- If balance is less than the booking price, throw an error
    IF v_current_balance < NEW.total_price THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction Rejected: Insufficient balance in user account.';
    END IF;
END$$

DELIMITER ;

-- Deduct User Balance
DELIMITER $$

CREATE TRIGGER trg_deduct_user_balance
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE users
    SET balance = balance - NEW.total_price
    WHERE id = NEW.user_id;
END$$

DELIMITER ;

--Refund & Reduce Income on Booking Delete
DELIMITER $$

CREATE TRIGGER trg_refund_on_delete
AFTER DELETE ON bookings
FOR EACH ROW
BEGIN
    -- Refund user
    UPDATE users
    SET balance = balance + OLD.total_price
    WHERE id = OLD.user_id;

    -- Reduce movie income
    UPDATE movies m
    JOIN showtimes s ON s.movie_id = m.id
    SET m.income = m.income - OLD.total_price
    WHERE s.id = OLD.showtime_id;
END$$

DELIMITER ;

-- Booking Details
-- SELECT * FROM v_booking_details;
CREATE VIEW v_booking_details AS
SELECT 
    b.id AS booking_id,
    u.username,
    m.title AS movie_title,
    s.room,
    s.show_date,
    s.show_time,
    b.total_price,
    b.booked_at
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN showtimes s ON b.showtime_id = s.id
JOIN movies m ON s.movie_id = m.id;

-- Movie Revenue Summary
-- example top 5 best 
-- SELECT * FROM v_movie_revenue ORDER BY income DESC LIMIT 5;
CREATE VIEW v_movie_revenue AS
SELECT 
    m.id AS movie_id,
    m.title,
    m.income,
    COUNT(b.id) AS total_bookings
FROM movies m
LEFT JOIN showtimes s ON m.id = s.movie_id
LEFT JOIN bookings b ON s.id = b.showtime_id
GROUP BY m.id, m.title, m.income;

-- Seat Availability Per Showtime 
-- SELECT * FROM v_booked_seats WHERE showtime_id = 3;
CREATE VIEW v_booked_seats AS
SELECT 
    bs.showtime_id,
    s.room,
    s.seat_row,
    s.seat_number
FROM booking_seats bs
JOIN seats s ON bs.seat_id = s.id;

-- User Booking History
-- SELECT * FROM v_user_booking_history WHERE user_id = 1;
CREATE VIEW v_user_booking_history AS
SELECT 
    u.id AS user_id,
    u.username,
    m.title,
    s.show_date,
    s.show_time,
    b.total_price,
    b.booked_at
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN showtimes s ON b.showtime_id = s.id
JOIN movies m ON s.movie_id = m.id;

-- Detailed Ticket View (With Seats)
-- for printing tickets 🎫
-- SELECT * FROM v_ticket_details WHERE booking_id = 10;
-- for user
-- SELECT * FROM v_ticket_details WHERE username = 'john' ORDER BY show_date DESC;
CREATE VIEW v_ticket_details AS
SELECT 
    b.id AS booking_id,
    u.username,
    m.title,
    s.show_date,
    s.show_time,
    se.seat_row,
    se.seat_number,
    se.price
FROM booking_seats bs
JOIN bookings b ON bs.booking_id = b.id
JOIN users u ON b.user_id = u.id
JOIN showtimes s ON b.showtime_id = s.id
JOIN movies m ON s.movie_id = m.id
JOIN seats se ON bs.seat_id = se.id;

-- Daily Revenue Report
-- SELECT * FROM v_daily_revenue;
-- SELECT * FROM v_daily_revenue WHERE booking_date = CURDATE();
CREATE VIEW v_daily_revenue AS
SELECT 
    DATE(b.booked_at) AS booking_date,
    SUM(b.total_price) AS daily_income,
    COUNT(b.id) AS total_bookings
FROM bookings b
GROUP BY DATE(b.booked_at);

