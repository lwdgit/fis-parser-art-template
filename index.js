'use strict';

var template = require('art-template');
    template.config('extname', ''),
    template.config('cache', false);
var fs = require('fs');


module.exports = function(content, file, conf){ 
    if (!content) return '';
    
    if (content.trim() == '') {
      return '<!doctype html><html><head><title>tpl file is empty</title></head><body>tpl file is empty</body></html>';
    }

    if (conf.native) {
      template = require('art-template/node/template-native');
      template.config('extname', '');
      template.config('cache', false);
    }
    
    var jsonFile = file.realpathNoExt.toString() + '.json';
    if (fs.existsSync(jsonFile)) {
      var data = fs.readFileSync(jsonFile,'utf-8');
      if (!data || data.trim() == '') {
        data = '{}';
      }
      data = eval('(' + data + ')')
      content = template(file, data);
      return content.replace(/([\n\r])(\s*)\1/g,'$1$1');
    } else if (file.ext != '.tpl'){
      content = template(file, {});
      return content.replace(/([\n\r])(\s*)\1/g,'$1$1');
    } else {
      console.log(file.filename + ' not modify');
      return content;
    }
};