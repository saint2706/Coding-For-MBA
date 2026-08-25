import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import NotePanel from '../../../src/components/NotePanel'
import { useNotesStore } from '../../../src/stores/notesStore'

function renderPanel(day = '1') {
  return render(
    <MemoryRouter>
      <NotePanel day={day} />
    </MemoryRouter>,
  )
}

describe('NotePanel', () => {
  beforeEach(() => {
    useNotesStore.setState({ notes: {} })
  })

  it('shows an "Add a note" affordance when no note exists', () => {
    renderPanel()
    expect(screen.getByRole('button', { name: '+ Add a note' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Edit note')).not.toBeInTheDocument()
  })

  it('creates a note and persists it in the store', () => {
    renderPanel('1')
    fireEvent.click(screen.getByRole('button', { name: '+ Add a note' }))

    const textarea = screen.getByLabelText('Note content')
    fireEvent.change(textarea, { target: { value: 'Remember to review loops.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Remember to review loops.')).toBeInTheDocument()
    expect(useNotesStore.getState().notes['1']?.content).toBe('Remember to review loops.')
  })

  it('edits an existing note', () => {
    useNotesStore.getState().setNote('1', 'Original note')
    renderPanel('1')

    fireEvent.click(screen.getByLabelText('Edit note'))
    const textarea = screen.getByLabelText('Note content')
    fireEvent.change(textarea, { target: { value: 'Updated note' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Updated note')).toBeInTheDocument()
    expect(useNotesStore.getState().notes['1']?.content).toBe('Updated note')
  })

  it('deletes a note', () => {
    useNotesStore.getState().setNote('1', 'To be deleted')
    renderPanel('1')

    fireEvent.click(screen.getByLabelText('Delete note'))

    expect(screen.queryByText('To be deleted')).not.toBeInTheDocument()
    expect(useNotesStore.getState().notes['1']).toBeUndefined()
    expect(screen.getByRole('button', { name: '+ Add a note' })).toBeInTheDocument()
  })

  it('discards changes on cancel', () => {
    useNotesStore.getState().setNote('1', 'Keep me')
    renderPanel('1')

    fireEvent.click(screen.getByLabelText('Edit note'))
    fireEvent.change(screen.getByLabelText('Note content'), { target: { value: 'Discarded' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(useNotesStore.getState().notes['1']?.content).toBe('Keep me')
  })

  it('saving an empty note deletes it', () => {
    useNotesStore.getState().setNote('1', 'Keep me')
    renderPanel('1')

    fireEvent.click(screen.getByLabelText('Edit note'))
    fireEvent.change(screen.getByLabelText('Note content'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(useNotesStore.getState().notes['1']).toBeUndefined()
  })
})
