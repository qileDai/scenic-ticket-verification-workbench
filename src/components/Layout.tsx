import type { Component, JSX } from 'solid-js'
import { createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import CommandPalette from './CommandPalette'
import ShortcutHelp from './ShortcutHelp'
import { state, setCommandPaletteOpen, setShortcutHelpOpen, loadData, exportAllData, resetAllData } from '../stores'
import { exportToCSV, exportToJSON } from '../utils/business'

interface LayoutProps {
  children?: JSX.Element
}

const Layout: Component<LayoutProps> = (props) => {
  const location = useLocation()
  const [showExportMenu, setShowExportMenu] = createSignal(false)

  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      setCommandPaletteOpen(true)
    }

    if (event.key === '?' && !isInputFocused()) {
      event.preventDefault()
      setShortcutHelpOpen(true)
    }
  }

  onMount(async () => {
    await loadData()
    document.addEventListener('keydown', handleGlobalKeyDown)
  })

  onCleanup(() => {
    document.removeEventListener('keydown', handleGlobalKeyDown)
  })

  const isInputFocused = () => {
    const activeElement = document.activeElement
    return activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'SELECT'
  }

  const commands = [
    {
      id: 'nav-overview',
      label: '前往券码总览',
      shortcut: 'G O',
      icon: '📋',
      category: '导航',
      action: () => {
        window.location.href = '/'
      }
    },
    {
      id: 'nav-exceptions',
      label: '前往异常工作区',
      shortcut: 'G E',
      icon: '⚠️',
      category: '导航',
      action: () => {
        window.location.href = '/exceptions'
      }
    },
    {
      id: 'nav-rules',
      label: '前往规则沙盒',
      shortcut: 'G R',
      icon: '⚙️',
      category: '导航',
      action: () => {
        window.location.href = '/rules'
      }
    },
    {
      id: 'nav-duplicates',
      label: '前往重复队列',
      shortcut: 'G D',
      icon: '🔄',
      category: '导航',
      action: () => {
        window.location.href = '/duplicates'
      }
    },
    {
      id: 'nav-charts',
      label: '前往图表分析',
      shortcut: 'G C',
      icon: '📊',
      category: '导航',
      action: () => {
        window.location.href = '/charts'
      }
    },
    {
      id: 'export-json',
      label: '导出JSON数据',
      shortcut: '',
      icon: '📤',
      category: '数据操作',
      action: async () => {
        const data = await exportAllData()
        if (data) {
          exportToJSON(data, 'ticket_verification_data')
        }
        setShowExportMenu(false)
      }
    },
    {
      id: 'export-csv',
      label: '导出CSV数据',
      shortcut: '',
      icon: '📊',
      category: '数据操作',
      action: async () => {
        const data = await exportAllData()
        if (data?.coupons) {
          exportToCSV(data.coupons, 'coupons')
        }
        setShowExportMenu(false)
      }
    },
    {
      id: 'reset-data',
      label: '重置所有数据',
      shortcut: '',
      icon: '🗑️',
      category: '数据操作',
      action: async () => {
        if (confirm('确定要重置所有数据吗？此操作不可撤销！')) {
          await resetAllData()
          await loadData()
        }
        setShowExportMenu(false)
      }
    }
  ]

  const shortcuts = [
    { key: 'Ctrl + K / ⌘ + K', description: '打开命令面板', category: '通用' },
    { key: '?', description: '显示快捷键帮助', category: '通用' },
    { key: 'Ctrl + S', description: '保存当前编辑', category: '通用' },
    { key: 'Esc', description: '关闭弹窗/抽屉', category: '通用' },
    { key: '↑ ↓', description: '在列表中导航', category: '列表操作' },
    { key: 'Space', description: '选择/取消选择当前项', category: '列表操作' },
    { key: 'Enter', description: '打开详情/确认操作', category: '列表操作' }
  ]

  const navItems = [
    { path: '/', label: '券码总览', icon: '📋' },
    { path: '/exceptions', label: '异常工作区', icon: '⚠️' },
    { path: '/rules', label: '规则沙盒', icon: '⚙️' },
    { path: '/duplicates', label: '重复队列', icon: '🔄' },
    { path: '/charts', label: '图表分析', icon: '📊' }
  ]

  return (
    <div class="layout" style={{ display: 'flex', height: '100vh' }}>
      <div style={{
        width: '240px',
        background: '#001529',
        color: 'var(--white)',
        display: 'flex',
        'flex-direction': 'column',
        padding: '16px 0'
      }}>
        <div style={{ padding: '0 24px 24px', 'font-size': '18px', 'font-weight': 'bold' }}>
          🎫 核销工作台
        </div>

        <nav style={{ flex: 1 }}>
          <For each={navItems}>
            {(item) => (
              <A
                href={item.path}
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: location.pathname === item.path ? 'var(--white)' : 'rgba(255,255,255,0.65)',
                  background: location.pathname === item.path ? 'var(--primary-color)' : 'transparent',
                  'text-decoration': 'none',
                  transition: 'all 0.3s'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </A>
            )}
          </For>
        </nav>

        <div style={{ padding: '16px 24px', 'border-top': '1px solid rgba(255,255,255,0.1)', 'font-size': '12px', color: 'rgba(255,255,255,0.45)' }}>
          v1.0.0 | 按?查看帮助
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', 'flex-direction': 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'var(--white)',
          padding: '16px 24px',
          'box-shadow': '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
          'z-index': 10
        }}>
          <h1 style={{ margin: 0, 'font-size': '20px', color: 'var(--text-primary)' }}>
            景区门票团购核销异常分诊交互复核工作台
          </h1>

          <div style={{ display: 'flex', gap: '12px', 'align-items': 'center' }}>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              style={{
                padding: '8px 16px',
                background: '#f5f5f5',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                'align-items': 'center',
                gap: '8px'
              }}
            >
              <span>🔍</span>
              <span>搜索...</span>
              <kbd style={{
                padding: '2px 6px',
                background: 'var(--white)',
                border: '1px solid var(--border-color)',
                'border-radius': '4px',
                'font-size': '11px'
              }}>
                ⌘K
              </kbd>
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu())}
                style={{
                  padding: '8px 16px',
                  background: 'var(--primary-color)',
                  color: 'var(--white)',
                  'border-radius': 'var(--radius-sm)'
                }}
              >
                数据操作 ▼
              </button>

              <Show when={showExportMenu()}>
                <>
                  <div
                    onClick={() => setShowExportMenu(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      'z-index': 99
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    'margin-top': '4px',
                    background: 'var(--white)',
                    'border-radius': 'var(--radius-md)',
                    'box-shadow': 'var(--shadow-lg)',
                    overflow: 'hidden',
                    'min-width': '180px',
                    'z-index': 100
                  }}>
                    <button
                      onClick={async () => {
                        const data = await exportAllData()
                        if (data) {
                          exportToJSON(data, 'ticket_verification_data')
                        }
                        setShowExportMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        'text-align': 'left',
                        cursor: 'pointer'
                      }}
                    >
                      📤 导出 JSON
                    </button>
                    <button
                      onClick={async () => {
                        const data = await exportAllData()
                        if (data?.coupons) {
                          exportToCSV(data.coupons, 'coupons')
                        }
                        setShowExportMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        'text-align': 'left',
                        cursor: 'pointer'
                      }}
                    >
                      📊 导出 CSV
                    </button>
                    <hr style={{ margin: 0, border: 'none', 'border-top': '1px solid var(--border-color)' }} />
                    <button
                      onClick={async () => {
                        if (confirm('确定要重置所有数据吗？此操作不可撤销！')) {
                          await resetAllData()
                          await loadData()
                        }
                        setShowExportMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        'text-align': 'left',
                        cursor: 'pointer',
                        color: 'var(--error-color)'
                      }}
                    >
                      🗑️ 重置数据
                    </button>
                  </div>
                </>
              </Show>
            </div>
          </div>
        </header>

        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          background: 'var(--bg-color)'
        }}>
          {props.children}
        </main>
      </div>

      <CommandPalette
        open={state.commandPaletteOpen}
        commands={commands}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <ShortcutHelp
        open={state.shortcutHelpOpen}
        shortcuts={shortcuts}
        onClose={() => setShortcutHelpOpen(false)}
      />
    </div>
  )
}

export default Layout
