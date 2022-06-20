import { TextDocument } from 'vscode';

export default class Identifier {
    constructor(
        public name: string,
        public document: TextDocument,
        public line: number,
        public character: number,
        // public documentation?: ahkDoc
    ) { }
}
