/**
 * EditorialCover — full-bleed magazine masthead.
 *
 * Replaces the stock "Welcome / hero with stats" pattern. Reads as the
 * cover of an issue, not as a marketing pitch. Compound-component
 * style: caller composes <EditorialCover.Eyebrow>, <EditorialCover.Title>,
 * <EditorialCover.Lede>, <EditorialCover.Meta>, <EditorialCover.Action>.
 */

import { type ReactNode } from 'react'

function Cover({ children }: { children: ReactNode }) {
  return (
    <header className="editorial-cover" role="banner">
      {children}
    </header>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="cover-eyebrow">{children}</p>
}

function Title({ children }: { children: ReactNode }) {
  return <h1 className="cover-title display-headline">{children}</h1>
}

function Lede({ children }: { children: ReactNode }) {
  return <p className="cover-lede">{children}</p>
}

function Meta({ children }: { children: ReactNode }) {
  return <dl className="cover-meta">{children}</dl>
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="cover-meta-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="cover-actions">{children}</div>
}

const EditorialCover = Object.assign(Cover, {
  Eyebrow,
  Title,
  Lede,
  Meta,
  MetaItem,
  Actions,
})

/**
 * The combined EditorialCover component exposing sub-components.
 */
export default EditorialCover
