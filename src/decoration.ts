/**
 * decoration.ts - Handle editor decorations for read-only files
 */
import * as vscode from 'vscode';

export class DecorationManager {
    // Instead of using specific colors, we'll use theme color identifiers
    // that will adapt to the user's current theme
    private static readonly decorationType = vscode.window.createTextEditorDecorationType({
        // Don't use background color for the entire document
        // This prevents the white background issue
        opacity: '1',
        border: '1px solid var(--vscode-editorWarning-foreground)',
        borderStyle: 'solid none none none', // Top border only
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });
    
    private static readonly headerDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: ' READ-ONLY MODE ',
            color: 'var(--vscode-editor-foreground)',
            backgroundColor: 'var(--vscode-editorWarning-foreground)',
            margin: '0 0 0 2em',
            border: '1px solid var(--vscode-editorWarning-foreground)',
        }
    });
    
    /**
     * Applies or removes read-only decorations from an editor
     * @param editor The text editor
     * @param isReadOnly Whether to apply read-only decorations
     */
    public static applyDecorations(editor: vscode.TextEditor, isReadOnly: boolean): void {
        if (isReadOnly) {
            // Apply header decoration to the top of the document
            const firstLine = editor.document.lineAt(0);
            const headerRange = new vscode.Range(
                firstLine.range.start,
                firstLine.range.end
            );
            
            editor.setDecorations(this.headerDecorationType, [headerRange]);
            
            // Instead of applying a background to the entire document,
            // let's add a top border to indicate read-only status
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