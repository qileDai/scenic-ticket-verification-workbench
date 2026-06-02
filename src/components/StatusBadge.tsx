import type { Component } from 'solid-js'
import type { EntityStatus } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/business'

interface StatusBadgeProps {
  status: EntityStatus
  size?: 'small' | 'medium' | 'large'
}

const StatusBadge: Component<StatusBadgeProps> = (props) => {
  const sizeStyles = {
    small: { padding: '2px 8px', 'font-size': '12px' },
    medium: { padding: '4px 12px', 'font-size': '13px' },
    large: { padding: '6px 16px', 'font-size': '14px' }
  }

  return (
    <span
      style={{
        display: 'inline-block',
        ...sizeStyles[props.size || 'medium'],
        'border-radius': 'var(--radius-sm)',
        background: `${STATUS_COLORS[props.status]}15`,
        color: STATUS_COLORS[props.status],
        border: `1px solid ${STATUS_COLORS[props.status]}30`,
        'font-weight': 500,
        'white-space': 'nowrap'
      }}
    >
      {STATUS_LABELS[props.status]}
    </span>
  )
}

export default StatusBadge
