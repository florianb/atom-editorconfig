/** @babel */
import generateConfig from './commands/generate';
import showState from './commands/show';
import fixFile from './commands/fix';

const importLazy = require('import-lazy')(require);

const checklist = importLazy('./lib/checklist');
const statusTile = importLazy('./lib/statustile-view');
const Editorconfig = importLazy('./lib/editorconfig');

// Sets the state of the embedded editorconfig
// This includes the severity (info, warning..) as well as the notification-messages for users
function setState(ecfg) {
	checklist(ecfg);
	statusTile.updateIcon(ecfg.state);
}

// Initializes the (into the TextBuffer-instance) embedded editorconfig-object
function initializeTextBuffer(buffer) {
	if ('editorconfig' in buffer === false) {
		// eslint-disable-next-line new-cap
		buffer.editorconfig = new (Editorconfig())(buffer);

		// TODO: move that into Editorconfig
		buffer.editorconfig.disposables.add(
			buffer.onWillSave(buffer.editorconfig.onWillSave.bind(buffer.editorconfig))
		);

		if (buffer.getUri() && buffer.getUri().match(/[\\|/]\.editorconfig$/g) !== null) {
			buffer.editorconfig.disposables.add(
				buffer.onDidSave(reapplyEditorconfigs)
			);
		}
	}
}

// Reveal and apply the editorconfig for the given TextEditor-instance
function observeTextEditor(editor) {
	if (!editor) {
		return;
	}

	initializeTextBuffer(editor.getBuffer());
}

// Reapplies the whole editorconfig to **all** open TextEditor-instances
function reapplyEditorconfigs() {
	const textEditors = atom.workspace.getTextEditors();
	textEditors.forEach(editor => {
		observeTextEditor(editor);
	});
}

// Reapplies the settings immediately after changing the focus to a new pane
function observeActivePaneItem(editor) {
	if (editor && editor.constructor.name === 'TextEditor') {
		if (editor.getBuffer().editorconfig) {
			editor.getBuffer().editorconfig.applySettings();
			setState(editor.getBuffer().editorconfig);
		}
	} else {
		statusTile.removeIcon();
	}
}

// Hook into the events to recognize the user opening new editors or changing the pane
const activate = () => {
	generateConfig();
	showState();
	fixFile();
	atom.workspace.observeTextEditors(observeTextEditor);
	atom.workspace.observeActivePaneItem(observeActivePaneItem);
	reapplyEditorconfigs();
};

// Clean the status-icon up, remove all embedded editorconfig-objects
const deactivate = () => {
	const textEditors = atom.workspace.getTextEditors();
	textEditors.forEach(editor => {
		editor.getBuffer().editorconfig.disposables.dispose();
	});
	statusTile.removeIcon();
};

// Apply the statusbar icon-container
// The icon will be applied if needed
const consumeStatusBar = statusBar => {
	if (statusTile.containerExists() === false) {
		statusBar.addRightTile({
			item: statusTile.createContainer(),
			priority: 999
		});
	}
};

export default {activate, deactivate, consumeStatusBar};
