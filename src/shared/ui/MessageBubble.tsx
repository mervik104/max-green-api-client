import type { ChatMessage } from '../../entities/chat/chat-store'
import { Icon } from './Icon'
import styles from './MessageBubble.module.css'

interface MessageBubbleProps {
  message: ChatMessage
  onRetry?: (message: ChatMessage) => void
}

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})

function getStatusLabel(message: ChatMessage): string {
  if (message.direction === 'incoming') {
    return 'MAX'
  }
  switch (message.status) {
    case 'sending':
      return 'Отправляется…'
    case 'delivered':
      return 'Доставлено'
    case 'failed':
      return 'Ошибка'
    case 'sent':
      return 'Отправлено'
  }
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isOutgoing = message.direction === 'outgoing'
  const isFailed = message.status === 'failed'
  const rowClassName = [
    styles.row,
    isOutgoing ? styles.outgoing : styles.incoming,
    isFailed ? styles.failed : '',
  ]
    .filter(Boolean)
    .join(' ')
  const statusClassName = isFailed
    ? styles.failedText
    : message.status === 'sent' || message.status === 'delivered'
      ? styles.sent
      : ''

  return (
    <div className={rowClassName}>
      <div className={styles.column}>
        <div className={styles.bubble}>{message.text}</div>
        <div className={styles.meta}>
          <span>{timeFormatter.format(new Date(message.createdAt))}</span>
          <span className={statusClassName}>{getStatusLabel(message)}</span>
          {isOutgoing && message.status === 'sent' && <Icon name="check" size={12} />}
          {isFailed && onRetry && (
            <button className={styles.retry} type="button" onClick={() => onRetry(message)}>
              <Icon name="refresh" size={12} />
              Повторить
            </button>
          )}
        </div>
        {isFailed && message.error && <div className={styles.failedText}>{message.error}</div>}
      </div>
    </div>
  )
}
