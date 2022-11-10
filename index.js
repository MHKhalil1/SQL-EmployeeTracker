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

// This function is for picking the department for employees.
function getDept(deptChoices){
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which department would you like',
                choices: deptChoices
            }
        ]).then((res)=>{ 
        let query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name
                    FROM employee
                    JOIN role
                        ON employee.role_id = role.id
                    JOIN department
                        ON department.id = role.department_id
                    WHERE department.id = ?`
  
        connection.query(query, res.department,(err, res)=>{
        if(err)throw err;
          firstPrompt();
          console.table(res);
        });
    })
}

// This function is for adding employees.
function addEmployee() {
    let query = 
    `SELECT role.id, role.title, role.salary
    FROM role`

 connection.query(query,(err, res)=>{
    if(err)throw err;
    const role = res.map(({ id, title, salary }) => ({
      value: id, 
      title: `${title}`, 
      salary: `${salary}`
    }));

    console.table(res);
    employeeRoles(role);
  });
}

// This function is for updating roles.
function employeeRoles(role) {
    inquirer
      .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Employee First Name: "
      },
      {
        type: "input",
        name: "lastName",
        message: "Employee Last Name: "
      },
      {
        type: "list",
        name: "roleId",
        message: "Employee Role: ",
        choices: role
      }
    ]).then((res)=>{
        let query = `INSERT INTO employee SET ?`
        connection.query(query,{
          first_name: res.firstName,
          last_name: res.lastName,
          role_id: res.roleId
        },(err, res)=>{
          if(err) throw err;
          firstPrompt();
      });
    });
  }

  // This function is for removing employees.
function removeEmployee() {
    let query =
    `SELECT employee.id, employee.first_name, employee.last_name
    FROM employee`
  
    connection.query(query,(err, res)=>{
      if(err)throw err;
      const employee = res.map(({ id, first_name, last_name }) => ({
        value: id,
        name: `${id} ${first_name} ${last_name}`
      }));
      console.table(res);
      getDelete(employee);
    });
  }