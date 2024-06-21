const express = require('express');
const app = express();
const router = express.Router();

app.get('/', (req, res) => {
    res.render('premium')
});

module.exports = router;
