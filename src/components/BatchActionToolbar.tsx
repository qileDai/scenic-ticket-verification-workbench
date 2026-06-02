import type { Component } from 'solid-js'
import { createSignal, Show } from 'solid-js'

interface BatchAction {
  label: string
  icon?: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'danger' | 'default'
}

interface BatchActionToolbarProps {
  selectedCount: number
  actions: BatchAction[]
  onSelectAll?: () => void
  onClearSelection?: () => void
  totalCount?: number
}

const BatchActionToolbar: Component<BatchActionToolbarProps> = (props) => {
  const [showConfirmDialog, setShowConfirmDialog] = createSignal(false)
  const [pendingAction, setPendingAction] = createSignal<BatchAction | null>(null)

  const handleActionClick = (action: BatchAction) => {
    if (action.variant === 'danger') {
      setPendingAction(action)
      setShowConfirmDialog(true)
    } else {
      action.onClick()
    }
  }

  const confirmAction = () => {
    if (pendingAction()) {
      pendingAction()?.onClick()
    }
    setShowConfirmDialog(false)
    setPendingAction(null)
  }

  return (
    <>
      <div class="batch-action-toolbar" style={{
        background: props.selectedCount > 0 ? '#e6f7ff' : 'var(--white)',
        padding: '12px 16px',
        'border-radius': 'var(--radius-md)',
        display: 'flex',
        'align-items': 'center',
        gap: '16px',
        'margin-bottom': '16px',
        border: `1px solid ${props.selectedCount > 0 ? '#91d5ff' : 'var(--border-color)'}`
      }}>
        <div style={{
          color: props.selectedCount > 0 ? 'var(--primary-color)' : 'var(--text-secondary)',
          'font-weight': 500,
          'min-width': '120px'
        }}>
          {props.selectedCount > 0 ? (
            <>已选择 <span style={{ 'font-size': '18px', 'font-weight': 600 }}>{props.selectedCount}</span> 项</>
          ) : (
            '未选择任何项'
          )}
        </div>

        <Show when={props.onSelectAll}>
          <button
            onClick={props.onSelectAll}
            disabled={props.selectedCount === (props.totalCount || 0)}
            style={{
              padding: '6px 12px',
              background: props.selectedCount === (props.totalCount || 0) ? '#f5f5f5' : 'var(--white)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-sm)',
              cursor: props.selectedCount === (props.totalCount || 0) ? 'not-allowed' : 'pointer'
            }}
          >
            全选 ({props.totalCount || 0})
          </button>
        </Show>

        <Show when={props.onClearSelection && props.selectedCount > 0}>
          <button
            onClick={props.onClearSelection}
            style={{
              padding: '6px 12px',
              background: 'var(--white)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-sm)'
            }}
          >
            清空选择
          </button>
        </Show>

        <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
          {props.actions.map((action) => (
            <button
              onClick={() => handleActionClick(action)}
              disabled={action.disabled || props.selectedCount === 0}
              style={{
                padding: '6px 16px',
                'border-radius': 'var(--radius-sm)',
                opacity: (action.disabled || props.selectedCount === 0) ? 0.5 : 1,
                cursor: (action.disabled || props.selectedCount === 0) ? 'not-allowed' : 'pointer',
                ...(action.variant === 'primary' ? {
                  background: 'var(--primary-color)',
                  color: 'var(--white)'
                } : action.variant === 'danger' ? {
                  background: 'var(--error-color)',
                  color: 'var(--white)'
                } : {
                  background: 'var(--white)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                })
              }}
            >
              {action.icon && <span style={{ 'margin-right': '4px' }}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <Show when={showConfirmDialog()}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'z-index': 1000
        }}>
          <div style={{
            background: 'var(--white)',
            padding: '24px',
            'border-radius': 'var(--radius-lg)',
            'max-width': '400px',
            width: '90%',
            'box-shadow': 'var(--shadow-lg)'
          }}>
            <h3 style={{ 'margin-bottom': '16px', color: 'var(--error-color)' }}>确认操作</h3>
            <p style={{ 'margin-bottom': '20px', color: 'var(--text-secondary)' }}>
              您确定要对已选择的 {props.selectedCount} 项执行此操作吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', gap: '12px', 'justify-content': 'flex-end' }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  padding: '8px 20px',
                  background: 'var(--white)',
                  border: '1px solid var(--border-color)',
                  'border-radius': 'var(--radius-sm)'
                }}
              >
                取消
              </button>
              <button
                onClick={confirmAction}
                style={{
                  padding: '8px 20px',
                  background: 'var(--error-color)',
                  color: 'var(--white)',
                  'border-radius': 'var(--radius-sm)'
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

export default BatchActionToolbar
