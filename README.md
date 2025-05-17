# 🧊 CodeFreeze for VS Code

> A lightweight and efficient Visual Studio Code extension that enables toggling read-only mode for any file using a keyboard shortcut, context menu, or Command Palette. Protect your files from accidental edits with clear visual indicators and persistent state across sessions.

## Demo
https://github.com/user-attachments/assets/9d6a934d-0e46-47b5-96a8-cb093ad7bf69

## ✨ Features

- **Toggle Read-Only Mode**: Use `Ctrl+Alt+F` (Windows/Linux) or `Cmd+Alt+F` (macOS) to lock/unlock files
- **Visual Indicators**: Prominent background and status bar indicators show when a file is locked
- **Command Palette Integration**: Access via `Ctrl+Shift+P` and search for "Toggle Read-Only Mode"
- **Context Menu Support**: Right-click a file to toggle read-only mode
- **Persistent State**: Read-only status persists across editor sessions
- **Status Bar Indicator**: Displays the current mode (locked/unlocked)

## 📥 Installation

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Read-Only Mode"
4. Click Install to add the extension
5. Reload VS Code if prompted

Alternatively, install via the VS Code Marketplace or by running:
```
code --install-extension CodeFreeze
```

## 🚀 Usage

Open any file in VS Code. Toggle read-only mode using one of these methods:

- **Keyboard Shortcut**: Press `Ctrl+Alt+F` (Windows/Linux) or `Cmd+Alt+F` (macOS)
- **Command Palette**: Press `Ctrl+Shift+P`, then type `Toggle Read-Only Mode`
- **Context Menu**: Right-click the file in the editor and select `Toggle Read-Only Mode`

When locked, the file cannot be edited or saved, and a status bar indicator confirms the mode.

## 🔧 Extension Settings

This extension contributes the following settings:

- `CodeFreeze.toggle`: Command to toggle read-only mode for the active file

You can customize the keyboard shortcut in VS Code's Keyboard Shortcuts settings.

## ⚠️ Known Issues

*No known issues at this time.*

## 📝 Release Notes

### 0.1.0
- Initial release of the Read-Only Mode extension
- Features include keyboard shortcut, Command Palette, context menu, and status bar integration

## 👥 Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

Built with ❤️ for the VS Code community.
