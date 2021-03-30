const mysql = require('mysql');

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
  	console.log('Connected to MySQL DB!');
});


// sql queries - how to call this from GQL ?
// would need multiple functions, for each query - check format of my basic MongoDB TIL example

// Basic Query
let queryGetBasicQuestions = `
	SELECT q_id, question, gp_order, points_type 
	FROM ref_core_questions
	`
// get questions and their points value, in order to build UI table
let queryGetAllQuestionDetails = `
	SELECT rcq.q_id, rcq.question, rcq.points_type, rcp.pointsA_not, rcp.pointsB_only, rcp.pointsC_sometimes, rcp.pointsD_often, rcp.pointsE_most 
	FROM ref_core_questions AS rcq 
	INNER JOIN ref_core_points AS rcp 
		ON rcq.points_type = rcp.points_id 
	ORDER BY rcq.gp_order;
	`

let queryGetUsersAnswers = `
	SELECT u.user_id, u.name, ucs.score_date, ucs.overall_score, uca.q_id, uca.points 
	FROM user_core_score AS ucs 
	INNER JOIN user_core_answers AS uca 
		ON uca.ucs_id = ucs.ucs_id 
	INNER JOIN users AS u
		ON u.user_id = ucs.user_id 
	ORDER BY u.user_id, ucs.score_date;
	`
connection.query(queryGetBasicQuestions, (err,rows) => {
  if(err) throw err;
  console.log('Data received from DB:');
  console.log(rows);
});

//loop over data from crud example - https://www.sitepoint.com/using-node-mysql-javascript-client/
// rows.forEach( (row) => {
//   console.log(`${row.name} lives in ${row.city}`);
// });


//Basic DB Create/Insert Example
// const author = { name: 'Craig Buckler', city: 'Exmouth' };
// con.query('INSERT INTO authors SET ?', author, (err, res) => {
//   if(err) throw err;
//   console.log('Last insert ID:', res.insertId);
// });



//this ends the connection straight away, if this is the only file being run by node
connection.end((err) => {
  // The connection is terminated gracefully
  // Ensures all remaining queries are executed
  // Then sends a quit packet to the MySQL server.
});


// TO DO LATER - consider using Stored Proecedures?

// Examples to avoid SQL Injection - for later

// use the mysql.escape method
// con.query(
//   `SELECT * FROM authors WHERE id = ${mysql.escape(userSubmittedVariable)}`,
//   (err, rows) => {
//     if(err) throw err;
//     console.log(rows);
//   }
// );

// // use ? placeholder 
// con.query(
//   'SELECT * FROM authors WHERE id = ?',
//   [userSubmittedVariable],
//   (err, rows) => {
//     if(err) throw err;
//     console.log(rows);
//   }
// );