var express = require('express')
var mysqlDAO = require('./mySqlDao')
let ejs = require('ejs');

var app = express()
app.set('view engine', 'ejs')

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));


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

app.get("/students/edit/:id",(req,res)=>{
    const studentId = req.params.id;

    mysqlDAO.getStudents()
    .then((students) => {
        // Find the specific student by sid
        const student = students.find(s => s.sid == studentId);

        res.render('updateStudent', { student: student });
       
    })
    .catch((error) => {
        res.send(error);
    });
})

app.post("/students/update/:id", (req, res) => {
    const studentId = req.params.id;
    const { name, age } = req.body;

    // Ensure the name and age are valid
    if (!name || !age) {
        return res.send("Name and Age are required.");
    }

    mysqlDAO.updateStudent(studentId, name, age)
        .then((result) => {
            res.redirect("/students");  // Redirect back to the students list page
        })
        .catch((error) => {
            res.send(error);
        });
});
