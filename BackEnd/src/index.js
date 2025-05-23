const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/json', (res) => {
  res.json({ Text: "Hello" });
});
