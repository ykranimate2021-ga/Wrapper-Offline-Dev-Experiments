var express = require('express');
var router = express.Router();
var util = require('../util/util')
var fs = require("fs");
let dotenv = require('dotenv').config()
const savedFolder = process.env.SAVED_FOLDER;
const settings = require('../util/settings.json')

function getFile(id, type) {
  switch (type) {
    case "thumb": {
      fs.readFile(util.getThumbPath(id, 'video'), (e, b) => {
        if (e) {
          console.log(e);
          return 'error';
        } else {
          return b;
        }
      });
      break;
    }
    case "file": {
      fs.readFile(util.getFilePath(id, 'video'), (e, b) => {
        if (e) {
          console.log(e);
          return 'error';
        } else {
          return b;
        }
      });
      break;
    }
  }
}

router.get('/:id/thumb', function(req, res, next) {
  var id = "" + req.params.id;
  var i = id.indexOf("-");
	var prefix = id.substring(0, i);
  switch (prefix) {
    case "v": {
      var toSend = getFile(id, 'thumb');
      if (toSend == "error") {
        res.status(404);
        res.send('Could not get thumbnail.');
      } else {
        res.set({'Content-Type': 'image/png'});
        res.send(toSend);
      }
    }
    default: {
      res.status(400);
      res.send('Invalid ID.');
    }
  }
});

router.get('/:id/file', function(req, res, next) {
  var id = "" + req.params.id;
  var i = id.indexOf("-");
	var prefix = id.substring(0, i);

  switch (prefix) {
    case "v": {
      var toSend = getFile(id, 'file');
      if (toSend == "error") {
        res.status(404);
        res.send('Could not get file.');
      } else {
        res.set({'Content-Type': 'text/html; charset=UTF-8'});
        res.send(toSend);
      }
    }
    default: {
      res.status(400);
      res.send('Invalid ID.');
    }
  }
});

router.get('/:id', function(req, res, next) {
  if (settings.discord_rpc == "true") {
    util.setRpcActivity('Watching a video', 'play');
  }
})

module.exports = router;