var express = require('express')
var mysqlDAO = require('./mySqlDao')
let ejs = require('ejs');

var app = express()
app.set('view engine', 'ejs')


app.listen(3004, () => {
    console.log("Running on port 3004")
})

app.get('/', (req, res) => {
    res.render('home');
  });

app.get("/students", (req, res) => {
    mysqlDAO.getStudents()
    .then((data) => {
        res.render("students", {studentsList: data})
    })
    .catch((error) => {
        res.send(error)
    })
})

app.get("/students/delete/:id",(req,res)=>{
    mysqlDAO.deleteStudent()
    .then((data)=>{
        
    })
    res.send(req.params.id)
})