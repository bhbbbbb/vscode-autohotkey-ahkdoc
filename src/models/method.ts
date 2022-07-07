import { TextDocument } from "vscode";
import Identifier from "./identifier";
import Variable from "./variable";
import Comment from "./comment";

/**
 * @prop {boolean} withQuote whether the function have '{' with ')' in the same line
 * @prop {string} origin e.g. 'foo(par1, par2)'
 * @prop {string} name e.g. 'foo'
 */
export default class Method extends Identifier {

    public params: string[];
    public variables: Variable[];
    public full: string;
    public endLine: number;

    constructor(
        name: string,
        document: TextDocument,
        line: number,
        character: number,
        public origin: string,
        public comment: Comment,
    ) {
        super(name, document, line, character);
        this.buildParams();
        this.variables = [];
    }

    private buildParams() {
        const refPattern = /\s*\((.+?)\)\s*$/;
        if (this.origin != this.name) {
            const paramsMatch = this.origin.match(refPattern);
            if (paramsMatch) {
                this.params = paramsMatch[1].split(",").filter(param => param.trim() != "").map(param => {
                    const paramMatch = param.match(/(byref\s+)?([^:=* \t]+)/i);
                    return paramMatch != null ? paramMatch[2] : param;
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