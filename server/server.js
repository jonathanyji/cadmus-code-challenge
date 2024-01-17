const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
var mysql = require('mysql');

const app = express();
const port = 4000;
const databaseName = 'notesdatabase';
const tableName = 'entries';

// MySQL connection
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: databaseName,
});

  // Middleware to parse JSON requests
  app.use(bodyParser.json());

  // Enable CORS for all routes
  app.use(cors());

  
  // CRUD operations
  app.post('/storeData', (req, res) => {

    // Use a connection from the pool to execute the query
    pool.getConnection((err, connection) => {

      const data = req.body.content;
      console.log("TEST DATA: ", data)

      if (err) {
        console.error('Error getting MySQL connection:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Perform the bulk INSERT query
      const query = `INSERT INTO \`${tableName}\` (id, userid, words, rowPosition, style) VALUES ? ON DUPLICATE KEY UPDATE words = VALUES(words), rowPosition = VALUES(rowPosition), style = VALUES(style)`;

    const values = data.map(({ id, userid, words, rowPosition, style }) => [id, 1, words, rowPosition, style]);

    connection.query(query, [values], (queryErr, result) => {
      connection.release(); // Release the connection back to the pool

      if (queryErr) {
        console.error('Error executing query:', queryErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      console.log('Data stored successfully.');
      res.json({ message: 'Data stored successfully', ids: result.insertId });

      });
    });
  });


  app.get('/getAllData', (req, res) => {
    // Use a connection from the pool to execute the query
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      // Perform the SELECT query
      const tableName = 'entries'; // Replace with your actual table name
      const query = `SELECT * FROM \`${tableName}\``;
  
      connection.query(query, (queryErr, result) => {
        connection.release(); // Release the connection back to the pool
  
        if (queryErr) {
          console.error('Error executing query:', queryErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        console.log('Data retrieved successfully.');
        res.json(result);
      });
    });
  });

  app.delete('/deleteAll', async (req, res) => {
    const userId = 1;
  
    try {
      const query = 'DELETE FROM entries WHERE userid = ?';
      const [result] = await pool.query(query, [userId]);

      if (result.affectedRows > 0) {
        console.log('Deleted', result.affectedRows, 'record(s) from the table.');
        res.json({ message: 'Record(s) deleted successfully.' });
      } else {
        res.status(404).json({ error: 'No matching records found.' });
      }
    } catch (error) {
      console.error('Error deleting records:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });