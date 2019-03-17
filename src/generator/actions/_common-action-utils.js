const path = require('path')
const fspp = require('../fs-promise-proxy')

const getFullData = (data, cfg) => Object.assign({}, cfg.data, data);
exports.makeDestPath = (data, cfg, plop) =>
	path.resolve(
		plop.getDestBasePath(),
		plop.renderString(cfg.path || '', getFullData(data, cfg))
	);

exports.getRenderedTemplatePath = function (data, cfg, plop) {
	if (cfg.templateFile) {
		const absTemplatePath = path.resolve(plop.getPlopfilePath(), cfg.templateFile);
		return plop.renderString(absTemplatePath, getFullData(data, cfg));
	}
	return null;
}

const getTemplate = function* (data, cfg, plop) {
	const makeTmplPath = p => path.resolve(plop.getPlopfilePath(), p);

	let { template } = cfg;

	if (cfg.templateFile) {
		template = yield fspp.readFile(makeTmplPath(cfg.templateFile));
	}
	if (template == null) {
		template = '';
	}

	return template;
}
exports.getTemplate = getTemplate

exports.getRenderedTemplate = function* (data, cfg, plop) {
	const template = yield getTemplate(data, cfg, plop);

	return plop.renderString(template, getFullData(data, cfg));
}

exports.getRelativeToBasePath = (filePath, plop) =>
	filePath.replace(path.resolve(plop.getDestBasePath()), '');

exports.throwStringifiedError = err => {
	if (typeof err === 'string') {
		throw err;
	} else {
		throw err.message || JSON.stringify(err);
	}
};
