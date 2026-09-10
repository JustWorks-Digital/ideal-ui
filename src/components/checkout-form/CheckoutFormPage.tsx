import { CheckoutForm } from './CheckoutForm.tsx'
import { panelClass } from './styles.ts'

export function CheckoutFormPage() {
  return (
    <>
      <h1 className="mt-1.5 mb-3 text-4xl font-semibold leading-tight">
        Checkout form
      </h1>
      <p className="m-0">Payment is a demo only. Nothing is charged or stored.</p>
      <div className={panelClass}>
        <CheckoutForm />
      </div>
    </>
  )
}
