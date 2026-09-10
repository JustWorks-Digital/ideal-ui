import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from './theme-toggle/ThemeToggle.tsx'

export function Layout() {
  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
        href="#main"
      >
        Skip to content
      </a>
      <header className="mx-auto flex w-[min(42rem,calc(100%-2rem))] items-start justify-between gap-4 border-b border-line pt-6 pb-4">
        <div>
          <p className="m-0 text-lg font-semibold">
            <Link className="text-fg no-underline" to="/">
              Ideal
            </Link>
          </p>
          <p className="mt-0.5 mb-0 text-[0.95rem] text-muted">
            What should common UI actually look like?
          </p>
        </div>
        <ThemeToggle />
      </header>
      <main
        className="mx-auto w-[min(42rem,calc(100%-2rem))] pt-8 pb-16"
        id="main"
      >
        <Outlet />
      </main>
    </>
  )
}
