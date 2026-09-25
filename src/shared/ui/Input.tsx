import { useId, type InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, id, className = '', ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input
        {...props}
        id={inputId}
        className={`${styles.input} ${error ? styles.invalid : ''} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? descriptionId : undefined}
      />
      {(hint || error) && (
        <span id={descriptionId} className={error ? styles.error : styles.hint}>
          {error ?? hint}
        </span>
      )}
    </label>
  )
}
