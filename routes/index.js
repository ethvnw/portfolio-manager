const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { const1: 'value' });
});

router.get('/buyassets', function(req, res, next) {
  res.render('buyassets.pug', { const1: 'value' });
});

router.get('/sellassets', function(req, res, next) {
  res.render('sellassets.pug', { const1: 'value' });
});

module.exports = router;
