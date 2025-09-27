const mysql = require("mysql2/promise");

const query = async (query, params = []) => {
  try {
    // create the connection to database
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "todoapp",
      password: "P@ssw0rd",
    });

    // execute will internally call prepare and query
    const [results, fields] = await connection.execute(query, params);

    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
    return results;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  query,
};
