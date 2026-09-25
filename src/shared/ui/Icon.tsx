export type IconName =
  | 'alert'
  | 'arrow-left'
  | 'check'
  | 'chevron'
  | 'external'
  | 'logo'
  | 'logout'
  | 'message'
  | 'phone'
  | 'plus'
  | 'refresh'
  | 'send'
  | 'shield'

interface IconProps {
  name: IconName
  size?: number
}

export function Icon({ name, size = 18 }: IconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'logo':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <path
            d="M12 3.5 14.2 9l5.8 2.2-5.8 2.2L12 19l-2.2-5.6L4 11.2 9.8 9 12 3.5Z"
            fill="currentColor"
            stroke="none"
          />
          <path
            d="m19 3 .6 1.7L21.5 5l-1.9.4L19 7l-.6-1.6L16.5 5l1.9-.3L19 3Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )
    case 'send':
      return (
        <svg {...commonProps}>
          <path d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z" />
          <path d="M10.5 13.5 21 3" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...commonProps}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...commonProps}>
          <path d="M10 4H5.8A1.8 1.8 0 0 0 4 5.8v12.4A1.8 1.8 0 0 0 5.8 20H10" />
          <path d="m14 8 4 4-4 4M8 12h10" />
        </svg>
      )
    case 'arrow-left':
      return (
        <svg {...commonProps}>
          <path d="m15 18-6-6 6-6M9 12h11" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...commonProps}>
          <path d="M20 11a8 8 0 0 0-14.8-4L3 9" />
          <path d="M3 4v5h5M4 13a8 8 0 0 0 14.8 4L21 15" />
          <path d="M21 20v-5h-5" />
        </svg>
      )
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="m5 12 4.2 4.2L19 6.5" />
        </svg>
      )
    case 'alert':
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 21 20H3l9-16.5Z" />
          <path d="M12 9v4.5M12 16.5v.1" />
        </svg>
      )
    case 'message':
      return (
        <svg {...commonProps}>
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9.5 9.5 0 0 1-3.4-.7L4 20l1.5-3.8A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
          <path d="M8 11.5h.1M12 11.5h.1M16 11.5h.1" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 19 6v5.5c0 4.2-2.8 7.6-7 9-4.2-1.4-7-4.8-7-9V6l7-2.5Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...commonProps}>
          <path d="M7 3.5 4.5 5c-.8.5-1.1 1.4-.8 2.3 1.6 4.8 5.2 8.4 10 10 .9.3 1.8 0 2.3-.8l1.5-2.5-3.4-2.1-1.5 1.4a12 12 0 0 1-4.9-4.9L9.1 6 7 3.5Z" />
        </svg>
      )
    case 'external':
      return (
        <svg {...commonProps}>
          <path d="M14 4h6v6M20 4l-9 9" />
          <path d="M18 13v5.2c0 .9-.8 1.8-1.8 1.8H5.8C4.8 20 4 19.2 4 18V7.8C4 6.8 4.8 6 5.8 6H11" />
        </svg>
      )
    case 'chevron':
      return (
        <svg {...commonProps}>
          <path d="m9 5 7 7-7 7" />
        </svg>
      )
  }
}
