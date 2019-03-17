#!/usr/bin/env node

'use strict';

const Liftoff = require('liftoff');
const args = process.argv.slice(2);
const argv = require('minimist')(args);
const v8flags = require('v8flags');
const interpret = require('interpret');
const chalk = require('chalk');
const ora = require('ora');

const nodecodestore = require('./generator');
const out = require('./console-out');
const {combineBypassData} = require('./bypass');
const {getBypassAndGenerator, handleArgFlags} = require('./input-processing');

const codestore = new Liftoff({
	name: 'codestore',
	extensions: interpret.jsVariants,
	v8flags: v8flags
});

codestore.launch({
	cwd: argv.cwd,
	configPath: argv.codestorefile,
	require: argv.require,
	completion: argv.completion
}, run);

function run(env) {
	const codestorefilePath = env.configPath;

	// handle basic argument flags like --help, --version, etc
	handleArgFlags(env);

	// set the default base path to the codestorefile directory
	const codestore = nodecodestore(codestorefilePath, {
		force: argv.force || argv.f
	});

	const generators = codestore.getGeneratorList();
	const generatorNames = generators.map(v => v.name);
	const {generatorName, bypassArr, codestoreArgV} = getBypassAndGenerator(codestore);

	// look up a generator and run it with calculated bypass data
	const runGeneratorByName = name => {
		const generator = codestore.getGenerator(name);
		const bypassData = combineBypassData(generator, bypassArr, codestoreArgV);
		doThecodestore(generator, bypassData);
	};

	// hmmmm, couldn't identify a generator in the user's input
	if (!generators.length) {
		// no generators?! there's clearly something wrong here
		console.error(chalk.red('[codestore] ') + 'No generator found in codestorefile');
		process.exit(1);
	} else if (!generatorName && generators.length === 1) {
		// only one generator in this codestorefile... let's assume they
		// want to run that one!
		runGeneratorByName(generatorNames[0]);
	} else if (!generatorName && generators.length > 1 && !bypassArr.length) {
		// more than one generator? we'll have to ask the user which
		// one they want to run.
		out.chooseOptionFromList(generators, codestore.getWelcomeMessage())
			.then(runGeneratorByName)
			.catch((err) => {
				console.error(chalk.red('[codestore] ') + 'Something went wrong with selecting a generator', err);
			});
	} else if (generatorNames.includes(generatorName)) {
		// we have found the generator, run it!
		runGeneratorByName(generatorName);
	} else {
		// we just can't make sense of your input... sorry :-(
		const fuzyGenName = (generatorName + ' ' + args.join(' ')).trim();
		console.error(chalk.red('[codestore] ') + 'Could not find a generator for "' + fuzyGenName + '"');
		process.exit(1);
	}

}

/////
// everybody to the codestore!
//
function doThecodestore(generator, bypassArr) {
	generator.runPrompts(bypassArr)
		.then(answers => {
			const noMap = (argv['show-type-names'] || argv.t);
			const progress = ora();
			const onComment = (msg) => {
				progress.info(msg); progress.start();
			};
			const onSuccess = (change) => {
				let line = '';
				if (change.type) { line += ` ${out.typeMap(change.type, noMap)}`; }
				if (change.path) { line += ` ${change.path}`; }
				progress.succeed(line); progress.start();
			};
			const onFailure = (fail) => {
				let line = '';
				if (fail.type) { line += ` ${out.typeMap(fail.type, noMap)}`; }
				if (fail.path) { line += ` ${fail.path}`; }
				const errMsg = fail.error || fail.message;
				if (errMsg) { line += ` ${errMsg}` };
				progress.fail(line); progress.start();
			};
			progress.start();
			return generator.runActions(answers, {onSuccess, onFailure, onComment})
				.then(() => progress.stop());
		})
		.catch(function (err) {
			console.error(chalk.red('[ERROR]'), err.message);
			process.exit(1);
		});
}
