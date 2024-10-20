const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs')

const multer = require('multer')
const mysql = require('mysql')
require('dotenv').config();

const crypto = require('crypto');
const { json, response } = require('express');

const app = express();

app.use(express.static('rhino', { extensions: ['html', 'htm'] }))
app.use(express.static('storage', { extensions: ['mp3'] }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jsonParser = bodyParser.json()

test_questions = {}
test_answers = {}
user = {}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './storage/tests/audio/');
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name + '.mp3');
    }
});

const upload = multer({ storage: storage })

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rhino-nhce',
    multipleStatements: true
})

db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('mysql connected');
})

app.listen('8080', () => {
    console.log('listening')
})

app.get('/', (req, res) => {
    res.status(200).send()
})

app.get('/random', (req, res) => {
    res.status(200).send({
        'id': randomInt()
    })
})

app.post('/api/student/register', jsonParser, function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const usn = req.body.usn;
    const sectionId = req.body.sectionId;
    const id = randomInt();
    var sql = `SELECT * FROM students WHERE email = "${email}" OR usn = "${usn}"`;
    db.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
            res.send({
                "info": "already registered"
            });
        } else {
            var sql = `INSERT INTO students (student_id, usn, first_name, last_name, email, section_id, password) VALUES (${id}, "${usn}", "${firstName}","${lastName}","${email}",${sectionId}, "${password}")`
            db.query(sql, function (err, result) {
                if (err) throw err;
                res.send({
                    "info": "registered"
                });
            });
        }
    });
});

app.post('/api/tests/create', jsonParser, (req, res) => {

    const test_id = randomInt()

    console.log("created", test_id)

    //[TODO teahcer id]
    const test_questions = {
        metadata: {
            test_name: '',
            publish_date: '',
            test_duration: '',
            test_passing: '',
            teacher_id: req.body.teacher_id,
            test_id: test_id,
            level_info: '',
            test_info: '',
            description: '',
            resource_only: false
        },
        questions: [
            {
                'id': '000',
                'visibility': 'quiz',
                'question': 'Question goes here',
                'questionType': 'reading',
                'answerType': 'choice',
                'choices': ['Answer choice 1', 'Answer choice 2', 'Answer choice 3', 'Answer choice 4']
            }
        ]
    }

    //write questions file
    fs.writeFile(`./storage/tests/tests/${test_id}.json`, JSON.stringify(test_questions), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }

        test_answers = { '000': 0 }

        //write answers file
        fs.writeFile(`./storage/tests/answers/${test_id}.json`, JSON.stringify(test_answers), 'utf8', function (err) {
            if (err) {
                fs.unlinkSync(`./storage/tests/tests/${test_id}.json`);
                return console.log(err);
            }

            //insert test in table
            const sql = `INSERT INTO tests values(${test_id}, 'Test', curdate(), ${req.body.teacher_id}, 'unfinished', false)`
            db.query(sql, function (err, result) {
                if (err) { throw err }

                //generate tests list
                const sql = `SELECT * FROM tests WHERE teacher_id = ${req.body.teacher_id}`
                db.query(sql, function (err, result) {
                    if (err) { throw err }

                    tests = {}

                    Object.values(JSON.parse(JSON.stringify(result))).forEach((test) => {
                        tests[test.test_id] = {
                            name: test.test_name,
                            test_id: test.test_id
                        }
                    })

                    res.status(200).location(`/tests/create?test_id=${test_id}`).send({
                        'teacher_id': req.body.teacher_id,
                        'test_id': test_id,
                        'tests': tests
                    })

                })
            })

        })
    })

})

