var express = require('express');
var router = express.Router();
var util = require('../util/util')
var fs = require("fs");
let dotenv = require('dotenv').config()
const savedFolder = process.env.SAVED_FOLDER;

router.get('/:id/thumb', function(req, res, next) {
  fs.readFile(util.getThumbPath(req.params.id, 'video'), (e, b) => {
    if (e) {
      console.log(e);
      res.status(404);
      res.send(e);
    } else {
      res.set({'Content-Type': 'image/png'});
      res.send(b);
    }
  });
});

router.get('/:id/file', function(req, res, next) {
  var id = "" + req.params.id;
  var i = id.indexOf("-");
	var prefix = id.substring(0, i);
  var suffix = id.substring(i + 1);

  switch (prefix) {
    case "v": {
      fs.readFile(util.getFilePath(id, 'video'), (e, b) => {
        if (e) {
          console.log(e);
          res.status(404);
          res.send(e);
        } else {
          res.set({'Content-Type': 'text/html; charset=UTF-8'});
          res.send(b);
        }
      });
      break;
    }
  }
});

module.exports = router;