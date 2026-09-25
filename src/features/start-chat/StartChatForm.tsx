import { type ChangeEvent, type FormEvent } from 'react'
import { useStartChat } from './useStartChat'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { Input } from '../../shared/ui/Input'
import { Spinner } from '../../shared/ui/Spinner'
import styles from './StartChatForm.module.css'

export function StartChatForm() {
  const { phoneNumber, setPhoneNumber, isChecking, error, status, startChat } = useStartChat()

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 15))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    await startChat()
  }

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div>
        <h2 className={styles.title}>Найдите собеседника</h2>
        <p className={styles.description}>
          Укажите номер с кодом страны. Проверка найдёт аккаунт MAX и его настоящий chatId.
        </p>
      </div>

      <div className={styles.phone}>
        <Input
          label="Номер телефона"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="79991234567"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={15}
          disabled={isChecking}
          required
        />
        <span className={styles.phoneIcon}>
          <Icon name="phone" size={18} />
        </span>
      </div>
      <p className={styles.hint}>Только цифры, от 7 до 15 символов. Плюс и пробелы не нужны.</p>

      {status && (
        <div className={styles.status} role="status">
          <Spinner size="small" />
          {status}
        </div>
      )}
      {error && (
        <div className={styles.error} role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        loading={isChecking}
        icon={<Icon name="arrow-left" size={17} />}
      >
        {isChecking ? 'Проверяем…' : 'Создать чат'}
      </Button>
    </form>
  )
}
