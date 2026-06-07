import type { Component } from 'solid-js'
import { createEffect, createSignal, For, Show } from 'solid-js'
import { useParams } from '@solidjs/router'
import StatusBadge from '../components/StatusBadge'
import DiffViewer from '../components/DiffViewer'
import EvidenceTimeline from '../components/EvidenceTimeline'
import { state } from '../stores'
import type { VerificationRecord } from '../types'
import { checkCouponConsistency } from '../utils/business'

const RecordDetail: Component = () => {
  const params = useParams()
  const [record, setRecord] = createSignal<VerificationRecord | null>(null)
  const [editMode, setEditMode] = createSignal(false)
  const [editedData, setEditedData] = createSignal<Partial<VerificationRecord>>({})
  const [showDiff, setShowDiff] = createSignal(false)

  const recordId = () => params.id

  createEffect(() => {
    const found = state.records.find((item) => item.id === recordId()) || null
    setRecord(found)
  })

  const handleFieldChange = <K extends keyof VerificationRecord>(key: K, value: VerificationRecord[K]) => {
    setEditedData({ ...editedData(), [key]: value })
  }

  const startEditing = () => {
    const currentRecord = record()
    if (!currentRecord) {
      return
    }

    setEditedData({ ...currentRecord })
    setEditMode(true)
  }

  const cancelEditing = () => {
    setEditMode(false)
    setEditedData({})
    setShowDiff(false)
  }

  const saveChanges = () => {
    if (record() && Object.keys(editedData()).length > 0) {
      setShowDiff(true)
    }
  }

  const confirmSave = () => {
    alert('数据已保存！')
    setEditMode(false)
    setEditedData({})
    setShowDiff(false)
  }

  const relatedCoupon = () => {
    const currentRecord = record()
    if (!currentRecord) return null
    return state.coupons.find((coupon) => coupon.id === currentRecord.couponId) || null
  }

  const relatedGate = () => {
    const currentRecord = record()
    if (!currentRecord) return null
    return state.gates.find((gate) => gate.id === currentRecord.gateId) || null
  }

  const relatedCredential = () => {
    const coupon = relatedCoupon()
    if (!coupon?.visitorId) return null
    return state.credentials.find((credential) => credential.id === coupon.visitorId) || null
  }

  const consistencyCheck = () => {
    const coupon = relatedCoupon()
    const currentRecord = record()
    if (!coupon || !currentRecord) return null

    return checkCouponConsistency(
      coupon,
      currentRecord,
      relatedGate() || undefined,
      relatedCredential() || undefined
    )
  }

  const timelineItems = () => {
    const currentRecord = record()
    if (!currentRecord) return []

    const gate = relatedGate()

    return [
      {
        id: '1',
        time: currentRecord.createdAt,
        title: '创建核销记录',
        description: `操作人：${currentRecord.operatorName}`,
        type: 'info' as const
      },
      {
        id: '2',
        time: currentRecord.verificationTime,
        title: `执行核销（${currentRecord.verificationMethod === 'online' ? '在线' : '离线'}）`,
        description: currentRecord.isSuccess ? '✓ 核销成功' : `✗ 核销失败：${currentRecord.failReason || '未知原因'}`,
        type: currentRecord.isSuccess ? 'success' as const : 'error' as const
      },
      ...(gate ? [{
        id: '3',
        time: gate.lastHeartbeatTime || currentRecord.verificationTime,
        title: `闸机状态：${gate.isOnline ? '在线' : '离线'}`,
        description: `位置：${gate.location}，当前负载：${gate.currentLoad}/${gate.dailyCapacity}`,
        type: gate.isOnline ? 'success' as const : 'warning' as const
      }] : []),
      ...(!currentRecord.isSuccess && currentRecord.failReason ? [{
        id: '4',
        time: new Date(new Date(currentRecord.verificationTime).getTime() + 60000).toISOString(),
        title: '异常标记',
        description: currentRecord.failReason,
        type: 'error' as const
      }] : [])
    ]
  }

  return (
    <div class="record-detail">
      <Show
        when={record()}
        fallback={
          <div style={{
            padding: '60px',
            'text-align': 'center',
            background: 'var(--white)',
            'border-radius': 'var(--radius-md)',
            'box-shadow': 'var(--shadow-sm)'
          }}>
            <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>🔍</div>
            <p>未找到该核销记录</p>
          </div>
        }
      >
        <div style={{
          display: 'grid',
          'grid-template-columns': '2fr 1fr',
          gap: '20px',
          'margin-bottom': '24px'
        }}>
          <div style={{
            background: 'var(--white)',
            padding: '24px',
            'border-radius': 'var(--radius-md)',
            'box-shadow': 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '20px' }}>
              <h2 style={{ margin: 0 }}>核销记录详情</h2>
              <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
                <StatusBadge status={record()!.status} size="large" />
                <Show
                  when={!editMode()}
                  fallback={
                    <>
                      <button onClick={cancelEditing} style={{ padding: '8px 16px', background: '#f5f5f5', border: '1px solid var(--border-color)', 'border-radius': '4px' }}>取消</button>
                      <button onClick={saveChanges} style={{ padding: '8px 16px', background: '#52c41a', color: '#fff', border: 'none', 'border-radius': '4px' }}>保存</button>
                    </>
                  }
                >
                  <button onClick={startEditing} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: '#fff', border: 'none', 'border-radius': '4px' }}>编辑</button>
                </Show>
              </div>
            </div>

            <div class="detail-grid" style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>记录编号</label>
                <Show
                  when={!editMode()}
                  fallback={<input type="text" value={editedData().recordCode || ''} onChange={(event) => handleFieldChange('recordCode', event.currentTarget.value)} style={{ width: '100%' }} />}
                >
                  <strong>{record()!.recordCode}</strong>
                </Show>
              </div>

              <div>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>关联券码</label>
                <span>{relatedCoupon()?.couponCode || '未找到'}</span>
              </div>

              <div>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>闸机</label>
                <span>{relatedGate()?.gateCode || '未找到'} - {relatedGate()?.location || ''}</span>
              </div>

              <div>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>核销时间</label>
                <Show
                  when={!editMode()}
                  fallback={<input type="datetime-local" value={editedData().verificationTime?.slice(0, 16) || ''} onChange={(event) => handleFieldChange('verificationTime', event.currentTarget.value)} style={{ width: '100%' }} />}
                >
                  {record()!.verificationTime}
                </Show>
              </div>

              <div>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>核销方式</label>
                <Show
                  when={!editMode()}
                  fallback={
                    <select value={editedData().verificationMethod || ''} onChange={(event) => handleFieldChange('verificationMethod', event.currentTarget.value as VerificationRecord['verificationMethod'])} style={{ width: '100%' }}>
                      <option value="online">在线</option>
                      <option value="offline">离线</option>
                    </select>
                  }
                >
                  <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
                    <StatusBadge status={record()!.verificationMethod === 'online' ? 'confirmed' : 'pending_supplement'} size="small" />
                    <span>{record()!.verificationMethod === 'online' ? '在线' : '离线'}</span>
                  </div>
                </Show>
              </div>

              <div>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>操作人</label>
                <Show
                  when={!editMode()}
                  fallback={<input type="text" value={editedData().operatorName || ''} onChange={(event) => handleFieldChange('operatorName', event.currentTarget.value)} style={{ width: '100%' }} />}
                >
                  {record()!.operatorName}
                </Show>
              </div>

              <div>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>是否成功</label>
                <span style={{
                  padding: '4px 12px',
                  'border-radius': '4px',
                  background: record()!.isSuccess ? '#f6ffed' : '#fff2f0',
                  color: record()!.isSuccess ? '#52c41a' : '#f5222d',
                  'font-weight': 500
                }}>
                  {record()!.isSuccess ? '✓ 成功' : '✗ 失败'}
                </span>
              </div>

              <Show when={!record()!.isSuccess}>
                <div style={{ 'grid-column': '1 / -1' }}>
                  <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>失败原因</label>
                  <Show
                    when={!editMode()}
                    fallback={<textarea value={editedData().failReason || ''} onChange={(event) => handleFieldChange('failReason', event.currentTarget.value)} rows={3} style={{ width: '100%' }} />}
                  >
                    <span style={{ color: '#f5222d' }}>{record()!.failReason}</span>
                  </Show>
                </div>
              </Show>

              <div style={{ 'grid-column': '1 / -1' }}>
                <label style={{ display: 'block', 'margin-bottom': '6px', color: 'var(--text-secondary)', 'font-weight': 500 }}>备注</label>
                <Show
                  when={!editMode()}
                  fallback={<textarea value={editedData().remark || ''} onChange={(event) => handleFieldChange('remark', event.currentTarget.value)} rows={3} style={{ width: '100%' }} />}
                >
                  {record()!.remark || '-'}
                </Show>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '20px' }}>
            <EvidenceTimeline items={timelineItems()} title="处理时间线" />

            <Show when={consistencyCheck()}>
              <div style={{
                background: consistencyCheck()!.isConsistent ? '#f6ffed' : '#fffbe6',
                padding: '16px',
                'border-radius': 'var(--radius-md)',
                border: `1px solid ${consistencyCheck()!.isConsistent ? '#b7eb8f' : '#ffe58f'}`
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  color: consistencyCheck()!.isConsistent ? '#52c41a' : '#faad14'
                }}>
                  {consistencyCheck()!.isConsistent ? '✓ 数据一致性检查通过' : '⚠ 数据一致性检查异常'}
                </h4>

                <Show when={!consistencyCheck()!.isConsistent}>
                  <ul style={{ margin: 0, 'padding-left': '20px', 'font-size': '13px', color: 'var(--text-secondary)' }}>
                    <For each={consistencyCheck()!.issues}>
                      {(issue) => <li>{issue}</li>}
                    </For>
                  </ul>

                  <div style={{
                    'margin-top': '12px',
                    padding: '10px',
                    background: 'var(--white)',
                    'border-radius': '4px',
                    'font-size': '13px',
                    color: 'var(--text-primary)'
                  }}>
                    💡 建议：{consistencyCheck()!.suggestion}
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </div>

        <Show when={showDiff()}>
          <DiffViewer
            oldData={record()!}
            newData={editedData() as Record<string, any>}
            title="变更预览"
          />

          <div style={{
            'margin-top': '16px',
            display: 'flex',
            gap: '12px',
            'justify-content': 'flex-end'
          }}>
            <button
              onClick={() => setShowDiff(false)}
              style={{ padding: '8px 20px', background: '#f5f5f5', border: '1px solid var(--border-color)', 'border-radius': '4px' }}
            >
              返回编辑
            </button>
            <button
              onClick={confirmSave}
              style={{ padding: '8px 20px', background: '#52c41a', color: '#fff', border: 'none', 'border-radius': '4px' }}
            >
              确认保存
            </button>
          </div>
        </Show>
      </Show>
    </div>
  )
}

export default RecordDetail
