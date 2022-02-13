import * as vscode from "vscode";
import { ahkDoc } from "./ahkdoc";

export interface Script {
    methods: Method[];
    refs: Ref[];
    labels: Label[];
    variables: Variable[];
    blocks: Block[];
}

export interface Variable {
    name: string;
    document: vscode.TextDocument;
    line: number;
    character: number;
    method: Method;
    isGlobal: boolean;
}

class Identifier {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
        public documentation?: ahkDoc
    ) { }
}
export class Label extends Identifier {
}

export class Ref extends Identifier {
}

export class Block {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number
    ) { }
}

export class Class extends Identifier {

}

/**
 * @prop {number} line line count of the start pos. of doc i.e. '/**'
 * @prop {number} height how many line that this doc have (note: line + height - 1 <=> endline'*\/')
 */
export class Comment {
    public readonly line: number;
    public readonly height: number;
    public readonly content: string[];

    /**
     * 
     * @param line 
     * @param rawContent content that keep both '/*' and '*\/'
     */
    constructor(line: number, rawContent: string[]) {
        this.line = line;
        this.height = rawContent.length;
        if (this.height === 1) {
            this.content = [ rawContent[0].replace(/^\s*\;/, "").trim() ];
        }
        else {
            let tem = rawContent.slice(0, -1);
            tem[0] = tem[0].replace(/^\s*\/\*/, "").trim();
            this.content = tem;
        }
    }
    get plainText(): string {
        return this.content.join();
    }
    public dumpMarkdownText(markdownTextRef: vscode.MarkdownString): vscode.MarkdownString {
        return markdownTextRef.appendMarkdown(this.content.join("\n\n"));
    }
}
/**
 * @prop {boolean} withQuote whether the function have '{' with ')' in the same line
 */
export class Method {
    public params: string[];
    public variables: Variable[];
    public full: string;
    public endLine: number;
    constructor(
        public origin: string,
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
        public withQuote: boolean,
        public comment: Comment,
        ) {
        this.buildParams();
        this.variables = []
    }

    private buildParams() {
        const refPattern = /\s*\((.+?)\)\s*$/;
        if (this.origin != this.name) {
            const paramsMatch = this.origin.match(refPattern);
            if (paramsMatch) {
                this.params = paramsMatch[1].split(",").filter(param => param.trim() != "").map(param => {
                    const paramMatch = param.match(/[^:=* \t]+/);
                    return paramMatch != null ? paramMatch[0] : param;
                });
                this.full = this.origin.replace(paramsMatch[1], this.params.join(","));
            }
            else {
                this.params = []
                this.full = this.origin;
            }
        }
    }

    public pushVariable(variables: Variable | Variable[]) {
        if (!Array.isArray(variables)) {
            variables = [variables];
        }
        loop: for (const variable of variables) {
            for (const curVariable of this.variables) {
                if (curVariable.name == variable.name) continue loop;
            }
            for (const paramStr of this.params) {
                if (paramStr == variable.name) continue loop;
            }
            this.variables.push(variable)
        }
    }
}
