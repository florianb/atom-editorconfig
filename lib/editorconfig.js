const importLazy = require('import-lazy')(require);

const atm = importLazy('atom');
const editorconfig = importLazy('editorconfig');

const initialAttributes = {
	buffer: undefined, // Reference to the corresponding TextBuffer-instance
	disposables: new (atm().CompositeDisposable)(),
	state: 'subtle',
	settings: {
		trim_trailing_whitespace: 'auto', // eslint-disable-line camelcase
		insert_final_newline: 'auto', // eslint-disable-line camelcase
		max_line_length: 'auto', // eslint-disable-line camelcase
		end_of_line: 'auto', // eslint-disable-line camelcase
		indent_style: 'auto', // eslint-disable-line camelcase
		tab_width: 'auto', // eslint-disable-line camelcase
		charset: 'auto' // eslint-disable-line camelcase
	}
};

module.exports = class Editorconfig {
	constructor(buffer) {
		Object.assign(this, initialAttributes, {
			buffer
		});
	}

	// Applies the settings to the buffer and the corresponding editor
	applySettings() {
		const buffer = this.buffer;
		const editor = this._getCurrentEditor();
		if (!editor) {
			return;
		}
		const configOptions = {scope: editor.getRootScopeDescriptor()};
		const settings = this.settings;

		if (editor && editor.getBuffer() === buffer) {
			if (settings.indent_style === 'auto') {
				const usesSoftTabs = editor.usesSoftTabs();
				if (usesSoftTabs === undefined) {
					editor.setSoftTabs(atom.config.get('editor.softTabs', configOptions));
				} else {
					editor.setSoftTabs(usesSoftTabs);
				}
			} else {
				editor.setSoftTabs(settings.indent_style === 'space');
			}

			if (settings.tab_width === 'auto') {
				editor.setTabLength(atom.config.get('editor.tabLength', configOptions));
			} else {
				editor.setTabLength(settings.tab_width);
			}

			if (settings.charset === 'auto') {
				buffer.setEncoding(atom.config.get('core.fileEncoding', configOptions));
			} else {
				buffer.setEncoding(settings.charset);
			}

			// Max_line_length-settings
			const editorParams = {};
			if (settings.max_line_length === 'auto') {
				editorParams.preferredLineLength =
					atom.config.get('editor.preferredLineLength', configOptions);
			} else {
				editorParams.preferredLineLength = settings.max_line_length;
			}

			// Update the editor-properties
			editor.update(editorParams);

			if (settings.end_of_line !== 'auto') {
				buffer.setPreferredLineEnding(settings.end_of_line);
			}
		}
	}

	// Parses the editorconfig responsible for referenced buffer
	parseEditorconfig() {
		const file = this.buffer.getUri();
		if (!file) {
			return;
		}

		editorconfig()
			.parse(this.buffer.getUri())
			.then(this.setConfig)
			.then(() => this.applySettings())
			.catch(Error, e => {
				console.warn(`atom-editorconfig: ${e}`);
			});
	}

	// OnWillSave-Event-Handler
	// Trims whitespaces and inserts/strips final newline before saving
	onWillSave() {
		const buffer = this.buffer;
		const settings = this.settings;

		if (settings.trim_trailing_whitespace === true) {
			// eslint-disable-next-line max-params
			buffer.backwardsScan(/[ \t]+$/gm, params => {
				if (params.match[0].length > 0) {
					params.replace('');
				}
			});
		}

		if (settings.insert_final_newline !== 'auto') {
			const lastRow = buffer.getLineCount() - 1;

			if (buffer.isRowBlank(lastRow)) {
				let stripStart = buffer.previousNonBlankRow(lastRow);

				if (settings.insert_final_newline === true) {
					stripStart += 1;
				}
				// Strip empty lines from the end
				if (stripStart < lastRow) {
					buffer.deleteRows(stripStart + 1, lastRow);
				}
			} else if (settings.insert_final_newline === true) {
				buffer.append('\n');
			}
		}
	}

	// Get the current Editor for this.buffer
	_getCurrentEditor() {
		return atom.workspace.getTextEditors().reduce((prev, curr) => {
			return (curr.getBuffer() === this.buffer && curr) || prev;
		}, undefined);
	}
};
