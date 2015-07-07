# fis-parser-art-template ![NPM version](https://badge.fury.io/js/fis-parser-art-template.png)

[![NPM Download](https://nodei.co/npm-dl/fis-parser-art-template.png?months=1)](https://www.npmjs.org/package/fis-parser-art-template)

> A fis parser plugin for art-template

## install

   $ npm install fis-parser-art-template


##usage

```javascript

//fis-conf.js

fis.config.set('modules.parser.html', 'art-template');
fis.config.set('modules.parser.tpl', 'art-template');
fis.config.set('settings.parser.art-template.native', false);
fis.config.set('roadmap.ext.tpl', 'html');

//set data for tpl
fis.config.set('settings.parser.art-template.define', {
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
});

```

  $ fis release -d ./output

## example 

see [example](https://github.com/lwdgit/fis-parser-art-template/tree/master/example '')
