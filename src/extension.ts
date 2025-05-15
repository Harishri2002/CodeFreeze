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
    const toggleCommand = vscode.commands.registerCommand('read-only-mode.toggle', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }
        
        const document = editor.document;
        const isReadOnly = readOnlyManager.toggleReadOnly(document.uri);
        
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
    const showCommandPalette = vscode.commands.registerCommand('read-only-mode.showStatus', () => {
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
}

export function deactivate() {
    console.log('Read-Only Mode extension is deactivated');
}
