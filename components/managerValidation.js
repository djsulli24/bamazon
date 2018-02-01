// This module validates the manager's entered product ID
// against the IDs in the db, then
// calls the appropriate callback function

var mysql = require('mysql');
var bamazon = require('./bamazon');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    port     : '3306',
    password : 'root',
    database : 'bamazon'
  });

function validation(id, quantity) {
    this.id = id;
    this.quantity = quantity;
    this.idValidation = function(failureCallback, successCallback) {
        let instance = this;
        connection.query(`SELECT item_id FROM products WHERE item_id = ${this.id};`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                console.log(`\n------------------------------\nInvalid product ID. Try again.\n------------------------------\n`);
                instance.promptInventory();
            }
            else {
                instance.addInventory(instance.id);
            }
        })
    }
};

module.exports = validation;