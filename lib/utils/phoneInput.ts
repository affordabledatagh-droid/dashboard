import type { ChangeEvent, ClipboardEvent } from 'react'

export const isValidPhone = (value: string) => /^0\d{9}$/.test(value)

export function phoneInputProps(value: string, setValue: (value: string) => void) {
  return {
    value,
    inputMode: 'numeric' as const,
    maxLength: 10,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (/^\d{0,10}$/.test(event.target.value)) setValue(event.target.value)
    },
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault()
      const input = event.currentTarget
      const pasted = event.clipboardData.getData('text').replace(/\s/g, '')
      const next = value.slice(0, input.selectionStart ?? 0) + pasted + value.slice(input.selectionEnd ?? 0)
      if (/^\d{0,10}$/.test(next)) {
        setValue(next)
      } else {
        input.setCustomValidity('Paste a number of at most 10 digits.')
        input.reportValidity()
        input.setCustomValidity('')
      }
    },
  }
}
