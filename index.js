

const { table } = require("console");
const inquirer = require("inquirer")
const mysql = require('mysql2');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'test'
    
    
  });

// const connection = mysql.createConnection(
//     "mysql://i9xl1umxqy1o72l2:x6geolvnuoeg0i1y@ohunm00fjsjs1uzy.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/z6vn1y8tcupsugnu"
   
// )

  connection.connect(function(err) {
    if (err) console.log(err);
    connection.query(`CREATE TABLE IF NOT EXISTS department (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(30)
      );`,
  
      //create table role
      //department id is a foreign key into department
      (err, res) => {
        if(err) {
            throw err
        } else {
            // selectView()
            connection.query(`CREATE TABLE IF NOT EXISTS ROLES (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(30),
                salary DECIMAL,
                department_id INT
            )`,
            (err, res) => {
                if(err) {
                    throw err
                }   else {
                    connection.query(`CREATE TABLE IF NOT EXISTS EMPLOYEES (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        first_name VARCHAR(30),
                        last_name VARCHAR(30),
                        role_id INT,
                        manager_id INT
                    )`,
                    (err, res) => {
                        if(err) {
                            throw err
                        } else {
                            selectView()
                        }
                    }
                    )
                }
            }
            )
        }
      }
      )
  })

function selectView() {
    inquirer.prompt(
        {
            name: 'selectView',
            message: 'What would you like to view?',
            choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "done"],
            type: "list"
        }).then(function(answer){
            
            if(answer.selectView === 'view all departments') {
                viewTable('department')
            }
            if (answer.selectView === 'view all roles') {
                viewTable('roles')
            }
            if(answer.selectView === 'view all employees') {
                viewCombinedEmployeesRecord()
            }
            if(answer.selectView === 'add a department') {
                addDepartment()
            }
            if(answer.selectView === 'add a role') {
                addRole()
            }
            if(answer.selectView === 'add an employee') {
                addEmployee()
            }
            if(answer.selectView === 'update an employee role') {
                updateEmployee()
            }
            if (answer.selectView === 'done') {
                closeProgram()
            }
           
            
        })
}

//if statement for if answer is view all roles with function call
//view table roles

function addDepartment() {
    inquirer.prompt([
        {
            name: 'nameOfDepartment',
            message: 'what is the name of the department?',
            type: "input"
        }
    ]).then(function(answer) {
          connection.query(`INSERT into department (name) VALUES ("${answer.nameOfDepartment}")`, (err, res) => {
            if(err) {
                throw err
            } else {
                console.log('Department added successfully')
                selectView()
            }
    }) 
    }) 
}

function addRole() {
    inquirer.prompt([
        {
            name: "nameOfRole",
            message: "what is the name of the role?",
            type: "input"
        },

        {
            name: "salaryOfRole",
            message: "what is the salary of the role?",
            type: "input"
        },

        {
            name: "departmentOfRole",
            message: "what is the department ID that this roles belongs to?",
            type: "input"
        },
    ]).then(function(answer) {
        connection.query(`INSERT INTO roles (title, salary, department_id) VALUES ("${answer.nameOfRole}", ${answer.salaryOfRole}, ${answer.departmentOfRole})`, (err, res) => {
            if(err){
                throw err
            } else {
                selectView()
            }
        })
    })
}

function addEmployee() {
    inquirer.prompt([
        {
            name: "nameOfEmployee",
            message: "what is the first name of the employee?",
            type: "input"
        },

        {
            name: "lastNameOfEmployee",
            message: "what is the last name of the employee?",
            type: "input"
        },

        {
            name: "roleOfEmployee",
            message: "what is the employees role ID?",
            type: "input"
        },

        {
            name: "managerOfEmployee",
            message: "what is the ID of the employees manager?"
        }
    ]).then(function(answer) {
        
        connection.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("${answer.nameOfEmployee}", "${answer.lastNameOfEmployee}", ${answer.roleOfEmployee}, ${answer.managerOfEmployee})`, (err, res) => {
            if(err){
                throw err
            } else {
                selectView()
            }
        })
    })
}

function viewTable(tableName) {
   

    //query departments table in mysql to get data back from server
    //show the data using ctable
    //https://www.npmjs.com/package/console.table
    
    connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
        if(err) {
            throw err
        } else {
            console.table(res)
            selectView()
        }
      }
    )
    

}

function updateEmployee() {
    connection.query(`SELECT id, first_name, last_name FROM employees`, (err, res) => {
        if (err) {
            throw err
        } else {
            const choices = res.map(choice => `${choice.first_name} ${choice.last_name}` )
            
            inquirer.prompt([
                {
                    name: 'updateEmployee',
                    message: 'Who would you like to update?',
                    choices: choices,
                    type: "list"
                }
            ]).then(function(answer){
                    inquirer.prompt([
                        {
                            name: 'newRole',
                            message: 'what is the employees new role',
                            type: 'input'
                        }
                    ]).then(function(roleAnswer){
                        connection.query(`SELECT * FROM roles WHERE title = "${roleAnswer.newRole}"`, (err, res) => {
                            if(err){
                                throw err
                            } else {
                                
                                //check length of array if res.length is >0 proceed with updating employee if equal to 0 there is no role so console log a message no role exists add new role
                                if(res.length >= 1){
                                    const newRoleId = res[0].id
                                    const splitName = answer.updateEmployee.split(' ')
                                    
                                    connection.query(`UPDATE employees SET role_id = ${newRoleId} WHERE (first_name = "${splitName[0]}" AND last_name = "${splitName[1]}") `, (err, res) => {
                                        if(err){
                                            throw err
                                        } else {
                                            console.log('Role Updated Successfully')
                                            selectView()
                                        }
                                    })

                                } else {
                                    console.log("This role does not exists in the database, you'll need to add a new role")
                                    selectView()
                                }
                            }
                        })

                    //figure out from the answer what is the employees id
                    //ask what new role is
                    //call sql update on the role using the id.
                    //select id from employees where firstname = and last name =
                })  
                })
        }
    })
}

// function determineRole(){

// }

function viewCombinedEmployeesRecord() {
    
    
    connection.query(`
        SELECT 
            e.id,
            e.first_name,
            e.last_name,
            r.title,
            d.name as department,
            r.salary,
            CONCAT(ee.first_name,' ', ee.last_name) as manager_name

        FROM 
            employees as e
        LEFT JOIN
            roles as r
        ON 
            e.role_id = r.id
        LEFT JOIN
            department as d
        ON
            r.department_id = d.id
        LEFT JOIN
            employees as ee
        on
            e.manager_id = ee.id
            

    `, (err, res) => {
        if(err){
            throw err
        } else {
            console.table(res)
            selectView()
        }
    })
}

function closeProgram() {
    console.log('closing program hope you had a good time viewing our departments and stuff')
    process.exit()
}

//WHERE WE LEFT OFF: SQL QUERY THAT LINKS 3 TABLES. select from table when user selects view all employees cant call view tables employees need a new function and will look something like. 

//add question objects to .promt array,
//.then at the end of 52 and try to console.log answer. 









// GIVEN a command-line application that accepts user input
// WHEN I start the application
// THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
// WHEN I choose to view all departments
// THEN I am presented with a formatted table showing department names and department ids
// WHEN I choose to view all roles
// THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
// WHEN I choose to add a department
// THEN I am prompted to enter the name of the department and that department is added to the database
// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
// WHEN I choose to add an employee
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database