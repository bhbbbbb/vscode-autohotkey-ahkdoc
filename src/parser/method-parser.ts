import { CommentThreadCollapsibleState, TextDocument } from "vscode";
import { CodeUtil } from "../common/codeUtil";
import Method from "../models/method";
import Comment from "../models/comment";
import Ref from "../models/ref";
import staticConfig from "../static.config";

interface NextLineReturnT {
    text?: string
    line: number
}

interface ParserReturnT {
    method?: Method
    refs?: Ref[]
    line: number
}

type RefMatchArr = [ string, string, string, string, string ] & RegExpMatchArray;
// type RefMatchArr = [
//     origin: string, full: string, name: string, params: string, leftBracket: string
// ] & RegExpMatchArray;

/**
 * @group0 foo (param1, param2) {
 * @group1 foo (param1, param2)
 * @group2 foo
 * @group3 param1, param2
 * @group4 {
 */
const REF_PATTERN = /\s*(([\u4e00-\u9fa5_a-zA-Z0-9]+)(?<!if|while)\s*\((.*?)\))\s*(\{)?\s*/i;

enum RefMatchIdx {
    origin, full, name, params, leftBracket,
}

export default class MethodParser {

    
    /**
     * detect method by line
     * @todo last function won't be detected
     * @param document
     * @param line
     * @returns {ParserReturnT}
     */
    public static parseByLine(
        document: TextDocument,
        line: number,
        lastComment: Comment,
        origin?: string,
    ): ParserReturnT {

        const text = origin || document.lineAt(line).text;
        // const text = CodeUtil.purityMethod(origin);
        const methodMatch = text.match(REF_PATTERN) as RefMatchArr | null;
        if (!methodMatch) return;

        // parse ref
        if (!methodMatch[4]) { // no '{' at the end of line
            const { line: line_, text: nextLineText } = this.getNextLine(document, line);
            line = line_;
            if (!nextLineText.match(/^\s*\{/)) { // not method but ref
                return {
                    refs: RefParser.parseRef(document, line, methodMatch),
                    line: line_,
                };
            }
        }

        const methodName = methodMatch[RefMatchIdx.name];
        const method = new Method(
            methodName,
            document,
            line,
            origin.indexOf(methodName),
            methodMatch[RefMatchIdx.full],
            lastComment,
        );

        return {
            method,
            line,
        }
    }

    /**
     * keep string "" version of purity
     * @todo default param can be object
     * @param {string} origin 
     */
    // private static purityMethod(origin: string): string {
    //     if (!origin) return "";
    //     return origin.replace(/;.+/, "")
    //         .replace(/\{.*?\}/g, "")
    //         .replace(/\s+/g, " ")
    //         .replace(/\bgui\b.*/ig, "")
    //         .replace(/\b(msgbox)\b.+?%/ig, "$1");
    // }

    /**
     * 
     * @param document 
     * @param line 
     * @returns {null} if get end of document
     * @returns line: line that contain `{`
     */
    private static getNextLine(document: TextDocument, line: number): NextLineReturnT {

        const lineCount = Math.min(document.lineCount, staticConfig.maxDocumentLines);

        for (let i = line + 1; i < lineCount; i++) {
            const { text } = document.lineAt(i)
            if (text.trim()) return { text, line: i };
        }

        return { line: lineCount - 1 };
    }

}

class RefParser {

    refs: Ref[]

    constructor(
        public document: TextDocument,
        public line: number,
        public headRefMatchArr: RefMatchArr,
    ) {
        this.refs = [new Ref(
            headRefMatchArr[2],
            this.document,
            this.line,
            this.getCharacter(headRefMatchArr[RefMatchIdx.name]),
        )];
    }


    private getCharacter(refName: string): number {
        return this.headRefMatchArr.index
                + this.headRefMatchArr[RefMatchIdx.origin].indexOf(refName);
    }

    // public parseRef(): Ref[] {
    //     return this._parseRef(this.headRefMatchArr[RefMatchIdx.params]);
    // }

    public static parseRef(document: TextDocument, line: number, headRefMatchArr: RefMatchArr) {

        const parser = new RefParser(document, line, headRefMatchArr);

        return parser._parseRef(headRefMatchArr[RefMatchIdx.params]);
    }

    private _parseRef(origin: string): Ref[] {

        const match = origin.match(REF_PATTERN) as (RefMatchArr | null);

        if (!match) return this.refs;

        const refName = match[RefMatchIdx.name];

        this.refs.push(new Ref(
            refName, 
            this.document,
            this.line,
            this.getCharacter(refName),
        ));

        return this._parseRef(match[RefMatchIdx.params]);
    }

}
