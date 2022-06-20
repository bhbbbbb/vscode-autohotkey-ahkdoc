import * as vscode from "vscode";
import STATIC_CONFIG from "../static.config";
import { WorkspaceConfig } from "../static.config";

export class Global {

    public static readonly CONFIG: WorkspaceConfig = (() => {
        const obj = {};
        Object.keys(STATIC_CONFIG).forEach((key) => { obj[key] = Global.getConfig(key) });
        return obj as WorkspaceConfig;
    })();

    private static statusBarItem: vscode.StatusBarItem;

    /**
     * get configuration from vscode setting.
     * @param key config key
     */
    private static getConfig<T>(key: string): T {
        return vscode.workspace.getConfiguration(STATIC_CONFIG.prefix).get<T>(key);
    }

    public static updateStatusBarItems(text: string) {
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
        this.statusBarItem.text = text
        this.statusBarItem.show()
    }

    public static hide() {
        this.statusBarItem.hide();
    }

}
