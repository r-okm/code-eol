import { DecorationOptions, ExtensionContext, Position, Range, window, workspace, WorkspaceConfiguration } from 'vscode'

// this method is called when vs code is activated
export function activate (context: ExtensionContext) {
  // create a decorator type that we use to decorate small numbers
  const nullDecoration = window.createTextEditorDecorationType({})

  let activeEditor = window.activeTextEditor
  if (activeEditor) {
    updateDecorations()
  }

  window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor
      if (editor) {
        updateDecorations()
      }
    },
    null,
    context.subscriptions
  )
  window.onDidChangeTextEditorSelection(
    () => {
      updateDecorations()
    },
    null,
    context.subscriptions
  )
  workspace.onDidChangeTextDocument(
    () => {
      updateDecorations()
    },
    null,
    context.subscriptions
  )

  function updateDecorations () {
    if (!activeEditor) {
      return
    }

    const config: WorkspaceConfiguration = workspace.getConfiguration('code-eol')
    const decorationColor: any = config.color

    const currentCursorLine: number = activeEditor.selection.active.line

    const regEx: RegExp = /(\r(?!\n))|(\r?\n)/g
    const text: string = activeEditor.document.getText()

    const newLineDecorations: DecorationOptions[] = []
    let match: RegExpExecArray
    while (match = regEx.exec(text)) {
      const decTxt = getDecTxt(match[0])
      const position: Position = activeEditor.document.positionAt(match.index)
      const decoration: DecorationOptions = {
        range: new Range(position, position),
        renderOptions: {
          after: {
            contentText: decTxt,
            color: decorationColor
          }
        }
      }
      if (position.line !== currentCursorLine) newLineDecorations.push(decoration)
    }

    activeEditor.setDecorations(nullDecoration, newLineDecorations)
  }
}

function getDecTxt (match: string): EolChar {
  switch (match) {
    case "\n":
      return "↓"
    case "\r\n":
      return "↵"
    case "\r":
      return "←"
    default:
      return ""
  }
}

type EolChar = "↓" | "↵" | "←" | ""
