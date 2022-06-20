import { MarkdownString } from "vscode";

/**
 * @prop {number} line line count of the start pos. of doc i.e. '/**'
 * @prop {number} height how many line that this doc have (note: line + height - 1 <=> endline'*\/')
 */
export default class Comment {
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

    public dumpMarkdownText(markdownTextRef: MarkdownString): MarkdownString {
        return markdownTextRef.appendMarkdown(this.content.join("\n\n"));
    }
}