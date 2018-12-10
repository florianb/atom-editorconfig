/* This file contains all specs to ensure the base-functionality of
the plugin. */

import fs from 'fs';

import test from 'ava';

const atomEnv = require('../ava-runner')()

//import printen from 'printen';

//import runTestHelpers from './helpers';

const envParams = {
	files: {
		base: 'base'
	}
};

test('Atom-editorconfig should have been loaded', t => {
	t.deepEqual(atomEnv, {})
	//t.truthy(atom.packages.getActivePackage('editoroconfig'));
});

//
// describe('editorconfig', () => {
// 	const h = runTestHelpers(envParams);
//
// 	it('should have been loaded', () => {
// 		fs.writeFileSync('test.log', printen({this: 'blah'}));
// 		expect(h.pkg).not.toBeUndefined();
// 		expect(h.pkg.isCompatible()).toBeTruthy();
// 	});
// 	//
// 	// it('should provide the EditorConfig:generate-config command', () => {
// 	// 	const commands = atom.commands.findCommands({target: atom.views.getView(atom.workspace)});
// 	//
// 	// 	expect(commands.reduce((a, c) => {
// 	// 		return c.name === 'EditorConfig:generate-config' || a;
// 	// 	}, false)).toBeTruthy();
// 	// });
// 	//
// 	// it('should provide the EditorConfig:show-state command', () => {
// 	// 	const commands = atom.commands.findCommands({target: atom.views.getView(atom.workspace)});
// 	//
// 	// 	expect(commands.reduce((a, c) => {
// 	// 		return c.name === 'EditorConfig:show-state' || a;
// 	// 	}, false)).toBeTruthy();
// 	// });
// 	//
// 	// it('should provide the EditorConfig:fix-file command', () => {
// 	// 	const commands = atom.commands.findCommands({target: atom.views.getView(atom.workspace)});
// 	//
// 	// 	expect(commands.reduce((a, c) => {
// 	// 		return c.name === 'EditorConfig:fix-file' || a;
// 	// 	}, false)).toBeTruthy();
// 	// });
// 	//
// 	// it('should have set the indent_style to "space"', () => {
// 	// 	expect(this.env.baseEditor.getSoftTabs()).toBeTruthy();
// 	// });
// 	//
// 	// it('should have set the indent_size to 2 characters', () => {
// 	// 	expect(this.env.baseEditor.getTabLength()).toEqual(2);
// 	// });
// 	//
// 	// it('should have set the end_of_line-character to "lf"', () => {
// 	// 	expect(this.env.baseEditor.getBuffer().getPreferredLineEnding()).toMatch('\n');
// 	// });
// 	//
// 	// it('should have set the charset of the document to "utf8"', () => {
// 	// 	expect(this.env.baseEditor.getEncoding()).toMatch('utf8');
// 	// });
// });
