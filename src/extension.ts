// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MyCodeLensProvider } from './myCodeLensProvider';

const nReadlines = require('n-readlines');

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

      let depth = 0;

      await editor.document.save();

      const filePath = editor.document.fileName;

      const fileToRun = new nReadlines(filePath);

      let line;
      let lineNumber = 1;

      while ((line = fileToRun.next())) {
        if (lineNumber > lineValue) {
          console.log(`Line ${lineNumber} has: ${line.toString('ascii')}`);
          console.log('depth', depth);

          if (line.toString('ascii').match(/\/\/.*Start-Block/)) {
            depth += 1;
          }

          if (line.toString('ascii').match(/\/\/.*End-Block/) && depth === 0) {
            fileToRun.stop();
          }

          if (line.toString('ascii').match(/\/\/.*End-Block/) && depth !== 0) {
            depth -= 1;
          }
        }

        lineNumber++;
      }

      console.log('end of file.');
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(
        `The script uses approximately ${Math.round(used * 100) / 100} MB`,
      );

      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage('Hello World from TestingCodelens!');
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
export function deactivate() {}
