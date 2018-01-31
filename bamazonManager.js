var bamazon = require('./components/bamazon');
var inquirer = require('inquirer');

var bamazonManager = {
    start: function() {
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
                this.addInventory();
                break;
                case "Add New Product":
                this.addProduct();
                break;
            }
        });
    },
    viewProducts: function() {
        console.log("View Proeducts");
    },
    viewInventory: function() {
        console.log("View Inventory");
    },
    addInventory: function() {
        console.log("Add Inventory");
    },
    addProduct: function() {
        console.log("Add Product");
    },
};

bamazonManager.start();