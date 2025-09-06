import { useState } from "react"

interface Subsection {
  id: string
  name: string
  icon: string
  items: any[]
}

export default function SubsectionCard({
  subsection,
  onClick,
  onDelete,
  onRename,
}: {
  subsection: Subsection
  onClick: () => void
  onDelete: () => void
  onRename: (newName: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(subsection.name)

  const handleRename = () => {
    onRename(name)
    setEditing(false)
  }

  return (
    <div className="relative p-4 border rounded-lg shadow bg-white dark:bg-zinc-800 flex flex-col items-center">
      <div className="text-4xl mb-2 cursor-pointer" onClick={onClick}>
        {subsection.icon || "📦"}
      </div>

      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="text-center border rounded px-1"
          autoFocus
        />
      ) : (
        <h2
          className="font-semibold cursor-pointer"
          onDoubleClick={() => setEditing(true)}
        >
          {subsection.name}
        </h2>
      )}

      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
      >
        ✕
      </button>
    </div>
  )
}
