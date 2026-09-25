import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant], fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size="small" /> : icon}
      <span>{children}</span>
    </button>
  )
}
