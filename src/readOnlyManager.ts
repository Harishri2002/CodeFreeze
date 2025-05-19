import * as vscode from 'vscode';
import * as path from 'path';
import { DecorationManager } from './decoration';

export class ReadOnlyManager {
    private context: vscode.ExtensionContext;
    private readOnlyDocuments: Set<string>;
    private readonly storageKey = 'readOnlyDocuments';
    private isUndoing: boolean = false;
    private documentSnapshots: Map<string, string> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.readOnlyDocuments = new Set<string>(this.loadReadOnlyState());
        
        // Register event handlers
        context.subscriptions.push(
            // Intercept text changes in read-only documents
            vscode.workspace.onDidChangeTextDocument(e => {
                if (!this.isUndoing && this.isReadOnly(e.document.uri) && e.contentChanges.length > 0) {
                    // Flag that we're handling an edit so we don't create an infinite loop
                    this.isUndoing = true;
                    
                    // Get a snapshot of the document content if we have one
                    this.restoreDocumentContent(e.document).then(() => {
                        // Show warning
                        vscode.window.showWarningMessage(
                            `Cannot edit ${path.basename(e.document.fileName)} - file is in Read-Only mode`
                        );
                        
                        // Reset flag
                        this.isUndoing = false;
                    });
                }
            }),
            
            // Block save operations on read-only documents
            vscode.workspace.onWillSaveTextDocument(e => {
                if (this.isReadOnly(e.document.uri)) {
                    // Cancel the save operation
                    e.waitUntil(Promise.resolve([]));
                    
                    vscode.window.showWarningMessage(
                        `Cannot save ${path.basename(e.document.fileName)} - file is in Read-Only mode`
                    );
                }
            })
        );
        
        // Apply saved read-only state to all open editors when extension starts
        this.restoreReadOnlyState();
    }

    /**
     * Restore document content using stored snapshot
     * @param document Document to restore
     */
    private async restoreDocumentContent(document: vscode.TextDocument): Promise<void> {
        const key = this.getDocumentKey(document.uri);
        const snapshot = this.documentSnapshots.get(key);
        
        if (snapshot !== undefined) {
            // Try to find an editor for this document
            const editor = vscode.window.visibleTextEditors.find(
                e => e.document.uri.toString() === document.uri.toString()
            );
            
            if (editor) {
                // Replace the entire document content with the snapshot
                const fullRange = new vscode.Range(
                    0, 0,
                    document.lineCount - 1,
                    document.lineAt(document.lineCount - 1).text.length
                );
                
                await editor.edit(editBuilder => {
                    editBuilder.replace(fullRange, snapshot);
                });
            } else {
                // Fallback to document reloading
                await vscode.commands.executeCommand('workbench.action.files.revert');
            }
        } else {
            // No snapshot available, use standard undo
            await vscode.commands.executeCommand('undo');
        }
    }

    /**
     * Toggles the read-only state of a document
     * @param uri Document URI
     * @returns New read-only state
     */
    public toggleReadOnly(uri: vscode.Uri): boolean {
        const key = this.getDocumentKey(uri);
        const document = this.findDocumentByUri(uri);
        
        if (this.readOnlyDocuments.has(key)) {
            // Make document editable
            this.readOnlyDocuments.delete(key);
            // Remove the snapshot
            this.documentSnapshots.delete(key);
            return false;
        } else {
            // Make document read-only
            this.readOnlyDocuments.add(key);
            
            // Store a snapshot of the current document content
            if (document) {
                this.documentSnapshots.set(key, document.getText());
            }
            
            return true;
        }
    }

    /**
     * Find document by URI
     * @param uri Document URI
     * @returns TextDocument or undefined
     */
    private findDocumentByUri(uri: vscode.Uri): vscode.TextDocument | undefined {
        return vscode.workspace.textDocuments.find(
            doc => doc.uri.toString() === uri.toString()
        );
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
            const uri = editor.document.uri;
            const isReadOnly = this.isReadOnly(uri);
            
            if (isReadOnly) {
                // Store a snapshot of the current document content
                this.documentSnapshots.set(
                    this.getDocumentKey(uri),
                    editor.document.getText()
                );
                
                // Apply decorations
                DecorationManager.applyDecorations(editor, true);
            }
        });
    }
}