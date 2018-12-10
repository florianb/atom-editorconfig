/** @babel */

import fs from 'fs';
import path from 'path';

const prepareEnvironment = params => {
	const initialPromises = [
		atom.packages.activatePackage('editorconfig')
			.then(p => {
				return Promise.resolve({
					pkg: p.mainModule
				});
			})
	];

	if (params.files && typeof params.files === 'object') {
		Object.keys(params.files).forEach(file => {
			initialPromises.push(
				atom.workspace.open(params.files[file])
					.then(e => {
						const result = {};

						result[`${file}Editor`] = e;

						return Promise.resolve(result);
					})
			);
		});
	}

	return Promise.all(initialPromises)
		.then(results => {
			const combinedResult = {};

			results.forEach(result => {
				Object.assign(combinedResult, result);
			});

			return Promise.resolve(combinedResult);
		});
};

function runTestHelpers(params) {
	const result = {};

	result.envParams = {files: {}};
	Object.assign(result.envParams, params);

	Object.keys(result.envParams.files).forEach(file => {
		if (path.isAbsolute(file)) {
			result.envParams.files[file] = path.normalize(file);
		} else {
			const testPrefix = path.basename(__filename).split('-').shift();

			result.envParams.files[file] = path.join(
				__dirname,
				'fixtures',
				`fixture-${testPrefix}.${file}`
			);
		}
	});

	beforeEach(() => {
		waitsForPromise(() => prepareEnvironment(params)
			.then(e => {
				result.env = e;

				return Promise.resolve();
			})
		);
	});

	afterEach(() => {
		// Remove the created fixtures, if they exist
		runs(() => {
			Object.keys(result.envParams.files).forEach(file => {
				const filePath = result.envParams.files[file];
				fs.stat(filePath, (err, stats) => {
					if (!err && stats.isFile()) {
						fs.unlink(filePath);
					}
				});
			});
		});

		waitsFor(() => {
			try {
				let fixturesRemoved = true;

				Object.keys(result.envParams.files).forEach(file => {
					const filePath = result.envParams.files[file];

					if (fs.statSync(filePath).isFile() === true) {
						fixturesRemoved = false;
					}
				});

				return fixturesRemoved;
			} catch (err) {
				return true;
			}
		}, 5000, `removed all fixture-files`);
	});

	return result;
}

export default runTestHelpers;
