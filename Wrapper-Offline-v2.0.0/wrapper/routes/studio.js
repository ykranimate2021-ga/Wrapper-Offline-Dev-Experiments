var express = require('express');
var router = express.Router();
var util = require('../util/util')
const settings = require('../util/settings.json')

router.get('/:theme', function(req, res, next) {
  var flash_vars = `'apiserver':'/','storePath':'https://localhost:4664/store/3a981f5cb2739137/<store>','isEmbed':0,'ctc':'go','ut':'60','bs':'default','appCode':'go','page':'','siteId':'go','lid':13,'isLogin':'Y','retut':0,'clientThemePath':'https://localhost:4664/static/ad44370a650793d9/<client_theme>','themeId':'${req.params.theme}','tlang':'en_US','presaveId':'m-1','goteam_draft_only':1,'isWide':1,'collab':0,'nextUrl':'/','noSkipTutorial':1,'tray':'${req.params.theme}'`
  var urlFv = flash_vars.replace(/'/g, '').replace(/,/g, '&').replace(/:/g, '=').replace(/https=\/\/localhost=4664/g, 'https://localhost:4664').replace(/\//g, '%2F').replace(/:/g, '%3A').replace(/</g, '%3C').replace(/>/g, '%3E')
  if (settings.discord_rpc == "true") {
    util.setRpcActivity('Making a video', 'movie');
  }
  res.render('studio', { title: 'Video Maker', fullscreen: true, flash_vars: flash_vars, url_fv: urlFv, page: 'video_maker', source: 'go_full' } );
});

router.get('/:theme/:mid', function(req, res, next) {
  var flash_vars = `'apiserver':'/','storePath':'https://localhost:4664/store/3a981f5cb2739137/<store>','isEmbed':1,'ctc':'go','ut':'30','bs':'default','appCode':'go','page':'','siteId':'go','lid':13,'isLogin':'Y','retut':0,'clientThemePath':'https://localhost:4664/static/ad44370a650793d9/<client_theme>','themeId':'${req.params.theme}','tlang':'en_US','presaveId':'${req.params.mid}','goteam_draft_only':1,'isWide':1,'collab':0,'nextUrl':'/','noSkipTutorial':1,'tray':'${req.params.theme}','movieId':'${req.params.mid}'`
  var urlFv = flash_vars.replace(/'/g, '').replace(/,/g, '&').replace(/:/g, '=').replace(/https=\/\/localhost=4664/g, 'https://localhost:4664').replace(/\//g, '%2F').replace(/:/g, '%3A').replace(/</g, '%3C').replace(/>/g, '%3E')
  if (settings.discord_rpc == "true") {
    util.setRpcActivity('Editing a video', 'movie');
  }
  res.render('studio', { title: 'Video Editor', fullscreen: true, flash_vars: flash_vars, url_fv: urlFv, page: 'video_maker', source: 'go_full' } );
});

module.exports = router;