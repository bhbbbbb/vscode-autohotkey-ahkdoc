import { TextDocument } from "vscode";
import { CodeUtil } from "../common/codeUtil";
import Method from "../models/method";
import Comment from "../models/comment";
import Ref from "../models/ref";

export default class MethodParser {

    /**
     * detect method by line
     * @todo last function won't be detected
     * @param document
     * @param line
     * @returns {Method | Ref | Ref[]}
     */
    public static parseByLine(
        document: TextDocument,
        line: number,
        lastComment: Comment,
        origin?: string
    ): Method | Ref | Ref[] {

        origin = origin != undefined ? origin : document.lineAt(line).text;
        const text = CodeUtil.purityMethod(origin);
        const refPattern = /\s*(([\u4e00-\u9fa5_a-zA-Z0-9]+)(?<!if|while)\(.*?\))\s*(\{)?\s*/i
        const methodMatch = text.match(refPattern);
        if (!methodMatch) {
            return;
        }
        const methodName = methodMatch[2];
        const character = origin.indexOf(methodName);
        if (text.length != methodMatch[0].length) {
            // in this case there is no '{' thus this would be ref
            let refs = [new Ref(methodName, document, line, character)];
            const newRef = this.parseByLine(document, line, lastComment, origin.replace(new RegExp(methodName + "\\s*\\("), ""));
            CodeUtil.join(refs, newRef)
            return refs
        }
        const methodFullName = methodMatch[1];
        const isMethod = methodMatch[3];
        if (isMethod) {
            return new Method(
                methodName,
                document,
                line,
                character,
                methodFullName,
                true,
                MethodParser.checkRemarkOwnership(document, lastComment, line),
            );
        }
        for (let i = line + 1; i < document.lineCount; i++) {
            const nextLineText = CodeUtil.purityMethod(document.lineAt(i).text);
            if (!nextLineText.trim()) { continue; }
            if (nextLineText.match(/^\s*{/)) {
                return new Method(
                    methodName,
                    document,
                    line,
                    character,
                    methodFullName,
                    false,
                    MethodParser.checkRemarkOwnership(document, lastComment, line)
                );
            } else {
                return new Ref(methodName, document, line, character)
            }
        }
    }

    /**
     * detech remark, remark format: ;any , /* comment *\/, /** ahkdoc *\/
     * @param comment 
     * @param line line that contain Method / Class / Label
     */
    private static checkRemarkOwnership(document: TextDocument, comment: Comment, line: number) {
        if (!comment) return null;
        if (line >= 0) {
            const endline = comment.line + comment.height;
            if (endline > line) return null;
            else if (line - endline >= 0) {
                for (let i = line - endline; i > 0; i--) {
                    const { text } = document.lineAt(line - i);
                    if (!text.trim()) return null;
                }
                return comment;
            }
        }
        return null;
    }

}