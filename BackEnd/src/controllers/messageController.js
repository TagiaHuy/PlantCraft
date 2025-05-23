const getMessage = (req, res) => {
  try {
    res.json({ message: 'Hello from backend!' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMessage
};