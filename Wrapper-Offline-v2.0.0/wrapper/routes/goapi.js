const express = require('express');
const router = express.Router();
var themelist = require('../_THEMES/themelist.json')
const util = require('../util/util');
let dotenv = require('dotenv').config()
const themeFolder = process.env.THEME_FOLDER;
const savedFolder = process.env.SAVED_FOLDER;
const premadeFolder = process.env.PREMADE_FOLDER;
const charUrl = process.env.CHAR_BASE_URL;
const fw = process.env.FILE_WIDTH;
const xNumWidth = process.env.XML_NUM_WIDTH;
var savedjson = JSON.parse(util.readFile(`${savedFolder}/saved.json`));

router.post('/getThemeList', function(req, res, next) {
  var themelist_xml = `<?xml version="1.0" encoding="UTF-8"?>\n<list version="1.0">\n\t<fvm_meta theme_code="" is_biz="0" />`
  themelist.forEach(theme => {
    if (theme.has_cc === true) {
      themelist_xml += `\n\t<theme id="${theme.vm_id}" name="${theme.name}" thumb="" cc_theme_id="${theme.cc_id}" />`
    } else {
      themelist_xml += `\n\t<theme id="${theme.vm_id}" name="${theme.name}" thumb="" />`
    }
  });
  themelist_xml += `\n\t<word></word>\n\t<whiteword />\n\t<excludeAssetIDs />\n\t<points money="0" sharing="0" />\n</list>`
  res.set({'Content-Type': 'application/zip'});
  util.makeZip('themelist.xml', themelist_xml).then((b) => res.send(b));
});

router.post('/getTheme', function(req, res, next) {
  var theme_xml = util.readFileSync(`${themeFolder}/${req.body.themeId}.xml`)
  res.set({'Content-Type': 'application/zip'});
  util.makeZip('theme.xml', theme_xml).then((b) => res.send(b));
});

router.post('/getUserWatermarks', function(req, res, next) {
  res.send(`<?xml version="1.0" encoding="UTF-8"?><watermarks><current/><preview/></watermarks>`)
});

router.post('/getUserAssetsXml', function(req, res, next) {
  var ugc_xml = '<?xml version="1.0" encoding="UTF-8"?><ugc more="0">'
  switch (req.body.themeId) {
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
  switch (req.body.type) {
    case "char": {
      savedjson.forEach(asset => {
        if (asset.type == 'char' && asset.theme == theme) {
          ugc_xml += `<char id="${asset.id}" name="${asset.name}" cc_theme_id="${asset.theme}" thumbnail_url="${asset.thumb}" copyable="Y"><tags/></char>`
        }
      });
    }
    default: {
      break;
    }
  }
  ugc_xml += '</ugc>'
  res.send(ugc_xml)
});

router.post('/getCcCharCompositionXml', function(req, res, next) {
  var id = "" + req.body.assetId;
  var i = id.indexOf("-");
	var prefix = id.substring(0, i);
  var suffix = id.substring(i + 1);

  switch (prefix) {
    case "c":
    case "C": {
      util.readFile(util.getCharPath(id), 'utf-8');
      break;
    }

    case "": {
      var nId = Number.parseInt(suffix);
      var xmlSubId = nId % fw;
      var fileId = nId - xmlSubId;
      var lnNum = util.padZero(xmlSubId, xNumWidth);
      var url = `${charUrl}/${util.padZero(fileId)}.txt`;
      util.get(url).then((b) => {
        var line = b
          .toString("utf8")
					.split("\n")
					.find((v) => v.substring(0, xNumWidth) == lnNum);
        if (line) {
          res.set({'Content-Type': 'text/html; charset=UTF-8'});
          res.send('0' + Buffer.from(line.substring(xNumWidth)));
        } else {
          console.log('gooooofy!')
        }
      });
      break;
    }
  }
});

router.post('/getCCPreMadeCharacters', function(req, res, next) {
  //var xml = fs.readFileSync(`${premadeFolder}/${req.body.themeId}.xml`, 'utf8')
  res.send('');
});

router.post('/saveCCCharacter', function(req, res, next) {
  var id = `c-${util.getNextFileId("char-", ".xml")}`;
  const i = id.indexOf("-");
	const prefix = id.substr(0, i);
	const suffix = id.substr(i + 1);
	switch (prefix) {
		case "c":
			util.writeFile(util.getFileIndex("char-", ".xml", suffix), req.body.body);
			break;
		case "C":
	}
  var thumb = Buffer.from(req.body.thumbdata, "base64");
  util.writeFile(util.getThumbPath(id, 'char'), thumb);
  util.addToSavedJson({id: id, type: 'char', theme: req.body.themeId, thumb: `/char/thumb/${id}`, category: ''})
	res.send('0' + id);
});

router.post('/saveCCThumbs', function(req, res, next) {
  var thumb = Buffer.from(req.body.thumbdata, "base64");
  util.writeFile(util.getThumbPath(req.body.assetId, 'char'), thumb);
	res.send('0' + req.body.assetId);
});

router.post('/deleteUgc', function(req, res, next) {
  var id = req.body.id;
  const i = id.indexOf("-");
	const prefix = id.substr(0, i);
	const suffix = id.substr(i + 1);
	switch (prefix) {
    case "c": {
      util.removeFromSavedJson(id);
      util.deleteFile(util.getFilePath(id, 'char'));
      util.deleteFile(util.getThumbPath(id, 'char'));
      res.send('0');
      break;
    }
    case "v": {
      util.removeFromSavedJson(id);
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

router.post('/updateAsset', function(req, res, next) {
  var id = req.body.id;
  var name = req.body.name;
  var category = req.body.category;
  var i = 0;
  savedjson.forEach(asset => {
    if (asset.id == id) {
      var n = i;
      var newEntry = {
        "id": asset.id,
        "type": asset.type,
        "name": name,
        "description": asset.desc,
        "thumb": asset.thumb,
        "theme": asset.theme,
        "subtype": asset.subtype,
        "duration": asset.duration,
        "category": category
      }
      savedjson.splice(n,1,newEntry);
      var newJson = JSON.stringify(json);
      util.writeFile(`${savedFolder}/saved.json`, newJson);
    }
    i++
  })
});

/* moooore placeholder */

router.post('/getUserFontList', function(req, res, next) {
  res.send('{"status":"ok","data":[]}')
})

router.post('/getAssetTags', function(req, res, next) {
  res.send('{"status":"ok","data":[]}')
})
module.exports = router;