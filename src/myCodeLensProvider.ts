import {
  CancellationToken,
  CodeLens,
  CodeLensProvider,
  ProviderResult,
  Range,
  TextDocument,
  Command,
} from 'vscode';

export class MyCodeLensProvider implements CodeLensProvider {
  async provideCodeLenses(
    document: TextDocument,
    token: CancellationToken,
  ): Promise<CodeLens[]> {
    // Define where the CodeLens will exist

    let codeLensArr: CodeLens[] = [];

    for (let i = 0; i < document.lineCount; i += 1) {
      if (document.lineAt(i).text.match(/\/\/.*Start-Block/)) {
        // Define what command we want to trigger when activating the CodeLens
        let c: Command = {
          command: 'testingcodelens.helloWorld',
          title: 'Hello World',
          arguments: [i + 1],
        };

        let topOfDocument = new Range(i, 0, i, 0);
        let codeLens = new CodeLens(topOfDocument, c);

        codeLensArr.push(codeLens);
      }
    }

    return codeLensArr;
  }
}
