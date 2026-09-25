import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import styles from './MessageComposer.module.css'

interface MessageComposerProps {
  onSend: (text: string) => Promise<boolean>
  isSending: boolean
  error: string | null
}

export function MessageComposer({ onSend, isSending, error }: MessageComposerProps) {
  const [text, setText] = useState('')

  const submit = async (): Promise<void> => {
    const value = text.trim()
    if (!value || isSending) {
      return
    }
    const sent = await onSend(value)
    if (sent) {
      setText('')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className={styles.composer}>
      {error && (
        <div className={styles.error} role="alert">
          <Icon name="alert" size={15} />
          <span>{error}</span>
        </div>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение…"
          aria-label="Текст сообщения"
          rows={1}
          maxLength={4096}
          disabled={isSending}
        />
        <Button
          className={styles.send}
          type="submit"
          loading={isSending}
          disabled={!text.trim()}
          aria-label="Отправить сообщение"
        >
          <Icon name="send" size={17} />
        </Button>
      </form>
      <span className={styles.counter}>Enter — отправить · Shift + Enter — новая строка</span>
    </div>
  )
}
