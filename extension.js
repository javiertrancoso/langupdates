// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const R = require('ramda');
const { Uri } = require('vscode');
const { TextDecoder } = require('util');
const { TextEncoder } = require('util');
const enc = new TextEncoder();
const dec = new TextDecoder();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const extName = 'JSON LangUpdates'

let enabledArrays = true
let enabledLoadedMsg = true
let enabledOverwrite = true
let enabledMessaging = true
let enabledPlainDifAlert = true
let indent = '\t'
let todoMsg = '//TODO: translate'
let enabledAddIndex = true
let langFolderName = 'lang'
let enabledAutoSave = false
let defOverwriteOpt = 'ask'
let excludeNames = []

let isWorking = false

/**
 * @param {vscode.ExtensionContext} context
 */
// eslint-disable-next-line no-unused-vars
async function activate(context) {
	await updateConfig()

	let disposable = vscode.commands.registerCommand('jlu.runJLU', function () {
		manage(vscode.window.activeTextEditor.document)
	});
	context.subscriptions.push(disposable);

	if (enabledLoadedMsg) {
		showInfo(extName + ' extension is now active')
	}
}

// this method is called when your extension is deactivated
function deactivate() { }


//#region JSON
/**
 * @param {Uri} fileURI
 * @param {*} json
 * @param {string} name
 */
async function writeJson(fileURI, json, name) {
	if (enabledAutoSave) {
		await vscode.workspace.fs.writeFile(fileURI, enc.encode(JSON.stringify(json, null, indent)))
		showInfo('Modified: ' + name)
	}
	else {
		// known-issue: focus move to the last editor
		vscode.window.showTextDocument(fileURI).then(doc => {
			let fullRange = new vscode.Range(0, 0, doc.document.lineCount, 0);
			doc.edit(async editBuilder => {
				editBuilder.replace(fullRange, JSON.stringify(json, null, indent))
			})
		})
	}
}

/**
 * @param {string | vscode.Uri} input
 * @param {string} name
 * @param {boolean} isOrigin
 */
async function readJson(input, name, isOrigin) {
	let content
	if (typeof (input) === 'string') {
		content = input
	} else {
		content = dec.decode(await vscode.workspace.fs.readFile(input))
	}
	try {
		return JSON.parse(content)
	} catch (error) {
		if (isOrigin) {
			showError(extName + ' only works with JSON format')
		} else {
			switch (defOverwriteOpt) {
				case 'ask':
					const answer = await showInput(['Overwrite ' + name, 'Do Nothing'])
					if (answer === 'Overwrite ' + name) return {}
					break
				case 'overwrite':
					return {}
				default:
					break
			}
		}
	}
}

//#endregion

function showInfo(info) {
	if (enabledMessaging) {
		vscode.window.showInformationMessage(info)
	}
}

function showError(e) {
	vscode.window.showErrorMessage(e)
}

/**
 * @param {string[] | Thenable<string[]>} message
 */
async function showInput(message) {
	return await vscode.window.showQuickPick(message)
}

async function manageLang(origin, target, path) {
	const printKeyConcatValue = async (value, key) => {
		const keyPath = path + '.' + key
		if (typeof (value) != 'string') {
			if (Array.isArray(value)) {
				if (enabledArrays) {

					if ((!Array.isArray(target[key]) && enabledOverwrite)) {
						target[key] = []
					}
					await manageLangArray(value, target[key], keyPath)
				}
			} else {
				if (target[key] === undefined || (typeof (target[key]) != 'object' && enabledOverwrite)) {
					target[key] = {}
				}
				await manageLang(value, target[key], keyPath)
			}
		} else {
			if (target[key] === undefined || (typeof (target[key]) != 'string' && enabledOverwrite)) {
				target[key] = todoMsg
			}
		}
	}
	await R.forEachObjIndexed(await printKeyConcatValue, origin);
}

