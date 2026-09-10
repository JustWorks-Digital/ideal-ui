export type FieldType = 'text' | 'email'

export type FieldMessages = {
  required?: string
  invalid?: string
}

export type FieldDefinition = {
  id: string
  name: string
  label: string
  messages: FieldMessages
  required?: boolean
  type?: FieldType
  autoComplete?: string
  rows?: number
}

export function errorForValue(
  value: string,
  field: Pick<FieldDefinition, 'required' | 'type' | 'messages'>,
): string | undefined {
  if (field.required && value === '') {
    return field.messages.required
  }

  if (
    field.type === 'email' &&
    value !== '' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return field.messages.invalid
  }

  return undefined
}
