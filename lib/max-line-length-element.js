const importLazy = require('import-lazy')(require);

const atm = importLazy('atom');

module.exports = function (ecfg, editor, editorElement) {
	return {
		ecfg,
		editor,
		editorElement,

		initialize() {
			this.element = document.createElement('div');
			this.element.setAttribute('is', 'max-line-length');
			this.element.classList.add('max-line-length');

			if (this.attachToScrollView()) {
				this.handleEvents();
				this.updateGuide();
				console.info('added element');
			}
		},

		attachToScrollView() {
			const scrollView = this.editorElement.querySelector('.scroll-view');
			if (scrollView && !this.editorElement.editorconfig) {
				scrollView.appendChild(this.element);
				this.editorElement.editorconfig = this.ecfg;

				return true;
			}
			return false;
		},

		handleEvents() {
			const subscriptions = new (atm().CompositeDisposable)();
			subscriptions.add(
				atom.config.onDidChange('editor.fontSize', () => {
					setTimeout(this.updateGuide, 0);
				})
			);
			subscriptions.add(
				this.editorElement.onDidChangeScrollLeft(() => {
					this.updateGuide();
				})
			);
			subscriptions.add(
				this.editor.onDidDestroy(() => subscriptions.dispose())
			);
			subscriptions.add(
				this.editorElement.onDidAttach(() => {
					this.attachToScrollView();
					this.updateGuide();
				})
			);
		},

		getGuideColumn() {
			const maxLineLength = this.ecfg.settings.max_line_length;

			if (Number.isInteger(maxLineLength)) {
				return maxLineLength;
			}
			return 0;
		},

		updateGuide() {
			const column = this.getGuideColumn();
			// Console.info('References:');
			// console.dir(this.editor);
			// console.dir(this.editorElement);
			// console.dir(this.ecfg);
			// console.info('column:', column);
			// console.info('defaultCharacterWidth:', this.editorElement.getDefaultCharacterWidth());

			if (column > 0) {
				let left = this.editorElement.getDefaultCharacterWidth() * column;
				// Console.info('defaultCharacterWidth:', this.editorElement.getDefaultCharacterWidth());

				// console.info(left);

				left -= this.editorElement.getScrollLeft();

				// Console.info(left);
				this.element.left = `${Math.round(left)}px`;
				// Console.info('element.left:', this.element.left);
				this.element.style.display = 'block';
			} else {
				this.element.style.display = 'none';
			}
		}
	};
};
