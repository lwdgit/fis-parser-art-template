//fis.set('project.fileType.text', 'ts');

fis.match('**/*.{ts,tsx}', {
	parser: fis.plugin('typescript', {
		sourceMap: true,
		strictNullChecks: true,
		module: 1,
		target: 2,
		noImplicitAny: true
	}),
	rExt: '.js'
});

// 开启模块化
fis.hook('commonjs', {
	baseUrl: '.',
	extList: ['.ts', '.tsx'],
	/*paths: {
	 $: 'lib/jquery-3.1.1',
	 react: 'lib/react'
	 }*/
});


// 设置成是模块化 js, 编译后会被 define 包裹。
fis.match('**/*.{ts,tsx}', {
	//wrap : false,
	//useSameNameRequire: true,// 开启同名依赖
	isMod: true
});


fis.match('::package', {
	postpackager: fis.plugin('loader'),
	useSourceMap: true // 合并后开启 SourceMap 功能。
});


//SCSS Compile
fis.match('*.scss', {
	parser: fis.plugin('node-sass', {
		outputStyle: 'compact',
		sourceMap: true
	}),
	rExt: '.css'
});


fis.match('{/@types/**.*,/mock/**.*}', {
	release: false
});


var js = ['/lib/plugins.js'];
fis.match('{**.html,/js/config.js}', {
	parser: fis.plugin('art-template', {
		//native: true, //默认为false，即简单语法模式
		//openTag: '<%', //默认为{{
		//closeTag: '%>',//默认为}}
		compress: false,//默认为false

		define: {
			js: js,
			bodyType: 'whiteFrame',
			__layout: '/comm/layout.html',
			'page/':{
				'withoutLayout.html' : {
					__layout: null
				}
			},
			'comm/': {
				release: false
			}
		}
	})
});

// fis3 server start --root ../dist
// fis3 release dev -d ../dist

