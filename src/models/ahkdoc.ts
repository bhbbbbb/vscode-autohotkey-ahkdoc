import { assert } from "console";
import { Comment } from "../parser/model";
import { MarkdownString } from "vscode";
export class Link {
    public index: number;
    public destination: string;
    public destinationName: string;
    constructor(index: number, destination: string, destinationName?: string) {
        this.index = index;
        this.destination = destination;
        this.destinationName = destinationName ? destinationName : destination;
    }
}
export class Description {
    public text: string;
    public markdownText: string;
    public link: Link[];
    /**
     * @todo deal with text '\n'
     * @param text 
     * @param link 
     */
    constructor(text: string, link?: Link[]) {
        this.text = text;
        if (!this.link) {
            this.link = [];
            this._parseInlineLink();
        }
        else this.link = link;
    }

    private _parseInlineLink() {
        const inlineTagPattern = /{@link\s*(\w*)\s*(\w.*)?}/gmi;
        this.markdownText = this.text.replace(inlineTagPattern, (match, p1, p2) => {
            if (p2) p1 = p2;
            return `[${p1 ? p1 : ""}](https://www.google.com)`;
        });
        this.markdownText += "\n";
        let match = inlineTagPattern.exec(this.text);
        for (; match !== null; match = inlineTagPattern.exec(this.text)) {
            this.link.push(new Link(match.index, match[1], match[2]));
        }
    }
}
export class BlockTag {

    public tag: string;
    public type?: string;
    public variableName?: string;
    public description?: Description;
    constructor(tag: string, type: string, variableName: string, descriptionText: string) {
        this.tag = tag;
        this.type = type;
        this.variableName = variableName;
        this.description = new Description(descriptionText);
    }

    public dumpMarkdownString(markdownTextRef: MarkdownString): MarkdownString {
        if (this.tag === null) { // plain description
            return markdownTextRef.appendMarkdown(this.description?.markdownText);
        }
        else if (this.tag === "@example") {
            markdownTextRef.appendMarkdown("*@example*\n");
            return markdownTextRef.appendCodeblock(this.description?.text);
        }
        else {
            const variable = this.variableName ? `\`${this.variableName}\``: "";
            let description = this.description.markdownText;
            if (this.description?.text) description = "\u2014 " + description;
            const tem = `*${this.tag}* ${variable} ${description}\n`;
            return markdownTextRef.appendMarkdown(tem);
        }
    }
}

export default class ahkDoc extends Comment {
    public tags: BlockTag[];
    constructor(line: number, block: string[]) {
        super(line, block);
        this.tags = ahkDoc.parseBlock(this.content);
    }

    /**
     * @override
     */
    public dumpMarkdownText(markdownText: MarkdownString): MarkdownString {
        for (const tag of this.tags) {
            markdownText = tag.dumpMarkdownString(markdownText);
        }
        return markdownText;
    }

    /**
     * 
     * @param {string[]} content array of linetext of doc block.
     * Block should be make sure in correct form of ahkdoc before this function.
     * The start and end label (i.e. '\*' and '*\/') should be trimmed in super. {@link Comment}
     * @returns 
     */
    private static parseBlock(content: string[]): BlockTag[] {
        let blockText = "";
        for (let line of content) {
            line = line.replace(/\s*\*/, "").trim() + "\n";
            blockText += line;
        }

        const typevarTagPattern = /((?:@member|@byref|@param|@arg|@argument|@property|@prop|@global|@if|@ifwinactive|@ifwinnotactive|@ifwinexist|@ifwinnotexist))\s*({.*?})?\s*(\b\S+\b)?\s*(((?:[^@\n]|{@link)+\s)*)/gmi;
        const typeTagPattern = /((?:@private|@protected|@public|@readonly|@returns|@return|@throws|@exception|@type|@send))\s*({.*?})?\s*(((?:[^@\n]|{@link)+\s)*)/gmi;
        const varTagPattern = /((?:@author|@see|@goto|@gosub))\s*(((?:[^@\n]|{@link)+\s)*)/gmi;
        const examplePattern = /(@example)\s*([^@]*)/gmi;
        // const customTagPattern = /(@\w+)\s*(((?:[^@\n]|{@link)+\s)*)/gmi;
        const customTagPattern = /(@\w+)\b(?<!@link|@member|@byref|@param|@arg|@argument|@property|@prop|@global|@if|@ifwinactive|@ifwinnotactive|@ifwinexist|@ifwinnotexist|@private|@protected|@public|@readonly|@returns|@return|@throws|@exception|@type|@send|@author|@see|@goto|@gosub)\s*(((?:[^@\n]|{@link)+\s)*)/gmi;
        const descriptionPattern = /^((?:[^@\n]|{@link)+\s)+/gmi;

        let result: BlockTag[] = [];

        let typevarMatch = typevarTagPattern.exec(blockText);
        let typeMatch = typeTagPattern.exec(blockText);
        let varMatch = varTagPattern.exec(blockText);
        let exampleMatch = examplePattern.exec(blockText);
        let customMatch = customTagPattern.exec(blockText);
        let descriptionMatch = descriptionPattern.exec(blockText);
        let probe = 0;

        while (typevarMatch || typeMatch || varMatch || exampleMatch || customMatch || descriptionMatch) {
            let tem: {match: RegExpExecArray, params: [string, string, string, string]}[] = [];
            if (typevarMatch) {
                tem.push({
                    match: typevarMatch,
                    params: [typevarMatch[1], typevarMatch[2], typevarMatch[3], typevarMatch[4]],
                });
            }
            if (typeMatch) {
                tem.push({
                    match: typeMatch,
                    params: [typeMatch[1], typeMatch[2], null, typeMatch[3]],
                });
            }
            if (varMatch) {
                tem.push({
                    match: varMatch,
                    params: [varMatch[1], null, null, varMatch[2]],
                });
            }
            if (exampleMatch) {
                tem.push({
                    match: exampleMatch,
                    params: [exampleMatch[1], null, null, exampleMatch[2]],
                })
            }
            if (customMatch) {
                tem.push({
                    match: customMatch,
                    params: [customMatch[1], null, null, customMatch[2]],
                });
            }
            if (descriptionMatch) {
                tem.push({
                    match: descriptionMatch,
                    params: [null, null, null, descriptionMatch[0]],
                });
            }

            assert(tem.length > 0);

            tem.sort((a, b) => a.match.index - b.match.index);
            
            result.push(new BlockTag(...tem[0].params));
            probe = tem[0].match.index + tem[0].match[0].length;

            while (typevarMatch && typevarMatch.index < probe) {
                typevarMatch = typevarTagPattern.exec(blockText);
            }
            while (typeMatch && typeMatch.index < probe) {
                typeMatch = typeTagPattern.exec(blockText);
            }
            while (varMatch && varMatch.index < probe) {
                varMatch = varTagPattern.exec(blockText);
            }
            while (exampleMatch && exampleMatch.index < probe) {
                exampleMatch = examplePattern.exec(blockText);
            }
            while (customMatch && customMatch.index < probe) {
                customMatch = customTagPattern.exec(blockText);
            }
            while (descriptionMatch && descriptionMatch.index < probe) {
                descriptionMatch = descriptionPattern.exec(blockText);
            }

        }
        return result;
    }}
