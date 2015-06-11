#fis-parser-art-template

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

```

  $ fis release -d ./output

## example 

see [example](https://github.com/lwdgit/fis-parser-art-template/tree/master/example '')