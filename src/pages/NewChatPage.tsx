import { useAuth } from '../app/useAuth'
import { useChatStore } from '../entities/chat/chat-store'
import { StartChatForm } from '../features/start-chat/StartChatForm'
import { Avatar } from '../shared/ui/Avatar'
import { Button } from '../shared/ui/Button'
import { Icon } from '../shared/ui/Icon'
import styles from './NewChatPage.module.css'

export function NewChatPage() {
  const { idInstance, disconnect } = useAuth()
  const clearChat = useChatStore((state) => state.clearChat)

  const handleLogout = (): void => {
    clearChat()
    disconnect()
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <Icon name="logo" size={20} />
            </span>
            <span>MAX messenger</span>
          </div>

          <p className={styles.sidebarLabel}>Текущий чат</p>
          <div className={styles.contactCard}>
            <Avatar name="Новый чат" size="small" />
            <div className={styles.contactInfo}>
              <span className={styles.contactName}>Ещё не выбран</span>
              <span className={styles.contactMeta}>Собеседник появится здесь</span>
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

        <section className={styles.content}>
          <div className={styles.contentHeader}>
            <div>
              <span className={styles.badge}>
                <Icon name="message" size={13} />
                Green API подключён
              </span>
              <h1 className={styles.title}>Начните разговор</h1>
              <p className={styles.subtitle}>
                MAX использует короткий chatId, а не номер телефона. Мы проверим аккаунт и
                автоматически получим правильный идентификатор.
              </p>
            </div>
            <span className={styles.illustration}>
              <Icon name="message" size={29} />
            </span>
          </div>

          <div className={styles.formArea}>
            <StartChatForm />
            <p className={styles.footerNote}>
              <Icon name="shield" size={14} />
              Все сообщения отправляются напрямую через API выбранного инстанса.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