async function manageLangArray(origin, target, path) {
	if (enabledArrays) {
		let oriValuesCount = 0
		origin.forEach(async (value, index) => {
			const indexPath = path + `[${index}]`
			if (target.length === index) {
				if (typeof (value) === 'object') {
					if (Array.isArray(value)) {
						target.push([])
					} else {
						target.push({})
					}
				} else {
					let todoStr = todoMsg
					if (enabledAddIndex) {
						todoStr += ` (${index})`
					}
					target.push(todoStr)
				}
			}
			if (typeof (value) === 'object') {
				if (Array.isArray(value)) {
					if (!Array.isArray(target[index]) && enabledOverwrite) {
						target[index] = []
					}
					await manageLangArray(value, target[index], indexPath)
				} else {
					if (typeof (target[index]) != 'object' && enabledOverwrite) {
						showInfo(target[index])
						target[index] = {}
					}
					await manageLang(value, target[index], indexPath)
				}
			} else {
				oriValuesCount++
			}
		});

		// Compares the number of non (array or obj) values
		let tarValuesCount = 0
		target.forEach((/** @type {any} */ value) => {
			if (!Array.isArray(oriValuesCount) && typeof (value) != 'object') {
				tarValuesCount++
			}
		})
		if (oriValuesCount != tarValuesCount && enabledPlainDifAlert) {
			showInfo('You will have to modify manually: ' + path)
		}
	}
}

async function updateConfig() {
	langFolderName = await vscode.workspace.getConfiguration().get('jlu.langFolderName')
	enabledAutoSave = await vscode.workspace.getConfiguration().get('jlu.autoSave')
	enabledArrays = await vscode.workspace.getConfiguration().get('jlu.target.arrayChecking')
	enabledOverwrite = await vscode.workspace.getConfiguration().get('jlu.target.overwriting')
	enabledLoadedMsg = await vscode.workspace.getConfiguration().get('jlu.msg.loadedMsg')
	enabledMessaging = await vscode.workspace.getConfiguration().get('jlu.msg.messaging')
	enabledPlainDifAlert = await vscode.workspace.getConfiguration().get('jlu.msg.plainDifAlert')
	todoMsg = await vscode.workspace.getConfiguration().get('jlu.target.todoTxt')
	enabledAddIndex = await vscode.workspace.getConfiguration().get('jlu.target.todoTxtAddIndex')
	defOverwriteOpt = await vscode.workspace.getConfiguration().get('jlu.target.defaultOverwriteOption')
	excludeNames = await vscode.workspace.getConfiguration().get('jlu.target.excludeNames')
	const indentRep = await vscode.workspace.getConfiguration().get('jlu.format.indentSpaces')
	const indentOpt = await vscode.workspace.getConfiguration().get('jlu.format.indentOption')

	let indentChar = ''
	switch (indentOpt) {
		case 'tab':
			indentChar = '\t'
			break
		case 'space':
			indentChar = ' '
			break
		default:
			break
	}
	indent = indentChar.repeat(indentRep)
}

const manage = async (/** @type {vscode.TextDocument} */ openDocument) => {
	await updateConfig()
	const document = R.clone(openDocument)
	if (document.uri.scheme === "file" && document.languageId === 'json') {
		const parentPathArray = document.uri.path.split('/')
		const orFileName = parentPathArray.pop()
		const parentPath = parentPathArray.join('/')

		let hasDirPermission = false

		if (parentPathArray.includes(langFolderName)) {
			hasDirPermission = true
		} else {
			const answer = await showInput(['Run outside ' + langFolderName + ' dir', 'Cancel'])
			hasDirPermission = (answer === 'Run outside ' + langFolderName + ' dir')
		}
		if (hasDirPermission) {
			const orLang = await readJson(document.getText(), orFileName, true)
			const dir = await vscode.workspace.fs.readDirectory(Uri.parse(parentPath))

			for(const lang of dir) {
				while (isWorking) {console.log('Waiting for loop')}
				if (lang[1] === vscode.FileType.File) {
					if (lang[0] != orFileName && lang[0].endsWith('.json') && (!excludeNames.includes(lang[0]))) {
						isWorking = true
						const langURI = Uri.parse(parentPath + '/' + lang[0])
						const langJson = await readJson(langURI, lang[0], false)

						if (langJson != undefined) {
							await manageLang(orLang, langJson, lang[0])
							await writeJson(langURI, langJson, lang[0])
						}
						isWorking = false
					}
				}
			}
		}
	} else {
		showError(extName + ' only supports JSON files')
	}
}

module.exports = {
	activate,
	deactivate
}
