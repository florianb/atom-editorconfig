/** @babel */
/* eslint-env jasmine, atomtest */

/*
  This file contains verifying specs for:
  https://github.com/sindresorhus/atom-editorconfig/issues/69
*/

import path from 'path';
import deepEql from 'deep-eql';

const projectRoot = path.join(__dirname, 'fixtures');
const filePath = path.join(projectRoot, 'service.txt');

describe('when opening any file', () => {
	let textEditor;
	let packageInstance;

	beforeEach(() => {
		waitsForPromise(() =>
			Promise.all([
				atom.packages.activatePackage('editorconfig').then(p => {
					packageInstance = p.mainModule
				}),
				atom.workspace.open(filePath)
			]).then(results => {
				textEditor = results[1];
			})
		);
	});

	it('the provided services should provide the editorconfig-settings of the buffer', () => {
		const buffer = textEditor.getBuffer();
		const settings = packageInstance.buffers.get(buffer).settings;
		//expect(deepEql(settings, packageInstance.requestEditorconfigSettings(buffer))).toBeTruthy();
	});
});
