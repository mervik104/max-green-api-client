import { AuthForm } from '../features/auth-form/AuthForm'
import { Icon } from '../shared/ui/Icon'
import styles from './AuthPage.module.css'

export function AuthPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <Icon name="logo" size={20} />
          </span>
          <span>MAX messenger</span>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
