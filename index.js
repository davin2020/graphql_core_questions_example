var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

// Dav t29march - queries and single mutation for CoreQuestions are now working ok using array as dummy db
// ToDO - updaet Readme to refer to Questions insetad of Courses; then add in connection to MySQL db; do DB first then update readme with results of returned GQL calls

// Construct a schema, using GraphQL schema language
// Dav schema for questions - nnames here must be valid within schema
var questionSchema = buildSchema(`
  "All available queries"
  type Query {
    "Fetch a single CoreQuestion by ID"
    question(q_id: Int!): CoreQuestion
    "Fetch a list of all questions"
    questions: [CoreQuestion]
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
    "The points id, currently the same as type of points"
    points_id: Int
    "An array of possible AnswerLabel objects"
    possibleAnswers: [AnswerLabel]
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

var app = express();

// Route for CoreQuestion stuff
// FYI rootValue is the graphqlResolvers above
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

app.listen(4004);
console.log('Running a GraphQL API server at http://localhost:4004/graphql for Core Questions');

// NOTES
// instead of having multiplel end points, u only have 1 Endpoint and u can ask for whatever u want from it ie theres one single 'smart' endpoint, generally used to serve data in json format