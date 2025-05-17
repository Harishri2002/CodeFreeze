import * as vscode from 'vscode';
import { ReadOnlyManager } from './readOnlyManager';
import { StatusBarManager } from './statusBarItem';
import { NotificationManager } from './notification';
import { DecorationManager } from './decoration';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Read-Only Mode extension is now active');

    // Initialize main components
    const readOnlyManager = new ReadOnlyManager(context);
    const statusBarManager = new StatusBarManager(context);
    
    // Register commands
    const toggleCommand = vscode.commands.registerCommand('CodeFreeze.toggle', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }
        
        const document = editor.document;
        const isReadOnly = readOnlyManager.toggleReadOnly(document.uri);
        
        // Save state immediately after toggling
        readOnlyManager.saveReadOnlyState();
        
        // Update status bar
        statusBarManager.updateStatusBar(isReadOnly);
        
        // Apply decorations
        DecorationManager.applyDecorations(editor, isReadOnly);
        
        // Show notification
        const fileName = path.basename(document.fileName);
        NotificationManager.showReadOnlyNotification(isReadOnly, fileName);
    });

    // Handle editor change
    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const isReadOnly = readOnlyManager.isReadOnly(editor.document.uri);
            statusBarManager.updateStatusBar(isReadOnly);
            DecorationManager.applyDecorations(editor, isReadOnly);
        } else {
            statusBarManager.hideStatusBar();
        }
    });

    // Listen for document save attempts
    const onWillSaveTextDocument = vscode.workspace.onWillSaveTextDocument(e => {
        const isReadOnly = readOnlyManager.isReadOnly(e.document.uri);
        
        if (isReadOnly) {
            // Cancel the save operation
            e.waitUntil(Promise.resolve([]));
            
            // Show notification
            vscode.window.showWarningMessage(
                `Cannot save ${path.basename(e.document.fileName)} - file is in Read-Only mode`
            );
        }
    });

    // Add command palette integration
    const showCommandPalette = vscode.commands.registerCommand('CodeFreeze.showStatus', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const isReadOnly = readOnlyManager.isReadOnly(editor.document.uri);
            const fileName = path.basename(editor.document.fileName);
            vscode.window.showInformationMessage(
                isReadOnly ? 
                `${fileName} is currently in READ-ONLY mode. Use Ctrl+Alt+L to toggle.` : 
                `${fileName} is currently EDITABLE. Use Ctrl+Alt+L to toggle read-only mode.`
            );
        }
    });

    // Push subscriptions to context
    context.subscriptions.push(toggleCommand);
    context.subscriptions.push(showCommandPalette);
    context.subscriptions.push(onDidChangeActiveEditor);
    context.subscriptions.push(onWillSaveTextDocument);
    
    // Initialize status bar for current editor
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const isReadOnly = readOnlyManager.isReadOnly(activeEditor.document.uri);
        statusBarManager.updateStatusBar(isReadOnly);
        DecorationManager.applyDecorations(activeEditor, isReadOnly);
    }

    // When new document is opened, check if it should be read-only
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            const isReadOnly = readOnlyManager.isReadOnly(document.uri);
            if (isReadOnly) {
                // Find the editor for this document
                vscode.window.visibleTextEditors.forEach(editor => {
                    if (editor.document.uri.toString() === document.uri.toString()) {
                        DecorationManager.applyDecorations(editor, true);
                        statusBarManager.updateStatusBar(true);
                    }
                });
            }
        })
    );
}

export function deactivate() {
    console.log('Read-Only Mode extension is deactivated');
}