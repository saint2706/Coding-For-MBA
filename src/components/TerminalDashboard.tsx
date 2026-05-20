/**
 * TerminalDashboard — Bloomberg-terminal-style data tile grid.
 *
 * Six dense, mono-typed tiles. Each tile is a compound piece composed
 * by the caller: header (label + symbol), body (the figure), footer
 * (delta or context). No new state — caller passes computed values.
 */

import { type ReactNode } from 'react'

function Dashboard({ children }: { children: ReactNode }) {
  return (
    <section className="terminal-dashboard" aria-label="Session dashboard">
      {children}
    </section>
  )
}

interface TileProps {
  children: ReactNode
  href?: string
  highlight?: boolean
}

function Tile({ children, href, highlight }: TileProps) {
  const className = `dashboard-tile${highlight ? ' dashboard-tile--highlight' : ''}`
  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    )
  }
  return <article className={className}>{children}</article>
}

function TileHeader({ label, symbol }: { label: string; symbol?: string }) {
  return (
    <header className="dashboard-tile-header">
      <span className="dashboard-tile-label">{label}</span>
      {symbol && (
        <span className="dashboard-tile-symbol" aria-hidden="true">
          {symbol}
        </span>
      )}
    </header>
  )
}

function TileValue({ children, unit }: { children: ReactNode; unit?: string }) {
  return (
    <div className="dashboard-tile-value">
      <span className="dashboard-tile-figure">{children}</span>
      {unit && <span className="dashboard-tile-unit">{unit}</span>}
    </div>
  )
}

function TileFooter({ children }: { children: ReactNode }) {
  return <footer className="dashboard-tile-footer">{children}</footer>
}

const TerminalDashboard = Object.assign(Dashboard, {
  Tile,
  TileHeader,
  TileValue,
  TileFooter,
})

/**
 * The combined TerminalDashboard component exposing Tile, TileHeader, TileBody, and TileFooter sub-components.
 * @returns {JSX.Element} The rendered TerminalDashboard component.
 */
export default TerminalDashboard
