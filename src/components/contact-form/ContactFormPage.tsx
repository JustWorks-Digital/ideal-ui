import { Link } from 'react-router-dom'
import { variations } from './variations.ts'

export function ContactFormPage() {
  return (
    <>
      <h1 className="mt-1.5 mb-3 text-4xl font-semibold leading-tight">
        Contact form
      </h1>
      <p className="m-0">Variations of the same form, so they can be compared.</p>
      <ul className="mt-8 grid list-none gap-5 p-0">
        {variations.map((variation) => (
          <li
            className="rounded-lg border border-line bg-surface p-5"
            key={variation.slug}
          >
            <h2 className="mt-0.5 mb-1.5 text-xl font-semibold leading-tight">
              <Link to={`/contact-form/${variation.slug}`}>{variation.title}</Link>
            </h2>
            <p className="m-0">{variation.summary}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
