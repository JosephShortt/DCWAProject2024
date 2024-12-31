//Set up the mongo database with lecturers collection etc
const MongoClient = require('mongodb').MongoClient

const mysql = require('./mySqlDao'); 
//Connect to localHost
MongoClient.connect('mongodb://127.0.0.1:27017')
.then((client) => {
db = client.db('proj2024MongoDB')
coll = db.collection('lecturers')
})
.catch((error) => {
console.log(error.message)
})

//returns the lecturers from the db
function getLecturers() {
    return new Promise((resolve, reject) => {
        coll.find().sort({"_id":1}).toArray()
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
//Deletes a lecturer if the specific lecturer has no modules from the sql database attached to it
function deleteLecturer(id) {
    return new Promise((resolve, reject) => {
        // Check MySQL module table first
        mysql.getModules()
            .then(modules => {
                const hasModules = modules.some(module => module.lecturer === id);
                //If lecturer has modules, reject with specific error
                if (hasModules) {
                    reject(`Cannot delete lecturer ${id}. He/She has associated modules`);
                } else {
                    //delete the specific lecturer by id
                    return coll.deleteOne({ "_id": id });
                }
            })
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
}

module.exports = { getLecturers, deleteLecturer };

