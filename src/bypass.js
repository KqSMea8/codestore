const out = require('./console-out');

module.exports = {
	combineBypassData
};

/**
 * Combine different types of bypass data
 * @param generator - The generator object involved
 * @param bypassArr - The array of overwritten properties
 * @param codestoreArgV - The original args passed to codestore without using names
 */
function combineBypassData(generator, bypassArr, codestoreArgV) {
	// Get named prompts that are passed to the command line
	const promptNames = generator.prompts.map((prompt) => prompt.name);
	// Check if bypassArr is too long for promptNames
	if (bypassArr.length > promptNames.length) {
		console.error(chalk.red('[codestore] ') + 'Too many bypass arguments passed for "' + generator.name + '"');
		out.getHelpMessage(generator);
		process.exit(1);
	}

	let namedBypassArr = [];
	if (Object.keys(codestoreArgV).length > 0) {
		// Let's make sure we made no whoopsy-poos (AKA passing incorrect inputs)
		let errors = false;
		Object.keys(codestoreArgV).forEach((arg) => {
			if (!(promptNames.find((name) => name === arg)) && arg !== '_') {
				console.error(chalk.red('[codestore] ') + '"' + arg + '"' + ' is an invalid argument for "' + generator.name + '"');
				errors = true;
			}
		});
		if (errors) {
			out.getHelpMessage(generator);
			process.exit(1);
		}
		namedBypassArr = promptNames.map((name) => codestoreArgV[name] ? codestoreArgV[name] : undefined);
	}

	// merge the bypass data with named bypass values
	const mergedBypass = mergeArrays(bypassArr, namedBypassArr);
	// clean up `undefined` values
	return mergedBypass.map(v => v === undefined ? '_' : v);
}

function mergeArrays(baseArr, overlay) {
	const length = Math.max(baseArr.length, overlay.length);
	return (new Array(length)).fill().map(
		(v, i) => overlay[i] !== undefined ? overlay[i] : baseArr[i]
	);
}
