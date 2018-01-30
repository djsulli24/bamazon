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
        console.log ("Yes, going to purchase " + this.currentQuantity + " of product ID " + this.currentID);
    }
};

module.exports = bamazon;