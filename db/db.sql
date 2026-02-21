-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MOVIES TABLE
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    duration INT NOT NULL -- minutes
);

-- SHOWTIMES TABLE
CREATE TABLE showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    room CHAR(1) NOT NULL,          -- Room A/B/C
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    UNIQUE (room, show_date, show_time),
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

-- SEATS TABLE
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room CHAR(1) NOT NULL,          -- Room A/B/C
    seat_row CHAR(1) NOT NULL,      -- Row A-J
    seat_number INT NOT NULL,        -- 1-10
    price INT NOT NULL,
    UNIQUE (room, seat_row, seat_number)
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    showtime_id INT NOT NULL,
    total_price INT NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);

-- BOOKING_SEATS TABLE
CREATE TABLE booking_seats (
    booking_id INT NOT NULL,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    PRIMARY KEY (showtime_id, seat_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id)
);
