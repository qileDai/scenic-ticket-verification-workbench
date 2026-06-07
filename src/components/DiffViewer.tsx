import type { Component } from 'solid-js'
import { createMemo, For, Show } from 'solid-js'

interface DiffItem {
  key: string
  oldValue: any
  newValue: any
  type: 'added' | 'removed' | 'modified' | 'unchanged'
}

interface DiffViewerProps {
  oldData: Record<string, any>
  newData: Record<string, any>
  title?: string
}

const DiffViewer: Component<DiffViewerProps> = (props) => {
  const diffs = createMemo<DiffItem[]>(() => {
    const allKeys = new Set([...Object.keys(props.oldData), ...Object.keys(props.newData)])
    const result: DiffItem[] = []

    allKeys.forEach((key) => {
      const oldValue = props.oldData[key]
      const newValue = props.newData[key]

      if (!(key in props.oldData)) {
        result.push({ key, oldValue: undefined, newValue, type: 'added' })
      } else if (!(key in props.newData)) {
        result.push({ key, oldValue, newValue: undefined, type: 'removed' })
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        result.push({ key, oldValue, newValue, type: 'modified' })
      } else {
        result.push({ key, oldValue, newValue, type: 'unchanged' })
      }
    })

    return result
  })

  const changedCount = createMemo(() => diffs().filter((diff) => diff.type !== 'unchanged').length)

  return (
    <div class="diff-viewer" style={{
      background: 'var(--white)',
      padding: '20px',
      'border-radius': 'var(--radius-md)',
      'box-shadow': 'var(--shadow-sm)'
    }}>
      <Show when={props.title}>
        <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)', display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
          {props.title}
          <span style={{
            'font-size': '14px',
            'font-weight': 'normal',
            color: changedCount() > 0 ? '#f5222d' : '#52c41a'
          }}>
            {changedCount()} 处变更
          </span>
        </h3>
      </Show>

      <table style={{ width: '100%', border: '1px solid var(--border-color)', 'border-radius': 'var(--radius-sm)' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: '12px', width: '25%' }}>字段</th>
            <th style={{ padding: '12px', width: '37.5%' }}>原值</th>
            <th style={{ padding: '12px', width: '37.5%' }}>新值</th>
          </tr>
        </thead>
        <tbody>
          <For each={diffs()}>
            {(diff) => (
              <tr style={{
                background:
                  diff.type === 'added' ? '#f6ffed' :
                  diff.type === 'removed' ? '#fff2f0' :
                  diff.type === 'modified' ? '#fffbe6' :
                  'transparent',
                'border-left': `3px solid ${
                  diff.type === 'added' ? '#52c41a' :
                  diff.type === 'removed' ? '#f5222d' :
                  diff.type === 'modified' ? '#faad14' :
                  'transparent'
                }`
              }}>
                <td style={{ padding: '10px 12px', 'font-weight': 500 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background:
                      diff.type === 'added' ? '#f6ffed' :
                      diff.type === 'removed' ? '#fff2f0' :
                      diff.type === 'modified' ? '#fffbe6' : '#fafafa',
                    'border-radius': '4px',
                    'font-size': '13px'
                  }}>
                    {diff.key}
                  </span>
                </td>

                <td style={{ padding: '10px 12px', color: diff.type === 'removed' || diff.type === 'modified' ? '#f5222d' : 'inherit' }}>
                  <Show
                    when={diff.type !== 'added'}
                    fallback={<span style={{ color: 'var(--text-disabled)' }}>-</span>}
                  >
                    <span style={{
                      'text-decoration': diff.type === 'removed' ? 'line-through' : 'none'
                    }}>
                      {diff.oldValue !== undefined && diff.oldValue !== '' ? String(diff.oldValue) : '-'}
                    </span>
                  </Show>
                </td>

                <td style={{ padding: '10px 12px', color: diff.type === 'added' || diff.type === 'modified' ? '#52c41a' : 'inherit' }}>
                  <Show
                    when={diff.type !== 'removed'}
                    fallback={<span style={{ color: 'var(--text-disabled)' }}>-</span>}
                  >
                    <span style={{
                      'font-weight': diff.type === 'added' ? 600 : 'normal'
                    }}>
                      {diff.newValue !== undefined && diff.newValue !== '' ? String(diff.newValue) : '-'}
                    </span>
                  </Show>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>

      <Show when={changedCount() === 0}>
        <div style={{
          padding: '20px',
          'text-align': 'center',
          color: '#52c41a',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          'border-radius': 'var(--radius-sm)',
          'margin-top': '16px'
        }}>
          ✓ 未检测到任何差异，数据完全一致
        </div>
      </Show>
    </div>
  )
}

export default DiffViewer
