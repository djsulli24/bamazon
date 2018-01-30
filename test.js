var table = require('table');
var mysql = require('mysql');
var inquirer = require('inquirer');
var tableize = require('./tableize');
var validation = require('./validation');
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

var validate = new validation(99, 5);
validate.idValidation();
