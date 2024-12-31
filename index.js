//Setting the app up to use express
var express = require("express");
//Creating instances of sql and mongo
var mysqlDAO = require("./mySqlDao");
const mongoDAO = require('./mongoDao');

//Requires ejs
let ejs = require("ejs");

var app = express();
app.set("view engine", "ejs");

//Using body parser to allow parsing of url data
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

//App runs on port 3004
app.listen(3004, () => {
  console.log("Running on port 3004");
});

//Handles get request to display home page
app.get("/", (req, res) => {
  res.render("home");
});

//Handles get request to render the students page
app.get("/students", (req, res) => {
  //Calls getStudents to create a list of students to be passed to students.ejs
  mysqlDAO
    .getStudents()
    .then((data) => {
      res.render("students", { studentsList: data });
    })
    .catch((error) => {
      res.send(error);
    });
});

//get request to get the student by id
app.get("/students/edit/:id", (req, res) => {
  const studentId = req.params.id;

  //Runs through students and finds the student by id
  mysqlDAO
    .getStudents()
    .then((students) => {
      // Find the specific student by sid
      const student = students.find((s) => s.sid == studentId);

      //Renders the updateStudents page passing the specific student with an empty errors array
      res.render("updateStudent", { student: student, errors: [] });
    })
    .catch((error) => {
      res.send(error);
    });
});

//Post method handles update request
app.post("/students/update/:id", (req, res) => {
  //Extracts id from url
  const studentId = req.params.id;
  //Name and age attributes
  const { name, age } = req.body;

  const errors = []; // Array to hold any validation errors

  //Push particular errors to array in case if invalid updates.
  //Name and age are required fields
  if (!name || !age) {
    errors.push("Name and Age are required.");
  }

// Validate name (must be more than 1 character)
if (name && name.length <= 1) {
    errors.push("Student name should be at least 2 characters.");
  }

  // Validate age (must be greater than 18)
  if (age && age < 18) {
    errors.push("Student age should at least 18.");
  }

  // If there are errors, re-render the update form with error messages
  if (errors.length > 0) {
    mysqlDAO
      .getStudents()
      .then((students) => {
        const student = students.find((s) => s.sid == studentId);
        res.render("updateStudent", {
          student: student,
          errors: errors, // Pass the errors to the template
        });
      })
      .catch((error) => {
        res.send(error);
      });
    
  //Else update the student with the updated details and redirect user back to students
  } else {
    mysqlDAO
      .updateStudent(studentId, name, age)
      .then((result) => {
        res.redirect("/students"); // Redirect back to the students list page
      })
      .catch((error) => {
        res.send(error);
      });
  }
});

// GET route to show the form for adding a student
app.get("/students/add", (req, res) => {
  res.render("addStudent", { errors: [], student: null });
});

//post method for adding a student
app.post("/students/add", async (req, res) => {
  const { sid, name, age } = req.body;
  
  // Validation
  const errors = [];
  
  if (!sid || !name || !age) {
      errors.push("All fields are required");
  }
  
  if (name && name.length <= 1) {
      errors.push("Name should be more than 1 character");
  }
  
  if (age && (isNaN(age) || parseInt(age) < 18)) {
      errors.push("Age should be a valid number greater than 18");
  }
  
  try {
    // Check if student ID exists (only if sid is valid)
    if (sid && sid.length === 4) {
        const exists = await mysqlDAO.checkStudentExists(sid);
        if (exists) {
          //If students id already exists, push the error to errors[]
            errors.push("Student ID already exists");
        }
    }

    // If there are any errors, show them all at once
    if (errors.length > 0) {
        return res.render("addStudent", {
            student: { sid, name, age },
            errors: errors
        });
    }

    // If no errors, proceed with adding the student
    await mysqlDAO.addStudent(sid, name, parseInt(age));
    res.redirect("/students");

} catch (error) {
    // Handle any database errors
    res.render("addStudent", {
        student: { sid, name, age },
        errors: ["Database error occurred"]
    });
}
});


//Handles request for grades
app.get("/grades", (req, res) => {
  //Call getGrades in mySqlDao
  mysqlDAO
      .getGrades()
      .then((data) => {
        //Render the grades page passing the list of grades
          res.render("grades", { gradesList: data });
      })
      .catch((error) => {
          res.send(error);
      });
});

//Get lecturers from mongoDao
app.get("/lecturers", (req, res) => {
  mongoDAO.getLecturers()
      .then((data) => {
        //Render the page with list of lecturers 
          res.render("lecturers", { lecturersList: data });
      })
      .catch((error) => {
          res.send(error);
      });
});

//Handle delete for lecturers
app.get("/lecturers/delete/:id", (req, res) => {
  //exttracts lid from url
  const lecturerId = req.params.id;
  
  //Call delete method from mongoDao
  mongoDAO.deleteLecturer(lecturerId)
      .then(() => {
        //Redirect back to lecturers upon successfull deletion
          res.redirect("/lecturers");
      })
      .catch(error => {
          res.render("error", { message: error });
      });
});