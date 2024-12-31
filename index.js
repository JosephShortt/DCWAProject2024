var express = require("express");
var mysqlDAO = require("./mySqlDao");
let ejs = require("ejs");

var app = express();
app.set("view engine", "ejs");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3004, () => {
  console.log("Running on port 3004");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/students", (req, res) => {
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

  mysqlDAO
    .getStudents()
    .then((students) => {
      // Find the specific student by sid
      const student = students.find((s) => s.sid == studentId);

      res.render("updateStudent", { student: student, errors: [] });
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post("/students/update/:id", (req, res) => {
  const studentId = req.params.id;
  const { name, age } = req.body;

  const errors = []; // Array to hold any validation errors

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


// In index.js
app.get("/grades", (req, res) => {
  mysqlDAO
      .getGrades()
      .then((data) => {
          res.render("grades", { gradesList: data });
      })
      .catch((error) => {
          res.send(error);
      });
});