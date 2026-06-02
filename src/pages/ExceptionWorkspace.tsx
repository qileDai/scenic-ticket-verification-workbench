import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import EvidenceTimeline from '../components/EvidenceTimeline'
import RuleBuilder from '../components/RuleBuilder'
import DetailDrawer from '../components/DetailDrawer'
import { state } from '../stores'
import type { ExceptionReason, EntityStatus } from '../types'
import { checkCouponConsistency, STATUS_LABELS } from '../utils/business'

const ExceptionWorkspace: Component = () => {
  const [selectedException, setSelectedException] = createSignal<ExceptionReason | null>(null)
  const [drawerOpen, setDrawerOpen] = createSignal(false)
  const [ruleTestResult, setRuleTestResult] = createSignal<any>(null)

  const exceptions = () => state.exceptions

  const metrics = () => [
    {
      label: '异常总数',
      value: exceptions().length,
      unit: '条'
    },
    {
      label: '高优先级',
      value: exceptions().filter(e => e.severity === 'high').length,
      unit: '条'
    },
    {
      label: '待处理',
      value: exceptions().filter(e => e.status === 'pending_review' || e.status === 'pending_supplement').length,
      unit: '条'
    },
    {
      label: '今日新增',
      value: exceptions().filter(e => e.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length,
      unit: '条'
    }
  ]

  const handleRuleTest = (rule: any) => {
    const matchingExceptions = exceptions().filter(exception => {
      return rule.conditions.every((condition: any) => {
        const fieldValue = exception[condition.field as keyof ExceptionReason]
        
        switch (condition.operator) {
          case 'equals':
            return String(fieldValue) === condition.value
          case 'notEquals':
            return String(fieldValue) !== condition.value
          case 'contains':
            return String(fieldValue).includes(condition.value)
          case 'greaterThan':
            return Number(fieldValue) > Number(condition.value)
          case 'lessThan':
            return Number(fieldValue) < Number(condition.value)
          default:
            return true
        }
      })
    })

    setRuleTestResult({
      rule,
      matchedCount: matchingExceptions.length,
      totalCount: exceptions().length,
      matches: matchingExceptions.slice(0, 5),
      actions: rule.actions
    })
  }

  const openDetail = (exception: ExceptionReason) => {
    setSelectedException(exception)
    setDrawerOpen(true)
  }

  const closeDetail = () => {
    setDrawerOpen(false)
    setSelectedException(null)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#f5222d'
      case 'medium': return '#faad14'
      case 'low': return '#52c41a'
      default: return '#1890ff'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '未知'
    }
  }

  const exceptionTypeLabels: Record<string, string> = {
    duplicate_verification: '重复核销',
    gate_offline: '闸机离线',
    missing_evidence: '证据缺失',
    expired_coupon: '券码过期',
    invalid_coupon: '无效券码',
    other: '其他异常'
  }

  const timelineItems = () => selectedException() ? [
    {
      id: '1',
      time: selectedException()!.createdAt,
      title: `异常发现：${exceptionTypeLabels[selectedException()!.exceptionType] || selectedException()!.exceptionType}`,
      description: selectedException()!.description,
      type: 'error' as const
    },
    {
      id: '2',
      time: selectedException()!.createdAt,
      title: `严重级别：${getSeverityLabel(selectedException()!.severity!)}`,
      description: `影响范围评估完成，建议处理时限：${selectedException()!.deadline || '未设定'}`,
      type: selectedException()!.severity as any
    },
    ...(selectedException()!.sourceField ? [{
      id: '3',
      time: new Date(new Date(selectedException()!.createdAt).getTime() + 3600000).toISOString(),
      title: `触发字段：${selectedException()!.sourceField}`,
      description: `阈值：${selectedException()!.thresholdValue}，实际值：${selectedException()!.actualValue}`,
      type: 'warning' as const
    }] : []),
    ...(selectedException()!.handler ? [{
      id: '4',
      time: new Date().toISOString(),
      title: `处理人：${selectedException()!.handler}`,
      description: '正在处理中...',
      type: 'info' as const
    }] : [])
  ] : []

  return (
    <div class="exception-workspace">
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

      <div style={{
        display: 'grid',
        'grid-template-columns': '1fr 1fr',
        gap: '20px',
        'margin-bottom': '24px'
      }}>
        <div style={{
          background: 'var(--white)',
          padding: '20px',
          'border-radius': 'var(--radius-md)',
          'box-shadow': 'var(--shadow-sm)'
        }}>
          <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>SLA 倒计时控制台</h3>
          
          <For each={exceptions().filter(e => e.severity === 'high').slice(0, 5)}>
            {(exception) => (
              <div style={{
                padding: '12px',
                'margin-bottom': '12px',
                border: `1px solid ${getSeverityColor(exception.severity!)}30`,
                'border-radius': 'var(--radius-sm)',
                'border-left': `4px solid ${getSeverityColor(exception.severity!)}`
              }}>
                <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px' }}>
                  <strong>{exception.name}</strong>
                  <StatusBadge status={exception.status} size="small" />
                </div>
                
                <div style={{ 'font-size': '13px', color: 'var(--text-secondary)', 'margin-bottom': '6px' }}>
                  {exceptionTypeLabels[exception.exceptionType]}
                </div>

                <Show when={exception.deadline}>
                  <div style={{
                    'font-size': '12px',
                    padding: '4px 8px',
                    background: '#fff2f0',
                    color: '#f5222d',
                    'border-radius': '4px',
                    display: 'inline-block'
                  }}>
                    ⏰ 截止时间：{exception.deadline}
                  </div>
                </Show>

                <button
                  onClick={() => openDetail(exception)}
                  style={{
                    'margin-top': '8px',
                    padding: '4px 12px',
                    background: 'transparent',
                    border: '1px solid var(--primary-color)',
                    color: 'var(--primary-color)',
                    'border-radius': '4px',
                    cursor: 'pointer',
                    'font-size': '12px'
                  }}
                >
                  处理
                </button>
              </div>
            )}
          </For>
        </div>

        <EvidenceTimeline
          items={timelineItems()}
          title="异常处理时间线"
        />
      </div>

      <div style={{
        background: 'var(--white)',
        padding: '20px',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        'margin-bottom': '24px'
      }}>
        <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>分诊规则配置与测试</h3>
        
        <RuleBuilder onTest={handleRuleTest} />

        <Show when={ruleTestResult()}>
          <div style={{
            'margin-top': '20px',
            padding: '16px',
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            'border-radius': 'var(--radius-md)'
          }}>
            <h4 style={{ 'margin-bottom': '12px', color: 'var(--primary-color)' }}>
              ✓ 规则测试结果：匹配 {ruleTestResult()?.matchedCount} / {ruleTestResult()?.totalCount} 条异常
            </h4>
            
            <div style={{ 'font-size': '13px', color: 'var(--text-secondary)', 'margin-bottom': '12px' }}>
              将执行以下动作：
              <For each={ruleTestResult()?.actions || []}>
                {(action) => (
                  <span style={{
                    'margin-right': '12px',
                    padding: '2px 8px',
                    background: 'var(--white)',
                    'border-radius': '4px'
                  }}>
                    {action.type}
                  </span>
                )}
              </For>
            </div>

            <Show when={(ruleTestResult()?.matches?.length || 0) > 0}>
              <details>
                <summary style={{ cursor: 'pointer', 'font-weight': 500, color: 'var(--primary-color)' }}>
                  查看匹配的异常详情 ({ruleTestResult()?.matches.length} 条)
                </summary>
                <div style={{ 'margin-top': '8px' }}>
                  <For each={ruleTestResult()?.matches || []}>
                    {(match) => (
                      <div style={{
                        padding: '8px',
                        'margin-top': '4px',
                        background: 'var(--white)',
                        'border-radius': '4px',
                        'font-size': '13px'
                      }}>
                        • {match.name} - {match.description}
                      </div>
                    )}
                  </For>
                </div>
              </details>
            </Show>
          </div>
        </Show>
      </div>

      <div style={{
        background: 'var(--white)',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <table>
          <thead>
            <tr>
              <th>异常编号</th>
              <th>名称</th>
              <th>类型</th>
              <th>严重级别</th>
              <th>状态</th>
              <th>负责人</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <For each={exceptions()}>
              {(exception) => (
                <tr>
                  <td><strong>{exception.code}</strong></td>
                  <td>{exception.name}</td>
                  <td>{exceptionTypeLabels[exception.exceptionType] || exception.exceptionType}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      'border-radius': '4px',
                      background: `${getSeverityColor(exception.severity!)}15`,
                      color: getSeverityColor(exception.severity!),
                      'font-weight': 500
                    }}>
                      {getSeverityLabel(exception.severity!)}
                    </span>
                  </td>
                  <td><StatusBadge status={exception.status} /></td>
                  <td>{exception.owner}</td>
                  <td>{exception.createdAt.slice(0, 16)}</td>
                  <td>
                    <button
                      onClick={() => openDetail(exception)}
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
      </div>

      <DetailDrawer
        open={drawerOpen()}
        title="异常详情"
        data={selectedException() || {}}
        fields={[
          { key: 'code', label: '编号' },
          { key: 'name', label: '名称', editable: true },
          { key: 'exceptionType', label: '异常类型' },
          { key: 'severity', label: '严重级别' },
          { key: 'description', label: '描述', editable: true, type: 'textarea' },
          { key: 'status', label: '状态' },
          { key: 'owner', label: '负责人', editable: true },
          { key: 'handler', label: '处理人', editable: true },
          { key: 'deadline', label: '截止时间', editable: true },
          { key: 'remark', label: '备注', editable: true, type: 'textarea' }
        ]}
        onClose={closeDetail}
        onSave={async (data) => {
          console.log('保存异常数据:', data)
          closeDetail()
        }}
        statusOptions={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        onStatusChange={async (newStatus) => {
          if (newStatus === 'rejected') {
            const reason = prompt('请输入驳回原因：')
            if (!reason) return
            alert(`已驳回，原因：${reason}`)
          }
          closeDetail()
        }}
      />
    </div>
  )
}

export default ExceptionWorkspace
