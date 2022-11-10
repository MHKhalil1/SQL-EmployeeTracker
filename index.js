// Required Dependencies.
const mysql2 = require("mysql2");
const inquirer = require("inquirer");
require("console.table");

// SQL Connect.
const connection = mysql2.createConnection({ 
    host: "localhost",
    port: "3306",
    user: "root",
    password: "Password",
    database: "employeesDB"
})

connection.connect(function (err) {
    if (err) throw err;

    firstPrompt();
  });
  
  // This function will give the user the action.
  function firstPrompt(){
    inquirer.prompt([
    {
      type: 'list',
      name:'task',
      message: 'What would you like to do?',
      choices: [
      'View Employees',
      'View Employees By Department',
      'Add Employee',
      'Remove Employee',
      'Update Employee Role',
      'Add Role',
      'Add Department',
      'End'
      ]}
    ])
  
   .then((res)=>{
      console.log(res.task);
      switch(res.task){
        case 'View Employees':
          viewEmployees();
          break;
        case 'View Employees By Department':
          viewEmployeesByDepartment();
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Remove Employee':
          removeEmployee();
          break;
        case 'Update Employee Role':
          updateEmployeeRole();
          break;
        case 'Add Role':
          addRole();
          break;
        case 'Add Department':
          addDepartment();
          break;
        case 'End':
          connection.end();
          break;
        }
        
      }).catch((err)=>{
    if(err)throw err;
    });
  }

// This function is for viewing employees.
function viewEmployees() {
    let query = 
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role
        ON employee.role_id = role.id
    LEFT JOIN department
        ON department.id = role.department_id
    LEFT JOIN employee manager
        ON manager.id = employee.manager_id`
  
    connection.query(query, (err, res)=>{
      if (err) throw err;
      console.table(res);
      firstPrompt();
    });
}

// This function is for viewing employees department.
function viewEmployeesByDepartment(){
    let query =
    `SELECT department.id, department.name, role.salary
    FROM employee
    LEFT JOIN role 
        ON employee.role_id = role.id
    LEFT JOIN department
        ON department.id = role.department_id
    GROUP BY department.id, department.name, role.salary`;
  
  connection.query(query,(err, res)=>{
      if (err) throw err;
      const deptChoices = res.map((choices) => ({
          value: choices.id, name: choices.name
      }));
    console.table(res);
    getDept(deptChoices);
  });
}