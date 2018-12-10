const os = require('os');
const path = require('path');

const execa = require('execa');

let initialized = false;
let testParams;
let atom;
let app;

module.exports = params => {
	testParams = params;
	
	app = this.buildDefaultApplicationDelegate();
	atom = params.buildAtomEnvironment({
		applicationDelegate: app,
		configDirPath: path.join(os.homedir(), '.atom'),
		enablePersistence: false
	});

	console.log(testParams.testPaths.join('\n'));

	return execa(
		'ava',
		['--serial'].concat(params.testPaths),
		{
			stdio: 'inherit',
			env: {FORCE_COLOR: true}
		}
	).then(() => Promise.resolve(0))
	.catch(err => Promise.resolve(err.code));
};