app.post('/api/tests/save', jsonParser, (req, res) => {

    const id = req.body.test_id

    console.log(`saved ${id}`)

    const questionData = req.body.questions

    for (var i; i < questionData.questions.length; i++) {
        if (questionData.questions[i].questionType = 'listening') {
            questionData.questions[i]['audiosrc'] = `./storage/tests/audio/${id}-${questionData.questions[i].id}`
        }
    }

    fs.writeFile(`./storage/tests/tests/${id}.json`, JSON.stringify(questionData), 'utf8', function (err) {
        if (err) {
            res.status(400).send({ 'error': 'failed' })
            return console.log(err);
        }
        fs.writeFile(`./storage/tests/answers/${id}.json`, JSON.stringify(req.body.answers), 'utf8', function (err) {
            if (err) {
                res.status(400).send({ 'error': 'failed' })
                return console.log(err);
            }
            console.log(questionData.metadata.resource_only)
            const sql = `UPDATE tests SET test_name = '${questionData.metadata.test_name}', resource_only = ${questionData.metadata.resource_only} WHERE test_id = ${req.body.test_id};`
            db.query(sql, function (err, result) {
                if (err) { throw err }
                res.status(200).send()
            })
        });
    });
})

app.post('/api/tests/audio/upload/', upload.any('file'), (req, res) => {
    res.status(200).send()
})

app.post('/api/tests/get', jsonParser, (req, res) => {

    const id = req.body.test_id;

    console.log("loaded", id)

    var test_questions = {}
    var test_answers = {}

    fs.readFile(`./storage/tests/tests/${id}.json`, 'utf8', function (err, questions) {
        if (err) {
            console.log(err)
            res.status(404).send({ 'error': 'error' }).end()
            return
        }
        const test_questions = questions
        fs.readFile(`./storage/tests/answers/${id}.json`, 'utf8', function (err, answers) {
            if (err) {
                console.log(err)
                res.status(404).send({ 'error': 'error' }).end()
            }
            const test_answers = answers
            res.status(200).send({
                'questions': JSON.parse(test_questions),
                'answers': JSON.parse(test_answers),
                'teacher_id': req.body.teacher_id
            }).end()
        })
    })
})

//list quiz
app.post('/api/tests/list', jsonParser, (req, res) => {

    //generate tests list
    const sql = `SELECT * FROM tests WHERE teacher_id = ${req.body.teacher_id}`
    db.query(sql, function (err, result) {

        if (err) { throw err }

        tests = {}

        Object.values(JSON.parse(JSON.stringify(result))).forEach((test) => {
            tests[test.test_id] = {
                name: test.test_name,
                test_id: test.test_id,
                status: test.status
            }
        })

        res.status(200).location(`/tests/create?testId=${req.body.test_id}`).send({
            'teacher_id': req.body.teacher_id,
            'tests': tests
        })

    })

})

//delete quiz [TODO- delete audio files too]
app.post('/api/tests/delete', jsonParser, (req, res) => {

    console.log(`deleted test ${req.body.test_id}`)

    const sql = `DELETE from tests WHERE test_id = ${req.body.test_id} AND teacher_id = ${req.body.teacher_id}`
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }


        fs.unlink(`./storage/tests/tests/${req.body.test_id}.json`, function (err) {

            let response = ''

            if (err && err.code == 'ENOENT') {
                response = 'File not found.'
            } else if (err) {
                response = 'error'
                console.log(err)
            } else {
                fs.unlink(`./storage/tests/answers/${req.body.test_id}.json`, function (err) {

                    if (err && err.code == 'ENOENT') {
                        response = 'File not found.'
                    } else if (err) {
                        response = 'error'
                        console.log(err)
                    } else {
                        response = 'File removed.'
                    }

                    const sql = `SELECT * FROM tests WHERE teacher_id = ${req.body.teacher_id}`
                    db.query(sql, (err, result) => {
                        if (err) {
                            console.log(err)
                        }

                        tests = {}

                        Object.values(JSON.parse(JSON.stringify(result))).forEach((test) => {
                            tests[test.test_id] = {
                                name: test.test_name,
                                test_id: test.test_id
                            }
                        })

                        res.status(200).send({
                            'tests': tests
                        })
                    })
                })
            }
        });
    })
})

//enable quiz
app.post('/api/tests/enable', jsonParser, (req, res) => {

    console.log(`enabled test ${req.body.test_id}`)

    const sql = `UPDATE tests SET status='active' WHERE test_id = ${req.body.test_id} AND teacher_id = ${req.body.teacher_id}`
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }
        res.status(200).send({})
    })
})

