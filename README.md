# JSON LangUpdates README

## COMMANDS
* `jlu.runJLU` Runs the extension the the active document and updates his siblings

----

## Known Issues

* Right now is not possible to work with plain array values, other values are accepted and users are notified whenever the number or plain values on arrays are detected
* Format of the result files is being imposed but almost can config indents

----

<details>
<summary class="h2">Extension Settings</summary>

* `jlu.langFolderName`: (**String**) Lang folder name, the extension will only work under this folder
    * Default: ```"lang"```
* `jlu.autoSave`: (**Boolean**) Save the targets files and close the windows. Directly overwrite, **you won't be able to easily undo thoose changes**
    * Default: ```false```
* `jlu.target.arrayChecking`: (**Boolean**) Enable this option to check also arrays. (Array checking is made following the array order)
    * Default: ```true```
* `jlu.target.overwriting`: (**Boolean**) Overwrites when the properties of the saving file are diferent types to the ones of the target language files
    * Default: ```true```
* `jlu.msg.loadedMsg`: (**Boolean**) Shows a message when the extensions is ready
    * Default: ```false```
* `jlu.msg.messaging`: (**Boolean**) Enables all the info messages from this extension
    * Default: ```true```
* `jlu.msg.plainDifAlert`: (**Boolean**) Shows a message when a not identified plain value on an array is detected
    * Default: ```true```
* `jlu.target.todoTxt`: (**String**) Text that will replace for the waiting translation
    * Default: ```"//TODO: translate"```
* `jlu.target.todoTxtAddIndex`: (**Boolean**) When enabled will show the index of the array values at the target files
    * Default: ```true```
* `jlu.target.defaultOverwriteOption`: (**Options**) Action to take when a target file is not a JSON
    * Default: ```ask```
    * Options:
        * ```ask```: Shows a code input to let you choose
        * ```overwrite```: Overwrite the target file
        * ```do nothing```: Ignore the target file
* `jlu.target.excludeNames`: (**String Array**) These files won't be targets of the extension
* `jlu.format.indentSpaces`: (**Number**) Repetitions of the 'indent char' on one indent
    * Default: ```1```
* `jlu.format.indentOption`: (**Options**) Indent option used for formatting the target files
    * Default: ```tab```
    * Options:
        * ```tab```
	    * ```space```
        * ```none```
</details>

----

## Release Notes

### 1.0.0

Initial release of *JSON LangUpdates*

<style lang="scss">
    .h2 {
        font-size: 21px;
    }
</style>