'use strict';

var template = null;
var fs = require('fs'),
    fis = require('fis'),
    gData = {};


var Obj = {}; //使用全局变量是为了防止Obj也被递归

function extend(oldObj, newObj, override, combine) {
    if (typeof oldObj === 'object' && typeof newObj === 'object') {
        for (var o in newObj) {
            if (oldObj[o]) {
                if (combine && oldObj[o] instanceof Array) {
                    oldObj[o] = newObj[o].concat(oldObj[o]);
                }
                if (override === true) {
                    oldObj[o] = newObj[o];
                }
            } else {
                if (combine && oldObj[o] instanceof Array) {
                    oldObj[o] = newObj[o].concat(oldObj[o]);
                } else {
                    oldObj[o] = newObj[o];
                }
            }
        }
    } else {
        return oldObj || newObj || {};
    }
    return oldObj;
}

function listObj(key, obj) { //将对象降维

    if (Object.prototype.toString.call(obj) !== '[object Object]' || key.indexOf('.') > -1 || /defaults$/.test(key)) {
        return obj;
    }
    key = key ? key + '/' : '';
    for (var i in obj) {
        if (!/defaults$/.test(i) && Object.prototype.toString.call(obj[i]) !== '[object Object]') {
            if (key) {
                Obj[key + 'defaults'] = Obj[key + 'defaults'] || {};
                Obj[key + 'defaults'][i] = obj[i];
            } else {
                Obj['defaults'] = Obj['defaults'] || {};
                Obj['defaults'][i] = obj[i];
            }

            //console.log(i);
        } else {
            var value = listObj(key + i, obj[i]);
            if (value !== undefined) {
                if (typeof value !== 'object') {
                    Obj[key + i] = value;
                } else {
                    Obj[key + i] = extend(Obj[key + i], value, true, true);
                }
            }
        }
    }
    return undefined;
}

function recursiveExtend(path, data) {
    if (path === '') {
        return extend(data, gData['defaults'], false, true);
    }

    data = extend(data, gData[path + '/defaults'], false, true);
    path = path.substr(0, path.lastIndexOf('/'));
    return recursiveExtend(path, data);
}

function initEngine(conf) {
    if (template === null && !conf.hasLoaded) {
        if (conf.native) {
            template = require('art-template/node/template-native');
        } else {
            template = require('art-template');
        }
        template.config('extname', ''),
            template.config('cache', false);
        conf.hasLoaded = true;
    }
};

function render(file, data) {
    data = data || {};
    var content = template(file, data);
    if (content.indexOf('{Template Error}') === -1) {
      return content.replace(/([\n\r])(\s*)\1/g, '$1$1');
    } else {
      return '<!doctype html>\r\n<html>\r\n\t<head>\r\n\t\t<title>Template Error</title>\r\n\t</head>\r\n\t<body>'
       + content
       + '\r\n\t</body>\r\n</html>';
    }
}

function readConfig(file) {
    var gJsonFile = fis.project.getProjectPath() + '/config.json';
    if (fs.existsSync(gJsonFile)) {
        gData = fs.readFileSync(gJsonFile, 'utf-8');
        if (!gData || gData.trim() == '') {
            gData = {};
        }
        try {
          gData = eval('(' + gData + ')');
        } catch (e) {
          throw new Error('Global Config file: ' + gJsonFile + ' parse error'); 
        }
        Obj = {};
        listObj('', gData);
        //console.log(Obj);
        gData = Obj;
    } else {
        //throw new Error(gJsonFile + ' not exists!');
        gData = {};
    }

    var data = null;
    var jsonFile = file.realpathNoExt.toString() + '.json',
        data = {};
    if (fs.existsSync(jsonFile)) {
        data = fs.readFileSync(jsonFile, 'utf-8');
        if (!data || data.trim() == '') {
            data = '{}';
        }
        try {
          data = eval('(' + data + ')')
        } catch (e) {
          throw new Error('Config file: ' + jsonFile + ' parse error'); 
        }
    } else if (file.ext != '.tpl') {
        data = {};
    }

    data = recursiveExtend(file.id, extend(data, gData[file.id]));
    return data;
}

module.exports = function(content, file, conf) {
    if (!content) return '';

    if (content.trim() == '') {
        return '<!doctype html>\r\n<html>\r\n\t<head>\r\n\t\t<title>tpl file is empty</title>\r\n\t</head>\r\n\t<body>tpl file is empty</body>\r\n</html>';
    }
    initEngine(conf);
    var data = readConfig(file);
    //console.log(data);
    return data.noParse === true ? content : render(file, data);
};
