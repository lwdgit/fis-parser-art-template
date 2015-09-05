/*fis.config.set('modules.parser.tpl', 'art-template');
fis.config.set('settings.parser.art-template.native', false);
fis.config.set('roadmap.ext.tpl', 'html');
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

*/

fis.hook('test', {
  test: true
});
/*
fis.match('**.tpl', {
  parser: fis.plugin('art-template', {
    native: false,
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
      },
      "test.tpl": {
        release: false
      }
    }
  }),
  rExt: 'html'
});

fis.config.set('project.exclude', 'module/common/**');
*/