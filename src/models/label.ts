import { TextDocument } from 'vscode';
import Identifier from './identifier';
import Comment from './comment';

export default class Label extends Identifier { 

    constructor(
        name: string,
        document: TextDocument,
        line: number,
        character: number,
        public comment: Comment,
    ) {
        super(name, document, line, character);
    }
}
