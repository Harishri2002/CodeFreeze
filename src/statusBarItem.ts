import * as vscode from 'vscode';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            1000 // High priority for visibility
        );
        
        this.statusBarItem.command = 'CodeFreeze.toggle';
        this.statusBarItem.tooltip = 'Toggle Read-Only Mode';
        this.statusBarItem.hide();
        
        context.subscriptions.push(this.statusBarItem);
    }

    /**
     * Updates the status bar to reflect the current read-only state
     * @param isReadOnly Whether the current file is read-only
     */
    public updateStatusBar(isReadOnly: boolean): void {
        if (isReadOnly) {
            this.statusBarItem.text = '$(lock) READ-ONLY';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.show();
        } else {
            this.statusBarItem.text = '$(edit) EDITABLE';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.show();
        }
    }

    /**
     * Hides the status bar item
     */
    public hideStatusBar(): void {
        this.statusBarItem.hide();
    }
}