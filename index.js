var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

const bodyParser = require('body-parser');
const mysql = require('mysql');

// Dav t29march - queries and single mutation for CoreQuestions are now working ok using array as dummy db
// ToDO - updaet Readme to refer to Questions insetad of Courses; then add in connection to MySQL db; do DB first then update readme with results of returned GQL calls

// connect sql with node only (no gql)
// https://www.mysqltutorial.org/mysql-nodejs/connect/
// https://www.sitepoint.com/using-node-mysql-javascript-client/

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

//intead of getting questsin from array above, query DB instead, using generic queryDB method to start with - this uses promises and then in var root

// tue eve - issue may be that promises are not working/setup properly here, so req.mysqlDb is still null/undefined as its not being waited for, so nothig else will work

// NODE CONSOLE ERROR - (node:15816) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 2)
// (node:15816) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

//how to use async/await here instead??
//basically mysqlDB is null or undefined here and im not sure how to give it a value! 
const queryDB = (req, sql, args) => new Promise((resolve, reject) => {
    console.log('inside const queryDB, value of req.mysqlDBBB:')
    //whats value of req.mysqldb, is it actualy connnected??
    console.log(req.mysqlDb);
    //console.log(JSON.stringify(req.mysqlDB, null, 2)); 

    console.log('value of req:')
    //console.log(JSON.stringify(req, null, 2));


    // tue eve - now data is being outputted to node console at least ! do i need to reutrn data instead of the error/obj??
    console.log('whats req.connection?')
    //console.log(JSON.stringify(req.connection, null, 2)); 
    // above line was causeing 'circular errror'


// ISSUE = here! 
// TypeError: Cannot read property 'query' of undefined
    //req.mysqlDb.queryDB() 
    //  req.mysqlDB is undefined, but why??
    //what is mysqlDb??  its supposed to be db connection but inside req obj so it can be passed around?
    //why is it null ?? how to make it not null and add it to request object??
    // req.mysqlDB

    // req.mysqlDb.query(sql, args, (err, rows) => {
    //     if (err) {
    //         return reject(err);
    //     }
    //     console.log('next line')
    //     rows.changedRows || rows.affectedRows || rows.insertId ? resolve(true) : resolve(rows);
    // });

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
// var updateQuestionLabel = ({q_id, newquestion}) => {
//     coreQuestionData.map(question => {
//         if (question.q_id === q_id) {
//             console.log("found question match")
//             question.question = newquestion;
//             return question;
//         }
//     });
//     return coreQuestionData.filter(question => question.q_id === q_id)[0];
// }

// tue eve
// getQuestionInfo: (args, req) => queryDB(req, queryGetQuestionsByID, [args.q_id]).then(data => data[0])

//minor issue - this is meant to get a question by id, but is currently returning all quetsions
// this is workign and outputs values to node console but not to graphql console!
var getQuestionInfo2 = async (args, req) => {
    //connect to mysql here
    const connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'password',
        database: 'corelifedb'
    });

    connection.connect((err) => {
        if (err) {
            console.log('Error connecting to DB: ');
            console.log(err);
            //throw err; // this will give u the stack trace & actual error msg  
            return; 
        }
        console.log('line 240, Connected to MySQL DB!');

    });
 
    console.log('getQuestionInfo2, value of req.mysqlDB: ')
    console.log(req.mysqlDb)
    console.log('getQuestionInfo2, value of connection: ')
    //console.log(connection) //this works ok!

    // try manual query instead???
    // queryDB(req, queryGetQuestionsByID, [args.q_id]).then(data => data[0])
    // connection.query(queryGetBasicQuestions, 

    //shodl await keyword go here, instead of a promise?
    let temp1 = new Promise((resolve, reject) => {connection.query(queryGetQuestionsByID, [args.q_id], (err, rows) => {
        if (err) {
            return reject(err);
        }
        //how/wehre to add a .then()?
        data => data[0]
        console.log('next line 264')

        // this is failing - Rethrow non-MySQL errors, then ReferenceError: resolve is not defined
        rows.changedRows || rows.affectedRows || rows.insertId ? resolve(true) : resolve(rows);
        // resolve(rows)

        console.log('line 280: Data received from DB:');
        console.log(rows);

        //CURRENT ISSUE t30mar 2100 - how to get rows back to the caller or graphql console, insetad of hte node console?
        //return rows
        

    //this throws error - TypeError: connection.query(...).then is not a function    
    // }).then(data => data[0]) ;
    });
    });
        console.log('line 293: whats temp1:');
        console.log(temp1);
    console.log('eof getQuestionInfo2');
    //temp1 is pending!
    return temp1;

    //run query
    // let temp = await queryDB(req, queryGetQuestionsByID, [args.q_id]).then(data => data[0])
    // console.log(temp)
    
} 

// var getQuestionInfo2 = ({q_id}) => {
//     queryDB(req, queryGetQuestionsByID, [q_id]).then(data => data[0])
// }

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
    updateQuestion: updateQuestionVar,
    getQuestionInfo: getQuestionInfo2
    // getQuestionInfo: (args, req) => queryDB(req, queryGetQuestionsByID, [args.q_id]).then(data => data[0])
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
app.use(bodyParser.json({type: 'application/json'}))
app.use(bodyParser.urlencoded({extended: true}))

// Route for CoreQuestion stuff
// FYI rootValue is the graphqlResolvers above
// rootValue: was questionRoot, now rootDB but doenst work - somthing is wrong withn rootDB stuff

// ISSUES here as db isnt being connected to!
//shoudlnt this be calling/opening the db connetion?
app.use('/graphql', graphqlHTTP({
    schema: questionSchema,
    rootValue: questionRoot,
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
// does db conn stuff need to be async??
// Do i have to/am i suppposed to pass in req, resp when im calling thsi from the UI??
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


    //maybe call sql queries from here??
    let queryGetBasicQuestions = `
    SELECT q_id, question, gp_order, points_type 
    FROM ref_core_questions
    `

    // try manual query instead???
    // req.mysqlDb.query(queryGetBasicQuestions, args, (err, rows) => {
    //     if (err) {
    //         return reject(err);
    //     }
    //     console.log('next line 388')
    //     rows.changedRows || rows.affectedRows || rows.insertId ? resolve(true) : resolve(rows);
    //     console.log('Data received from DB:');
    //     console.log(rows);
    // });

//new stuf tues eve - test if db is being connected to
    // req.mysqlDb.query(queryGetBasicQuestions, (err,rows) => {
    // if(err) throw err;
    //   console.log('Data received from DB:');
    //   console.log(rows);
    // });


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

//how to log an object
// console.log(JSON.stringify(rootDB, null, 2)); 