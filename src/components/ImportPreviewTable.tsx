import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import type { ImportPreview } from '../types'

interface ImportPreviewTableProps {
  preview: ImportPreview
  onConfirm?: (data: any[]) => void
  onCancel?: () => void
}

const ImportPreviewTable: Component<ImportPreviewTableProps> = (props) => {
  const [currentPage, setCurrentPage] = createSignal(1)
  const pageSize = 10

  const totalPages = () => Math.ceil(props.preview.data.length / pageSize)
  
  const paginatedData = () => {
    const start = (currentPage() - 1) * pageSize
    return props.preview.data.slice(start, start + pageSize)
  }

  const headers = () => {
    if (props.preview.data.length === 0) return []
    return Object.keys(props.preview.data[0])
  }

  const errorRows = () => new Set(props.preview.errors.map(e => e.row))

  return (
    <div class="import-preview-table" style={{
      background: 'var(--white)',
      padding: '20px',
      'border-radius': 'var(--radius-md)',
      'box-shadow': 'var(--shadow-sm)'
    }}>
      <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>
        导入预览：{props.preview.fileName}
      </h3>

      <div style={{
        display: 'grid',
        'grid-template-columns': 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        'margin-bottom': '20px',
        padding: '16px',
        background: '#fafafa',
        'border-radius': 'var(--radius-sm)'
      }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', 'font-size': '13px' }}>总行数</div>
          <div style={{ 'font-size': '24px', 'font-weight': 600, color: 'var(--text-primary)' }}>
            {props.preview.totalRows}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-secondary)', 'font-size': '13px' }}>有效数据</div>
          <div style={{ 'font-size': '24px', 'font-weight': 600, color: '#52c41a' }}>
            {props.preview.validRows}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-secondary)', 'font-size': '13px' }}>错误数据</div>
          <div style={{ 'font-size': '24px', 'font-weight': 600, color: '#f5222d' }}>
            {props.preview.errorRows}
          </div>
        </div>
      </div>

      <Show when={Object.keys(props.preview.fieldMapping).length > 0}>
        <div style={{
          'margin-bottom': '16px',
          padding: '12px',
          background: '#e6f7ff',
          border: '1px solid #91d5ff',
          'border-radius': 'var(--radius-sm)',
          'font-size': '13px'
        }}>
          <strong>字段映射：</strong>
          {Object.entries(props.preview.fieldMapping).map(([source, target]) => (
            <span style={{ 'margin-right': '12px' }}>
              {source} → {target}
            </span>
          ))}
        </div>
      </Show>

      <Show when={props.preview.errors.length > 0}>
        <div style={{
          'margin-bottom': '16px',
          padding: '12px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          'border-radius': 'var(--radius-sm)',
          'max-height': '150px',
          overflow: 'auto'
        }}>
          <strong style={{ color: '#f5222d', display: 'block', 'margin-bottom': '8px' }}>
            错误详情 ({props.preview.errors.length} 条)
          </strong>
          <For each={props.preview.errors}>
            {(error) => (
              <div style={{
                'margin-bottom': '4px',
                'font-size': '12px',
                color: 'var(--text-secondary)'
              }}>
                第 {error.row} 行 - 字段 "{error.field}"：{error.message}
              </div>
            )}
          </For>
        </div>
      </Show>

      <div style={{ overflow: 'auto', 'max-height': '400px', border: '1px solid var(--border-color)', 'border-radius': 'var(--radius-sm)' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, background: '#fafafa' }}>
            <tr>
              <th>#</th>
              <For each={headers()}>
                {(header) => <th>{header}</th>}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={paginatedData()}>
              {(row, index) => (
                <tr style={{
                  background: errorRows().has((currentPage() - 1) * pageSize + index() + 1) ? '#fff2f0' : 'transparent'
                }}>
                  <td>{(currentPage() - 1) * pageSize + index() + 1}</td>
                  <For each={headers()}>
                    {(header) => <td>{row[header]}</td>}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <Show when={totalPages() > 1}>
        <div style={{
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
          'margin-top': '16px'
        }}>
          <span style={{ color: 'var(--text-secondary)', 'font-size': '13px' }}>
            第 {currentPage()} 页，共 {totalPages()} 页
          </span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage() === 1}
              style={{
                padding: '6px 12px',
                background: 'var(--white)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-sm)',
                opacity: currentPage() === 1 ? 0.5 : 1,
                cursor: currentPage() === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              上一页
            </button>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages(), p + 1))}
              disabled={currentPage() === totalPages()}
              style={{
                padding: '6px 12px',
                background: 'var(--white)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-sm)',
                opacity: currentPage() === totalPages() ? 0.5 : 1,
                cursor: currentPage() === totalPages() ? 'not-allowed' : 'pointer'
              }}
            >
              下一页
            </button>
          </div>
        </div>
      </Show>

      <div style={{
        display: 'flex',
        gap: '12px',
        'margin-top': '20px',
        'justify-content': 'flex-end'
      }}>
        <Show when={props.onCancel}>
          <button
            onClick={props.onCancel}
            style={{
              padding: '8px 20px',
              background: 'var(--white)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-sm)'
            }}
          >
            取消
          </button>
        </Show>

        <Show when={props.onConfirm && props.preview.validRows > 0}>
          <button
            onClick={() => props.onConfirm?.(props.preview.data)}
            disabled={props.preview.validRows === 0}
            style={{
              padding: '8px 20px',
              background: props.preview.errorRows > 0 ? '#faad14' : '#52c41a',
              color: 'var(--white)',
              'border-radius': 'var(--radius-sm)',
              opacity: props.preview.validRows === 0 ? 0.5 : 1,
              cursor: props.preview.validRows === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            确认导入{props.preview.errorRows > 0 ? `（${props.preview.validRows} 条有效）` : ''}
          </button>
        </Show>
      </div>
    </div>
  )
}

export default ImportPreviewTable
