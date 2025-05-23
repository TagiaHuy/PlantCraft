const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/json', (req, res) => {
  res.json({ Text: "Hello" });
});
