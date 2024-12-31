//Uses promise-mysql to handle asynchronous queries
var pmysql = require("promise-mysql");

var pool;

//Create pool to connect to sql database with a limit of 3 connnections
pmysql
  .createPool({
    connectionLimit: 3,
    host: "localhost",
    user: "root",
    password: "root",
    database: "proj2024mysql",
  })
  .then((p) => {
    pool = p;
  })
  .catch((e) => {
    console.log("pool error:" + e);
  });

  //returns all students from student in proj2024mysql
var getStudents = function () {
  return new Promise((resolve, reject) => {
    pool
      .query("SELECT * FROM student")
      .then((data) => {
        console.log(data);
        resolve(data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

//Returns a list of the students with name,module and grade using a join on grade and module
var getGrades = function () {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT 
              s.name as student_name,
              m.name as module_name,
              g.grade
          FROM student s
          LEFT JOIN grade g ON s.sid = g.sid
          LEFT JOIN module m ON g.mid = m.mid
          ORDER BY s.name, g.grade`;

          //Query the pool with defined query
      pool.query(query)
          .then((data) => {
              console.log("Grades data:", data);
              resolve(data);
          })
          .catch((error) => {
              console.log("Error getting grades:", error);
              reject(error);
          });
  });
};

//Update student with the entered details
var updateStudent = function (studentId, name, age) {
  return new Promise((resolve, reject) => {
    //Updates the student with name and age given the id
    const query = "UPDATE student SET name = ?, age = ? WHERE sid = ?";
    const values = [name, age, studentId];

    pool
      .query(query, values)
      .then((data) => {
        console.log("Student updated:", data);
        resolve(data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

//Function that check if the student sid already exists
var checkStudentExists = function (sid) {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) as count FROM student WHERE sid = ?";
    const values = [sid];

    pool
      .query(query, values)
      .then((data) => {
        // data[0].count will be 0 if student doesn't exist, 1 if exists
        resolve(data[0].count > 0);
      })
      .catch((error) => {
        console.log("Error checking student:", error);
        reject(error);
      });
  });
};

//Function to returns module record
var getModules = function() {
  return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM module")
          .then((data) => {
              resolve(data);
          })
          .catch((error) => {
              reject(error);
          });
  });
};
//Function to add student to the student table with the passed details
var addStudent = function (studentId, name, age) {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO student (sid, name, age) VALUES (?, ?, ?)";
    const values = [studentId, name, age];

    pool
      .query(query, values)
      .then((data) => {
        console.log("Student added:", data);
        resolve(data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};


//Export the methods
module.exports = { getStudents, updateStudent, addStudent, checkStudentExists, getGrades, getModules};
