import { Paper } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { ContactForm } from './ContactForm.tsx'

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: { dark: true },
})

export function ContactFormPage() {
  return (
    <>
      <p className="m-0 text-[0.95rem] text-muted">
        <Link to="/contact-form">Contact form</Link>
      </p>
      <h1 className="mt-1.5 mb-3 text-4xl font-semibold leading-tight">MUI</h1>
      <p className="m-0">
        Material UI TextField, Alert, and Button with the default theme.
      </p>
      <ThemeProvider theme={theme}>
        <Paper variant="outlined" sx={{ mt: 5, p: 3 }}>
          <ContactForm />
        </Paper>
      </ThemeProvider>
    </>
  )
}
