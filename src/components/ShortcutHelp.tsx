import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'

interface ShortcutItem {
  key: string
  description: string
  category?: string
}

interface ShortcutHelpProps {
  open: boolean
  onClose: () => void
  shortcuts: ShortcutItem[]
}

const ShortcutHelp: Component<ShortcutHelpProps> = (props) => {
  const categories = () => {
    const grouped = new Map<string, ShortcutItem[]>()

    props.shortcuts.forEach((shortcut) => {
      const category = shortcut.category || '通用'
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)?.push(shortcut)
    })

    return Array.from(grouped.entries())
  }

  return (
    <Show when={props.open}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        'z-index': 1001,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      }}>
        <div style={{
          background: 'var(--white)',
          width: '700px',
          'max-height': '80vh',
          padding: '24px',
          'border-radius': 'var(--radius-lg)',
          'box-shadow': 'var(--shadow-lg)',
          display: 'flex',
          'flex-direction': 'column'
        }}>
          <div style={{
            display: 'flex',
            'justify-content': 'space-between',
            'align-items': 'center',
            'margin-bottom': '20px',
            'padding-bottom': '16px',
            'border-bottom': '2px solid var(--border-color)'
          }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
              ⌨️ 快捷键帮助
            </h2>
            <button
              onClick={props.onClose}
              style={{
                background: 'transparent',
                border: 'none',
                'font-size': '28px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            <For each={categories()}>
              {([category, items]) => (
                <div style={{ 'margin-bottom': '24px' }}>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    color: 'var(--primary-color)',
                    'font-size': '15px',
                    'font-weight': 600,
                    'padding-bottom': '8px',
                    'border-bottom': '1px solid #e8e8e8'
                  }}>
                    {category}
                  </h3>

                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
                    <For each={items}>
                      {(item) => (
                        <div style={{
                          display: 'flex',
                          'justify-content': 'space-between',
                          'align-items': 'center',
                          padding: '10px 14px',
                          background: '#fafafa',
                          'border-radius': 'var(--radius-sm)'
                        }}>
                          <span style={{ color: 'var(--text-primary)', 'font-size': '14px' }}>
                            {item.description}
                          </span>

                          <kbd style={{
                            padding: '4px 12px',
                            background: 'var(--white)',
                            border: '1px solid var(--border-color)',
                            'border-radius': '6px',
                            'font-family': '"SF Mono", "Monaco", "Consolas", monospace',
                            'font-size': '13px',
                            'box-shadow': '0 1px 2px rgba(0, 0, 0, 0.05)',
                            color: 'var(--text-primary)',
                            'min-width': '80px',
                            'text-align': 'center'
                          }}>
                            {item.key}
                          </kbd>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>

          <div style={{
            'margin-top': '20px',
            'padding-top': '16px',
            'border-top': '1px solid var(--border-color)',
            'text-align': 'center'
          }}>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              'font-size': '13px'
            }}>
              💡 提示：按 <kbd style={{
                padding: '2px 6px',
                background: '#f5f5f5',
                border: '1px solid var(--border-color)',
                'border-radius': '4px',
                'font-size': '12px'
              }}>?</kbd> 可随时打开此帮助面板
            </p>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default ShortcutHelp
