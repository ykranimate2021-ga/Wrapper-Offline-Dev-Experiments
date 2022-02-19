var express = require('express');
var router = express.Router();
var util = require('../util/util')
var fs = require("fs");
let dotenv = require('dotenv').config()
const savedFolder = process.env.SAVED_FOLDER;
const themeFolder = process.env.THEME_FOLDER;

router.get('/browse/:theme', function(req, res, next) {
  var theme = req.params.theme;
  switch (theme) {
    case "custom":
      var theme = "family";
      break;
    case "action":
    case "animal":
    case "space":
    case "vietnam":
      var theme = "cc2";
      break;
  }

  /* custom chars */

  var savedjson = JSON.parse(fs.readFileSync(`${savedFolder}/saved.json`));
  var savedchars = [];
  savedjson.forEach (asset => {
		if (asset.type == "char") {
      if (asset.theme == theme) {
        let cc_entry = {
          "id": asset.id,
          "name": asset.name,
          "theme": asset.theme,
          "thumb": asset.thumb,
          "category": asset.category
        }
        savedchars.push(cc_entry)
      }
    }
  })

  if (savedchars.length == 0) {
    savedchars = false
  }

  /* stock chars */

  var stockjson = JSON.parse(fs.readFileSync(`${themeFolder}/JSON/${req.params.theme}.json`));
  var stockchars = [];
  stockjson.char.forEach (asset => {

    let entry = {
      "id": asset.attributes.id,
      "name": asset.attributes.name,
      "theme": asset.attributes.cc_theme_id,
      "thumb": asset.attributes.thumbnail_url,
      "category": asset.category
    }
    stockchars.push(entry)
  })


  if (stockchars.length == 0) {
    stockchars = false
  }

  util.setRpcActivity('Browsing characters', 'list')

  /* response */
  res.render('char_browser', { title: 'Character Browser', fullscreen: false, customchars: savedchars, stockchars: stockchars, theme: theme } );
});

router.get('/create/flash/:theme/:type', function(req, res, next) {
  var flash_vars = `'apiserver':'/','storePath':'https://localhost:4664/store/3a981f5cb2739137/<store>','clientThemePath':'https://localhost:4664/static/ad44370a650793d9/<client_theme>','themeId':'${req.params.theme}','ut':'30','bs':'${req.params.type}','appCode':'go','page':'','siteId':'go','m_mode':'school','isLogin':'Y','isEmbed':1,'ctc':'go','tlang':'en_US','nextUrl':'/cc_browser'`
  urlFv = util.urlEncodeFV(flash_vars)
  res.render('studio', { title: 'Character Creator', fullscreen: false, flash_vars: flash_vars, url_fv: urlFv, page: 'char_creator', source: 'cc' } );
});

router.get('/create/:theme/:type', function(req, res, next) {
  var theme = req.params.theme;
  var type = req.params.type;
  var id = util.getNextFileId("char-", ".xml")
  util.setRpcActivity('Creating a character', 'character')
  res.render('char_creator', { title: 'Character Creator', fullscreen: false, theme: theme, type: type, isEdit: false, id: id } );
});

router.get('/create/flash/:theme/copy/:id', function(req, res, next) {
  var flash_vars = `'apiserver':'/','storePath':'https://localhost:4664/store/3a981f5cb2739137/<store>','clientThemePath':'https://localhost:4664/static/ad44370a650793d9/<client_theme>','original_asset_id':'${req.params.id}','themeId':'${req.params.theme}','ut':'30','bs':'default','appCode':'go','page':'','siteId':'go','m_mode':'school','isLogin':'Y','isEmbed':1,'ctc':'go','tlang':'en_US','nextUrl':'/cc_browser'`
  urlFv = util.urlEncodeFV(flash_vars)
  res.render('studio', { title: 'Character Editor', fullscreen: false, flash_vars: flash_vars, url_fv: urlFv, page: 'char_creator', source: 'cc' } );
});

router.get('/create/:theme/copy/:id', function(req, res, next) {
  var theme = req.params.theme;
  var type = req.params.type;
  var id = req.params.id;
  util.setRpcActivity('Creating a character', 'character')
  res.render('char_creator', { title: 'Character Creator', fullscreen: false, theme: theme, type: type, isEdit: true, charId: id } );
});

router.get('/:id/thumb', function(req, res, next) {
  fs.readFile(util.getThumbPath(req.params.id, 'char'), (e, b) => {
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
    case "c":
    case "C": {
      fs.readFile(util.getFilePath(id, 'char'), (e, b) => {
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