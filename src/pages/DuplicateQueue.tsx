import type { Component } from 'solid-js'
import { createSignal, For, Show, createMemo } from 'solid-js'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import BatchActionToolbar from '../components/BatchActionToolbar'
import DetailDrawer from '../components/DetailDrawer'
import EvidenceTimeline from '../components/EvidenceTimeline'
import { state, setSelectedIds, toggleSelection, clearSelection } from '../stores'
import { detectDuplicateVerification, STATUS_LABELS } from '../utils/business'
import type { VerificationRecord, EntityStatus } from '../types'

const DuplicateQueue: Component = () => {
  const [selectedRecord, setSelectedRecord] = createSignal<VerificationRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = createSignal(false)
  const [selectedDuplicates, setSelectedDuplicates] = createSignal<string[]>([])

  const duplicates = createMemo(() => {
    return detectDuplicateVerification(state.records)
  })

  const duplicateRecords = createMemo(() => {
    const duplicateCouponIds = new Set(duplicates().map(d => d.couponId))
    return state.records.filter(r => duplicateCouponIds.has(r.couponId))
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
      value: duplicates().filter(d => d.firstTime.startsWith(new Date().toISOString().slice(0, 10))).length,
      unit: '组'
    },
    {
      label: '待处理',
      value: duplicateRecords().filter(r => r.status === 'pending_review' || r.status === 'pending_supplement').length,
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
    return state.records.filter(r => r.couponId === couponId).sort((a, b) => 
      a.verificationTime.localeCompare(b.verificationTime)
    )
  }

  const handleBatchProcess = (action: string) => {
    if (state.selectedIds.length === 0) {
      alert('请先选择要处理的记录')
      return
    }
    
    if (action === 'confirm') {
      alert(`已确认处理 ${state.selectedIds.length} 条重复核销记录`)
    } else if (action === 'reject') {
      alert(`已驳回 ${state.selectedIds.length} 条重复核销记录`)
    } else if (action === 'queue') {
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
        title: `创建核销记录`,
        description: `操作人：${record.operatorName}，方式：${record.verificationMethod}`,
        type: 'info' as const
      },
      ...relatedRecords.map((r, index) => ({
        id: `${index + 2}`,
        time: r.verificationTime,
        title: `第${index + 1}次核销`,
        description: r.isSuccess ? '✓ 核销成功' : `✗ 失败：${r.failReason || '未知'}`,
        type: r.isSuccess ? 'success' as const : 'error' as const
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
        onSelectAll={() => setSelectedIds(duplicateRecords().map(r => r.id))}
        onClearSelection={() => clearSelection()}
        actions={[
          {
            label: '批量确认',
            onClick: () => handleBatchProcess('confirm'),
            variant: 'primary'
          },
          {
            label: '批量驳回',
            onClick: () => handleBatchProcess('reject'),
            variant: 'danger'
          },
          {
            label: '加入异常队列',
            onClick: () => handleBatchProcess('queue')
          },
          {
            label: '导出报告',
            onClick: () => alert('导出重复核销报告')
          }
        ]}
      />

      <Show when={duplicates().length > 0}>
        <div style={{
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          padding: '16px 20px',
          'border-radius': 'var(--radius-md)',
          'margin-bottom': '20px',
          display: 'flex',
          'align-items': 'center',
          gap: '12px'
        }}>
          <span style={{ 'font-size': '20px' }}>⚠️</span>
          <span>检测到 <strong>{duplicates().length}</strong> 组重复核销异常，共涉及 <strong>{duplicateRecords().length}</strong> 条记录</span>
        </div>
      </Show>

      <div style={{ display: 'grid', 'grid-template-columns': '1fr 400px', gap: '20px', 'margin-bottom': '24px' }}>
        <div style={{
          background: 'var(--white)',
          'border-radius': 'var(--radius-md)',
          'box-shadow': 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <h3 style={{ padding: '20px 20px 0', color: 'var(--text-primary)', margin: 0 }}>重复核销队列</h3>
          
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={state.selectedIds.length === duplicateRecords().length && duplicateRecords().length > 0}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        setSelectedIds(duplicateRecords().map(r => r.id))
                      } else {
                        clearSelection()
                      }
                    }}
                  />
                </th>
                <th>记录编号</th>
                <th>券码ID</th>
                <th>核销时间</th>
                <th>是否成功</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <For each={duplicateRecords()}>
                {(record) => (
                  <tr style={{ background: state.selectedIds.includes(record.id) ? '#e6f7ff' : '' }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={state.selectedIds.includes(record.id)}
                        onChange={(e) => toggleSelection(record.id)}
                      />
                    </td>
                    <td><strong>{record.recordCode}</strong></td>
                    <td>
                      <code style={{ background: '#f5f5f5', padding: '2px 6px', 'border-radius': '4px' }}>{record.couponId.slice(0, 8)}...</code>
                    </td>
                    <td>{record.verificationTime.slice(0, 16)}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        'border-radius': '4px',
                        background: record.isSuccess ? '#f6ffed' : '#fff2f0',
                        color: record.isSuccess ? '#52c41a' : '#f5222d'
                      }}>
                        {record.isSuccess ? '✓' : '✗'}
                      </span>
                    </td>
                    <td><StatusBadge status={record.status} size="small" /></td>
                    <td>
                      <button
                        onClick={() => openDetail(record)}
                        style={{
                          padding: '4px 12px',
                          background: '#f0f0f0',
                          border: 'none',
                          'border-radius': '4px',
                          cursor: 'pointer'
                        }}
                      >
                        详情
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>

          <Show when={duplicateRecords().length === 0}>
            <div style={{
              padding: '60px',
              'text-align': 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>✅</div>
              <p>暂无重复核销记录</p>
            </div>
          </Show>
        </div>

        <Show when={selectedRecord()} fallback={
          <div style={{
            background: 'var(--white)',
            padding: '20px',
            'border-radius': 'var(--radius-md)',
            'box-shadow': 'var(--shadow-sm)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'min-height': '400px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ 'text-align': 'center' }}>
              <div style={{ 'font-size': '48px', 'margin-bottom': '12px' }}>🔄</div>
              <p>选择一条记录查看详情</p>
            </div>
          </div>
        }>
          <EvidenceTimeline
            items={timelineItemsForRecord(selectedRecord()!)}
            title={`记录 ${selectedRecord()?.recordCode} 时间线`}
          />

          <div style={{
            background: 'var(--white)',
            padding: '16px',
            'border-radius': 'var(--radius-md)',
            'box-shadow': 'var(--shadow-sm)',
            'margin-top': '20px'
          }}>
            <h4 style={{ 'margin-bottom': '12px' }}>相关重复记录</h4>
            
            <For each={getRelatedRecords(selectedRecord()!.couponId)}>
              {(relatedRecord) => (
                <div style={{
                  padding: '10px',
                  'margin-bottom': '8px',
                  background: '#fafafa',
                  'border-radius': '4px',
                  border: `1px solid ${relatedRecord.id === selectedRecord()?.id ? 'var(--primary-color)' : 'transparent'}`
                }}>
                  <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
                    <strong>{relatedRecord.recordCode}</strong>
                    <StatusBadge status={relatedRecord.status} size="small" />
                  </div>
                  <div style={{ 'font-size': '13px', color: 'var(--text-secondary)', 'margin-top': '4px' }}>
                    时间：{relatedRecord.verificationTime.slice(0, 16)} | 
                    结果：{relatedRecord.isSuccess ? '成功' : '失败'}
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      <DetailDrawer
        open={drawerOpen()}
        title="重复核销记录详情"
        data={selectedRecord() || {}}
        fields={[
          { key: 'recordCode', label: '记录编号' },
          { key: 'couponId', label: '关联券码' },
          { key: 'gateId', label: '闸机' },
          { key: 'verificationTime', label: '核销时间' },
          { key: 'verificationMethod', label: '核销方式' },
          { key: 'operatorName', label: '操作人' },
          { key: 'isSuccess', label: '是否成功' },
          { key: 'failReason', label: '失败原因' },
          { key: 'status', label: '状态' },
          { key: 'remark', label: '备注', editable: true, type: 'textarea' }
        ]}
        onClose={closeDetail}
        onSave={(data) => {
          console.log('保存数据:', data)
          closeDetail()
        }}
        statusOptions={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        onStatusChange={(newStatus) => {
          if (newStatus === 'rejected') {
            const reason = prompt('请输入驳回原因（必填）：')
            if (!reason) {
              alert('驳回必须填写原因！')
              return
            }
            alert(`已驳回，原因：${reason}`)
          } else {
            alert(`状态变更为：${newStatus}`)
          }
          closeDetail()
        }}
      />
    </div>
  )
}

export default DuplicateQueue
