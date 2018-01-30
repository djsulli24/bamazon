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
    this.idValidation = function() {
        let instance = this;
        connection.query(`SELECT item_id FROM products WHERE item_id = ${this.id};`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                console.log("Invalid product ID. Try again.\n\n");
                instance.renderProducts();
            }
            else {
                instance.quantityPrompt();
            }
        })
    },
    this.quantityValidation = function() {
        let quantity = this.quantity; 
        let instance = this;
        connection.query(`SELECT stock_quantity FROM products WHERE item_id = ${this.id};`, function (error, results, fields) {
            if (error) throw error;
            console.log("Amount existing: " + results[0]["stock_quantity"]);
            console.log("Amount you want: " + quantity);
            if (quantity > results[0]["stock_quantity"]) {
                console.log("\nThe number you wish to purchase of that item is more than we have in stock. Please enter a new number.\n")
                instance.quantityPrompt();
            }
            else {
                instance.doPurchase();
            }
        });
    }
};

module.exports = validation;