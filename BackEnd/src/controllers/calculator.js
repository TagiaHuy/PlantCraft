// calculator.js
// Controller for calculation logic

module.exports = {
    add: (req, res) => {
        const { a, b } = req.body;
        if (typeof a !== 'number' || typeof b !== 'number') {
            return res.status(400).json({ error: 'Both a and b must be numbers.' });
        }
        const result = a + b;
        res.json({ result });
    }
};