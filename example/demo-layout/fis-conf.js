

fis.match('::package', {
	postpackager: fis.plugin('loader'),
	useSourceMap: true
});


fis.match('{**.html,/js/config.js}', {
	parser: fis.plugin('art-template', {
		compress: false,//默认为false
		define: {
			js: ['/lib/plugins.js'] ,
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
