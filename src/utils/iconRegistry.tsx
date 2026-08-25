/**
 * Icon Registry
 *
 * Central lookup from a stable string name to a Phosphor icon component.
 * Used wherever an icon identity needs to travel through plain data (config
 * arrays, Zustand store state) rather than a JSX element — phase icons and
 * gamification achievement badges.
 */

import type { Icon, IconProps } from '@phosphor-icons/react'
import {
  BookOpen,
  Brain,
  Buildings,
  ChartBar,
  ChartPie,
  CheckCircle,
  ClipboardText,
  Clock,
  CloudArrowUp,
  Code,
  Database,
  Flame,
  FolderOpen,
  Function as FunctionIcon,
  Globe,
  Hammer,
  Lightbulb,
  Lightning,
  LinkSimple,
  MagnifyingGlass,
  MathOperations,
  Medal,
  Moon,
  Notebook,
  Package,
  Rocket,
  Sparkle,
  Star,
  Target,
  TestTube,
  ThumbsUp,
  TrendDown,
  Warning,
  XCircle,
} from '@phosphor-icons/react'

/** Name -> component map. Add new entries here as new icons are needed. */
export const ICON_REGISTRY = {
  BookOpen,
  Brain,
  Buildings,
  ChartBar,
  ChartPie,
  CheckCircle,
  ClipboardText,
  Clock,
  CloudArrowUp,
  Code,
  Database,
  Flame,
  FolderOpen,
  Function: FunctionIcon,
  Globe,
  Hammer,
  Lightbulb,
  Lightning,
  LinkSimple,
  MagnifyingGlass,
  MathOperations,
  Medal,
  Moon,
  Notebook,
  Package,
  Rocket,
  Sparkle,
  Star,
  Target,
  TestTube,
  ThumbsUp,
  TrendDown,
  Warning,
  XCircle,
} as const satisfies Record<string, Icon>

export type IconName = keyof typeof ICON_REGISTRY

interface AppIconProps extends IconProps {
  /** Name of the icon to render. Falls back to BookOpen if unrecognized. */
  name: string
}

/**
 * Renders a Phosphor icon by name, looked up from {@link ICON_REGISTRY}.
 * Falls back to `BookOpen` for names that don't resolve (e.g. stale data),
 * so callers never need to guard against a missing icon themselves.
 */
export function AppIcon({ name, ...props }: AppIconProps) {
  const Component: Icon = ICON_REGISTRY[name as IconName] ?? BookOpen
  return <Component aria-hidden="true" {...props} />
}
