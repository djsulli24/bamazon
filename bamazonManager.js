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
                this.promptProduct();
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
    promptProduct: function() {
        let name, dept, price, stock;
        let instance = this;
        function promptNameDeptPrice() {
            inquirer.prompt([
                {
                    name: 'name',
                    type: 'input',
                    message: `What is the product name?`
                },
                {
                    name: 'dept',
                    type: 'input',
                    message: `What is the product department?`
                }
            ])
            .then(answer=> {
                name = answer.name;
                dept = answer.dept;
                promptPrice();
            });
        };
        function promptPrice() {
            inquirer.prompt([
                {
                    name: 'price',
                    type: 'input',
                    message: `What is the product price? (omit dollar sign $)`
                }
            ])
            .then(answer=> {
                if (parseFloat(answer.price) > 0) {
                    price = answer.price;
                    promptStock();
                } else {
                    console.log("\nInvalid entry. Enter only numbers.\n")
                    promptPrice();
                }
            });
        }
        function promptStock() {
            inquirer.prompt([
                {
                    name: 'stock',
                    type: 'input',
                    message: `How many units of the product do you wish to add?`                  
                }
            ])
            .then(answer=> {
                if (answer.stock.indexOf(".") === -1 && parseInt(answer.stock) >= 0) {
                    stock = answer.stock;
                    instance.addProduct(name, dept, price, stock);
                } else {
                    console.log("\nInvalid entry. Enter only whole numbers.\n")
                    promptStock();
                }
            });
        }
        promptNameDeptPrice();
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
    },
    addProduct: function(name, dept, price, stock) {
        connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
        VALUES ('${name}', '${dept}', '${price}', '${stock}');`, (err, results, fields)=> {
            if (err) {throw err;}
            else {
                console.log ("\nYou have successfully added your product to the inventory.\n");
                this.againPrompt();
            }
        });
    }
};

bamazonManager.start();