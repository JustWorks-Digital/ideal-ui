import { Route, Routes } from 'react-router-dom'
import { CheckoutFormPage } from './components/checkout-form/CheckoutFormPage.tsx'
import { ContactFormPage as BasicContactFormPage } from './components/contact-form/basic/ContactFormPage.tsx'
import { ContactFormPage as MuiContactFormPage } from './components/contact-form/mui/ContactFormPage.tsx'
import { ContactFormPage as ReactAriaContactFormPage } from './components/contact-form/react-aria/ContactFormPage.tsx'
import { ContactFormPage as ShadcnContactFormPage } from './components/contact-form/shadcn/ContactFormPage.tsx'
import { ContactFormPage as RjsfContactFormPage } from './components/contact-form/rjsf/ContactFormPage.tsx'
import { ContactFormPage } from './components/contact-form/ContactFormPage.tsx'
import { Layout } from './components/Layout.tsx'
import { HomePage } from './pages/HomePage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact-form" element={<ContactFormPage />} />
        <Route path="/contact-form/basic" element={<BasicContactFormPage />} />
        <Route
          path="/contact-form/mui"
          element={<MuiContactFormPage />}
        />
        <Route
          path="/contact-form/react-aria"
          element={<ReactAriaContactFormPage />}
        />
        <Route path="/contact-form/shadcn" element={<ShadcnContactFormPage />} />
        <Route path="/contact-form/rjsf" element={<RjsfContactFormPage />} />
        <Route path="/checkout-form" element={<CheckoutFormPage />} />
      </Route>
    </Routes>
  )
}
