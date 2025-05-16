import * as vscode from 'vscode';

export class DecorationManager {
    // Instead of using specific colors, we'll use theme color identifiers
    // that will adapt to the user's current theme
    private static readonly decorationType = vscode.window.createTextEditorDecorationType({
        opacity: '1',
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });
    
    private static readonly headerDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: ' READ-ONLY MODE ',
            margin: '0 0 0 2em',
            border: '1px solid var(--vscode-editorWarning-foreground)',
        }
    });

    private static readonly documentDecorationType = vscode.window.createTextEditorDecorationType({
        opacity: '0.7', // Makes the text appear lighter
        color: 'var(--vscode-editor-foreground)',
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });
    
    /**
     * Applies or removes read-only decorations from an editor
     * @param editor The text editor
     * @param isReadOnly Whether to apply read-only decorations
     */
    public static applyDecorations(editor: vscode.TextEditor, isReadOnly: boolean): void {
        if (isReadOnly) {
            const firstLine = editor.document.lineAt(0);
            const headerRange = new vscode.Range(
                firstLine.range.start,
                firstLine.range.end
            );
            
            editor.setDecorations(this.headerDecorationType, [headerRange]);
        
            const documentRange = new vscode.Range(
                0, 0,
                editor.document.lineCount - 1,
                editor.document.lineAt(editor.document.lineCount - 1).text.length
            );
            
            editor.setDecorations(this.decorationType, [documentRange]);
        } else {
            // Clear decorations
            editor.setDecorations(this.headerDecorationType, []);
            editor.setDecorations(this.decorationType, []);
        }
    }
}