//disable quiz
app.post('/api/tests/disable', jsonParser, (req, res) => {

    console.log(`disabled test ${req.body.test_id}`)

    const sql = `UPDATE tests SET status='finished' WHERE test_id = ${req.body.test_id} AND teacher_id = ${req.body.teacher_id}`
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }
        res.status(200).send({})
    })
})

app.post('/api/tests/grade', jsonParser, (req, res) => {
    const sql = `SELECT * FROM marks WHERE test_id = ${req.body.test_id}`
    db.query(sql, function (err, result) {

        if (err) { throw err }

        fs.readFile(`./storage/tests/answers/${req.body.test_id}.json`, 'utf8', function (err, data) {
            if (err) {
                console.log(err)
                res.status(404).send({ 'error': 'error' }).end()
                return
            }

            const answer_key = JSON.parse(data);

            Object.values(JSON.parse(JSON.stringify(result))).forEach((answer) => {

                fs.readFile(`./storage/students/answers/${answer.answer_id}.json`, 'utf8', function (err, data) {
                    if (err) {
                        console.log(err)
                        res.status(404).send({ 'error': 'error' }).end()
                        return
                    }

                    const answer_sheet = JSON.parse(data)

                    let score = 0

                    console.log(answer_sheet)

                    Object.keys(answer_key).forEach((key_id) => {

                        if (answer_sheet.answers[key_id].answerType == 'choice' && answer_key[key_id] == answer_sheet.answers[key_id].answer) {
                            score += 1
                        }
                    })

                    const sql = `UPDATE marks SET score = ${score} WHERE answer_id = ${answer.answer_id}`

                    db.query(sql, function (err, result) {
                        if (err) { throw err }
                    })

                })
            })

        })

        res.status(200).send({})

    })
})

app.post('/api/tests/grade/list', jsonParser, (req, res) => {
    let sql = `(SELECT marks.answer_id, marks.student_id, marks.test_id, marks.score, students.usn, students.first_name, students.last_name FROM marks, students WHERE test_id = ${req.body.test_id})`
    sql = `
    SELECT marks.*, students.*
    FROM marks
    JOIN students
    ON marks.student_id = students.student_id
    WHERE marks.test_id = ${req.body.test_id};`
    db.query(sql, function (err, result) {

        if (err) { throw err }

        tests = {}

        Object.values(JSON.parse(JSON.stringify(result))).forEach((test) => {
            tests[test.test_id] = {
                name: test.test_name,
                test_id: test.test_id
            }
        })

        res.status(200).send({
            'data': Object.values(JSON.parse(JSON.stringify(result))),
        })

    })
})

app.post('/api/resource/create', jsonParser, (req, res) => {

    const resourceId = randomInt()

    const body = req.body

    console.log("created resource", resourceId)

    const resource = {
        metadata: {
            resource_name: 'Title',
            publish_date: '',
            teacher_id: body.teacher_id,
            resource_ID: resourceId,
            resource_info: '',
            description: ''
        },
        data: {
            "000": {
                type: 'text-heading',
                text: 'Add heading here',
            },
            "001": {
                type: 'video-youtube',
                id: '5T6zglM1Onc',
            },
            "002": {
                type: 'text-paragraph',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus feugiat eget lectus nec varius. Mauris at risus lorem. Morbi dictum quis purus sit amet tempor. Nulla feugiat justo vel erat scelerisque, eu commodo diam bibendum. Sed ullamcorper massa nec rhoncus vehicula. Proin egestas, metus nec vestibulum pellentesque, nunc ligula viverra quam, imperdiet varius lorem augue sed justo. Cras accumsan vestibulum orci, sit amet ullamcorper dolor elementum eu. Etiam sed accumsan ipsum, a placerat odio. Donec finibus erat quis lectus ornare, eget feugiat justo tempor. Mauris ut vestibulum magna, at malesuada neque. Etiam sit amet neque sit amet enim bibendum sodales vel eu diam. Quisque congue, urna nec tincidunt placerat, augue augue dignissim neque, nec cursus arcu est id nibh. Fusce ornare suscipit fermentum.',
            },
            "003": {
                type: 'quiz',
                name: 'quiz',
                id: ''
            }
        }
    }

    fs.writeFile(`./storage/resources/${resourceId}.json`, JSON.stringify(resource), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        const sql = `INSERT INTO resources values(${resourceId}, ${resourceId}, curdate(), ${body.teacher_id}, 'unfinished')`
        db.query(sql, function (err, result) {
            if (err) { throw err }
        })
    })

    resources = {}

    const sql = `SELECT * FROM resources WHERE teacher_id = ${body.teacher_id}`
    db.query(sql, function (err, result) {
        if (err) { throw err }
        Object.values(JSON.parse(JSON.stringify(result))).forEach((resource) => {
            resources[resource.resource_id] = {
                name: resource.resource_name,
                resource_id: resource.resource_id
            }
        })
    })

    res.status(200).send({
        'resource_id': resourceId,
        'resources': resources
    })

})

