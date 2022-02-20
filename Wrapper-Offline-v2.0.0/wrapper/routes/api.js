const express = require('express');
const router = express.Router();
const util = require('../util/util');

router.post('/changeSetting', function(req, res, next) {
  var name = req.body.name;
  var resp = util.changeSetting(name);
  res.send(resp);
});

module.exports = router;