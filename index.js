var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

//DAV 28march2021 this is working fine for courses

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  "All available queries"
  type Query {
    "Fetch a single course by ID"
    course(id: Int!): Course
    "Fetch a list of courses based on topic, provide no topic to get all courses"
    courses(topic: String): [Course]
  }
  "All available mutations"
  type Mutation {
    "Update the topic of a given course based on ID"
    updateCourseTopic(id: Int!, topic: String!): Course
  }
  "A course object"
  type Course {
    "Course ID"
    id: Int
    "The name of the course"
    title: String
    "An array of trainer objects"
    trainer: [Trainer]
    "Short text description of course content"
    description: String
    "A topic tag"
    topic: String
    "Link to the course on the academy site"
    url: String
  }
  "A trainer object"
  type Trainer {
    "The trainer ID"
    id: Int
    "First and last name"
    name: String
  }
`);

// Dav schema for questions - nnames here must be valid within schema
var questionSchema = buildSchema(`
  "All available queries"
  type Query {
    "Fetch a single Question by ID"
    question(q_id: Int!): Question
    "Fetch a list of all questions"
    questions: [Question]
  }
  "All available mutations"
  type Mutation {
    "Update the question based on ID"
    updateQuestion(q_id: Int!, question: String!): Question
  }
  "A Question object"
  type Question {
    "Question ID"
    q_id: Int
    "The actual question"
    question: String
    "Order of Questions for GP Core form"
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


// A dummy database
var coursesData = [
    {
        id: 1,
        title: 'Full Stack Track',
        trainer: [
            {
                id: 2,
                name: 'Ashley Coles'
            },
            {
                id: 1,
                name: 'Mike Oram'
            }
        ],
        description: 'In 16 weeks, we’ll teach you all you need to land your first job as a junior software developer.',
        topic: 'Full Stack',
        url: 'https://mayden.academy/full-stack-track/'
    },
    {
        id: 2,
        title: 'Working with Developers Workshop',
        trainer: [
            {
                id: 1,
                name: 'Mike Oram'
            }
        ],
        description: 'Do you work closely with software developers in your business, but don’t really understand the world of coding? Would you like your projects to run more effectively?',
        topic: 'Working with Developers',
        url: 'https://mayden.academy/working-with-developers-workshop/'
    },
    {
        id: 3,
        title: 'Introduction to WordPress for Developers',
        trainer: [
            {
                id: 2,
                name: 'Ashley Coles'
            }
        ],
        description: 'This one day online workshop is for developers who would like to learn more about working with WordPress.',
        topic: 'WordPress',
        url: 'https://mayden.academy/introduction-to-wordpress-for-developers/'
    }
];

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

// Dav get single course  by id
var getCourse = (args) => {
    var id = args.id;
    return coursesData.filter(course => course.id === id)[0];
}

// Dav get all courses, filtered by topic if provided
var getCourses = (args) => {
    if (args.topic) {
        var topic = args.topic;
        return coursesData.filter(course => course.topic === topic);
    } else {
        return coursesData;
    }
}

var updateCourseTopic = ({id, topic}) => {
    coursesData.map(course => {
        if (course.id === id) {
            course.topic = topic;
            return course;
        }
    });
    return coursesData.filter(course => course.id === id)[0];
}

// Dav Core Question stuff
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

// this isnt working, too many words called 'question' !
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


// The root provides a resolver function for each API endpoint
//these keywords on left of : are like the endpoint and MUST correspond with the keywords within the const/var schema on line 6 'var schema = buildSchema', while on the right are the variables which contain the results/callbacks of functions eg 'var getCourse' on line 91 etc
var root = {
    course: getCourse,
    courses: getCourses,
    updateCourseTopic: updateCourseTopic
};

// Dav root for Questions
const questionRoot = {
    question: getQuestion,
    questions: getQuestions,
    updateQuestion: updateQuestionLabel
};


//how to output results of getLearners ?
// console.log('output of getLearners: ')
// console.log(getLearners)

var app = express();

//FYI rootValue is the graphqlResolvers above
app.use('/graphql2', graphqlHTTP({
    schema: schema,
    rootValue: root,
    // Enable the GraphiQL UI
    graphiql: {
        defaultQuery: "query {\n" +
            "  course(id: 1) {\n" +
            "    title\n" +
            "    trainer\n" +
            "    url\n" +
            "  }\n" +
            "}"
    },

}));

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

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');

// NOTES
// instead of having multiplel end points, u only have 1 Endpoint and u can ask for whatever u want from it ie theres one single 'smart' endpoint, generally used to serve data in json format