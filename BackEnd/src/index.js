const express = require('express');
const app = express();
const port = 3000;


app.get('/json', (req, res) => {
  res.json({ Text: "Hello" });
});
