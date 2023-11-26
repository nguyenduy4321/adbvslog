// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {spawn} from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "adbvslog" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('adbvslog.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let adbCommand = 'adb.exe logcat';

		runAdbLogcat('','');
	});

	context.subscriptions.push(disposable);
}
function showOutputInNewTab(output: string) {
	vscode.workspace.openTextDocument({ language: 'log', content: output }).then((doc) => {
        // Show the document in a new tab
        vscode.window.showTextDocument(doc);
    });
}

function runAdbLogcat(android_serial: string, process_name: string) {
    // Create a new untitled document
    vscode.workspace.openTextDocument({ language: 'log', content: '' }).then((doc) => {
        // Show the document in a new tab
        vscode.window.showTextDocument(doc,{ preview: false, preserveFocus: true });

		let command=['logcat'];
		(android_serial)? command=[android_serial].concat(command):null;
		(process_name)? command.push(process_name):null;
        // Start adb logcat process
        const adbLogcat = spawn('adb', command);

        // Handle stdout
        adbLogcat.stdout.on('data', (data) => {
            const output = data.toString();
            appendToOutputDocument(doc, output);
        });

        // Handle stderr
        adbLogcat.stderr.on('data', (data) => {
            const error = data.toString();
            vscode.window.showErrorMessage(`ADB Logcat Error: ${error}`);
        });

        // Handle process exit
        adbLogcat.on('close', (code) => {
            vscode.window.showInformationMessage(`ADB Logcat process exited with code ${code}`);
        });
    });
}

function appendToOutputDocument(doc: vscode.TextDocument, output: string) {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;

    // Check if the active editor's document is the same as the specified document
    if (editor && editor.document === doc) {
        // Append the output to the document
        editor.edit((editBuilder) => {
            editBuilder.insert(new vscode.Position(doc.lineCount, 0), output);
        });
        // Scroll to the end of the document
        //{editor.revealRange(new vscode.Range(doc.lineCount, 0, doc.lineCount, 0));}
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
