// This module converts results from mysql query into a format
// that can be digested by the table package to render a table on the command line

var tableize = {
    format: function(inputArray) {
        let resultArray = [
            ['ID', 'Product\ Name', 'Department Name', 'Price', 'Stock Quantity']
        ];
        for (var object of inputArray) {
            let rowArray = [];
            for (var property in object) {
                rowArray.push(object[property].toString());
            }
            resultArray.push(rowArray)
        }
        return resultArray;
    }
};

module.exports = tableize;