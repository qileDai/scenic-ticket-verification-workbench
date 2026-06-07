import type { Component } from 'solid-js'
import { createEffect, createSignal, For, Show } from 'solid-js'

interface CommandItem {
  id: string
  label: string
  shortcut?: string
  icon?: string
  category?: string
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  commands: CommandItem[]
  onClose: () => void
}

const CommandPalette: Component<CommandPaletteProps> = (props) => {
  const [search, setSearch] = createSignal('')
  const [selectedIndex, setSelectedIndex] = createSignal(0)

  const filteredCommands = () => {
    const keyword = search().toLowerCase()
    if (!keyword) return props.commands

    return props.commands.filter((command) =>
      command.label.toLowerCase().includes(keyword) ||
      command.category?.toLowerCase().includes(keyword)
    )
  }

  const handleSelect = (command: CommandItem) => {
    command.action()
    props.onClose()
    setSearch('')
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const filtered = filteredCommands()

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex((previous) => Math.min(previous + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex((previous) => Math.max(previous - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (filtered[selectedIndex()]) {
          handleSelect(filtered[selectedIndex()])
        }
        break
      case 'Escape':
        event.preventDefault()
        props.onClose()
        break
    }
  }

  createEffect(() => {
    if (props.open) {
      setSearch('')
      setSelectedIndex(0)
    }
  })

  return (
    <Show when={props.open}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        'z-index': 1000,
        display: 'flex',
        'align-items': 'flex-start',
        'justify-content': 'center',
        'padding-top': '15vh'
      }}>
        <div
          onKeyDown={handleKeyDown}
          style={{
            background: 'var(--white)',
            width: '600px',
            'max-height': '70vh',
            'border-radius': 'var(--radius-lg)',
            'box-shadow': 'var(--shadow-lg)',
            overflow: 'hidden'
          }}
        >
          <div style={{
            padding: '16px',
            'border-bottom': '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            'align-items': 'center'
          }}>
            <span style={{ color: 'var(--text-secondary)', 'font-size': '18px' }}>⌘</span>
            <input
              type="text"
              value={search()}
              onInput={(event) => setSearch(event.currentTarget.value)}
              placeholder="搜索命令..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                'font-size': '16px',
                padding: '4px 0'
              }}
              ref={(element) => setTimeout(() => element?.focus(), 0)}
            />
          </div>

          <div style={{ 'max-height': 'calc(70vh - 60px)', overflow: 'auto' }}>
            <Show
              when={filteredCommands().length > 0}
              fallback={
                <div style={{
                  padding: '40px',
                  'text-align': 'center',
                  color: 'var(--text-secondary)'
                }}>
                  未找到匹配的命令
                </div>
              }
            >
              <For each={filteredCommands()}>
                {(command, index) => (
                  <div
                    onClick={() => handleSelect(command)}
                    onMouseEnter={() => setSelectedIndex(index())}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: selectedIndex() === index() ? '#e6f7ff' : 'transparent',
                      display: 'flex',
                      'justify-content': 'space-between',
                      'align-items': 'center'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', 'align-items': 'center' }}>
                      <Show when={command.icon}>
                        <span>{command.icon}</span>
                      </Show>
                      <div>
                        <div style={{ color: 'var(--text-primary)', 'font-weight': 500 }}>
                          {command.label}
                        </div>
                        <Show when={command.category}>
                          <div style={{ 'font-size': '12px', color: 'var(--text-secondary)' }}>
                            {command.category}
                          </div>
                        </Show>
                      </div>
                    </div>

                    <Show when={command.shortcut}>
                      <kbd style={{
                        padding: '2px 8px',
                        background: '#f5f5f5',
                        border: '1px solid var(--border-color)',
                        'border-radius': '4px',
                        'font-size': '12px',
                        color: 'var(--text-secondary)'
                      }}>
                        {command.shortcut}
                      </kbd>
                    </Show>
                  </div>
                )}
              </For>
            </Show>
          </div>

          <div style={{
            padding: '8px 16px',
            'border-top': '1px solid var(--border-color)',
            background: '#fafafa',
            display: 'flex',
            gap: '16px',
            'font-size': '12px',
            color: 'var(--text-secondary)'
          }}>
            <span><kbd>↑↓</kbd> 导航</span>
            <span><kbd>↵</kbd> 选择</span>
            <span><kbd>Esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default CommandPalette
