const generateSeatQueries = () => {
  const rooms = ['A', 'B', 'C'];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 10;

  // Define price groups
  const priceMap = {
    A: 2000,
    B: 2000,
    C: 2500,
    D: 2500,
    E: 3000,
    F: 3000,
    G: 3500,
    H: 3500,
    I: 5000,
    J: 5000,
  };

  let values = [];

  rooms.forEach((room) => {
    rows.forEach((row) => {
      const price = priceMap[row];
      for (let num = 1; num <= seatsPerRow; num++) {
        // Escape strings to prevent issues
        values.push(`('${room}', '${row}', ${num}, ${price})`);
      }
    });
  });

  const sql = `INSERT INTO seats (room, seat_row, seat_number, price) \nVALUES \n${values.join(',\n')};`;

  return sql;
};

console.log(generateSeatQueries());