app.post('/api/resource/save', jsonParser, (req, res) => {

    const id = req.body.resourceId

    console.log(`saved resource ${id}`)

    const resourceData = JSON.parse(req.body.resourceData)

    //[TO-DO audio e material]
    // for(var i; i<questionData.questions.length; i++){
    //     if(questionData.questions[i].questionType = 'listening'){
    //         questionData.questions[i]['audiosrc'] = `./storage/tests/audio/${id}-${questionData.questions[i].id}`
    //     }
    // }

    fs.writeFile(`./storage/resources/${id}.json`, JSON.stringify(resourceData), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        const sql = `UPDATE resources SET resource_name = '${resourceData.metadata.resource_name}' WHERE resource_id = ${id}`
        db.query(sql, function (err, result) {
            if (err) { throw err }
            res.status(200).send()
        })
    })
})

//delete quiz [TODO- delete audio files too]
app.post('/api/resource/delete', jsonParser, (req, res) => {

    console.log(`deleted test ${req.body.test_id}`)

    const sql = `DELETE from resources WHERE resource_id = ${req.body.resource_id} AND teacher_id = ${req.body.teacher_id}`
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }

        fs.unlink(`./storage/resources/${req.body.resource_id}.json`, function (err) {

            if (err && err.code == 'ENOENT') {
                r = 'File not found.'
            } else if (err) {
                r = 'error'
                console.log(err)
            } else {
                r = 'File removed.'
            }

            const sql = `SELECT * FROM resources WHERE teacher_id = ${req.body.teacher_id}`
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err)
                }

                resources = {}

                Object.values(JSON.parse(JSON.stringify(result))).forEach((resource) => {
                    resources[resource.resource_id] = {
                        name: resource.resource_name,
                        resource_id: resource.resource_id,
                        status: resource.status,
                    }
                })

                res.status(200).send({
                    'resources': resources
                })
            })
        })

    })
})

app.post('/api/resource/list', jsonParser, (req, res) => {

    const resources = {}

    body = req.body

    const sql = `SELECT * FROM resources WHERE teacher_id = ${body.teacher_id}`
    db.query(sql, function (err, result) {
        if (err) { throw err }
        Object.values(JSON.parse(JSON.stringify(result))).forEach((resource) => {
            resources[resource.resource_id] = {
                name: resource.resource_name,
                resource_id: resource.resource_id,
                status: resource.status
            }
        })
        res.status(200).send({
            'resources': resources
        })
    })
})

app.get('/api/resource/get', (req, res) => {

    const id = req.query.resourceId;

    console.log("loaded resource", id)

    fs.readFile(`./storage/resources/${id}.json`, 'utf8', function (err, resource) {
        if (err) {
            console.log(err)
            res.status(404).send({ 'error': 'error' }).end()
            return
        }
        res.status(200).json({
            'resource': resource
        })
    })

    //res.status(404).send()

})

app.post('/api/student/resource/list', jsonParser, (req, res) => {

    const resources = {}

    body = req.body

    const sql = `SELECT * FROM resources WHERE teacher_id = ${body.teacher_id} AND status='active'`
    db.query(sql, function (err, result) {
        if (err) { throw err }
        Object.values(JSON.parse(JSON.stringify(result))).forEach((resource) => {
            resources[resource.resource_id] = {
                name: resource.resource_name,
                resource_id: resource.resource_id
            }
        })
        res.status(200).send({
            'resources': resources
        })
    })
})

