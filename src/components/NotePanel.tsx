/**
 * Note Panel
 *
 * In-lesson widget for jotting down a private note tied to the current day.
 *
 * Key Responsibilities:
 * - Show the existing note for this lesson, if any.
 * - Let the reader create, edit, or delete that note.
 * - Persist changes via the shared notes store (localStorage-backed),
 *   so the note also appears on the "My Notes" page.
 */

import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotesStore } from '../stores/notesStore'

interface NotePanelProps {
  /** The lesson's day token, used as the note's storage key. */
  day: string
}

/**
 * Renders a collapsible note editor for a single lesson.
 *
 * @param {NotePanelProps} props - The component properties.
 * @returns {React.ReactElement} The rendered note panel.
 */
export default function NotePanel({ day }: NotePanelProps) {
  const note = useNotesStore((s) => s.notes[day])
  const setNote = useNotesStore((s) => s.setNote)
  const deleteNote = useNotesStore((s) => s.deleteNote)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note?.content ?? '')

  const startEditing = useCallback(() => {
    setDraft(note?.content ?? '')
    setEditing(true)
  }, [note])

  const save = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed) setNote(day, trimmed)
    else deleteNote(day)
    setEditing(false)
  }, [day, draft, setNote, deleteNote])

  const cancel = useCallback(() => {
    setDraft(note?.content ?? '')
    setEditing(false)
  }, [note])

  return (
    <section className="lesson-note-panel glass-card" aria-label="Your note for this lesson">
      <div className="lesson-note-panel-header">
        <h2 className="lesson-note-panel-title">
          <span aria-hidden="true">✎</span> My note
        </h2>
        {!editing && !note && (
          <button type="button" className="note-action-btn" onClick={startEditing}>
            + Add a note
          </button>
        )}
        {!editing && note && (
          <div className="note-card-actions">
            <button
              type="button"
              className="note-action-btn"
              onClick={startEditing}
              aria-label="Edit note"
            >
              Edit
            </button>
            <button
              type="button"
              className="note-action-btn note-action-btn--delete"
              onClick={() => deleteNote(day)}
              aria-label="Delete note"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="note-editor">
          <textarea
            className="note-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- moves focus into the textarea revealed by the user's own "Edit" click, not on page load
            autoFocus
            placeholder="Jot down a thought, question, or reminder about this lesson…"
            aria-label="Note content"
          />
          <div className="note-editor-actions">
            <button type="button" className="note-save-btn" onClick={save}>
              Save
            </button>
            <button type="button" className="note-cancel-btn" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : note ? (
        <p className="note-content">{note.content}</p>
      ) : (
        <p className="lesson-note-panel-hint">
          Notes are saved on this device and collected on your <Link to="/notes">Notes page</Link>.
        </p>
      )}
    </section>
  )
}
