'use strict';

const chalk = require('chalk');
const nodecodestore = require('node-plop');
const fs = require('fs');

const defaultChoosingMessage = chalk.blue('[codestore]') + ' Please choose a generator.';

module.exports = (function () {

	function getHelpMessage(generator) {
		const maxLen = Math.max(...generator.prompts.map(prompt => prompt.name.length));
		console.log([
			'',
			chalk.bold('Options:'),
			...generator.prompts.map(prompt =>
				'  --' + prompt.name +
				' '.repeat(maxLen - prompt.name.length + 2) +
				chalk.dim(prompt.help ? prompt.help : prompt.message)
			)
		].join('\n'));
	}

	function chooseOptionFromList(codestoreList, message) {
		const codestore = nodecodestore();
		const generator = codestore.setGenerator('choose', {
			prompts: [{
				type: 'list',
				name: 'generator',
				message: message || defaultChoosingMessage,
				choices: codestoreList.map(function (p) {
					return {
						name: p.name + chalk.gray(!!p.description ? ' - ' + p.description : ''),
						value: p.name
					};
				})
			}]
		});
		return generator.runPrompts().then(results => results.generator);
	}

	function displayHelpScreen() {
		console.log([
			'',
			chalk.bold('Usage:'),
			'  $ codestore                 ' + chalk.dim('Select from a list of available generators'),
			'  $ codestore <name>          ' + chalk.dim('Run a generator registered under that name'),
			'  $ codestore <name> [input]  ' + chalk.dim('Run the generator with input data to bypass prompts'),
			'',
			chalk.bold('Options:'),
			'  -h, --help             ' + chalk.dim('Show this help display'),
			'  -t, --show-type-names  ' + chalk.dim('Show type names instead of abbreviations'),
			'  -i, --init             ' + chalk.dim('Generate a basic codestorefile.js'),
			'  -v, --version          ' + chalk.dim('Print current version'),
			'  -f, --force            ' + chalk.dim('Run the generator forcefully'),
			'  --codestorefile             ' + chalk.dim('Path to the codestorefile'),
			'  --cwd                  ' + chalk.dim('Directory from which relative paths are calculated against'),
			'  --require              ' + chalk.dim('String or array of modules to require before running codestore'),
			'',
			chalk.bold('Examples:'),
			'  $ ' + chalk.blue('codestore'),
			'  $ ' + chalk.blue('codestore component'),
			'  $ ' + chalk.blue('codestore component "name of component"'),
			'',
		].join('\n'));
	}

	function createInitcodestorefile(cwd, callback){
		var initString = 'module.exports = function (codestore) {\n\n' +
			'\tcodestore.setGenerator(\'basics\', {\n' +
			'\t\tdescription: \'this is a skeleton codestorefile\',\n' +
			'\t\tprompts: [],\n' +
			'\t\tactions: []\n' +
			'\t});\n\n' +
			'};';

		fs.writeFile(cwd + '/codestorefile.js', initString, callback);
	}

	const typeDisplay = {
		'function': chalk.yellow('->'),
		'add': chalk.green('++'),
		'addMany': chalk.green('+!'),
		'modify': `${chalk.green('+')}${chalk.red('-')}`,
		'append': chalk.green('_+')
	};
	const typeMap = (name, noMap) => {
		const dimType = chalk.dim(name);
		return (noMap ? dimType : typeDisplay[name] || dimType);
	};

	return {
	    chooseOptionFromList,
		displayHelpScreen,
		createInitcodestorefile,
		typeMap,
		getHelpMessage
	};
})();
