/**
 * decoration.ts - Handle editor decorations for read-only files
 */
import * as vscode from 'vscode';

export class DecorationManager {
    private static readonly decorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });
    
    private static readonly headerDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: ' READ-ONLY MODE ',
            color: '#ffffff',
            backgroundColor: '#cc0000',
            margin: '0 0 0 2em',
            border: '1px solid #cc0000',
            // borderRadius: '3px'
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
            
            // Add subtle background to entire document
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