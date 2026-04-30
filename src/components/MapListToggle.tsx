/**
 * MapListToggle — segmented control choosing between two children.
 *
 * Compound: caller passes <MapListToggle.View label="list">…</MapListToggle.View>
 * children. The toggle renders the segmented switch and shows the
 * matching view. State is local; no new store.
 */

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from 'react'

interface ViewProps {
  label: string
  glyph?: string
  children: ReactNode
}

function View({ children }: ViewProps) {
  return <>{children}</>
}

interface ToggleProps {
  defaultActive?: string
  ariaLabel?: string
  children: ReactNode
}

function Toggle({ defaultActive, ariaLabel = 'Switch view', children }: ToggleProps) {
  const views = Children.toArray(children).filter(
    (child): child is ReactElement<ViewProps> => isValidElement(child) && child.type === View,
  )
  const initial = defaultActive ?? views[0]?.props.label ?? ''
  const [active, setActive] = useState(initial)
  const activeView = views.find((v) => v.props.label === active) ?? views[0]

  return (
    <div className="map-list-toggle">
      <div className="map-list-toggle-bar" role="tablist" aria-label={ariaLabel}>
        {views.map((v) => {
          const isActive = v.props.label === active
          return (
            <button
              key={v.props.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`map-list-toggle-btn${isActive ? ' active' : ''}`}
              onClick={() => setActive(v.props.label)}
            >
              {v.props.glyph && (
                <span className="map-list-toggle-glyph" aria-hidden="true">
                  {v.props.glyph}
                </span>
              )}
              <span>{v.props.label}</span>
            </button>
          )
        })}
      </div>
      <div className="map-list-toggle-panel" role="tabpanel">
        {activeView}
      </div>
    </div>
  )
}

const MapListToggle = Object.assign(Toggle, { View })

/**
 * The combined MapListToggle component exposing the View sub-component.
 */
export default MapListToggle
