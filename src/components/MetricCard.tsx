import type { Component } from 'solid-js'
import type { MetricData } from '../types'

interface MetricCardProps {
  data: MetricData
  onClick?: () => void
}

const MetricCard: Component<MetricCardProps> = (props) => {
  const isPositive = props.data.change !== undefined && props.data.change > 0
  const isNegative = props.data.change !== undefined && props.data.change < 0

  return (
    <div
      onClick={props.onClick}
      style={{
        background: 'var(--white)',
        padding: '20px',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        cursor: props.onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
    >
      <div style={{
        color: 'var(--text-secondary)',
        'font-size': '14px',
        'margin-bottom': '8px'
      }}>
        {props.data.label}
      </div>
      
      <div style={{
        display: 'flex',
        'align-items': 'baseline',
        gap: '8px'
      }}>
        <div style={{
          'font-size': '28px',
          'font-weight': 600,
          color: 'var(--text-primary)'
        }}>
          {typeof props.data.value === 'number' ? props.data.value.toLocaleString() : props.data.value}
        </div>
        
        {props.data.unit && (
          <span style={{ color: 'var(--text-secondary)', 'font-size': '14px' }}>
            {props.data.unit}
          </span>
        )}
      </div>

      {props.data.change !== undefined && (
        <div style={{
          'margin-top': '8px',
          'font-size': '13px',
          color: isPositive ? '#52c41a' : isNegative ? '#f5222d' : 'var(--text-secondary)',
          display: 'flex',
          'align-items': 'center',
          gap: '4px'
        }}>
          <span>{isPositive ? '↑' : isNegative ? '↓' : '→'}</span>
          <span>{Math.abs(props.data.change)}%</span>
          <span>较上期</span>
        </div>
      )}
    </div>
  )
}

export default MetricCard
