import { Paper } from '@mui/material'
import { Link } from 'react-router-dom'
import { ContactForm, MuiProvider, type FieldDefinition } from './ContactForm.tsx'

const fields = [
  {
    id: 'contact-name',
    name: 'name',
    label: 'Name',
    type: 'text',
    autoComplete: 'name',
    required: true,
    messages: { required: 'Enter your name.' },
  },
  {
    id: 'contact-email',
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    required: true,
    messages: {
      required: 'Enter your email address.',
      invalid: 'Enter a valid email address.',
    },
  },
  {
    id: 'contact-message',
    name: 'message',
    label: 'Message',
    rows: 5,
  },
] as const satisfies readonly FieldDefinition[]

async function sendContact(data: FormData) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: data,
  })

  if (!response.ok) {
    throw new Error('Could not send the message.')
  }
}

export function ContactFormPage() {
  return (
    <MuiProvider>
      <p className="m-0 text-[0.95rem] text-muted">
        <Link to="/contact-form">Contact form</Link>
      </p>
      <h1 className="mt-1.5 mb-3 text-4xl font-semibold leading-tight">
        MUI + React Hook Form
      </h1>
      <p className="m-0">
        Material UI components for the fields, alerts, and button. React Hook
        Form for values, validation, and submit.
      </p>
      <Paper variant="outlined" sx={{ mt: 5, p: 3 }}>
        <ContactForm
          fields={fields}
          submitLabel="Submit"
          action="/api/contact"
          method="post"
          onSubmit={sendContact}
        />
      </Paper>
    </MuiProvider>
  )
}
