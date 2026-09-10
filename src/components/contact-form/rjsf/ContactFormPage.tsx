import { Link } from 'react-router-dom'
import { ContactForm } from './ContactForm.tsx'

export function ContactFormPage() {
  return (
    <>
      <p className="m-0 text-[0.95rem] text-muted">
        <Link to="/contact-form">Contact form</Link>
      </p>
      <h1 className="mt-1.5 mb-3 text-4xl font-semibold leading-tight">
        React JSON Schema Form
      </h1>
      <p className="m-0">RJSF builds this form from a JSON Schema.</p>
      <div className="mt-10 rounded-lg border border-line bg-surface p-6">
        <ContactForm />
      </div>
    </>
  )
}
