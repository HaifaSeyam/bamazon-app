//Importing packages
var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var colors = require("colors");

//Establish a DB connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Your Password",
    database: "bamazon_db"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    //Calling start function
    startCustomer();
  });

  function startCustomer() {
    inquirer.prompt(
        {
        name: "choice",
        type: "rawlist",
        choices: ["Yes", "No"],
        message: "Hello Bamazon Customer! Would you like to start shopping now?"
        }).then(function(answer) {
          if(answer.choice === "Yes") {
            shopping();
          } else if(answer.choice === "No") {
            endShopping();
          }
        });
      }
  
  //Start of start function
  function shopping(){
    //Selecting all of the products table columns
    //Start of the query
    connection.query("SELECT * FROM products", function (err, result) {
      if (err) throw err;
      var idArr = result.map(result => {return result.id});

      //Display the results in a table
      console.log(colors.green("Bamazon is selling the following items:"));

      var values = [];

      for (var i = 0 ; i < result.length ; i++) {
        values.push([result[i].id, result[i].product_name, result[i].department_name, result[i].price, result[i].stock_quantity])
        
      }
      console.table(["Product ID", "Product", "Department", "Price", "Qunatity in Stock"], values);

      //Prompt two questions to the user
      //Start of prompt
      inquirer.prompt([
        //First Question
        {
          name: "itemID",
          type: "input",
          message: "What is the ID of the product you would like to buy?",
          validate: function(value) {

            if(value === undefined || value == null || value.length <= 0){
              console.log(colors.red("\nInvalid input!")); 
            }  else if (isNaN(value) === false) {
                  if(idArr.indexOf(parseInt(value)) > -1) {
                    return true;
                  } else {
                    console.log(colors.red("\nNot a valid ID"));
                    return false;
                  }
                  
                } else if (isNaN(value) === true){
                  console.log(colors.red("\nNot a valid ID"));
                  return false;
                }
          }
        },
        //Second Question
        {
          name: "requestedAmount",
          type: "input",
          message: "How many units you would like to buy?",
          validate: function(value) {
            if(value === undefined || value == null || value.length <= 0){
              console.log(colors.red("\nInvalid input!")); 
          } else {
              if (isNaN(value) === false) {
                  return true;
                }
                console.log(colors.red("\nNot a valid number"));
                return false;
          }
          }
        }
      ])
      .then(function(answer) {
        //Check if the amount requested is available
        var chosenItem;
        for (var i = 0; i < result.length; i++) {
          if (result[i].id === parseInt(answer.itemID)) {
            chosenItem = result[i];
          }
        }

        if (chosenItem.stock_quantity >= answer.requestedAmount) {
          var newQuantity = chosenItem.stock_quantity - parseInt(answer.requestedAmount);
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
              var cost = chosenItem.price * answer.requestedAmount;
              console.log(colors.yellow("Order placed successfully!"));
              console.log(colors.yellow("Your total cost for " + answer.requestedAmount + " items of " + "'" +
              chosenItem.product_name + "' is: " + "$" + cost.toFixed(2)))
    
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    product_sales: cost
                  },
                  {
                    id: chosenItem.id
                  }
                ],
                function(error) {
                  if (error) throw err;
                }
              );
              purchaseAgain();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log(colors.red("Quantity in stock is not enough!"));
          purchaseAgain();
        }


      });//End of prompt

      });//End of the query
  }//End of start function



  function purchaseAgain() {
    inquirer.prompt(
        {
        name: "choice",
        type: "rawlist",
        choices: ["Yes", "No"],
        message: "Would you like to buy other item?"
        }).then(function(answer) {
          if(answer.choice === "Yes") {
            shopping();
          } else if(answer.choice === "No") {
            endShopping();
          }
        });
      }


  function endShopping() {
    console.log(colors.red("SEE YOU NEXT TIME!"));
    connection.end(); 
}