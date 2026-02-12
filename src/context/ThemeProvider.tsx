import { useState, useEffect, useCallback, ReactNode } from 'react'
import { Theme, ThemeContext } from './ThemeContext'

function getInitialTheme(): Theme {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark') return stored

    // Respect prefers-color-scheme
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'

    return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    // Listen for system preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: light)')
        const handler = (e: MediaQueryListEvent) => {
            // Only auto-switch if no explicit preference stored
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'light' : 'dark')
            }
        }
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
