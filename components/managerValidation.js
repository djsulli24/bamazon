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
    },
    this.quantityValidation = function() {
        let quantity = this.quantity; 
        let instance = this;
        connection.query(`SELECT stock_quantity FROM products WHERE item_id = ${this.id};`, function (error, results, fields) {
            if (error) throw error;
            if (quantity > results[0]["stock_quantity"]) {
                console.log("\n---------------------------------\nThe quantity you wish to purchase \nof that item is more than we \nhave in stock. Please enter a \nnew quantity.\n---------------------------------\n");
                instance.quantityPrompt();
            }
            else if (quantity === 0) {
                console.log("\n---------------------------------\nYou must order at least one item.\n---------------------------------\n");
                instance.quantityPrompt();                
            }
            else {
                instance.doPurchase();
            }
        });
    }
};

module.exports = validation;