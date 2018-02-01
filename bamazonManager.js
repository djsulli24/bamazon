var bamazon = require('./components/bamazon');
var inquirer = require('inquirer');
var mysql = require('mysql');
var tableize = require('./components/tableize');
var table = require('table');
var validation = require('./components/managerValidation')
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

var bamazonManager = {
    start: function() {
        let instance =
        inquirer.prompt([
            {
                name: 'start',
                type: 'list',
                message: 'What would you like to do?',
                choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
            }
        ]).
        then((response)=>{
            switch (response.start) {
                case "View Products for Sale":
                this.viewProducts()
                break;
                case "View Low Inventory":
                this.viewInventory();
                break;
                case "Add to Inventory":
                this.promptInventory();
                break;
                case "Add New Product":
                this.addProduct();
                break;
            }
        });
    },
    viewProducts: function(callback) {
        let instance = this;
        connection.query(`SELECT * FROM products;`, function (error, results, fields) {
            if (error) throw error;
            console.log(table.table(tableize.format(results), tableOptions));
            instance.start();
        });
    },
    viewInventory: function(callback) {
        let instance = this;
        connection.query(`SELECT * FROM products WHERE stock_quantity < 6;`, function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                console.log(`\n--------------------------------------\nThere are no items with low inventory.\n--------------------------------------\n`);
                instance.start();
            } else {
                console.log(table.table(tableize.format(results), tableOptions));
                instance.start();
            }
        });
    },
    promptInventory: function() {
        let instance = this;
        connection.query(`SELECT * FROM products;`, function (error, results, fields) {
            if (error) throw error;
            console.log(table.table(tableize.format(results), tableOptions));
            inquirer.prompt([
                {
                    name: 'id',
                    type: 'input',
                    message: 'Enter the id of the product whose inventory you would like to update.'
                }
            ])
            .then((answer)=>{
                let validate = new validation(parseInt(answer.id));
                Object.setPrototypeOf(validate, instance);
                validate.idValidation();
            })
        })
    },
    addInventory: function(id) {
        inquirer.prompt([
            {
                name: 'amount',
                type: 'input',
                message: `How many units of ID ${id} would you like to add?`
            }
        ])
        .then(answer=> {
            let desiredAdd = parseInt(answer.amount);
            connection.query(`SELECT stock_quantity FROM products WHERE item_id = ${id}`, (err, results, fields)=> {
                if (err) {throw err}
                let currentAmount = results[0]["stock_quantity"];
                let totalAmount = desiredAdd + currentAmount;
                connection.query(`UPDATE products SET stock_quantity = ${totalAmount} WHERE item_id = ${id}`, (err, results, fields)=> {
                    if (err) {throw err}
                    console.log(`You have successfully added ${desiredAdd} units to ID ${id}`)
                    this.againPrompt();
                });
            });
        });
    },
    addProduct: function(callback) {
        return;
    },
    againPrompt: function() {
        inquirer.prompt(
            [
                {
                    name: 'goAgain',
                    type: 'confirm',
                    message: 'Would you like to do anything else?'
                }
            ]
        )
        .then(
            answers => {
                if (answers.goAgain) {
                    this.start();
                }
                else {
                    process.exit();
                }
            }
        );
    }
};

bamazonManager.start();