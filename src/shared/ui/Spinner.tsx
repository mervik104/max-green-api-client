import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large'
  label?: string
}

export function Spinner({ size = 'medium', label = 'Загрузка' }: SpinnerProps) {
  return (
    <span className={styles.spinner} role="status" aria-label={label}>
      <span className={`${styles.circle} ${styles[size]}`} />
    </span>
  )
}
