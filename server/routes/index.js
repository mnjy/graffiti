var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/draw/:room/:width/:height', function(req, res, next) {
  res.render('main', {
      'room': req.params.room,
      'width': req.params.width,
      'height': req.params.height
  });
});

module.exports = router;
