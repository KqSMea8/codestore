const co = require('co')
const fspp = require('../fs-promise-proxy')

const actionUtils = require('./_common-action-utils')

const actionInterfaceTest = require('./_common-action-interface-check')

module.exports = co.wrap(function*(data, cfg, plop) {
	const interfaceTestResult = actionInterfaceTest(cfg);
	if (interfaceTestResult !== true) {
		throw interfaceTestResult;
	}
	const fileDestPath = actionUtils.makeDestPath(data, cfg, plop);
	try {
		// check path
		const pathExists = yield fspp.fileExists(fileDestPath);

		if (!pathExists) {
			throw 'File does not exists';
		} else {
			let fileData = yield fspp.readFile(fileDestPath);
			cfg.templateFile = actionUtils.getRenderedTemplatePath(data, cfg, plop);
			const replacement = yield actionUtils.getRenderedTemplate(data, cfg, plop);
			fileData = fileData.replace(cfg.pattern, replacement);
			yield fspp.writeFile(fileDestPath, fileData);
		}
		return actionUtils.getRelativeToBasePath(fileDestPath, plop);
	} catch (err) {
		actionUtils.throwStringifiedError(err);
	}
});
