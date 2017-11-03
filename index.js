const importLazy = require('import-lazy')(require);

const Editorconfig = importLazy('./lib/editorconfig');
const generateConfig = importLazy('./commands/generate');
const showState = importLazy('./commands/show');
const fixFile = importLazy('./commands/fix');

module.exports = {
	activate(state) {
		this.buffers = new WeakMap();

		atom.workspace.observeTextEditors(editor => {
			if (!editor) {
				return;
			}

			const buffer = editor.getBuffer();
			const ecfg = new Editorconfig(buffer);
			ecfg.parseEditorconfig();

			if (!this.buffers.has(buffer)) {
				this.buffers.set(buffer, ecfg);
			}
		});
	},
	serialize() {},
	deactivate() {}
}

