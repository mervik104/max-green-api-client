import { useState, type FormEvent } from 'react'
import { useAuth } from '../../app/useAuth'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { Input } from '../../shared/ui/Input'
import styles from './AuthForm.module.css'

export function AuthForm() {
  const { idInstance, apiTokenInstance, apiUrl, isConnecting, error, connect } = useAuth()
  const [values, setValues] = useState({ idInstance, apiTokenInstance, apiUrl })
  const [validationError, setValidationError] = useState<string | null>(null)

  const updateValue = (field: keyof typeof values, value: string): void => {
    setValues((current) => ({ ...current, [field]: value }))
    setValidationError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const nextIdInstance = values.idInstance.trim()
    const nextToken = values.apiTokenInstance.trim()
    const nextApiUrl = values.apiUrl.trim()

    if (!nextIdInstance || !nextToken || !nextApiUrl) {
      setValidationError('Заполните все поля авторизации.')
      return
    }

    const connected = await connect({
      idInstance: nextIdInstance,
      apiTokenInstance: nextToken,
      apiUrl: nextApiUrl,
    })
    if (!connected) {
      setValidationError(null)
    }
  }

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <Icon name="shield" size={15} />
          Безопасный вход
        </span>
        <h1 className={styles.title}>Подключите Green API</h1>
        <p className={styles.description}>
          Введите параметры инстанса, затем найдите собеседника в MAX по номеру телефона.
        </p>
      </div>

      <div className={styles.fields}>
        <Input
          label="idInstance"
          value={values.idInstance}
          onChange={(event) => updateValue('idInstance', event.target.value)}
          placeholder="Например, 1101123456"
          autoComplete="username"
          inputMode="numeric"
          required
        />
        <Input
          label="apiTokenInstance"
          type="password"
          value={values.apiTokenInstance}
          onChange={(event) => updateValue('apiTokenInstance', event.target.value)}
          placeholder="Токен инстанса"
          autoComplete="current-password"
          required
        />
        <Input
          label="API URL"
          value={values.apiUrl}
          onChange={(event) => updateValue('apiUrl', event.target.value)}
          placeholder="https://<ваш-api-host>"
          inputMode="url"
          autoComplete="url"
          hint="Нужный адрес скопируйте в личном кабинете Green API для вашего инстанса."
          required
        />
      </div>

      <div className={styles.apiHint}>
        <Icon name="external" size={15} />
        <span>
          Параметры и настройки доступны в{' '}
          <a href="https://green-api.com/max" target="_blank" rel="noreferrer">
            кабинете Green API для MAX
            <Icon name="chevron" size={12} />
          </a>
          . В приложении нет сервера-посредника — запросы идут напрямую из браузера.
        </span>
      </div>

      {validationError && (
        <div className={styles.alert} role="alert">
          <Icon name="alert" size={16} />
          <span>{validationError}</span>
        </div>
      )}
      {error && (
        <div className={styles.alert} role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" fullWidth loading={isConnecting}>
        {isConnecting ? 'Проверяем доступ…' : 'Продолжить'}
      </Button>
      <p className={styles.privacy}>
        <Icon name="shield" size={14} />
        Токен хранится только в localStorage этого браузера. Не используйте его на публичных
        устройствах.
      </p>
    </form>
  )
}
