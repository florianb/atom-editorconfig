const importLazy = require('import-lazy')(require);

const generateConfig = importLazy('./commands/generate');
const showState = importLazy('./commands/show');
const fixFile = importLazy('./commands/fix');

const atom = importLazy('atom');

module.exports = {
	activate(state) {
		this.ecfgs = new WeakSet();
		this.editors = new WeakMap();
		
	},
	serialize() {},
	deactivate() {}
}