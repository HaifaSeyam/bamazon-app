var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("console.table");
var colors = require("colors");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Your Password",
    database: "bamazon_db"
  });
  connection.connect(function(err) {
    if (err) throw err;
    startManager();
  });

function startManager() {
    inquirer.prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Sign-Out"],
          message: "What do you want to do?"
        }
    ]).then(function(answer) {

        switch (answer.choice) {
            case "View Products for Sale":
                viewProductsFS();
                break;
            case "View Low Inventory":
                viewLowInv();
                break;
            case "Add to Inventory":
                addToInv();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Sign-Out":
                signOut();
                break;
            default:
                console.log("Error");
        }
    });
}

function viewProductsFS(){
    connection.query("SELECT * FROM products where stock_quantity > 0", function (err, result) {
        if (err) throw err;
      
        console.log(colors.green("\nProducts Available to Sell are: \n"));
        var values = [];

        for (var i = 0 ; i < result.length ; i++) {
            values.push([result[i].id, result[i].product_name, result[i].department_name, result[i].price, result[i].stock_quantity])
            
        }
        console.table(["Product ID", "Product", "Department", "Price", "Qunatity in Stock"], values);

        startManager();
        
    });
}

function viewLowInv(){
    connection.query("SELECT * FROM products where stock_quantity < 5", function (err, result) {
        if (err) throw err;
      
        if (result.length === 0){
            console.log(colors.yellow("\nThere is no low inventory!\n"));
        } else {
            console.log(colors.green("\nProducts With Low Inventory are: \n"));
            var values = [];

        for (var i = 0 ; i < result.length ; i++) {
            values.push([result[i].id, result[i].product_name, result[i].department_name, result[i].stock_quantity])
            
        }
        console.table(["Product ID", "Product", "Department", "Qunatity in Stock"], values);
        }
        
        startManager();
        
    });
}

function addToInv(){
    connection.query("SELECT * FROM departments", function(err, results) {
        if (err) throw err;
        inquirer.prompt({
            name: "choice",
            type: "rawlist",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].department_name);
                }
                return choiceArray;
            },
            message: "To which department you want to add?"
            }).then(function(answer) {
            
            connection.query("SELECT * FROM products WHERE department_name = ?", [answer.choice], function(err, results) {
                if (err) throw err;
                inquirer.prompt([
                    {
                    name: "choice",
                    type: "rawlist",
                    choices: function() {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "Which product you want to add to?"
                    },
                    {
                    name: "numOfNewItems",
                    type: "input",
                    message: "How much would you like to add?",
                    validate: function(value) {
                        if(value === undefined || value == null || value.length <= 0){
                            console.log(colors.red("\nInvalid input!\n")); 
                        } else {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            console.log(colors.red("\nNot a valid number\n"));
                            return false;
                        }
                        }
                    }
                ])
                .then(function(answer) {
                    var chosenItem;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].product_name === answer.choice) {
                            chosenItem = results[i];
                        }
                    }
                    
                    var newQuantity = chosenItem.stock_quantity + parseInt(answer.numOfNewItems);
        
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                        {
                            stock_quantity: newQuantity
                        },
                        {
                            id: chosenItem.id
                        }
                        ],
                        function(error) {
                        if (error) throw err;
                        console.log(colors.yellow("\nInventory updated successfully!\n"));
                        startManager();
                        }
                    );
            });
            
            });
            
            

        });
    });
}

function addNewProduct(){
    connection.query("SELECT * FROM departments", function(err, cohicesResults) {
        if (err) throw err;

    inquirer.prompt([
      {
        name: "productName",
        type: "input",
        message: "What is the product you would like to add?",
        validate: function(value){
            if(value === undefined || value == null || value.length <= 0){
                console.log(colors.red("\nInvalid input!\n")); 
            } else if (isNaN(value) === false){
                console.log(colors.red("\nInvalid input!\n")); 
            } else 
                return true;
        }
      },
      {
        name: "choice",
        type: "rawlist",
        choices: function() {
            var choiceArray = [];
            for (var i = 0; i < cohicesResults.length; i++) {
            choiceArray.push(cohicesResults[i].department_name);
            }
            return choiceArray;
        },
        message: "Which department you want to add to?"
      },
      {
        name: "price",
        type: "input",
        message: "What is your price for this product?",
        validate: function(value) {
            if(value === undefined || value == null || value.length <= 0){
                console.log(colors.red("\nInvalid input!\n")); 
            } else {
                if (isNaN(value) === false) {
                    return true;
                  }
                  console.log(colors.red("\nNot a valid price\n"));
                  return false;
            }
        }
      },
      {
        name: "stockQuantity",
        type: "input",
        message: "How many items of this product you want to add your stock?",
        validate: function(value) {
            if(value === undefined || value == null || value.length <= 0){
                console.log(colors.red("\nInvalid input!\n")); 
            } else {
                if (isNaN(value) === false) {
                    return true;
                  }
                  console.log(colors.red("\nNot a valid quantity\n"));
                  return false;
            }
        }
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO products SET ?",
        {
            product_name: answer.productName,
            department_name: answer.choice,
            price: answer.price,
            stock_quantity: answer.stockQuantity
        },
        function(err) {
          if (err) throw err;
          console.log(colors.yellow("\nYour product has been added successfully!\n"));
          startManager();
        }
      );
    });

});
}


function signOut() {
        console.log(colors.red("SEE YOU NEXT TIME!"));
        connection.end(); 
    }