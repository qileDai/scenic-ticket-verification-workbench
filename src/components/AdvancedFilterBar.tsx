import type { Component } from 'solid-js'
import { createMemo, createSignal, For } from 'solid-js'
import type { FilterCriteria, EntityStatus } from '../types'
import { STATUS_LABELS } from '../utils/business'

interface FilterOption {
  value: string
  label: string
}

interface AdvancedFilterBarProps {
  criteria: FilterCriteria
  onFilterChange: (criteria: FilterCriteria) => void
  statusOptions?: FilterOption[]
  ownerOptions?: FilterOption[]
  batchOptions?: FilterOption[]
}

const AdvancedFilterBar: Component<AdvancedFilterBarProps> = (props) => {
  const [keyword, setKeyword] = createSignal(props.criteria.keyword || '')
  const [selectedStatuses, setSelectedStatuses] = createSignal<EntityStatus[]>(props.criteria.status || [])
  const [selectedOwner, setSelectedOwner] = createSignal(props.criteria.owner || '')
  const [selectedBatch, setSelectedBatch] = createSignal(props.criteria.batchId || '')
  const [startDate, setStartDate] = createSignal('')
  const [endDate, setEndDate] = createSignal('')

  const statuses = createMemo(() => Object.keys(STATUS_LABELS) as EntityStatus[])

  const handleFilter = () => {
    props.onFilterChange({
      keyword: keyword() || undefined,
      status: selectedStatuses().length > 0 ? selectedStatuses() : undefined,
      owner: selectedOwner() || undefined,
      batchId: selectedBatch() || undefined,
      dateRange: startDate() && endDate() ? [startDate(), endDate()] : undefined
    })
  }

  const handleReset = () => {
    setKeyword('')
    setSelectedStatuses([])
    setSelectedOwner('')
    setSelectedBatch('')
    setStartDate('')
    setEndDate('')
    props.onFilterChange({})
  }

  const toggleStatus = (status: EntityStatus) => {
    const current = selectedStatuses()
    if (current.includes(status)) {
      setSelectedStatuses(current.filter(item => item !== status))
      return
    }

    setSelectedStatuses([...current, status])
  }

  return (
    <div class="advanced-filter-bar" style={{
      background: 'var(--white)',
      padding: '16px',
      'border-radius': 'var(--radius-md)',
      'box-shadow': 'var(--shadow-sm)',
      'margin-bottom': '16px'
    }}>
      <div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '12px', 'align-items': 'center' }}>
        <div style={{ 'min-width': '200px' }}>
          <input
            type="text"
            placeholder="搜索编号/名称/券码..."
            value={keyword()}
            onInput={(event) => setKeyword(event.currentTarget.value)}
            onKeyPress={(event) => event.key === 'Enter' && handleFilter()}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
          <For each={statuses()}>
            {(status) => (
              <button
                onClick={() => toggleStatus(status)}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${selectedStatuses().includes(status) ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  'border-radius': 'var(--radius-sm)',
                  background: selectedStatuses().includes(status) ? '#e6f7ff' : 'var(--white)',
                  color: selectedStatuses().includes(status) ? 'var(--primary-color)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  'font-size': '13px'
                }}
              >
                {STATUS_LABELS[status]}
              </button>
            )}
          </For>
        </div>

        <div>
          <select
            value={selectedOwner()}
            onChange={(event) => setSelectedOwner(event.currentTarget.value)}
            style={{ width: '120px' }}
          >
            <option value="">全部负责人</option>
            <For each={props.ownerOptions || []}>
              {(option) => <option value={option.value}>{option.label}</option>}
            </For>
          </select>
        </div>

        <div>
          <select
            value={selectedBatch()}
            onChange={(event) => setSelectedBatch(event.currentTarget.value)}
            style={{ width: '150px' }}
          >
            <option value="">全部批次</option>
            <For each={props.batchOptions || []}>
              {(option) => <option value={option.value}>{option.label}</option>}
            </For>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
          <input
            type="date"
            value={startDate()}
            onChange={(event) => setStartDate(event.currentTarget.value)}
            placeholder="开始日期"
          />
          <span>至</span>
          <input
            type="date"
            value={endDate()}
            onChange={(event) => setEndDate(event.currentTarget.value)}
            placeholder="结束日期"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleFilter}
            style={{
              padding: '8px 20px',
              background: 'var(--primary-color)',
              color: 'var(--white)',
              'border-radius': 'var(--radius-sm)'
            }}
          >
            筛选
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 20px',
              background: 'var(--white)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-sm)'
            }}
          >
            重置
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdvancedFilterBar
