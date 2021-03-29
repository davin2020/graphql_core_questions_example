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
let query1 = 'SELECT q_id, question, gp_order, points_type from ref_core_questions'
let query2 = "SELECT rcq.q_id, rcq.question, rcq.points_type, rcp.pointsA_not, rcp.pointsB_only, rcp.pointsC_sometimes, rcp.pointsD_often, rcp.pointsE_most FROM ref_core_questions AS rcq INNER JOIN ref_core_points AS rcp ON rcq.points_type = rcp.points_id ORDER BY rcq.gp_order;"

connection.query(query2, (err,rows) => {
  if(err) throw err;
  console.log('Data received from DB:');
  console.log(rows);
});

//loop over data from crud example - https://www.sitepoint.com/using-node-mysql-javascript-client/
// rows.forEach( (row) => {
//   console.log(`${row.name} lives in ${row.city}`);
// });


//this ends the connection straight away, if this is the only file being run by node
connection.end((err) => {
  // The connection is terminated gracefully
  // Ensures all remaining queries are executed
  // Then sends a quit packet to the MySQL server.
});