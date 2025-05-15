import * as vscode from 'vscode';
import * as path from 'path';

export class ReadOnlyManager {
    private context: vscode.ExtensionContext;
    private readOnlyDocuments: Set<string>;
    private readonly storageKey = 'readOnlyDocuments';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.readOnlyDocuments = new Set<string>(this.loadReadOnlyState());
        
        // Listen for text edit attempts on read-only files
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(e => this.handleTextDocumentChange(e))
        );
    }

    /**
     * Toggles the read-only state of a document
     * @param uri Document URI
     * @returns New read-only state
     */
    public toggleReadOnly(uri: vscode.Uri): boolean {
        const key = this.getDocumentKey(uri);
        
        if (this.readOnlyDocuments.has(key)) {
            this.readOnlyDocuments.delete(key);
            this.applyReadOnlyDecorations(uri, false);
            return false;
        } else {
            this.readOnlyDocuments.add(key);
            this.applyReadOnlyDecorations(uri, true);
            return true;
        }
        
        // Save state
        this.saveReadOnlyState();
    }

    /**
     * Checks if a document is read-only
     * @param uri Document URI
     * @returns True if the document is read-only
     */
    public isReadOnly(uri: vscode.Uri): boolean {
        return this.readOnlyDocuments.has(this.getDocumentKey(uri));
    }

    /**
     * Handles text document change events
     * @param event Text document change event
     */
    private handleTextDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        const uri = event.document.uri;
        
        if (this.isReadOnly(uri) && event.contentChanges.length > 0) {
            // If changes were made to a read-only document, undo them
            vscode.commands.executeCommand('undo').then(() => {
                vscode.window.showWarningMessage(
                    `Cannot edit ${path.basename(uri.fsPath)} - file is in Read-Only mode`
                );
            });
        }
    }

    /**
     * Applies decorations to indicate read-only status
     * @param uri Document URI
     * @param isReadOnly Whether the document is read-only
     */
    private applyReadOnlyDecorations(uri: vscode.Uri, isReadOnly: boolean): void {
        const editor = vscode.window.activeTextEditor;
        
        if (editor && editor.document.uri.toString() === uri.toString()) {
            const editorConfig = vscode.workspace.getConfiguration('editor');
            const originalColor = editorConfig.get<string>('background');
            
            // Apply a slightly different background color for read-only files
            vscode.workspace.getConfiguration().update(
                'workbench.colorCustomizations',
                {
                    'editor.background': isReadOnly ? originalColor : originalColor
                },
                vscode.ConfigurationTarget.Workspace
            );
        }
    }

    /**
     * Converts a URI to a string key for storage
     * @param uri Document URI
     * @returns String key
     */
    private getDocumentKey(uri: vscode.Uri): string {
        return uri.toString();
    }

    /**
     * Saves the read-only state to persistent storage
     */
    private saveReadOnlyState(): void {
        this.context.globalState.update(
            this.storageKey,
            Array.from(this.readOnlyDocuments)
        );
    }

    /**
     * Loads the read-only state from persistent storage
     * @returns Array of read-only document keys
     */
    private loadReadOnlyState(): string[] {
        return this.context.globalState.get<string[]>(this.storageKey) || [];
    }
}