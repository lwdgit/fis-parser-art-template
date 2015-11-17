'use strict';

var template = null;
var fs = require('fs'),
    path = require('path'),
    gData = {},
    hasLoaded = false,
    needClean = false,
    deletedFileName = '/.deleted';


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

    template.dependencies = []; //增加dependencies,用于记录文件依赖

    var content = template(file.toString(), data);

    if (template.dependencies.length) { //如果有include,将被include的文件加入deps
        template.dependencies.forEach(function(cp) {

            file.cache.addDeps(cp);
        })
    }
    if (content.indexOf('{Template Error}') === -1) {
        return content.replace(/([\n\r])(\s*)\1/g, '$1$1');
    } else {
        console.log(file + ' render Error!');
        return '<!doctype html>\r\n<html>\r\n\t<head>\r\n\t\t<title>Template Error</title>\r\n\t</head>\r\n\t<body>' + content + '\r\n\t</body>\r\n</html>';
    }
}

function readGlobalConfig(file, conf) { //读取全局配置 config.json

    gData = {};

    listObj('', conf.define || {});
    gData = Obj;

    var gJsonFile = fis.project.getProjectPath() + '/config.json',
        _gData = {};
    if (fs.existsSync(gJsonFile)) {
        _gData = fs.readFileSync(gJsonFile, 'utf-8');//这里不能用require
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
        file.cache.addDeps(gJsonFile);//移除全局配置编译依赖
    } else {
        //throw new Error(gJsonFile + ' not exists!');
        _gData = {};
    }

    extend(gData, _gData, false, true);
}

function readConfig(file) { //读取同名json配置

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
        file.cache.addDeps(jsonFile);
    } else {
        data = {};
    }
    data = recursiveExtend(file.id, extend(data, gData[file.id]));
    return data;
}




function initEngine(conf, file) {

    if (template === null) {
        if (conf.native || conf.engine === 'native') {
            template = require('./artTemplate/node/template-native');
        } else {
            template = require('./artTemplate');
        }
        template.config('extname', ''),
        template.config('cache', false);
        template.config('projectRoot', fis.project.getProjectPath());
    }
    template.config('openTag', conf.openTag || '{{');
    template.config('closeTag', conf.closeTag || '}}');
    template.config('compress', conf.compress === undefined ? false : !!conf.compress);
        
    if (!hasLoaded) {
        fis.on('release:end', function() {
            var opt = fis.config.data.options,
                dest;

            if (needClean && (dest = (opt.d || opt.dest))) {
                fis.log.info('clean files...');
                setTimeout(function() {
                    fs.unlink(path.join(process.cwd(), dest + deletedFileName), function(err) {
                        if (err) fis.log.warn(err);
                        fis.log.info('clean success...');
                    });
                }, 1000); //延时1秒清理

            }
            needClean = false;
        });

        hasLoaded = true;
    }
};

module.exports = function(content, file, conf) {
 
    initEngine(conf, file);

    readGlobalConfig(file, conf);

    var data = readConfig(file);

    if (data.release === false) { //如果不release,将文件丢到.deleted,并添加clean标记,在release:end后清除
        needClean = true;
        file.release = deletedFileName;
    }

    if (!content) return '';
    if (content.trim() === '') {
        return '<!doctype html>\r\n<html>\r\n\t<head>\r\n\t\t<title>tpl file is empty</title>\r\n\t</head>\r\n\t<body>tpl file is empty</body>\r\n</html>';
    }

    //console.log(data);
    return data.noParse === true ? content : render(file, data);
};
