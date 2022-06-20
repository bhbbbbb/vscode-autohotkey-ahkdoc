import Method from './method';
import Ref from './ref';
import Label from './label';
import Variable from './variable';
import Block from './block';

export default interface Script {
    methods: Method[];
    refs: Ref[];
    labels: Label[];
    variables: Variable[];
    blocks: Block[];
}
