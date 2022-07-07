import { TextDocument } from "vscode";
import ahkDoc from "../models/ahkdoc";
import Comment from "../models/comment";
import staticConfig from "../static.config";

interface ReturnT {
    comment?: Comment | ahkDoc
    endLine: number
}

const PATTERN = {
    singleLineComment: /^\s*;/,
    plainBlockComment: /^\s*\/\*(?!\*)/,
    ahkdocBlockComment: /^\s*\/\*\*/,
    endBlock: /^\s*\*\//,
} as const;


export default class CommentParser {

    public static parseByLine(
        document: TextDocument,
        line: number,
    ): ReturnT {

        let isAhkdoc: boolean;
        const lines: string[] = [document.lineAt(line).text];

        if (lines[0].match(PATTERN.singleLineComment))
            return {
                comment: new Comment(line, lines),
                endLine: line,
            };


        if (lines[0].match(PATTERN.ahkdocBlockComment)) isAhkdoc = true;

        else if (lines[0].match(PATTERN.plainBlockComment)) isAhkdoc = false;
        
        else return { comment: null, endLine: line };


        const lineCount = Math.min(staticConfig.maxDocumentLines, document.lineCount);
        for (let i = line + 1; i < lineCount; i++) {

            const lineText = document.lineAt(i).text;
            lines.push(lineText);
            if (lineText.match(PATTERN.endBlock))
                return {
                    comment: new (isAhkdoc ? ahkDoc : Comment)(line, lines),
                    endLine: i,
                };
        }

        return {
            comment: new (isAhkdoc ? ahkDoc : Comment)(line, lines),
            endLine: lineCount - 1,
        };
    }

}
