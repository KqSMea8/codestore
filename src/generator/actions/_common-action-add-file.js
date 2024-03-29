const path = require('path')
const del = require('del')
const actionUtils = require('./_common-action-utils')
const isBinary = require('isbinaryfile')
const fspp = require('../fs-promise-proxy')

module.exports = function* addFile(data, cfg, plop) {
	const fileDestPath = actionUtils.makeDestPath(data, cfg, plop);
	const { force, skipIfExists = false } = cfg;
	try {
		// check path
		let destExists = yield fspp.fileExists(fileDestPath);

		// if we are forcing and the file already exists, delete the file
		if (force === true && destExists) {
			yield del([fileDestPath]);
			destExists = false;
		}

		// we can't create files where one already exists
		if (destExists) {
			if (skipIfExists) { return `[SKIPPED] ${fileDestPath} (exists)`; }
			throw `File already exists\n -> ${fileDestPath}`;
		} else {
			yield fspp.makeDir(path.dirname(fileDestPath));

			const absTemplatePath = cfg.templateFile
				&& path.resolve(plop.getPlopfilePath(), cfg.templateFile)
				|| null;

			if (absTemplatePath != null && isBinary.sync(absTemplatePath)) {
				const rawTemplate = yield fspp.readFileRaw(cfg.templateFile);
				yield fspp.writeFileRaw(fileDestPath, rawTemplate);
			} else {
				const renderedTemplate = yield actionUtils.getRenderedTemplate(data, cfg, plop);
				yield fspp.writeFile(fileDestPath, renderedTemplate);
			}

			// keep the executable flags
			if (absTemplatePath != null) {
				const sourceStats = yield fspp.stat(absTemplatePath);
				const destStats = yield fspp.stat(fileDestPath);
				const executableFlags = sourceStats.mode & (
					fspp.constants.S_IXUSR | fspp.constants.S_IXGRP | fspp.constants.S_IXOTH
				);
				yield fspp.chmod(fileDestPath, destStats.mode | executableFlags);
			}
		}

		// return the added file path (relative to the destination path)
		return actionUtils.getRelativeToBasePath(fileDestPath, plop);
	} catch (err) {
		actionUtils.throwStringifiedError(err);
	}
}
