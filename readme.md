# fis3-parser-art-template
> 增强了以下几处：
> 
1. 文件编译时，传入fis的file对象，对象命名为__fis_file.filename，在页面文件中，可以使用类似`{{__fis_file.filename}}`来取得文件名，或者其他file信息；
2. fis-conf.js的打包时的参数，增加了layout 
`fis.match('**.html', {
	parser: fis.plugin('art-template', {
		layout : '/comm/layout.tpl' ,...
	})
});`

## layout.tpl: ##
    
```javascript
{{include '/comm/header.html'}}

<!--BODY_PLACEHOLDER-->

{{include '/comm/footer.html'}}
 
 
 


# fis-parser-art-template ![NPM version](https://badge.fury.io/js/fis-parser-art-template.png)

[![NPM Download](https://nodei.co/npm-dl/fis-parser-art-template.png?months=1)](https://www.npmjs.org/package/fis-parser-art-template)

> artTemplate自动编译插件。

## 安装
```bash
> npm install -g fis-parser-art-template
```

## 配置
```javascript
fis.match('**.{html,tpl}', {
    parser: fis.plugin('art-template', {
        native: false,//默认为false，即简单语法模式
        openTag: '{{',//默认为{{
        closeTag: '}}',//默认为}}
        compress: false,//默认为false
        define: {
            "title": "hello, art-template",
            "stylesheets": ["main.css"],
            "scripts": ["main.js"],
            "module/": {
              "title": "home module",

              "home.tpl": {
                "stylesheets": ["home.css"],
                "scripts": ["home.js"]
              }
            },
            "index.tpl": {
              "stylesheets": ["index.css"],
              "scripts": ["index.js"]
            }
        }
    }),
    rExt: 'html'
})
```

## 关于data处理

为了让模版文件和数据分离，本插件对art-template的数据收集进行了三种形式的存放。

 * 和模版同名的json文件，即test.json对应为test.tpl的数据
 * 工程目录下的config.json，该数据为全局配置，可以对应多个模版文件
 * fis-config中插件的`define`字段
> 从上至下优先级依次递减
> noParse: false表示不解析该文件，原样输出
> release: false表示不输入该文件

## 全局data分配原则

以上面`define`字段中配置说明：

各级目录的配置一般会对应到每个文件。如果只指定了文件夹的数据，则该文件夹下的所有模板配有相同的数据。
路径识别原则：以`/`结尾的识别为文件夹，key值带`.`的识别为文件。所以在自定义变量中请不要使用带`.`及以`/`结尾的变量
变量继承与覆盖原则：与js类似。数组会逐级延长。object类型则进行浅inherit

> 如：以上配置最终解析出来的规则出下：
```javascript
{
    "_defaults": {
        "title": "hello, art-template",
        "stylesheets": [
            "main.css"
        ],
        "scripts": [
            "main.js"
        ]
    },
    "module/_defaults": {
        "title": "home module"
    },
    "module/home.tpl": {
        "stylesheets": [
            "main.css",
            "home.css"
        ],
        "scripts": [
            "main.js",
            "home.js"
        ]
    },
    "index.tpl": {
        "stylesheets": [
            "main.css",
            "index.css"
        ],
        "scripts": [
            "main.js", 
            "index.js"
        ]
    },
    "test.tpl": {
        "release": false
    }
}
```

## 针对ArtTemplate的hack

 * 原版的artTemplate简洁语法模式不支持赋值操作，在本插件中对其进行了这方面的增强，使得数据可以使用赋值操作进行再分配。
 * 针对fis增加了对绝对路径的支持，即所有模板都可以以工程目录为根目录进行include。

