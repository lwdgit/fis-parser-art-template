var fs = require('fs');
var path = require('path');

module.exports = function(template) {

    template.dependencies = [];

    var cacheStore = template.cache;
    var defaults = template.defaults;
    var rExtname;

    // 提供新的配置字段
    defaults.base = '';
    defaults.extname = '.html';
    defaults.encoding = 'utf-8';


    // 重写引擎编译结果获取方法
    template.get = function(filename) {

        var fn;

        if (cacheStore.hasOwnProperty(filename)) {
            // 使用内存缓存
            fn = cacheStore[filename];
        } else {
            // 加载模板并编译
            var source = readTemplate(filename);
            if (typeof source === 'string') {
                fn = template.compile(source, {
                    filename: filename
                });
            }
        }

        return fn;
    };


    function readTemplate(id) {
        id = path.join(defaults.base, id + defaults.extname);

        if (id.indexOf(defaults.base) !== 0) {
            // 安全限制：禁止超出模板目录之外调用文件
            throw new Error('"' + id + '" is not in the template directory');
        } else {
            try {
                return fs.readFileSync(id, defaults.encoding);
            } catch (e) {}
        }
    }


    // 重写模板`include``语句实现方法，转换模板为绝对路径
    template.utils.$include = function(filename, data, from) {

        from = path.dirname(from);
        if (filename && filename.charAt('0') === '/') {
            filename = path.join(defaults.projectRoot, filename);
        } else {
        	filename = path.join(from, filename);
        }
        template.dependencies.push(filename);//将被include的文件添加到dependencies
        return template.renderFile(filename, data);
    }


    // express support
    template.__express = function(file, options, fn) {

        if (typeof options === 'function') {
            fn = options;
            options = {};
        }


        if (!rExtname) {
            // 去掉 express 传入的路径
            rExtname = new RegExp((defaults.extname + '$').replace(/\./g, '\\.'));
        }


        file = file.replace(rExtname, '');

        options.filename = file;
        fn(null, template.renderFile(file, options));
    };


    return template;
}
