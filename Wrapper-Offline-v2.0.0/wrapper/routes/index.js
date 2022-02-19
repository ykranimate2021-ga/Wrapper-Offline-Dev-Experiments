var express = require('express');
var router = express.Router();
var themelist = require('../themelist.json')
var util = require('../util/util')
let dotenv = require('dotenv').config()
const savedFolder = process.env.SAVED_FOLDER;
var fs = require("fs");

router.get('/', function(req, res, next) {
  var savedjson = JSON.parse(fs.readFileSync(`${savedFolder}/saved.json`));
  var videos = [];
  savedjson.forEach (asset => {
		if (asset.type == "video") {
      let entry = {
        "id": asset.id,
        "name": asset.name,
        "theme": asset.theme,
        "thumb": asset.thumb,
        "duration": asset.duration,
        "category": asset.category
      }
      videos.push(entry)
    }
  })

  if (videos.length == 0) {
    videos = false;
  }

  util.setRpcActivity('Browsing videos', 'list')
  res.render('index', { title: 'Video List', videolist: videos, onloadfunction: 'getAnnouncement()' });
});

router.get('/create', function(req, res, next) {
  util.setRpcActivity('Browsing themes', 'plus')
  res.render('create', { title: 'Theme List', themelist: themelist } );
});

/* redirects */

router.get('/go/character_creator/:theme/new_char', function(req, res, next) {
  var newlink = `/char/create/${req.params.theme}/${req.query.type}`
  res.redirect(newlink);
});

router.get('/go/character_creator/:theme/copy/:id/', function(req, res, next) {
  var newlink = `/char/create/${req.params.theme}/copy/${req.params.id}`
  res.redirect(newlink);
});

router.get('/go/character_creator/:theme', function(req, res, next) {
  var newlink = `/char/create/${req.params.theme}/adam`
  res.redirect(newlink);
});

module.exports = router;
