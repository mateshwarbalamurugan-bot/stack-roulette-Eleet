<script setup>
import { ref, onMounted } from 'vue'

const API = 'http://localhost:3000/api/notes'

const notes = ref([])
const search = ref('')
const title = ref('')
const content = ref('')
const tags = ref('')
const editingId = ref(null)
const loading = ref(false)
const error = ref('')
const saving = ref(false)

async function loadNotes() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${API}?q=${encodeURIComponent(search.value)}`)
    if (!response.ok) throw new Error('Could not load notes.')
    notes.value = await response.json()
  } catch (err) {
    error.value = 'Cannot connect to the backend. Make sure it is running on port 3000.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  title.value = ''
  content.value = ''
  tags.value = ''
  editingId.value = null
}

function startEdit(note) {
  editingId.value = note.id
  title.value = note.title
  content.value = note.content || ''
  tags.value = note.tags || ''
  document.querySelector('.note-form')?.scrollIntoView({ behavior: 'smooth' })
}

async function saveNote() {
  if (!title.value.trim()) {
    error.value = 'Please enter a title for your note.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const isEditing = editingId.value !== null
    const response = await fetch(
      isEditing ? `${API}/${editingId.value}` : API,
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.value,
          content: content.value,
          tags: tags.value
        })
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not save note.')

    resetForm()
    await loadNotes()
  } catch (err) {
    error.value = err.message || 'Could not save your note.'
  } finally {
    saving.value = false
  }
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return

  error.value = ''
  try {
    const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Could not delete note.')
    if (editingId.value === id) resetForm()
    await loadNotes()
  } catch (err) {
    error.value = err.message || 'Could not delete note.'
  }
}

onMounted(loadNotes)
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#">
        <span class="brand-mark">E</span>
        <span>elee<span class="brand-light">t.</span></span>
      </a>
      <span class="team-label">ELEET SQUAD · HACKATHON 2026</span>
    </header>

    <main>
      <section class="hero">
        <div class="eyebrow"><span class="status-dot"></span> YOUR SPACE TO THINK</div>
        <h1>Ideas deserve<br /><span>a place to live.</span></h1>
        <p class="hero-copy">
          Capture your thoughts, organise your ideas, and keep your next big
          thing within reach.
        </p>

        <div class="stats">
          <div class="stat">
            <strong>{{ notes.length }}</strong>
            <span>{{ search ? 'MATCHING NOTES' : 'NOTES FOUND' }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <strong>01</strong>
            <span>YOUR WORKSPACE</span>
          </div>
        </div>
      </section>

      <section class="workspace">
        <div class="section-heading">
          <div>
            <div class="eyebrow">YOUR WORKSPACE</div>
            <h2>Notes board<span class="heading-period">.</span></h2>
          </div>
          <span class="note-count">{{ notes.length }} {{ notes.length === 1 ? 'NOTE' : 'NOTES' }}</span>
        </div>

        <div class="toolbar">
          <label class="search-box">
            <span class="search-icon">⌕</span>
            <input
              v-model="search"
              @input="loadNotes"
              placeholder="Search titles, ideas, tags..."
              aria-label="Search notes"
            />
            <kbd>SEARCH</kbd>
          </label>
        </div>

        <div v-if="error" class="alert" role="alert">
          <span>{{ error }}</span>
          <button class="alert-close" @click="error = ''" aria-label="Dismiss error">×</button>
        </div>

        <div class="board-layout">
          <section class="note-form panel">
            <div class="panel-heading">
              <span class="form-icon">{{ editingId ? '↗' : '+' }}</span>
              <div>
                <h3>{{ editingId ? 'Edit your note' : 'Create a note' }}</h3>
                <p>{{ editingId ? 'Make your changes below.' : 'A thought, an idea, a plan.' }}</p>
              </div>
            </div>

            <form @submit.prevent="saveNote">
              <label for="note-title">TITLE <span class="required">*</span></label>
              <input
                id="note-title"
                v-model="title"
                maxlength="150"
                placeholder="Give your idea a name..."
                required
              />

              <label for="note-content">CONTENT</label>
              <textarea
                id="note-content"
                v-model="content"
                rows="5"
                placeholder="Start writing here..."
              ></textarea>

              <label for="note-tags">TAGS</label>
              <input
                id="note-tags"
                v-model="tags"
                placeholder="e.g. project, ideas, college"
              />
              <p class="field-hint">Separate tags with commas.</p>

              <div class="form-actions">
                <button class="primary-button" type="submit" :disabled="saving">
                  {{ saving ? 'Saving...' : editingId ? 'Save changes ↗' : 'Add note ↗' }}
                </button>
                <button v-if="editingId" class="cancel-button" type="button" @click="resetForm">
                  Cancel
                </button>
              </div>
            </form>
          </section>

          <section class="notes-column">
            <div v-if="loading" class="empty-state">
              <div class="empty-symbol">↻</div>
              <h3>Loading your notes...</h3>
            </div>

            <div v-else-if="notes.length === 0" class="empty-state">
              <div class="empty-symbol">{{ search ? '⌕' : '✳' }}</div>
              <h3>{{ search ? 'No matching notes' : 'Your story starts here.' }}</h3>
              <p>{{ search ? 'Try another search term.' : 'Create your first note using the form.' }}</p>
            </div>

            <article v-for="(note, index) in notes" :key="note.id" class="note-card">
              <div class="note-topline">
                <span class="note-index">NOTE {{ String(index + 1).padStart(2, '0') }}</span>
                <span class="note-id">#{{ note.id }}</span>
              </div>
              <h3>{{ note.title }}</h3>
              <p v-if="note.content" class="note-content">{{ note.content }}</p>
              <p v-else class="note-content muted">No additional content.</p>

              <div v-if="note.tags" class="tags-list">
                <span
                  v-for="tag in note.tags.split(',').map(t => t.trim()).filter(Boolean)"
                  :key="tag"
                  class="tag"
                >{{ tag }}</span>
              </div>

              <div class="note-footer">
                <span class="note-date">{{ note.created_at || 'SAVED NOTE' }}</span>
                <div class="note-actions">
                  <button class="text-button" @click="startEdit(note)">Edit ↗</button>
                  <button class="text-button delete-button" @click="deleteNote(note.id)">Delete</button>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>

    <footer>
      <span>ELEET SQUAD <span class="footer-dot">·</span> STACK ROULETTE 2026</span>
      <span>BUILT FOR IDEAS THAT MATTER.</span>
    </footer>
  </div>
</template>
