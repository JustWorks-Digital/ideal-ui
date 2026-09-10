import { Link } from 'react-router-dom'
import { examples } from '../examples.ts'

export function HomePage() {
  return (
    <>
      <h1 className="mt-1.5 mb-3 text-4xl font-semibold leading-tight">Ideal</h1>
      <p className="m-0">Working examples of common website UI.</p>
      <ul className="mt-8 grid list-none gap-5 p-0">
        {examples.map((example) => (
          <li
            className="rounded-lg border border-line bg-surface p-5"
            key={example.slug}
          >
            <h2 className="mt-0.5 mb-1.5 text-xl font-semibold leading-tight">
              <Link to={`/${example.slug}`}>{example.title}</Link>
            </h2>
            <p className="m-0">{example.summary}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
