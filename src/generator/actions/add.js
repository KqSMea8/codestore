const co = require('co')
const actionInterfaceTest = require('./_common-action-interface-check')
const addFile = require('./_common-action-add-file')
const {getRenderedTemplatePath} = require('./_common-action-utils')

module.exports = co.wrap(function* (data, cfg, plop) {
	const interfaceTestResult = actionInterfaceTest(cfg);
	if (interfaceTestResult !== true) { throw interfaceTestResult; }

	cfg.templateFile = getRenderedTemplatePath(data, cfg, plop);

	return yield addFile(data, cfg, plop);
});
