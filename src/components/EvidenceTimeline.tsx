import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'

interface TimelineItem {
  id: string
  time: string
  title: string
  description?: string
  type: 'info' | 'success' | 'warning' | 'error'
  evidenceUrl?: string
}

interface EvidenceTimelineProps {
  items: TimelineItem[]
  title?: string
}

const EvidenceTimeline: Component<EvidenceTimelineProps> = (props) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#52c41a'
      case 'warning': return '#faad14'
      case 'error': return '#f5222d'
      default: return '#1890ff'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✗'
      default: return '●'
    }
  }

  return (
    <div class="evidence-timeline" style={{
      background: 'var(--white)',
      padding: '20px',
      'border-radius': 'var(--radius-md)',
      'box-shadow': 'var(--shadow-sm)'
    }}>
      <Show when={props.title}>
        <h3 style={{ 'margin-bottom': '20px', color: 'var(--text-primary)' }}>
          {props.title}
        </h3>
      </Show>

      <div style={{ position: 'relative', padding: '0 0 0 30px' }}>
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '0',
          bottom: '0',
          width: '2px',
          background: '#e8e8e8'
        }} />

        <For each={props.items}>
          {(item, index) => (
            <div style={{
              position: 'relative',
              'margin-bottom': index() === props.items.length - 1 ? '0' : '24px'
            }}>
              <div style={{
                position: 'absolute',
                left: '-26px',
                top: '4px',
                width: '16px',
                height: '16px',
                'border-radius': '50%',
                background: getTypeColor(item.type),
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                color: 'var(--white)',
                'font-size': '10px',
                'font-weight': 'bold',
                border: '2px solid var(--white)',
                'box-shadow': 'var(--shadow-sm)'
              }}>
                {getTypeIcon(item.type)}
              </div>

              <div style={{
                background: '#fafafa',
                padding: '12px 16px',
                'border-radius': 'var(--radius-md)',
                border: `1px solid ${getTypeColor(item.type)}20`,
                'border-left': `3px solid ${getTypeColor(item.type)}`
              }}>
                <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '4px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.title}</strong>
                  <span style={{ 'font-size': '12px', color: 'var(--text-secondary)' }}>{item.time}</span>
                </div>

                <Show when={item.description}>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: 'var(--text-secondary)',
                    'font-size': '13px',
                    'line-height': 1.5
                  }}>
                    {item.description}
                  </p>
                </Show>

                <Show when={item.evidenceUrl}>
                  <div style={{ 'margin-top': '8px' }}>
                    <a
                      href={item.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--primary-color)',
                        'text-decoration': 'none',
                        'font-size': '13px',
                        display: 'inline-flex',
                        'align-items': 'center',
                        gap: '4px'
                      }}
                    >
                      📎 查看证据
                    </a>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default EvidenceTimeline
