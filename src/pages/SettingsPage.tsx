import SEOHead from '../components/SEOHead'
import Breadcrumb from '../components/Breadcrumb'
import { useUserPreferencesStore, type ColorPalette } from '../stores/userPreferencesStore'

const PALETTES: { id: ColorPalette; label: string; swatches: string[] }[] = [
  {
    id: 'peach-sorbet',
    label: 'Peach Sorbet',
    swatches: ['#f08080', '#f4978e', '#f8ad9d', '#fbc4ab', '#ffdab9'],
  },
  {
    id: 'gradient-blues',
    label: 'Gradient Blues',
    swatches: ['#7400b8', '#5e60ce', '#48bfe3', '#72efdd', '#80ffdb'],
  },
  {
    id: 'neon-party',
    label: 'Neon Party',
    swatches: ['#00ccff', '#00ffcc', '#ffff00', '#ff00cc', '#cc00ff'],
  },
  {
    id: 'deep-ocean-blue',
    label: 'Deep Ocean Blue',
    swatches: ['#006466', '#0b525b', '#212f45', '#312244', '#4d194d'],
  },
  {
    id: 'pastel-dreamland',
    label: 'Pastel Dreamland',
    swatches: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'],
  },
  {
    id: 'golden-summer-fields',
    label: 'Golden Summer Fields',
    swatches: ['#ccd5ae', '#e9edc9', '#fefae0', '#faedcd', '#d4a373'],
  },
  {
    id: 'light-steel',
    label: 'Light Steel',
    swatches: ['#f8f9fa', '#ced4da', '#adb5bd', '#6c757d', '#212529'],
  },
]

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="settings-section glass-card">
      <h2 className="settings-section-title">{title}</h2>
      <div className="settings-section-body">{children}</div>
    </section>
  )
}

function SettingsRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-label">
        <span>{label}</span>
        {hint && <small className="settings-row-hint">{hint}</small>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const {
    palette,
    sidebarDefaultOpen,
    fontSize,
    codeLanguage,
    density,
    readingMode,
    readingComfortTheme,
    customCursorEnabled,
    setPalette,
    setSidebarDefaultOpen,
    setFontSize,
    setCodeLanguage,
    setDensity,
    setReadingMode,
    setReadingComfortTheme,
    setCustomCursorEnabled,
  } = useUserPreferencesStore()

  return (
    <div className="page-container">
      <SEOHead
        title="Settings"
        description="Customize your learning experience."
        path="/settings"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Settings', url: '/settings' },
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Settings' }]} />

      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h1>Settings</h1>
        <p>All preferences are saved automatically to this device.</p>
      </div>

      <div className="settings-page">
        <SettingsSection title="Appearance">
          <div className="settings-palette-label">Color palette</div>
          <div className="palette-grid" role="radiogroup" aria-label="Color palette">
            {PALETTES.map(({ id, label, swatches }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={palette === id}
                className={`palette-swatch-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2${palette === id ? ' palette-swatch-btn--active' : ''}`}
                onClick={() => setPalette(id)}
                title={label}
                aria-label={label}
              >
                <span className="palette-swatch-strip" aria-hidden="true">
                  {swatches.map((color) => (
                    <span
                      key={color}
                      className="palette-swatch-color"
                      style={{ background: color }}
                    />
                  ))}
                </span>
                <span className="palette-swatch-name">{label}</span>
              </button>
            ))}
          </div>

          <SettingsRow label="Font size">
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as 'sm' | 'md' | 'lg')}
              aria-label="Font size"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </SettingsRow>

          <SettingsRow label="Layout density">
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as 'comfortable' | 'compact')}
              aria-label="Layout density"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Reading">
          <SettingsRow
            label="Reading mode"
            hint="Focus on lesson text with reduced interface chrome."
          >
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={readingMode}
                onChange={(e) => setReadingMode(e.target.checked)}
                aria-label="Start lessons in reading mode"
              />
              <span className="settings-toggle-track" aria-hidden="true" />
              <span className="settings-toggle-label">Start lessons in reading mode</span>
            </label>
          </SettingsRow>

          <SettingsRow
            label="Reading comfort theme"
            hint="Applies a softer palette while in reading mode; keeps your selected palette elsewhere."
          >
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={readingComfortTheme}
                onChange={(e) => setReadingComfortTheme(e.target.checked)}
                aria-label="Apply reading comfort theme"
              />
              <span className="settings-toggle-track" aria-hidden="true" />
              <span className="settings-toggle-label">Apply softer reading palette</span>
            </label>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Behavior">
          <SettingsRow label="Preferred code language">
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value as 'python' | 'sql')}
              aria-label="Preferred code language"
            >
              <option value="python">Python</option>
              <option value="sql">SQL</option>
            </select>
          </SettingsRow>

          <SettingsRow label="Sidebar" hint="You can still toggle the sidebar at any time.">
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={sidebarDefaultOpen}
                onChange={(e) => setSidebarDefaultOpen(e.target.checked)}
                aria-label="Open sidebar on new pages"
              />
              <span className="settings-toggle-track" aria-hidden="true" />
              <span className="settings-toggle-label">Open sidebar on new pages</span>
            </label>
          </SettingsRow>

          <SettingsRow
            label="Custom cursor"
            hint="Enhanced pointer effects on desktop. Off by default for a calmer experience."
          >
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={customCursorEnabled}
                onChange={(e) => setCustomCursorEnabled(e.target.checked)}
                aria-label="Enable custom cursor"
              />
              <span className="settings-toggle-track" aria-hidden="true" />
              <span className="settings-toggle-label">Enable enhanced pointer effects</span>
            </label>
          </SettingsRow>
        </SettingsSection>
      </div>
    </div>
  )
}
