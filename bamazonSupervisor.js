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
    startSupervisor();
  });

function startSupervisor() {
    inquirer.prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: ["View Product Sales by Department", "Create New Department", "Sign-Out"],
          message: "What do you want to do?"
        }
    ]).then(function(answer) {

        switch (answer.choice) {
            case "View Product Sales by Department":
                viewProdutSalesByDept();
                break;
            case "Create New Department":
                createNewDept();
                break;
            case "Sign-Out":
                signOut();
                break;
            default:
                console.log("Error");
        }
    });
}

function viewProdutSalesByDept(){

  query = "SELECT department_id, products.department_name, over_head_costs, sum(product_sales) as products_sales, ";
  query += "sum(product_sales) - over_head_costs as profit FROM products ";
  query += " INNER JOIN departments ON products.department_name = departments.department_name ";
  query += "GROUP BY department_name ORDER BY department_id";


  connection.query(query, function (err, result) {
    if (err) throw err;

    var values = [];

        for (var i = 0 ; i < result.length ; i++) {
          if (result[i].products_sales === null) {
            continue;
          } else {
            values.push([result[i].department_id, result[i].department_name, result[i].over_head_costs, result[i].products_sales, result[i].profit]);
          }
            
        }
        console.table(["Department ID", "Department", "Over Head Costs", "Products Sales", "Profit/Loss"], values);

    startSupervisor();
    
});
}

function createNewDept() {

  connection.query("SELECT * FROM departments", function (err, result) {
    if (err) throw err;
    var idArr = result.map(result => {return result.id});

  inquirer.prompt([
    {
      name: "departmentName",
      type: "input",
      message: "What is the name of the department you would like to create?",
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
      name: "departmentID",
      type: "input",
      message: "What is the ID for this department?",
      validate: function(value) {

        if(value === undefined || value == null || value.length <= 0){
          console.log(colors.red("\nInvalid input!")); 
        }  else if (isNaN(value) === false) {
              if(idArr.indexOf(parseInt(value)) === -1) {
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
    {
      name: "overHeadCosts",
      type: "input",
      message: "How much is the over head costs of this department?",
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
    }
  ])
  .then(function(answer) {
    connection.query(
      "INSERT INTO departments SET ?",
      {
          department_id: answer.departmentID,
          department_name: answer.departmentName,
          over_head_costs: answer.overHeadCosts,
      },
      function(err) {
        if (err) throw err;
        console.log(colors.yellow("\nYour department has been created successfully!\n"));
        startSupervisor();
      }
    );
  });

});
}

function signOut() {
  console.log(colors.red("SEE YOU NEXT TIME!"));
  connection.end(); 
}