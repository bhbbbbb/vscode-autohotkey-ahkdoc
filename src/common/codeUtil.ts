export class CodeUtil {
    /**
     * trim unfoucs code.
     * @param origin any string
     */
    public static purity(origin: string): string {
        if (!origin) return "";
        // TODO: untest 
        return origin.replace(/;.+/, "")
            .replace(/".*?"/g, "")
            .replace(/\{.*?\}/g, "")
            .replace(/ +/g, " ")
            .replace(/\bgui\b.*/ig, "")
            .replace(/\b(msgbox)\b.+?%/ig, "$1");
    }

    /**
     * keep string "" version of purity
     * @todo default param can be object
     * @param {string} origin 
     */
    public static purityMethod(origin: string): string {
        if (!origin) return "";
        return origin.replace(/;.+/, "")
            .replace(/\{.*?\}/g, "")
            .replace(/ +/g, " ")
            .replace(/\bgui\b.*/ig, "")
            .replace(/\b(msgbox)\b.+?%/ig, "$1");
    }

    /**
     * Join two array (or an array with a object)
     * @param array array to be added items
     * @param {any | any[]} items can be single or an array to be join with the prev. array
     */
    public static join(array: any[], items: any | any[]) {
        if (array == undefined || items == undefined) {
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

    public static matchAll(regex: RegExp, text: string): RegExpExecArray[] {

        if (!regex.global) {
            throw new Error("Only support global regex!");
        }

        let regs = [];
        let temp: RegExpExecArray;
        while ((temp = regex.exec(text)) != null) {
            regs.push(temp)
        }

        return regs;
    }

}