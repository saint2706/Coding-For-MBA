/**
 * Breadcrumb Navigation
 *
 * Displays a hierarchical trail of links indicating the current page location.
 *
 * Key Responsibilities:
 * - Render a list of navigation items.
 * - Mark the current page with `aria-current="page"`.
 * - Use accessible separators.
 */

import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb Navigation Component
 *
 * Renders a trail of links to help users navigate back up the site hierarchy.
 *
 * @param {BreadcrumbProps} props - The component props.
 * @param {Array<{label: string, path: string}>} props.items - The list of breadcrumb items.
 * @returns {JSX.Element} The breadcrumb navigation bar.
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="lesson-breadcrumb">
        {items.map((item, i) => (
          <li key={i} className="breadcrumb-item">
            {i > 0 && (
              <span className="sep" aria-hidden="true">
                /
              </span>
            )}
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
