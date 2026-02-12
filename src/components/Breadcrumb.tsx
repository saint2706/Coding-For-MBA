/**
 * Breadcrumb Component
 *
 * Displays a hierarchical breadcrumb navigation trail showing the user's
 * current location within the site structure.
 */

import { Link } from 'react-router-dom'

/**
 * Represents a single breadcrumb item in the navigation trail.
 *
 * @property label - Display text for the breadcrumb item
 * @property to - Optional URL path for navigation. If omitted, renders as plain text
 */
export interface BreadcrumbItem {
  label: string
  to?: string
}

/**
 * Props for the Breadcrumb component.
 *
 * @property items - Array of breadcrumb items to display in order
 */
interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb navigation component.
 *
 * Renders a horizontal list of navigation items separated by forward slashes.
 * The last item (current page) is rendered as plain text without a link.
 *
 * @param items - Array of breadcrumb items to render
 * @returns A breadcrumb navigation element
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
