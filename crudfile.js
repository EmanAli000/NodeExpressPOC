const express = require('express');
const fs = require('fs');
const app = express();
let currentStudentId;

app.use(express.json());

let studentsArray = [];

app.get('/api/students',(req,res)=>{
    res.send(studentsArray.sort(compare_item));
});

app.get('/api/students/:grade',(req,res)=>{
    if(req.params.grade > 10 || req.params.grade < 1)
        res.status(400).send('Grades are from 1 to 10');
    else
        res.send(studentsArray.filter(s=>s.grade === parseInt(req.params.grade)).sort(compare_item));  
});

app.post('/api/students',(req,res)=>{
    if(!req.body.name || !req.body.grade || !req.body.score || req.body.grade > 10 || req.body.grade < 1 || req.body.score > 100 || req.body.score < 0)
        return res.status(400).send("Incorrect or Incomplete Data");

    const student = { 
        id : currentStudentId + 1,
        name : req.body.name, 
        grade : req.body.grade, 
        score : req.body.score 
    };
    studentsArray.push(student);
    res.send(student);
    currentStudentId++;
    updateStudentsFile();
    updateMetaDataFile();
});

app.put('/api/students/:id',(req,res)=>{
    let student = studentsArray.find(s=>s.id === parseInt(req.params.id) );

    if(req.body.grade < 1 || req.body.grade > 10 || req.body.score < 0 || req.body.score > 100)
        return res.status(400).send('Incorrect Data');
    if(!student)
        return res.status(400).send('Student not found');
    if(req.body.name)
        student.name = req.body.name;
    if(req.body.grade)
        student.grade = req.body.grade;
    if(req.body.score)
        student.score = req.body.score;
    res.send(student);
    updateStudentsFile();
});

app.delete('/api/students/:id',(req,res)=>{
    let student = studentsArray.find(s=>s.id === parseInt(req.params.id) );
    if(!student)
        return res.status(400).send('Student not found');

    const index = studentsArray.indexOf(student);
    studentsArray.splice(index,1);
    res.send(student);
    updateStudentsFile();
});

const port = 3000 ;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    readData();
});

function readData()
{
    let rawData = fs.readFileSync('students.json');
    let jsonDataArray = JSON.parse(rawData);
    studentsArray = studentsArray.concat(jsonDataArray);
    let metaData = fs.readFileSync('metaDataForStudents.json');
    currentStudentId = JSON.parse(metaData).currentStudentId;
}

function updateStudentsFile()
{
    let jsonStudents = JSON.stringify(studentsArray);
    fs.writeFileSync('students.json',jsonStudents);
}

function updateMetaDataFile()
{
    let jsonCurrentStudentId = JSON.stringify({ "currentStudentId" : currentStudentId });
    fs.writeFileSync('metaDataForStudents.json',jsonCurrentStudentId);
}

function compare_item(a, b){
    if(a.score > b.score){
            return -1;
    }else if(a.item < b.item){
            return 1;
    }else{
            return 0;
    }
}
