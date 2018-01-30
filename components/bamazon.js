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

var bamazon = {
    currentID: 0,
    currentQuantity: 0,
    renderProducts: function() {
        connection.query(`SELECT * FROM products WHERE stock_quantity>0;`, function (error, results, fields) {
            if (error) throw error;
            console.log(table.table(tableize.format(results), tableOptions));
            bamazon.purchasePrompt();
        });
    },
    purchasePrompt: function() {
        inquirer.prompt(
            [
                {
                    name: 'productId',
                    type: 'input',
                    message: 'Enter the ID of the product you wish you purchase.'
                }
            ]
        )
        .then(
            answers => {
                bamazon.currentID = parseInt(answers.productId);
                let validate = new validation(parseInt(answers.productId), 0);
                // This sets the prototype of the new validation object to
                // this bamazon object, so that the callback function in 
                // validate can access the methods in bamazon
                Object.setPrototypeOf(validate, this)
                validate.idValidation();
            }
        );
    },
    quantityPrompt: function() {
        inquirer.prompt(
            [
                {
                    name: 'productQuantity',
                    type: 'input',
                    message: 'Enter the quantity of the product you wish you purchase.'
                }
            ]
        )
        .then(
            answers => {
                bamazon.currentQuantity = parseInt(answers.productQuantity);
                let validate = new validation(bamazon.currentID, bamazon.currentQuantity);
                Object.setPrototypeOf(validate, this)
                validate.quantityValidation();
            }
        );
    },
    doPurchase: function() {
        let requestedQuantity = this.currentQuantity;
        let requestedID = this.currentID;
        let instance = this;
        connection.query(`SELECT stock_quantity FROM products WHERE item_id = ${requestedID};`, function (error, results, fields) {
            if (error) throw error;
            let stockQuantity = results[0]["stock_quantity"];
            let newAmount = stockQuantity - requestedQuantity;
            connection.query(`UPDATE products
            SET stock_quantity = ${newAmount}
            WHERE item_id = ${requestedID};`, function (error, results, fields) {
                if (error) throw error;
                connection.query(`SELECT price FROM products WHERE item_id = ${requestedID};`, function (error, results, fields) {
                    if (error) throw error;
                    console.log("\nThe total for this purchase is $" + (results[0]["price"]*requestedQuantity).toFixed(2) + ". It has been charged to your credit card.\n")
                    instance.buyAgainPrompt();
                });
            });
        });
        this.currentID = 0;
        this.currentQuantity = 0;
    },
    buyAgainPrompt: function() {
        inquirer.prompt(
            [
                {
                    name: 'buyagain',
                    type: 'confirm',
                    message: 'You have successfully completed your order. Would you like to purchase something else?'
                }
            ]
        )
        .then(
            answers => {
                if (answers.buyagain) {
                    this.renderProducts();
                }
                else {
                    process.exit();
                }
            }
        );
    }
};

module.exports = bamazon;