export default {

    prefix: "vscode-ahkdoct",

    workspaceConfigs: {
        compilePath: "compilePath",
        executePath: "executePath",
        enableIntelliSense: "enableIntelliSense",
        documentPath: "documentPath",
    },

    maxDocumentLines: 10000, // TODO: migrate to package.json (available for users)

} as const;

export interface WorkspaceConfig {
    compilePath: string
    executePath: string
    enableIntelliSense: boolean
    documentPath: string
}
