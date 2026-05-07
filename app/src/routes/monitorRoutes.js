const express = require('express');
const router = express.Router();
const { monitor } = require('../controllers/monitorController');

router.post('/monitor', monitor);

module.exports = router;