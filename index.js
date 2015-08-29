'use strict';

var template = null;
var fs = require('fs'),
    path = require('path'),
    gData = {},
    hasLoaded = false, needClean = false;


var Obj = {}; //使用全局变量是为了防止Obj也被递归

function extend(oldObj, newObj, override, combine) {
    if (typeof oldObj === 'object' && typeof newObj === 'object') {
        for (var o in newObj) {
            if (typeof oldObj[o] !== 'undefined') {
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

    //console.log(key);
    if ((key && !/\/$/.test(key)) || key.indexOf('.') > -1 || /_defaults$/.test(key)) {
        return obj;
    }
    key = key ? key : '';
    for (var i in obj) {
        if (!/_defaults$/.test(i) && Object.prototype.toString.call(obj[i]) !== '[object Object]') {
            if (key) {
                Obj[key + '_defaults'] = Obj[key + '_defaults'] || {};
                Obj[key + '_defaults'][i] = obj[i];
            } else {
                Obj['_defaults'] = Obj['_defaults'] || {};
                Obj['_defaults'][i] = obj[i];
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
        return extend(data, gData['_defaults'], false, true);
    }

    data = extend(data, gData[path + '/_defaults'], false, true);
    path = path.substr(0, path.lastIndexOf('/'));
    return recursiveExtend(path, data);
}


function render(file, data) {
    data = data || {};
    var content = template(file, data);
    if (content.indexOf('{Template Error}') === -1) {
        return content.replace(/([\n\r])(\s*)\1/g, '$1$1');
    } else {
        console.log(file + ' render Error!');
        return '<!doctype html>\r\n<html>\r\n\t<head>\r\n\t\t<title>Template Error</title>\r\n\t</head>\r\n\t<body>' + content + '\r\n\t</body>\r\n</html>';
    }
}

function readGlobalConfig() {
    var gJsonFile = fis.project.getProjectPath() + '/config.json',
        _gData = {};
    if (fs.existsSync(gJsonFile)) {
        _gData = fs.readFileSync(gJsonFile, 'utf-8');
        if (!_gData || _gData.trim() == '') {
            _gData = '{}';
        }

        try {
            _gData = eval('(' + _gData + ')');
        } catch (e) {
            throw new Error('Global Config file: ' + gJsonFile + ' parse error');
        }
        Obj = {};
        listObj('', _gData);
        _gData = Obj;
    } else {
        //throw new Error(gJsonFile + ' not exists!');
        _gData = {};
    }

    extend(gData, _gData, false, true);
}

function readConfig(file) {

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

function initEngine(conf) {

    if (!hasLoaded) {
        if (template === null) {
            if (conf.native || conf.engine === 'native') {
                template = require('./artTemplate/node/template-native');
            } else {
                template = require('./artTemplate');
            }
            template.config('extname', ''),
            template.config('cache', true);
            template.config('projectRoot', fis.project.getProjectPath());

        }
        listObj('', conf.define || {});
        gData = Obj;

        readGlobalConfig();

        fis.on('release:end', function() {
            var opt = fis.config.data.options,
                dest;
                console.log(needClean);
            if (needClean && (dest = (opt.d || opt.dest))) {
                fis.log.info('clean release false files...');
                setTimeout(function() {
                    fs.unlink(path.join(process.cwd(), dest + '/deleted'), function(err) {
                        if (err) fis.log.warn(err)
                        fis.log.info('success...');
                    });
                }, 1000);//延时1稍清理
                
            }  
        });

        hasLoaded = true;
    }
};

module.exports = function(content, file, conf) {
    initEngine(conf);
    var data = readConfig(file);
    //console.log(data)
    if (data.release === false) {
        needClean = true;
        file.release = './deleted';
    }

    if (!content) return '';
    if (content.trim() === '') {
        return '<!doctype html>\r\n<html>\r\n\t<head>\r\n\t\t<title>tpl file is empty</title>\r\n\t</head>\r\n\t<body>tpl file is empty</body>\r\n</html>';
    }

    //console.log(data);
    return data.noParse === true ? content : render(file, data);
};
