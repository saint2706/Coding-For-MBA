import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import Breadcrumb from '../components/Breadcrumb'
import { useNotesStore } from '../stores/notesStore'
import { getLesson } from '../utils/contentLoader'

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function NoteCard({
  day,
  content,
  updatedAt,
}: {
  day: string
  content: string
  updatedAt: number
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(content)
  const setNote = useNotesStore((s) => s.setNote)
  const deleteNote = useNotesStore((s) => s.deleteNote)
  const lesson = getLesson(day)

  const save = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed) setNote(day, trimmed)
    else deleteNote(day)
    setEditing(false)
  }, [day, draft, setNote, deleteNote])

  const cancel = useCallback(() => {
    setDraft(content)
    setEditing(false)
  }, [content])

  return (
    <div className="note-card glass-card">
      <div className="note-card-header">
        <div className="note-card-meta">
          {lesson ? (
            <Link to={`/lesson/${day}`} className="note-lesson-link">
              Day {lesson.day}: {lesson.title}
            </Link>
          ) : (
            <span className="note-lesson-link">Day {day}</span>
          )}
          <span className="note-timestamp">{formatRelative(updatedAt)}</span>
        </div>
        <div className="note-card-actions">
          {!editing && (
            <button
              type="button"
              className="note-action-btn"
              onClick={() => setEditing(true)}
              aria-label="Edit note"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            className="note-action-btn note-action-btn--delete"
            onClick={() => deleteNote(day)}
            aria-label="Delete note"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="note-editor">
          <textarea
            className="note-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            autoFocus
            aria-label="Edit note content"
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
      ) : (
        <p className="note-content">{content}</p>
      )}
    </div>
  )
}

export default function NotesPage() {
  const notes = useNotesStore((s) => s.notes)
  const clearAllNotes = useNotesStore((s) => s.clearAllNotes)

  const sorted = Object.entries(notes).sort((a, b) => b[1].updatedAt - a[1].updatedAt)

  const handleClear = () => {
    if (window.confirm('Delete all notes? This cannot be undone.')) clearAllNotes()
  }

  return (
    <div className="page-container">
      <SEOHead
        title="My Notes"
        description="Personal notes saved across lessons."
        path="/notes"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Notes', url: '/notes' },
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Notes' }]} />

      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h1>My Notes</h1>
        <p>
          {sorted.length === 0
            ? 'Notes you add while reading lessons will appear here.'
            : `${sorted.length} note${sorted.length !== 1 ? 's' : ''} — saved locally on this device.`}
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="notes-empty glass-card">
          <span className="notes-empty-glyph" aria-hidden="true">
            ✎
          </span>
          <p>No notes yet.</p>
          <p className="notes-empty-hint">
            Open any lesson and use the note panel to jot something down.
          </p>
        </div>
      ) : (
        <>
          <div className="notes-list">
            {sorted.map(([day, { content, updatedAt }]) => (
              <NoteCard key={day} day={day} content={content} updatedAt={updatedAt} />
            ))}
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <button
              type="button"
              className="progress-clear-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={handleClear}
              aria-label="Delete all notes"
            >
              Clear All Notes
            </button>
          </div>
        </>
      )}
    </div>
  )
}
