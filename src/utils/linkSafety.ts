/**
 * Link Safety Utilities
 *
 * Provides validation and sanitization for URL links, particularly those
 * generated from user content or external sources.
 *
 * Key Responsibilities:
 * - Validate protocols to prevent javascript: or data: URI attacks.
 * - Enforce `rel="noopener noreferrer"` for external links to prevent reverse tabnabbing.
 * - Normalize relative vs absolute URLs.
 */

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:'])

// Matches anything that looks like a scheme: starts with a letter,
// followed by any characters EXCEPT colon, slash, question mark, or hash,
// and ends with a colon.
// This prevents relative URLs like "search?q=filter:value" from being treated as schemes,
// while still catching valid schemes and obfuscated ones (if they don't contain /?#).
const URL_SCHEME_PATTERN = /^[a-zA-Z][^:/?#]*:/

/**
 * Validates and normalizes a URL string.
 * Detects if the link is external and safe to use.
 *
 * @param href - The raw URL string to check.
 * @returns Object containing the normalized URL and safety flags.
 */
export const normalizeAndValidateHref = (href?: string | null) => {
  if (typeof href !== 'string') {
    return { normalizedHref: null, isExternal: false, isSafe: false }
  }

  // Remove control characters (ASCII 0-31, 127) and trim whitespace.
  // This neutralizes obfuscation attempts like "j\navascript:" or "jav\0ascript:".
  // eslint-disable-next-line no-control-regex -- matching control characters is the point: this strips them to block obfuscated scheme sniffing
  const normalizedHref = href.replace(/[\x00-\x1F\x7F]/g, '').trim()

  if (!normalizedHref || normalizedHref.startsWith('//')) {
    return { normalizedHref: null, isExternal: false, isSafe: false }
  }

  // If it doesn't look like a URL with a scheme, treat it as a relative path.
  // We check specific prefixes to be sure, or fallback to the regex check.
  if (
    normalizedHref.startsWith('#') ||
    normalizedHref.startsWith('/') ||
    normalizedHref.startsWith('./') ||
    normalizedHref.startsWith('../') ||
    !URL_SCHEME_PATTERN.test(normalizedHref)
  ) {
    return { normalizedHref, isExternal: false, isSafe: true }
  }

  try {
    const url = new URL(normalizedHref)
    // Validate protocol against allowlist
    if (!SAFE_SCHEMES.has(url.protocol)) {
      return { normalizedHref: null, isExternal: false, isSafe: false }
    }

    return {
      normalizedHref,
      isExternal: url.protocol === 'http:' || url.protocol === 'https:',
      isSafe: true,
    }
  } catch {
    // If it looks like a URL (has scheme) but fails parsing, it's unsafe.
    return { normalizedHref: null, isExternal: false, isSafe: false }
  }
}

/**
 * Common HTML anchor element attributes used alongside a validated href.
 */
export interface LinkProps {
  target?: string
  rel?: string
}

/**
 * Generates secure HTML attributes for a link.
 * Automatically adds `rel="noopener noreferrer"` and `target="_blank"` for external links.
 *
 * @param href - The destination URL.
 * @param props - Additional link properties (target, rel).
 * @returns Safe props object or null if the link is unsafe.
 */
export const getSecureLinkAttributes = (href?: string | null, props: LinkProps = {}) => {
  const { normalizedHref, isExternal, isSafe } = normalizeAndValidateHref(href)

  if (!isSafe || !normalizedHref) {
    return null
  }

  let { target, rel } = props

  if (isExternal) {
    target = '_blank'
    const parts = (rel || '').split(/\s+/).reduce<string[]>((acc, token) => {
      if (token && token.toLowerCase() !== 'opener') {
        acc.push(token)
      }
      return acc
    }, [])
    const lowerParts = new Set(parts.map((token) => token.toLowerCase()))
    if (!lowerParts.has('noopener')) {
      parts.push('noopener')
      lowerParts.add('noopener')
    }
    if (!lowerParts.has('noreferrer')) {
      parts.push('noreferrer')
      lowerParts.add('noreferrer')
    }
    rel = parts.join(' ')
  }

  return { href: normalizedHref, target, rel }
}
