import { TextDocument } from "vscode";
import Comment from "../models/comment";
import Label from "../models/label";

/**
 * @normalForm -- `label:\n`
 * @hotkey -- `#n::`
 * @inlineHotkey -- `#::abc\n`
 * @hotstring -- `:?o*...:\hotstring::\n`
 * @inlineHotstring -- `:?o*...:\hotstring::an_inline\n`
 * 
 */
export default class LabelParser {

    public static parseByLine(document: TextDocument, line: number, comment: Comment): Label {

        // return new Label('', document, 0, 0, null);
        return null
    }

    // private static getLabelByLine(document: vscode.TextDocument, line: number) {
    //     const text = CodeUtil.purity(document.lineAt(line).text);
    //     const label = /^[ \t]*([\u4e00-\u9fa5_a-zA-Z0-9]+) *:{1}(?!(:|=))/.exec(text)
    //     if (label) {
    //         const labelName = label[1]
    //         if (labelName.toLowerCase() == "case" || labelName.toLowerCase() == "default") return;
    //         return new Label(label[1], document, line, text.indexOf(labelName));
    //     }
    // }

}