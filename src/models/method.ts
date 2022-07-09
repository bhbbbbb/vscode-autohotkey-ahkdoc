import { TextDocument } from "vscode";
import Identifier from "./identifier";
import Variable from "./variable";
import Comment from "./comment";
import codeUtil from "../common/codeUtil";

/**
 * @prop {boolean} withQuote whether the function have '{' with ')' in the same line
 * @prop {string} origin e.g. 'foo(par1, par2)'
 * @prop {string} name e.g. 'foo'
 */
export default class Method extends Identifier {

    public params: Param[];
    public variables: Variable[];
    // public full: string;
    public endLine: number;

    constructor(
        name: string,
        document: TextDocument,
        line: number,
        character: number,
        origin: string,
        paramsText: string,
        public comment: Comment,
    ) {
        super(name, document, line, character);
        this.params = this.parseParams(origin, paramsText);
        this.variables = [];
    }

    public get full(): string {
        const paramsText = this.params.map((param) => param.full).join(", ");
        return `${this.name}(${paramsText})`;
    }

    private parseParams(origin: string, paramsText: string): Param[] {

        const matches = codeUtil.matchAll(new RegExp(PARAM_PATTERN), paramsText);

        return matches.map((match) => {
            const name = match[paramMatchIdx.name];
            return new Param(
                name,
                this.document,
                this.line,
                this.character + origin.indexOf(name),
                Boolean(match[paramMatchIdx.byref]),
                Boolean(match[paramMatchIdx.star]),
                match[paramMatchIdx.defaultVal],
            );
        });
    }

    // public static parse(paramsText: string) {
    //     const refPattern = /\s*\((.+?)\)\s*$/;
    //     if (this.origin != this.name) {
    //         const paramsMatch = this.origin.match(refPattern);
    //         if (paramsMatch) {
    //             this.params = paramsMatch[1].split(",").filter(param => param.trim() != "").map(param => {
    //                 const paramMatch = param.match(/(byref\s+)?([^:=* \t]+)/i);
    //                 return paramMatch != null ? paramMatch[2] : param;
    //             });
    //             this.full = this.origin.replace(paramsMatch[1], this.params.join(","));
    //         }
    //         else {
    //             this.params = []
    //             this.full = this.origin;
    //         }
    //     }
    // }


    // public pushVariable(variables: Variable | Variable[]) {
    //     if (!Array.isArray(variables)) {
    //         variables = [variables];
    //     }
    //     loop: for (const variable of variables) {
    //         for (const curVariable of this.variables) {
    //             if (curVariable.name == variable.name) continue loop;
    //         }
    //         for (const paramStr of this.params) {
    //             if (paramStr == variable.name) continue loop;
    //         }
    //         this.variables.push(variable)
    //     }
    // }
}


type ParamDefaultValueType = number | string | boolean;

enum paramMatchIdx {
    origin, byref, name, star, _, defaultVal
}

/**
 * @group0 `byref par := "default value"`
 * @group1 `byref `
 * @group2 `par`
 * @group3 `*`
 * @group4 `:= "default value"`
 * @group5 `"default value"`
 */
const PARAM_PATTERN =
    /\s*(byref\s+)?(\w+)\s*(\*)?\s*(:?=\s*((?:true|false|(0x)?\d+(\.\d+)?|\".*\")))?,?/gi;

export class Param extends Identifier {

    constructor(
        name: string,
        document: TextDocument,
        line: number,
        character: number,
        public byref: boolean,
        public variadic: boolean,
        public defaultVal?: ParamDefaultValueType,
    ) {
        super(name, document, line, character);
    }

    public get full(): string {
        let tem = `${this.byref ? 'byref ' : ''}${this.name}${this.variadic ? '*' : ''}`;

        if (this.defaultVal) tem += ` := ${this.defaultVal}`;

        return tem;
    }
}