export type Example = {
  slug: string
  title: string
  summary: string
}

export const examples: Example[] = [
  {
    slug: 'contact-form',
    title: 'Contact form',
    summary: 'Name, email, and a message.',
  },
  {
    slug: 'checkout-form',
    title: 'Checkout form',
    summary: 'Contact, shipping, and payment. Demo only — nothing is charged.',
  },
]
