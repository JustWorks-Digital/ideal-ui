import { Route, Routes } from 'react-router-dom'
import { CheckoutFormPage } from './components/checkout-form/CheckoutFormPage.tsx'
import { ContactFormPage as BasicContactFormPage } from './components/contact-form/basic/ContactFormPage.tsx'
import { ContactFormPage as ReactHookFormContactFormPage } from './components/contact-form/react-hook-form/ContactFormPage.tsx'
import { ContactFormPage as ReactAriaContactFormPage } from './components/contact-form/react-aria/ContactFormPage.tsx'
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
          path="/contact-form/react-hook-form"
          element={<ReactHookFormContactFormPage />}
        />
        <Route
          path="/contact-form/react-aria"
          element={<ReactAriaContactFormPage />}
        />
        <Route path="/checkout-form" element={<CheckoutFormPage />} />
      </Route>
    </Routes>
  )
}
