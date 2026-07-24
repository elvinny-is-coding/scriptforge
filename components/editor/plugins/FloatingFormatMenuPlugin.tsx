// components/editor/plugins/FloatingFormatMenuPlugin.tsx
import { useEffect, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from "lexical"
import { mergeRegister } from "@lexical/utils"

export function FloatingFormatMenuPlugin() {
  const [editor] = useLexicalComposerContext()
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            const rect = getSelection()?.getRangeAt(0).getBoundingClientRect()
            if (rect) {
              setPosition({ top: rect.top - 50, left: rect.left + rect.width / 2 })
              setShow(true)
              setIsBold(selection.hasFormat("bold"))
              setIsItalic(selection.hasFormat("italic"))
              setIsUnderline(selection.hasFormat("underline"))
            }
          } else {
            setShow(false)
          }
        })
      })
    )
    return unregister
  }, [editor])

  if (!show) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white shadow-lg rounded-md border p-1 flex gap-1"
      style={{ top: position.top, left: position.left }}
    >
      <button
        className={`px-2 py-1 rounded ${isBold ? "bg-gray-200" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <strong>B</strong>
      </button>
      <button
        className={`px-2 py-1 rounded ${isItalic ? "bg-gray-200" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <em>I</em>
      </button>
      <button
        className={`px-2 py-1 rounded ${isUnderline ? "bg-gray-200" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <u>U</u>
      </button>
    </div>
  )
}