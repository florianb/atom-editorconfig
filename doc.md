Any TextBuffer may be used by multiple TextEditors. In order to apply Editorconfig we rely mostly on the TextEditors API to change editing behavior on the TextBuffer underneath.

THe reason is that the TextBuffer does not expose many useful API functions to apply editorconfig-settings and the TextEditor's API does not support all features of Editorconfig.

This package maintains an Array of editorconfig Objects, one for each Textbuffer. Since we're hooking into the TextEditor's events which are notfying us about the creation Texteditors, we're also maintaining an Array of current TextEditors.

We do so to ocasionally reapply the editorconfig if the filename or path changed.