//enable quiz
app.post('/api/resource/enable', jsonParser, (req, res) => {

    console.log(`enabled resource ${req.body.resource_id}`)

    const sql = `UPDATE resources SET status='active' WHERE resource_id = ${req.body.resource_id} AND teacher_id = ${req.body.teacher_id}`
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }
        res.status(200).send({})
    })
})

//disable quiz
app.post('/api/resource/disable', jsonParser, (req, res) => {

    console.log(`disabled resource ${req.body.resource_id}`)

    console.log(req.body)

    const sql = `UPDATE resources SET status='finished' WHERE resource_id = ${req.body.resource_id} AND teacher_id = ${req.body.teacher_id}`
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }
        res.status(200).send({})
    })
})

app.get('/api/student/get', (req, res) => {

    const id = req.query.id;

    var sql = `SELECT * FROM students WHERE student_id = '${id}';`
    db.query(sql, function (err, result) {
        if (err) throw err;

        res.send({
            "data": Object.values(JSON.parse(JSON.stringify(result)))[0]
        });
    });

    //res.status(200).send(students[id])
})

app.get('/api/student/tests/get', (req, res) => {

    console.log(req.query)
    const id = req.query.testId;

    fs.readFile(`./storage/tests/tests/${id}.json`, 'utf8', (err, data) => {
        if (err) {
            console.log(err)
            res.status(404).send({ 'error': 'error' }).end()
            return
        }
        res.status(200).send({
            'questions': JSON.parse(data)
        })
    })

})

app.post('/api/student/answers/get', jsonParser, (req, res) => {

    //generate tests list
    const sql = `SELECT * FROM marks WHERE teacher_id = ${req.body.teacher_id} AND AND test_id = ${req.body.test_id})`
    db.query(sql, function (err, result) {

        if (err) { throw err }

        tests = {}

        Object.values(JSON.parse(JSON.stringify(result))).forEach((test) => {
            tests[test.test_id] = {
                name: test.test_name,
                test_id: test.test_id,
                status: test.status
            }
        })

        res.status(200).location(`/tests/create?testId=${req.body.test_id}`).send({
            'teacher_id': req.body.teacher_id,
            'tests': tests
        })

    })

})

app.post('/api/student/tests/list', jsonParser, (req, res) => {

    //generate tests list
    const sql = `SELECT * FROM tests WHERE teacher_id = ${req.body.teacher_id} AND resource_only = 0 AND test_id NOT IN (SELECT test_id FROM marks WHERE student_id=${req.body.student_id})`
    db.query(sql, function (err, result) {

        if (err) { throw err }

        tests = {}

        Object.values(JSON.parse(JSON.stringify(result))).forEach((test) => {
            tests[test.test_id] = {
                name: test.test_name,
                test_id: test.test_id,
                status: test.status
            }
        })

        res.status(200).location(`/tests/create?testId=${req.body.test_id}`).send({
            'teacher_id': req.body.teacher_id,
            'tests': tests
        })

    })

})

app.post('/api/student/tests/submit', jsonParser, (req, res) => {

    const id = randomInt()

    console.log(req.body)

    fs.writeFile(`./storage/students/answers/${id}.json`, JSON.stringify(req.body.answers), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }

        const sql = `INSERT INTO marks(answer_id, student_id, test_id, score) VALUES(${id}, ${req.body.answers.metadata.studentid}, ${req.body.answers.metadata.testid},NULL)`
        db.query(sql, function (err, result) {

            if (err) { throw err }

            res.status(200).send()


            // res.status(200).location(`/tests/create?testId=${req.body.test_id}`).send({
            //     'teacher_id': req.body.teacher_id,
            //     'tests': tests
            // })

        })

    })
})

app.get('/api/teacher/get', (req, res) => {

    const id = req.query.id;

    const sql = `SELECT * FROM teachers WHERE teacher_id = '${id}';`
    db.query(sql, function (err, result) {
        if (err) {
            return res.status(404).send()
        };

        res.send({
            "data": Object.values(JSON.parse(JSON.stringify(result)))[0]
        });
    });

    //res.status(200).send(students[id])
})

function randomInt() {
    return Math.floor(Math.random() * (2147483647 - 1000000000) + 1000000000);
}
