import { useEffect, useRef } from 'react'
import { useAuth } from '../app/useAuth'
import { useChatStore } from '../entities/chat/chat-store'
import { MessageComposer } from '../features/message-composer/MessageComposer'
import { useSendMessage } from '../features/message-composer/useSendMessage'
import { usePolling } from '../features/incoming-poller/usePolling'
import { Avatar } from '../shared/ui/Avatar'
import { Button } from '../shared/ui/Button'
import { Icon } from '../shared/ui/Icon'
import { MessageBubble } from '../shared/ui/MessageBubble'
import styles from './ChatPage.module.css'

function getPollingLabel(status: 'idle' | 'starting' | 'waiting' | 'error'): string {
  switch (status) {
    case 'starting':
      return 'Подключаемся…'
    case 'waiting':
      return 'Проверяем сообщения…'
    case 'error':
      return 'Нет соединения'
    case 'idle':
      return 'Не запущено'
  }
}

export function ChatPage() {
  const { idInstance, disconnect } = useAuth()
  const chatId = useChatStore((state) => state.chatId)
  const phoneNumber = useChatStore((state) => state.phoneNumber)
  const messages = useChatStore((state) => state.messages)
  const pollingStatus = useChatStore((state) => state.pollingStatus)
  const pollingError = useChatStore((state) => state.pollingError)
  const clearChat = useChatStore((state) => state.clearChat)
  const { isSending, error: sendError, send, retry } = useSendMessage()
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  usePolling()

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  const handleNewChat = (): void => {
    clearChat()
  }

  const handleLogout = (): void => {
    clearChat()
    disconnect()
  }

  const contactName = phoneNumber ?? 'Собеседник'
  const lastMessage = messages.at(-1)?.text ?? 'Пока нет сообщений'
  const connectionClassName = pollingStatus === 'error' ? styles.connectionError : ''

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div className={styles.brand}>
              <span className={styles.brandMark}>
                <Icon name="logo" size={20} />
              </span>
              <span>MAX messenger</span>
            </div>
            <Button
              className={styles.newChat}
              icon={<Icon name="plus" size={17} />}
              onClick={handleNewChat}
            >
              Новый чат
            </Button>
          </div>

          <p className={styles.sidebarSectionLabel}>Переписки · 1</p>
          <div className={styles.chatList}>
            <div className={styles.chatItem}>
              <Avatar name={contactName} size="small" online />
              <div className={styles.chatItemInfo}>
                <span className={styles.chatName}>{contactName}</span>
                <span className={styles.chatPreview}>{lastMessage}</span>
              </div>
            </div>
          </div>

          <div className={styles.sidebarBottom}>
            <div className={styles.account}>
              <span className={styles.accountLabel}>Инстанс</span>
              <span className={styles.accountValue}>{idInstance || '—'}</span>
            </div>
            <Button
              className={styles.logout}
              variant="ghost"
              icon={<Icon name="logout" size={17} />}
              onClick={handleLogout}
            >
              Выйти
            </Button>
          </div>
        </aside>

        <section className={styles.workspace}>
          <header className={styles.chatHeader}>
            <div className={styles.headerContact}>
              <Avatar name={contactName} size="medium" online />
              <div className={styles.headerInfo}>
                <span className={styles.headerName}>{contactName}</span>
                <span className={styles.headerMeta}>chatId: {chatId}</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <span className={`${styles.connection} ${connectionClassName}`}>
                <span className={styles.connectionDot} />
                {getPollingLabel(pollingStatus)}
              </span>
              <Button
                className={styles.mobileNewChat}
                variant="ghost"
                icon={<Icon name="plus" size={17} />}
                onClick={handleNewChat}
                aria-label="Новый чат"
              >
                Новый чат
              </Button>
            </div>
          </header>

          <div className={styles.messageArea}>
            {pollingError && (
              <div className={styles.pollingAlert} role="status">
                <Icon name="alert" size={15} />
                <span>{pollingError} Повторная проверка выполняется автоматически.</span>
              </div>
            )}

            <div className={styles.messages} aria-live="polite">
              {messages.length === 0 ? (
                <div className={styles.empty}>
                  <div>
                    <span className={styles.emptyIcon}>
                      <Icon name="message" size={27} />
                    </span>
                    <h2 className={styles.emptyTitle}>Здесь будет ваша переписка</h2>
                    <p className={styles.emptyText}>
                      Отправьте первое сообщение. Ответ собеседника из MAX появится автоматически
                      после проверки уведомлений.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} onRetry={retry} />
                  ))}
                  <div ref={endOfMessagesRef} />
                </>
              )}
            </div>
          </div>

          <div className={styles.composerArea}>
            <MessageComposer onSend={send} isSending={isSending} error={sendError} />
          </div>
        </section>
      </div>
    </main>
  )
}
