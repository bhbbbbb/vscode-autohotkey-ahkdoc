import * as fs from "fs";
import * as vscode from "vscode";
import { CodeUtil } from "../common/codeUtil";
import { Out } from "../common/out";
// import { Script, Method, Ref, Label, Block, Variable, Comment } from "./model";
// import { ahkDoc } from "./models/ahkdoc";
import Script from "../models/script";
import Method from "../models/method";
import Ref from "../models/ref";
import Label from "../models/label";
import Block from "../models/block";
import Variable from "../models/variable";
import Comment from "../models/comment";

import CommentParser from "./comment-parser";
import MethodParser from "./method-parser";
import LabelParser from "./label-parser";
import { assert } from "console";

export class Parser {

    private static documentCache = new Map<string, Script>();

    /**
     * load method list by path
     * @param buildPath
     */
    public static async buildByPath(buildPath: string) {
        console.log(`here: ${buildPath}`);
        if (!buildPath) return;
        if (fs.statSync(buildPath).isDirectory()) {
            fs.readdir(buildPath, (err, files) => {
                if (err) {
                    Out.log(err);
                    return;
                }
                for (const file of files) {
                    if (file.match(/(^\.|out|target|node_modules)/)) {
                        continue;
                    }
                    this.buildByPath(buildPath + "/" + file);
                }
            });
        } else if (buildPath.match(/\b(ahk|ext)$/i)) {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(buildPath));
            this.buildScript(document);
        }

    }

    /**
     * detect method list by document
     * @param document 
     */
    public static async buildScript(
        document: vscode.TextDocument,
        usingCache: boolean = false,
    ): Promise<Script> {

        if (usingCache && null != this.documentCache.get(document.uri.path)) {
            return this.documentCache.get(document.uri.path)
        }

        const methods: Method[] = [];
        const refs: Ref[] = [];
        const labels: Label[] = [];
        const variables: Variable[] = [];
        const blocks: Block[] = [];

        let currentComment: Comment = null;
        let temComment: Comment = null;
        let currentMethod: Method = null;
        let currentRefs: Ref[] = null;
        let deep = 0;
        const lineCount = Math.min(document.lineCount, 10000);

        for (let line = 0; line < lineCount; line++) {

            // console.log(`line: ${line}`);
            // console.log(methods);

            const lineText = document.lineAt(line).text;

            if (!lineText.trim()) continue;

            ({ comment: temComment, endLine: line } = CommentParser.parseByLine(document, line));
            
            if (temComment) {
                currentComment = temComment;
                continue;
            }
            
            const tem = 
                MethodParser.parseByLine(document, line, currentComment);
            // ({ method: currentMethod, refs: currentRefs, line } =
            //     MethodParser.parseByLine(document, line, currentComment));
            
            if (tem) {
                ({ method: currentMethod, refs: currentRefs, line } = tem);
                
                if (currentMethod) {
                    methods.push(currentMethod);
                    deep++;
                    currentComment = null;
                }

                if (currentRefs) CodeUtil.join(refs, currentRefs);

                assert(currentMethod || currentRefs);
                continue;
            }


            const label = LabelParser.parseByLine(document, line, currentComment);
            if (label) {
                labels.push(label);
                currentComment = null;
                continue;
            }
            // const block = Parser.getBlockByLine(document, line);
            // if (block) {
            //     blocks.push(block);
            // }
            if (lineText.indexOf("{") !== -1) {
                deep++;
            }
            if (lineText.indexOf("}") !== -1) {
                deep--;
                if (currentMethod) {
                    currentMethod.endLine = line
                }
            }
            // const variable = Parser.detechVariableByLine(document, line);
            // if (variable) {
            //     if (deep === 0 || !currentMethod) {
            //         this.joinVars(variables, variable)
            //     } else {
            //         currentMethod.pushVariable(variable)
            //     }
            // }
        }
        const script: Script = { methods, labels, refs, variables, blocks }
        this.documentCache.set(document.uri.path, script)
        console.log(script)
        return script;
    }

    public static async getMethodByName(document: vscode.TextDocument, name: string) {
        name = name.toLowerCase()
        for (const method of this.documentCache.get(document.uri.path).methods) {
            if (method.name.toLowerCase() == name) {
                return method;
            }
        }
        for (const filePath of this.documentCache.keys()) {
            for (const method of this.documentCache.get(filePath).methods) {
                if (method.name.toLowerCase() == name) {
                    return method;
                }
            }
        }
    }

    public static async getAllMethod(): Promise<Method[]> {
        const methods = []
        for (const filePath of this.documentCache.keys()) {
            for (const method of this.documentCache.get(filePath).methods) {
                methods.push(method)
            }
        }
        return methods;
    }

    public static async getLabelByName(document: vscode.TextDocument, name: string) {
        name = name.toLowerCase()
        for (const label of this.documentCache.get(document.uri.path).labels) {
            if (label.name.toLowerCase() == name) {
                return label;
            }
        }
        for (const filePath of this.documentCache.keys()) {
            for (const label of this.documentCache.get(filePath).labels) {
                if (label.name.toLowerCase() == name) {
                    return label;
                }
            }
        }
    }

    public static getAllRefByName(name: string): Ref[] {
        const refs = [];
        name = name.toLowerCase()
        for (const filePath of this.documentCache.keys()) {
            const document = this.documentCache.get(filePath)
            for (const ref of document.refs) {
                if (ref.name.toLowerCase() == name) {
                    refs.push(ref)
                }
            }
        }
        return refs;
    }

    /**
     * not sure what is this.
     */
    // private static getBlockByLine(document: vscode.TextDocument, line: number): Block {
    //     const { text } = document.lineAt(line);
    //     const blockMatch = text.match(/;;(.+)/);
    //     if (blockMatch) {
    //         return { document, line, name: blockMatch[1], character: text.indexOf(blockMatch[1]) }
    //     }
    // }


    private static readonly varDefPattern = /[ \t]*(\w+?)\s*([+\-*/.:])?(?<![=!])=(?![=!]).+/;
    private static readonly varCommandPattern = /(\w+)[ \t,]+/g;
    private static readonly keywords = ['and','or','new','extends','if','loop'];
    // private static detechVariableByLine(document: vscode.TextDocument, line: number): Variable | Variable[] {

    //     const lineText = CodeUtil.purity(document.lineAt(line).text);

    //     const defMatch = lineText.match(Parser.varDefPattern)
    //     if (defMatch) {
    //         const varName = defMatch[1];
    //         return {
    //             line, document, isGlobal: true, method: null, name: varName, character: lineText.indexOf(varName)
    //         }
    //     } else {
    //         let vars = [];
    //         const commandMatchAll = CodeUtil.matchAll(
    //             Parser.varCommandPattern,
    //             lineText.replace(/\(.+?\)/g,"")
    //         );
    //         for (let index = 0; index < commandMatchAll.length; index++) {
    //             if (index == 0) continue;
    //             const varName = commandMatchAll[index][1];
    //             if(this.keywords.includes(varName.toLowerCase())){
    //                 continue;
    //             }
    //             vars.push({
    //                 line, document, isGlobal: true, method: null, name: varName, character: lineText.indexOf(commandMatchAll[index][0])
    //             })
    //         }
    //         return vars;
    //     }

    //     return null;
    // }


    public static joinVars(variables: Variable[], items: Variable | Variable[]) {
        if (variables == undefined || items == undefined) {
            return
        }

        if (!Array.isArray(items)) {
            items = [items]
        }

        loop: for (const item of items) {
            for (const variable of variables) {
                if (variable.name == item.name) {
                    continue loop;
                }
            }
            variables.push(item)
        }


    }

}
