require("dotenv").config();
const mysql = require("mysql");

/*var connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});*/

var connection = mysql.createPool({
  host: "185.178.193.141",
  user: "appproduction.",
  password: "jBa9$6v7",
  database: "cityinfo",
});

exports.connect = () => {
  connection.getConnection(function (err, conn) {});
};
