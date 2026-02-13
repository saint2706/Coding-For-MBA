const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:'])
const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/

export const normalizeAndValidateHref = (href?: string | null) => {
  if (typeof href !== 'string') {
    return { normalizedHref: null, isExternal: false, isSafe: false }
  }

  const normalizedHref = href.trim()

  if (!normalizedHref || normalizedHref.startsWith('//')) {
    return { normalizedHref: null, isExternal: false, isSafe: false }
  }

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
    if (!SAFE_SCHEMES.has(url.protocol)) {
      return { normalizedHref: null, isExternal: false, isSafe: false }
    }

    return {
      normalizedHref,
      isExternal: url.protocol === 'http:' || url.protocol === 'https:',
      isSafe: true,
    }
  } catch {
    return { normalizedHref: null, isExternal: false, isSafe: false }
  }
}

export interface LinkProps {
  target?: string
  rel?: string
}

export const getSecureLinkAttributes = (
  href?: string | null,
  props: LinkProps = {},
) => {
  const { normalizedHref, isExternal, isSafe } = normalizeAndValidateHref(href)

  if (!isSafe || !normalizedHref) {
    return null
  }

  let { target, rel } = props

  if (isExternal) {
    target = '_blank'
    const parts = (rel || '')
      .split(/\s+/)
      .filter(Boolean)
      .filter(token => token.toLowerCase() !== 'opener')
    const lowerParts = new Set(parts.map(token => token.toLowerCase()))
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
