const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4000;

// In-memory data store
let data = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];
  
  // Middleware to parse JSON requests
  app.use(bodyParser.json());

  // Enable CORS for all routes
  app.use(cors());

  
  // CRUD operations
  
  // Read all items
  app.get('/items', (req, res) => {
    res.json(data);
  });


  
  // Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });