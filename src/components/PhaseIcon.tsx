/**
 * PhaseIcon
 *
 * Renders the icon for a given curriculum phase number, looked up from
 * `phaseIcons`. Centralizes the "phase index -> icon, with fallback" logic
 * that used to be repeated at every call site.
 */

import type { IconProps } from '@phosphor-icons/react'
import { phaseIcons } from '../utils/contentLoader'
import { AppIcon } from '../utils/iconRegistry'

interface PhaseIconProps extends IconProps {
  /** 1-indexed curriculum phase number. */
  phase: number
}

export default function PhaseIcon({ phase, ...props }: PhaseIconProps) {
  const name = phaseIcons[phase - 1] ?? 'BookOpen'
  return <AppIcon name={name} {...props} />
}
