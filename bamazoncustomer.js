var table = require('table');
var mysql = require('mysql');
var tableize = require('./tableize');
// This contains the formatting configuration for the table of 
// products that will be shown to the user
const tableOptions = {
    drawHorizontalLine: (index, size) => {
        return index === 0 || index === 1 || index === size;
    }
};
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port     : '3306',
  password : 'root',
  database : 'bamazon'
});

var bamazon = {
    renderProducts: function() {
        connection.query(`SELECT * FROM products;`, function (error, results, fields) {
            if (error) throw error;
            console.log(table.table(tableize.format(results), tableOptions));
        });
    }
};
 
connection.connect();
 
bamazon.renderProducts();
 
connection.end();