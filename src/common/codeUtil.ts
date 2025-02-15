/**
 * trim unfoucs code.
 * @param origin any string
 */
function purity(origin: string): string {
    if (!origin) return "";
    // TODO: untest 
    return origin.replace(/;.+/, "")
        .replace(/".*?"/g, "")
        .replace(/\{.*?\}/g, "")
        .replace(/\s+/g, " ")
        // don't know what are these for
        // .replace(/\bgui\b.*/ig, "")
        // .replace(/\b(msgbox)\b.+?%/ig, "$1");
}

/**
 * Join two array (or an array with a object)
 * @param array array to be added items
 * @param {any | any[]} items can be single or an array to be join with the prev. array
 */
function join<T>(array: T[], items: T | T[]) {
    if (array === undefined || items === undefined) {
        return
    }
    if (Array.isArray(items)) {
        for (const item of items) {
            array.push(item)
        }
    } else {
        array.push(items)
    }
}

function matchAll(regex: RegExp, text: string): RegExpExecArray[] {

    if (!regex.global) {
        throw new Error("Only support global regex!");
    }

    let regs: RegExpExecArray[] = [];
    let temp: RegExpExecArray | null;
    while ((temp = regex.exec(text)) !== null) {
        regs.push(temp)
    }

    return regs;
}


export default {
    matchAll,
    join,
    purity,
} as const;
