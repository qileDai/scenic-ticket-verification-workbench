import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import StatusBadge from './StatusBadge'

interface FieldConfig {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'date' | 'number'
  options?: Array<{ value: string; label: string }>
  editable?: boolean
}

interface DetailDrawerProps {
  open: boolean
  title: string
  data: Record<string, any>
  fields: FieldConfig[]
  onClose: () => void
  onSave?: (data: Record<string, any>) => void
  onStatusChange?: (newStatus: string) => void
  statusOptions?: Array<{ value: string; label: string }>
}

const DetailDrawer: Component<DetailDrawerProps> = (props) => {
  const [editData, setEditData] = createSignal<Record<string, any>>({})
  const [isEditing, setIsEditing] = createSignal(false)
  const [activeTab, setActiveTab] = createSignal('basic')

  const handleFieldChange = (key: string, value: any) => {
    setEditData({ ...editData(), [key]: value })
  }

  const startEditing = () => {
    setEditData({ ...props.data })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setEditData({})
    setIsEditing(false)
  }

  const saveChanges = () => {
    props.onSave?.(editData())
    setIsEditing(false)
    setEditData({})
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
        'z-index': 999
      }}>
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '600px',
          height: '100vh',
          background: 'var(--white)',
          'box-shadow': '-4px 0 16px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          'flex-direction': 'column'
        }}>
          <div style={{
            padding: '20px',
            background: '#fafafa',
            'border-bottom': '1px solid var(--border-color)',
            display: 'flex',
            'justify-content': 'space-between',
            'align-items': 'center'
          }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{props.title}</h2>
            <button
              onClick={props.onClose}
              style={{
                background: 'transparent',
                border: 'none',
                'font-size': '24px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              ×
            </button>
          </div>

          <div style={{
            padding: '12px 20px',
            display: 'flex',
            gap: '8px',
            'border-bottom': '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('basic')}
              style={{
                padding: '8px 16px',
                background: activeTab() === 'basic' ? 'var(--primary-color)' : 'transparent',
                color: activeTab() === 'basic' ? 'var(--white)' : 'var(--text-secondary)',
                border: 'none',
                'border-radius': 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              基本信息
            </button>
            <button
              onClick={() => setActiveTab('status')}
              style={{
                padding: '8px 16px',
                background: activeTab() === 'status' ? 'var(--primary-color)' : 'transparent',
                color: activeTab() === 'status' ? 'var(--white)' : 'var(--text-secondary)',
                border: 'none',
                'border-radius': 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              状态流转
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
            <Show
              when={activeTab() === 'basic'}
              fallback={
                <div>
                  <div style={{ 'margin-bottom': '24px' }}>
                    <strong>当前状态</strong>
                    <div style={{ 'margin-top': '8px' }}>
                      <StatusBadge status={props.data.status} size="large" />
                    </div>
                  </div>

                  <Show when={props.onStatusChange && props.statusOptions}>
                    <div>
                      <strong style={{ display: 'block', 'margin-bottom': '12px' }}>变更状态</strong>
                      <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
                        <For each={props.statusOptions || []}>
                          {(option) => (
                            <button
                              onClick={() => props.onStatusChange?.(option.value)}
                              style={{
                                padding: '8px 16px',
                                background: 'var(--white)',
                                border: '1px solid var(--border-color)',
                                'border-radius': 'var(--radius-sm)',
                                cursor: 'pointer'
                              }}
                            >
                              {option.label}
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                </div>
              }
            >
              <div class="detail-fields">
                <For each={props.fields}>
                  {(field) => (
                    <div style={{ 'margin-bottom': '20px' }}>
                      <label style={{
                        display: 'block',
                        'margin-bottom': '8px',
                        'font-weight': 500,
                        color: 'var(--text-primary)'
                      }}>
                        {field.label}
                      </label>

                      <Show
                        when={isEditing() && field.editable}
                        fallback={
                          <div style={{
                            padding: '10px 12px',
                            background: '#fafafa',
                            'border-radius': 'var(--radius-sm)',
                            border: '1px solid var(--border-color)'
                          }}>
                            {field.type === 'textarea' ? (
                              <pre style={{ margin: 0, 'white-space': 'pre-wrap' }}>
                                {props.data[field.key] || '-'}
                              </pre>
                            ) : (
                              props.data[field.key] || '-'
                            )}
                          </div>
                        }
                      >
                        <Show
                          when={field.type === 'select'}
                          fallback={
                            <Show
                              when={field.type === 'textarea'}
                              fallback={
                                <input
                                  type={field.type || 'text'}
                                  value={editData()[field.key] || ''}
                                  onChange={(event) => handleFieldChange(field.key, event.currentTarget.value)}
                                  style={{ width: '100%' }}
                                />
                              }
                            >
                              <textarea
                                value={editData()[field.key] || ''}
                                onChange={(event) => handleFieldChange(field.key, event.currentTarget.value)}
                                rows={4}
                                style={{ width: '100%' }}
                              />
                            </Show>
                          }
                        >
                          <select
                            value={editData()[field.key] || ''}
                            onChange={(event) => handleFieldChange(field.key, event.currentTarget.value)}
                            style={{ width: '100%' }}
                          >
                            <For each={field.options || []}>
                              {(option) => <option value={option.value}>{option.label}</option>}
                            </For>
                          </select>
                        </Show>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <div style={{
            padding: '16px 20px',
            'border-top': '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            'justify-content': 'flex-end'
          }}>
            <Show
              when={isEditing()}
              fallback={
                <button
                  onClick={startEditing}
                  disabled={!props.onSave}
                  style={{
                    padding: '8px 20px',
                    background: 'var(--primary-color)',
                    color: 'var(--white)',
                    'border-radius': 'var(--radius-sm)',
                    opacity: !props.onSave ? 0.5 : 1,
                    cursor: !props.onSave ? 'not-allowed' : 'pointer'
                  }}
                >
                  编辑
                </button>
              }
            >
              <button
                onClick={cancelEditing}
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
                onClick={saveChanges}
                style={{
                  padding: '8px 20px',
                  background: 'var(--success-color)',
                  color: 'var(--white)',
                  'border-radius': 'var(--radius-sm)'
                }}
              >
                保存
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default DetailDrawer
