import { Link } from 'react-router-dom'
import { ContactForm } from './ContactForm.tsx'
import { Card, CardContent } from './ui/card.tsx'

export function ContactFormPage() {
  return (
    <>
      <p className="m-0 text-[0.95rem] text-muted">
        <Link to="/contact-form">Contact form</Link>
      </p>
      <h1 className="mt-1.5 mb-3 text-4xl font-semibold leading-tight">
        shadcn/ui
      </h1>
      <p className="m-0">
        shadcn/ui Input, Textarea, Alert, and Button with the default theme.
      </p>
      <div className="shadcn mt-10">
        <Card>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
