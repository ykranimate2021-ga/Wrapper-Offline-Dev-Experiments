const express = require('express');
const router = express.Router();
const util = require('../util/util');

router.post('/changeSetting', function(req, res, next) {
  var name = req.body.name;
  var resp = util.changeSetting(name);
  res.send(resp);
});

router.post('/ugc/delete', function(req, res, next) {
  var id = req.body.id;
  const i = id.indexOf("-");
	const prefix = id.substr(0, i);
	const suffix = id.substr(i + 1);
	switch (prefix) {
    case "c": {
      util.manipulateSavedJson('delete', { id: id });
      util.deleteFile(util.getFilePath(id, 'char'));
      util.deleteFile(util.getThumbPath(id, 'char'));
      res.send('0');
      break;
    }
    case "v": {
      util.manipulateSavedJson('delete', { id: id });
      util.deleteFile(util.getFilePath(id, 'video'));
      util.deleteFile(util.getThumbPath(id, 'video'));
      res.send('0');
      break;
    }
    default: 
      res.send('1');
      break;
  }
});

router.post('/ugc/update', function(req, res, next) {
  var id = req.body.id;
  var name = req.body.name;
  var category = req.body.category;
  util.manipulateSavedJson('edit', { id: id, name: name, category: category });
});

module.exports = router;