var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

const mysql = require('mysql');

// Dav t29march - queries and single mutation for CoreQuestions are now working ok using array as dummy db
// ToDO - updaet Readme to refer to Questions insetad of Courses; then add in connection to MySQL db; do DB first then update readme with results of returned GQL calls

// DB tutorial from https://morioh.com/p/c76d8fadc806
// aka https://blog.logrocket.com/crud-with-node-graphql-react/

// BUT t30march latest errors when running quetsions() query
// "message": "Cannot read property 'query' of undefined",


// Database stuff

// app.use((req, res, next) => {
//     req.mysqlDb = mysql.createConnection({
//         host: '127.0.0.1',
//         user: 'root',
//         password: 'password',
//         database: 'corelifedb'
//     });
//     req.mysqlDb.connect();
//     console.log('Connected !');
//     next();
// });




// === Graph QL stuff

// Construct a schema, using GraphQL schema language
// Dav schema for questions - nnames here must be valid within schema
// var schema = buildSchema(  type Query {     
//     hello: String   });

// var schema = buildSchema(  type User {     
//     id: String     
//     name: String     
//     job_title: String     
//     email: String   }   
//     type Query {     
//         getUsers: [User],     
//         getUserInfo(id: Int) : User   
//     });


// 30march2021 this schmea no longer matches my db!
var questionSchema = buildSchema(`
  "All available queries"
  type Query {
    "Fetch a list of all questions"
    questions: [CoreQuestion]
    "Fetch a single CoreQuestion by ID"
    question(q_id: Int!): CoreQuestion
    "Fetch a single CoreQuestion by ID and see Info"
    getQuestionInfo(q_id: Int!): CoreQuestion
  }
  "All available mutations"
  type Mutation {
    "Update the question based on ID"
    updateQuestion(q_id: Int!, question: String!): CoreQuestion
  }
  "A CoreQuestion object"
  type CoreQuestion {
    "CoreQuestion ID"
    q_id: Int
    "The actual question"
    question: String
    "Order of questions on GP Core form"
    gp_order: Int
    "The type of points, either ascending 123 or descending 321"
    points_type: Int
  }
  "An AnswerLabel object"
  type AnswerLabel {
    "The AnswerLabel scale ID"
    scale_id: Int
    "Label of the Answer"
    label: String
    "Points scored for choosing this answer"
    points: Int
  }
`);

//temp dummy db
//Dav added 28march2021, modelled on HeidiSQL data
const coreQuestionData = [
    {
        q_id: 1,  
        question: "I have felt tense, anxious or nervous",
        gp_order: 1,
        points_type: 123,
        points_id: 123,
        possibleAnswers: [
            {
                scale_id: 10,
                label: "Not all all",
                points: 0
            },
            {
                scale_id: 20,
                label: "Only occasionally",
                points: 1
            }
            ,
            {
                scale_id: 30,
                label: "Sometimes",
                points: 2
            }
        ]
    },
    {
        q_id: 2,  
        question: " I have felt I have someone to turn to for support when needed",
        gp_order: 2,
        points_type: 321,
        points_id: 321,
        possibleAnswers: [
            {
                scale_id: 10,
                label: "Not all all",
                points: 4
            },
            {
                scale_id: 20,
                label: "Only occasionally",
                points: 3
            }
            ,
            {
                scale_id: 30,
                label: "Sometimes",
                points: 2
            }
        ]
    },
];

// Dav Core CoreQuestion stuff
var getQuestion = (args) => {
    var q_id = args.q_id;
    return coreQuestionData.filter(question => question.q_id === q_id)[0];
}

//intead of getting questsin from array above, query DB instead, using generic qeuryDB method to start with - this uses promises and then in var root
const queryDB = (req, sql, args) => new Promise((resolve, reject) => {
    console.log('inside const queryDB')
    //whats value of req.mysqldb, is it actualy connnected??
    req.mysqlDb.query(sql, args, (err, rows) => {
        if (err) {
            return reject(err);
        }
        console.log('next line')
        rows.changedRows || rows.affectedRows || rows.insertId ? resolve(true) : resolve(rows);
    });
    console.log('seomthing else')
});

var getQuestions = (args) => {
    // if (args.topic) {
    //     var topic = args.topic;
    //     return coursesData.filter(course => course.topic === topic);
    // } else {
    //     return coreQuestionData;
    // }
    return coreQuestionData;
}


