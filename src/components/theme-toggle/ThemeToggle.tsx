import { useState } from 'react'
import { getTheme, setTheme, type Theme } from './theme.ts'

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(getTheme)

  function choose(next: Theme) {
    setTheme(next)
    setThemeState(next)
  }

  return (
    <div
      className="flex rounded-lg border border-line p-0.5"
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        className="rounded-md px-3 py-1 text-sm font-semibold text-muted aria-pressed:bg-accent aria-pressed:text-on-accent"
        aria-pressed={theme === 'light'}
        onClick={() => choose('light')}
      >
        Light
      </button>
      <button
        type="button"
        className="rounded-md px-3 py-1 text-sm font-semibold text-muted aria-pressed:bg-accent aria-pressed:text-on-accent"
        aria-pressed={theme === 'dark'}
        onClick={() => choose('dark')}
      >
        Dark
      </button>
    </div>
  )
}
