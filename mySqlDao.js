var pmysql = require("promise-mysql");

var pool;

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


  var getStudents = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM student')
        .then((data) => {
            console.log(data)
            resolve(data)
        })
        .catch((error) => {
            console.log(error)
            reject(error)
        })
    })
}

var updateStudent = function(studentId, name, age) {
  return new Promise((resolve, reject) => {
      const query = 'UPDATE student SET name = ?, age = ? WHERE sid = ?';
      const values = [name, age, studentId];

      pool.query(query, values)
          .then((data) => {
              console.log('Student updated:', data);
              resolve(data);
          })
          .catch((error) => {
              console.log(error);
              reject(error);
          });
  });
};

var addStudent = function(studentId, name, age){
  return new Promise((resolve,reject)=>{
    const query = 'INSERT INTO student (sid, name, age) VALUES (?, ?, ?)';
    const values = [studentId, name, age];

    pool.query(query, values)
    .then((data) => {
        console.log('Student added:', data);
        resolve(data);
    })
    .catch((error) => {
        console.log(error);
        reject(error);
    });
  })
}



module.exports = { getStudents,updateStudent,addStudent } 