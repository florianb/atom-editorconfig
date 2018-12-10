const importLazy = require('import-lazy')(require);
const cloneDeep = importLazy('clone-deep');

const Editorconfig = importLazy('./lib/editorconfig');
const generateCommand = importLazy('./commands/generate');
const showCommand = importLazy('./commands/show');
const fixCommand = importLazy('./commands/fix');


module.exports = {
	activate(state) {
		this.buffers = new WeakMap();

		atom.commands.add('atom-workspace', 'EditorConfig:generate-config', generateCommand);
		atom.commands.add('atom-workspace', 'EditorConfig:show-state', showCommand);
		atom.commands.add('atom-workspace', 'EditorConfig:fix-file', fixCommand);

		atom.workspace.observeTextEditors(editor => {
			if (!editor) {
				return;
			}

			const buffer = editor.getBuffer();
			const ecfg = new Editorconfig(buffer);

			buffer.editrconfig = ecfg;
			ecfg.parseEditorconfig();

			if (!this.buffers.has(buffer)) {
				this.buffers.set(buffer, ecfg);
			}
		});
	},
	requestEditorconfigSettings(service) {
		this.getEditorconfigSettings = service
	},
	provideEditorconfigSettings(buffer) {
		const ecfg = this.buffers.get(buffer)

		if (!ecfg) {
			return;
		}

		return cloneDeep(ecfg.settings);
	},
	serialize() {},
	deactivate() {}
}
