// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MyCodeLensProvider } from './myCodeLensProvider';

const nReadlines = require('n-readlines');
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "testingcodelens" is now active!',
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'testingcodelens.helloWorld',
    async (lineValue) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      if (!vscode.workspace.workspaceFolders) {
        return;
      }

      await editor.document.save();

      const filePath = editor.document.fileName;
      const fileToRun = new nReadlines(filePath);

      let depth = 0;
      let line;
      let lineNumber = 1;

      let fileArr = [];

      // Reads line by line
      while ((line = fileToRun.next())) {
        // Picks up from the clicked line
        if (lineNumber > lineValue) {
          if (line.toString('ascii').match(/\/\/.*Start-Block/)) {
            depth += 1;
          }

          if (line.toString('ascii').match(/\/\/.*End-Block/) && depth === 0) {
            break;
          }

          if (line.toString('ascii').match(/\/\/.*End-Block/) && depth !== 0) {
            depth -= 1;
          }

          fileArr.push(line.toString('ascii'));
        }

        lineNumber++;
      }

      // Creates the .vscode/temp dir if not created
      fs.mkdirSync(
        `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.vscode/temp`,
        { recursive: true },
      );

      // Creates the file to be run
      fs.writeFileSync(
        `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.vscode/temp/runCodeBlock.js`,
        fileArr.join('\n'),
      );

      // Terminal stuff

      let terminal = null;
      if (vscode.window.terminals) {
        terminal = vscode.window.terminals.find(
          (terminal) => terminal.name === 'RunBlock',
        );
      }

      if (!terminal) {
        terminal = vscode.window.createTerminal(`RunBlock`);
      }

      terminal.show(true);
      terminal.sendText('clear');

      terminal.sendText(`node .vscode/temp/runCodeBlock.js`);
    },
  );

  // Get a document selector for the CodeLens provider
  // This one is any file that has the language of javascript
  let docSelector = {
    language: 'javascript',
    scheme: 'file',
  };

  // Register our CodeLens provider
  let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    docSelector,
    new MyCodeLensProvider(),
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(codeLensProviderDisposable);
}

// this method is called when your extension is deactivated
// Clean up
export function deactivate() {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }

  fs.unlinkSync(
    `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.vscode/temp/runCodeBlock.js`,
  );
}
