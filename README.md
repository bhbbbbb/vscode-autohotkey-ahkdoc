# AHKDoc
AHKDoc is a fork of [vscode-autohotkey-plus by cweijan](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus) with additional support for documentation called AHKdoc.

Ahkdoc is inspired by [JSDoc](https://jsdoc.app/index.html). 

This is an early version, and there is still a lot to be done.

Currently, it is very similar to jsdoc.

More functionality and better documentation will be coming in future version.


  - [AHKDoc](#AHKDoc#AHKDoc)
  - [Debug](#debug)
  - [Language Features](#language-features)
  - [Context Menu](#context-menu)
  - [Setting](#setting)
  - [Credits](#credits)

## Start

Install  [vscode-autohotkey-ahkdoc](https://marketplace.visualstudio.com/items?itemName=bhbbbbb.vscode-autohotkey-ahkdoc) from vscode marketplace.

## AHKDoc

- ![ahkdoc](image/ahkdoc.jpg)

- ![ahkdoc_hover](image/ahkdoc_hover.png)

- ![ahkCompletion](image/autoCompletion.jpg)


## Debug

![debug](image/debug.gif)

**Features:**
1. Click run button or press F9.
2. Support breakpoint、stacktrace、variable
4. **Output Message**: Recommend using `OutputDebug` command instead MsgBox when debug.
4. **Evalute**: Set and get variable in debug evaluter.

This extension provides basic debugging functions. If you need more debugging functions(Like **conditional breakpoint**), install additional extension [vscode-autohotkey-debug](https://marketplace.visualstudio.com/items?itemName=zero-plusplus.vscode-autohotkey-debug).

## Language Features

This extension provides basic programming language support for autohotkey:
- Method Symbol: ![methodSymbol](image/methodSymbol.png)
- Goto Definition: param, variable, method(**press ctrl then click**)
- Find References: Find method references(**shift+f12**).
- Code Format(**Shift+Alt+F**)
- Hover tip: Move mouse to method call or command. ![hover](image/hover.png)
- Code Symbol: Add two semicolon to comment code block. ![codeSymbole](image/codeSymbol.png)
- IntelliSense

## Context Menu

Support below function: ![context](image/context.png)

## Setting

OpenSetting -> extensions -> Ahk Plus
![settings](image/settings.jpg)

## Credits
- [vscode-autohotkey-plus by cweijan](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus)