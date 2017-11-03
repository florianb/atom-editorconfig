const importLazy = require('import-lazy')(require);

const editorconfigJs = importLazy('editorconfig');
const camelcaseKeys = importLazy('camelcase-keys');

const {CompositeDisposable} = importLazy('atom');

const initialAttributes = {
	buffer: undefined, // Reference to the corresponding TextBuffer-instance
	disposables: new CompositeDisposable(),
	state: 'subtle',
	settings: {}
};

module.exports = class Editorconfig {
	constructor(buffer) {
		Object.assign(this, initialAttributes, {
			buffer
		});
	}

	// Applies the settings to the current editor
	applySettings() {
		const buffer = this.buffer;
		const editor = this._getCurrentEditor();

		// Stop if this editorconfig-object doesn't belong to the buffer
		if (!editor || editor.getBuffer() !== buffer) {
			return;
		}

		// Get the configuration for the current language scope
		const configOptions = {scope: editor.getRootScopeDescriptor()};
		const settings = this.settings;

		if ('indentStyle' in settings) {
			editor.setSoftTabs(settings.indentStyle === 'space');
		} else {
			const usesSoftTabs = editor.usesSoftTabs();
			if (usesSoftTabs === undefined) {
				editor.setSoftTabs(atom.config.get('editor.softTabs', configOptions));
			} else {
				editor.setSoftTabs(usesSoftTabs);
			}
		}

		if ('tabWidth' in settings) {
			editor.setTabLength(settings.tabWidth);
		} else {
			editor.setTabLength(atom.config.get('editor.tabLength', configOptions));
		}

		if (!('charset' in settings)) {
			buffer.setEncoding(settings.charset);
		} else {
			buffer.setEncoding(atom.config.get('core.fileEncoding', configOptions));
		}

		const editorParams = {};
		if ('maxLineLength' in settings) {
			editorParams.preferredLineLength = settings.maxLineLength;
		} else {
			editorParams.preferredLineLength =
			atom.config.get('editor.preferredLineLength', configOptions);
		}
		// Inofficial API in the text-editor
		editor.update(editorParams);

		if ('endOfLine' in settings) {
			// Inofficial API in the text-buffer
			buffer.setPreferredLineEnding(settings.endOfLine);
		}
	}

	// Parses the editorconfig responsible for referenced buffer
	parseEditorconfig() {
		const file = this.buffer.getUri();
		if (!file) {
			return;
		}

		editorconfigJs
			.parse(this.buffer.getUri())
			.then(result => {
				this.settings = camelcaseKeys(result);
			})
			.then(result => {
				this.applySettings();
				console.dir(this);
			})
			.catch(Error, e => {
				console.warn(`atom-editorconfig: ${e}`);
			});
	}

	// OnWillSave-Event-Handler
	// Trims whitespaces and inserts/strips final newline before saving
	onWillSave() {
		const buffer = this.buffer;
		const settings = this.settings;

		if ('trimTrailingWhitespace' in settings) {
			buffer.backwardsScan(/[ \t]+$/gm, params => {
				if (params.match[0].length > 0) {
					params.replace('');
				}
			});
		}

		if ('insertFinalNewline' in settings) {
			const lastRow = buffer.getLineCount() - 1;

			if (buffer.isRowBlank(lastRow)) {
				let stripStart = buffer.previousNonBlankRow(lastRow);

				if (settings.insertFinalNewline === true) {
					stripStart += 1;
				}
				// Strip empty lines from the end
				if (stripStart < lastRow) {
					buffer.deleteRows(stripStart + 1, lastRow);
				}
			} else if (settings.insertFinalNewline === true) {
				buffer.append('\n');
			}
		}
	}

	// Returns the current TextEditor of undefined if not found
	_getCurrentEditor() {
		return atom.workspace.getTextEditors().reduce((prev, curr) => {
			return (curr.getBuffer() === this.buffer && curr) || prev;
		}, undefined);
	}
};
