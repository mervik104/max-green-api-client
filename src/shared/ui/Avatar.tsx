import styles from './Avatar.module.css'

type AvatarSize = 'small' | 'medium' | 'large'

interface AvatarProps {
  name: string
  size?: AvatarSize
  online?: boolean
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ name, size = 'medium', online = false }: AvatarProps) {
  return (
    <span className={`${styles.avatar} ${styles[size]}`} aria-label={name}>
      {getInitials(name) || '?'}
      {online && <span className={styles.online} aria-label="в сети" />}
    </span>
  )
}
