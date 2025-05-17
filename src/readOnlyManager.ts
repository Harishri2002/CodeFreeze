import * as vscode from 'vscode';
import * as path from 'path';
import { DecorationManager } from './decoration';

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
        
        // Apply saved read-only state to all open editors when extension starts
        this.restoreReadOnlyState();
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
            return false;
        } else {
            this.readOnlyDocuments.add(key);
            return true;
        }
        
        // Save state after changes
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
    public saveReadOnlyState(): void {
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

    /**
     * Restores read-only state for all open editors from saved state
     */
    private restoreReadOnlyState(): void {
        // Apply to all currently open editors
        vscode.window.visibleTextEditors.forEach(editor => {
            const isReadOnly = this.isReadOnly(editor.document.uri);
            if (isReadOnly) {
                DecorationManager.applyDecorations(editor, true);
            }
        });
    }
}