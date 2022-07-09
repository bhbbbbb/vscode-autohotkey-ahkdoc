import Identifier from './identifier';
import Method from './method';

export default interface Variable extends Identifier {
    // name: string;
    // document: vscode.TextDocument;
    // line: number;
    // character: number;
    method?: Method;
    isGlobal: boolean;
}
