const getTodolist = (req, res) => {
  try {
    const todolist = [
      "ăn cơm",
      "học bài",
      "tập gym"
    ];
    res.json({ todolist });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTodolist
};