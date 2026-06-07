import type { Component } from 'solid-js'
import { createMemo, createSignal, For, Show } from 'solid-js'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import BatchActionToolbar from '../components/BatchActionToolbar'
import DetailDrawer from '../components/DetailDrawer'
import EvidenceTimeline from '../components/EvidenceTimeline'
import { state, setSelectedIds, toggleSelection, clearSelection } from '../stores'
import { detectDuplicateVerification, STATUS_LABELS } from '../utils/business'
import type { VerificationRecord } from '../types'

const DuplicateQueue: Component = () => {
  const [selectedRecord, setSelectedRecord] = createSignal<VerificationRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = createSignal(false)

  const duplicates = createMemo(() => detectDuplicateVerification(state.records))

  const duplicateRecords = createMemo(() => {
    const duplicateCouponIds = new Set(duplicates().map((duplicate) => duplicate.couponId))
    return state.records.filter((record) => duplicateCouponIds.has(record.couponId))
  })

  const metrics = () => [
    {
      label: '重复核销总数',
      value: duplicates().length,
      unit: '组',
      change: -3.5
    },
    {
      label: '涉及记录数',
      value: duplicateRecords().length,
      unit: '条'
    },
    {
      label: '今日新增',
      value: duplicates().filter((duplicate) => duplicate.firstTime.startsWith(new Date().toISOString().slice(0, 10))).length,
      unit: '组'
    },
    {
      label: '待处理',
      value: duplicateRecords().filter((record) => record.status === 'pending_review' || record.status === 'pending_supplement').length,
      unit: '条'
    }
  ]

  const openDetail = (record: VerificationRecord) => {
    setSelectedRecord(record)
    setDrawerOpen(true)
  }

  const closeDetail = () => {
    setDrawerOpen(false)
    setSelectedRecord(null)
  }

  const getRelatedRecords = (couponId: string) => {
    return state.records
      .filter((record) => record.couponId === couponId)
      .sort((left, right) => left.verificationTime.localeCompare(right.verificationTime))
  }

  const handleBatchProcess = (action: 'confirm' | 'reject' | 'queue') => {
    if (state.selectedIds.length === 0) {
      alert('请先选择要处理的记录')
      return
    }

    if (action === 'confirm') {
      alert(`已确认处理 ${state.selectedIds.length} 条重复核销记录`)
    } else if (action === 'reject') {
      alert(`已驳回 ${state.selectedIds.length} 条重复核销记录`)
    } else {
      alert(`已将 ${state.selectedIds.length} 条记录加入异常队列`)
    }

    clearSelection()
  }

  const timelineItemsForRecord = (record: VerificationRecord) => {
    const relatedRecords = getRelatedRecords(record.couponId)

    return [
      {
        id: '1',
        time: record.createdAt,
        title: '创建核销记录',
        description: `操作人：${record.operatorName}，方式：${record.verificationMethod}`,
        type: 'info' as const
      },
      ...relatedRecords.map((relatedRecord, index) => ({
        id: `${index + 2}`,
        time: relatedRecord.verificationTime,
        title: `第${index + 1}次核销`,
        description: relatedRecord.isSuccess ? '✓ 核销成功' : `✗ 失败：${relatedRecord.failReason || '未知'}`,
        type: relatedRecord.isSuccess ? 'success' as const : 'error' as const
      })),
      ...(relatedRecords.length > 1 ? [{
        id: `${relatedRecords.length + 2}`,
        time: new Date().toISOString(),
        title: '⚠️ 检测到重复核销',
        description: `该券码已被核销 ${relatedRecords.length} 次，需要人工复核`,
        type: 'warning' as const
      }] : [])
    ]
  }

  return (
    <div class="duplicate-queue">
      <div style={{
        display: 'grid',
        'grid-template-columns': 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        'margin-bottom': '24px'
      }}>
        <For each={metrics()}>
          {(metric) => <MetricCard data={metric} />}
        </For>
      </div>

      <BatchActionToolbar
        selectedCount={state.selectedIds.length}
        totalCount={duplicateRecords().length}
        onClearSelection={clearSelection}
        onSelectAll={() => setSelectedIds(duplicateRecords().map((record) => record.id))}
        actions={[
          { label: '批量确认', variant: 'primary', onClick: () => handleBatchProcess('confirm') },
          { label: '批量驳回', variant: 'default', onClick: () => handleBatchProcess('reject') },
          { label: '加入异常队列', variant: 'danger', onClick: () => handleBatchProcess('queue') }
        ]}
      />

      <div style={{
        background: 'var(--white)',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
          'border-bottom': '1px solid var(--border-color)'
        }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>重复核销队列</h3>
          <button
            onClick={() => setSelectedIds(duplicateRecords().map((record) => record.id))}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid var(--border-color)',
              'border-radius': '4px',
              cursor: 'pointer'
            }}
          >
            全选
          </button>
        </div>

        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '12px 16px', width: '48px' }} />
                <th style={{ padding: '12px 16px', 'text-align': 'left' }}>记录编号</th>
                <th style={{ padding: '12px 16px', 'text-align': 'left' }}>券码</th>
                <th style={{ padding: '12px 16px', 'text-align': 'left' }}>核销时间</th>
                <th style={{ padding: '12px 16px', 'text-align': 'left' }}>操作人</th>
                <th style={{ padding: '12px 16px', 'text-align': 'left' }}>状态</th>
                <th style={{ padding: '12px 16px', 'text-align': 'left' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              <For each={duplicateRecords()}>
                {(record) => {
                  const checked = () => state.selectedIds.includes(record.id)
                  const relatedRecords = () => getRelatedRecords(record.couponId)

                  return (
                    <tr style={{ 'border-top': '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          checked={checked()}
                          onChange={() => toggleSelection(record.id)}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <strong>{record.recordCode}</strong>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{record.couponId}</td>
                      <td style={{ padding: '12px 16px' }}>{record.verificationTime.slice(0, 16)}</td>
                      <td style={{ padding: '12px 16px' }}>{record.operatorName}</td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={record.status} size="small" /></td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => openDetail(record)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            'border-radius': '4px',
                            cursor: 'pointer'
                          }}
                        >
                          查看详情
                        </button>
                        <div style={{ 'font-size': '12px', color: 'var(--text-secondary)', 'margin-top': '6px' }}>
                          同券码共 {relatedRecords().length} 条记录
                        </div>
                      </td>
                    </tr>
                  )
                }}
              </For>
            </tbody>
          </table>
        </div>
      </div>

      <Show when={selectedRecord()}>
        <DetailDrawer
          open={drawerOpen()}
          title="重复核销记录详情"
          data={selectedRecord() || {}}
          fields={[
            { key: 'recordCode', label: '记录编号' },
            { key: 'couponId', label: '关联券码' },
            { key: 'verificationTime', label: '核销时间', type: 'date' },
            { key: 'verificationMethod', label: '核销方式' },
            { key: 'operatorName', label: '操作人' },
            { key: 'failReason', label: '失败原因', type: 'textarea', editable: true },
            { key: 'remark', label: '备注', type: 'textarea', editable: true }
          ]}
          onClose={closeDetail}
          onStatusChange={(status) => alert(`状态已更新为：${status}`)}
          statusOptions={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </Show>

      <Show when={selectedRecord()}>
        <div style={{ 'margin-top': '24px' }}>
          <EvidenceTimeline
            title="重复核销时间线"
            items={timelineItemsForRecord(selectedRecord() as VerificationRecord)}
          />
        </div>
      </Show>
    </div>
  )
}

export default DuplicateQueue