// var updateQuestionLabel = ({q_id, newQuestion}) => {
//     coreQuestionData.map(questionItem => {
//         if (questionItem.q_id === q_id) {
//             console.log("found match")
//             questionItem.question = newQuestion;
//             return questionItem;
//         }
//     });
//     return coreQuestionData.filter(questionItem => questionItem.q_id === q_id)[0];
// }

// this ISNT working, too many words called 'question' !
//also some issues in console log but no thtis one being printed out, why?
var updateQuestionLabel = ({q_id, newquestion}) => {
    coreQuestionData.map(question => {
        if (question.q_id === q_id) {
            console.log("found question match")
            question.question = newquestion;
            return question;
        }
    });
    return coreQuestionData.filter(question => question.q_id === q_id)[0];
}


//m29march Dav -  this is now working ok!
// orange keywords id and topic probably have to match the schema above!
var updateQuestionVar = ({q_id, question}) => {
    coreQuestionData.map(questionItem => {
        if (questionItem.q_id === q_id) {
            console.log('found questionItem by q_id'); //tiis is output to Node console not browser!
            questionItem.question = question;
            return questionItem;
        }
    });
    //end of callback mapping fn for each item in array
    //this finds the newly updated course based on id and returns it, can return undefined if id & thus course doesnt exist - orange keyword course is not related to orange keyword questionItem but is essentially doing the same thing
    var result = coreQuestionData.filter(questionItem2 => questionItem2.q_id === q_id)[0]
    console.log('heres result questionItem2');
    console.log(result); //returns undefined if id doenst exist
    return result;
}

// The root provides a resolver function for each API endpoint
//these keywords on left of : are like the endpoint and MUST correspond with the keywords within the const/var schema on line 6 'var schema = buildSchema', while on the right are the variables which contain the results/callbacks of functions eg 'var getCourse' on line 91 etc
// Dav root for Questions
const questionRoot = {
    question: getQuestion,
    questions: getQuestions,
    // updateQuestion: updateQuestionLabel
    updateQuestion: updateQuestionVar
};

//how to output results of getLearners ? will get logged to Node console!
// console.log('output of getLearners: ')
// console.log(getLearners)

// from connect.js
let queryGetBasicQuestions = `
    SELECT q_id, question, gp_order, points_type 
    FROM ref_core_questions
    `

// var rootDB = {
//   hello: () => "World"
// };

let queryGetQuestionsByID = `
SELECT q_id, question, gp_order, points_type from ref_core_questions WHERE q_id = ? ;
`

// new db stuff - using promises and then, instead of async/await
// green keywords neesd to be in schema i want to query!
//none of these queries are actually workign! t30march
var rootDB = {
  questions: (args, req) => queryDB(req, queryGetBasicQuestions).then(data => data),
  getQuestionInfo: (args, req) => queryDB(req, queryGetQuestionsByID, [args.q_id]).then(data => data[0])
};
console.log('after var rootDB: ');
console.log(JSON.stringify(rootDB, null, 2)); //obj is empty atm



var app = express();

// Route for CoreQuestion stuff
// FYI rootValue is the graphqlResolvers above
// rootValue: was questionRoot
// ISSUES here as db isnt being connected to!
app.use('/graphql', graphqlHTTP({
    schema: questionSchema,
    rootValue: rootDB,
    // Enable the GraphiQL UI
    graphiql: {
        defaultQuery: "query {\n" +
            "  questions {\n" +
            "    q_id\n" +
            "    question\n" +
            "    points_type\n" +
            "  }\n" +
            "}"
    },
}));


// Database stuff t30march2021 - can call this by going to http://localhost:4004/
app.use((req, res, next) => {
    req.mysqlDb = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'password',
        database: 'corelifedb'
    });
    req.mysqlDb.connect((err) => {
        if (err) {
            console.log('Error connecting to DB: ' + err);
            // console.log(err);
            return; 
        }
        console.log('Connected to MySQL DB!');
        });
    console.log('Line after DB is connected...'); // does this line get logged before DB connection is made, cos im not doing async await?
    next();
});

// connection.connect((err) => {
//     if (err) {
//         console.log('Error connecting to DB: ');
//         console.log(err);
//         //throw err; // this will give u the stack trace & actual error msg  
//         return; 
//     }
//     console.log('Connected to MySQL DB!');
// });



app.listen(4004);
console.log('Running a GraphQL API server at http://localhost:4004/graphql for Core Questions');

// NOTES
// instead of having multiplel end points, u only have 1 Endpoint and u can ask for whatever u want from it ie theres one single 'smart' endpoint, generally used to serve data in json format