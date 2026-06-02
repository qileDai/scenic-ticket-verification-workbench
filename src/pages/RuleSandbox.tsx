import type { Component } from 'solid-js'
import { createSignal, For, Show, createMemo } from 'solid-js'
import RuleBuilder from '../components/RuleBuilder'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import { state } from '../stores'
import type { VisitorCredential } from '../types'

const RuleSandbox: Component = () => {
  const [selectedCredential, setSelectedCredential] = createSignal<VisitorCredential | null>(null)
  const [testResults, setTestResults] = createSignal<any[]>([])
  const [showResults, setShowResults] = createSignal(false)

  const credentials = () => state.credentials

  const metrics = () => [
    {
      label: '凭证总数',
      value: credentials().length,
      unit: '个'
    },
    {
      label: '有效凭证',
      value: credentials().filter(c => c.isValid).length,
      unit: '个'
    },
    {
      label: '已核销',
      value: credentials().filter(c => c.verificationCount > 0).length,
      unit: '个'
    },
    {
      label: '异常凭证',
      value: credentials().filter(c => !c.isValid).length,
      unit: '个'
    }
  ]

  const credentialTypeLabels: Record<string, string> = {
    id_card: '身份证',
    passport: '护照',
    ticket_qr: '门票二维码',
    order_number: '订单号'
  }

  const handleRuleTest = (rule: any) => {
    const matchingCredentials = credentials().filter(credential => {
      return rule.conditions.every((condition: any) => {
        const fieldValue = (credential as any)[condition.field]
        
        switch (condition.operator) {
          case 'equals':
            return String(fieldValue) === condition.value
          case 'notEquals':
            return String(fieldValue) !== condition.value
          case 'contains':
            return String(fieldValue).toLowerCase().includes(condition.value.toLowerCase())
          case 'greaterThan':
            return Number(fieldValue) > Number(condition.value)
          case 'lessThan':
            return Number(fieldValue) < Number(condition.value)
          default:
            return true
        }
      })
    })

    const results = matchingCredentials.map(credential => ({
      credential,
      matchedConditions: rule.conditions.map((condition: any) => ({
        condition,
        fieldValue: (credential as any)[condition.field],
        isMatch: (() => {
          const fieldValue = (credential as any)[condition.field]
          switch (condition.operator) {
            case 'equals': return String(fieldValue) === condition.value
            case 'notEquals': return String(fieldValue) !== condition.value
            case 'contains': return String(fieldValue).includes(condition.value)
            case 'greaterThan': return Number(fieldValue) > Number(condition.value)
            case 'lessThan': return Number(fieldValue) < Number(condition.value)
            default: return true
          }
        })()
      })),
      actions: rule.actions
    }))

    setTestResults(results)
    setShowResults(true)
  }

  const selectForDetail = (credential: VisitorCredential) => {
    setSelectedCredential(credential)
  }

  return (
    <div class="rule-sandbox">
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
        'grid-template-columns': '1fr 400px',
        gap: '20px',
        'margin-bottom': '24px'
      }}>
        <RuleBuilder onTest={handleRuleTest} />

        <Show when={selectedCredential()} fallback={
          <div style={{
            background: 'var(--white)',
            padding: '20px',
            'border-radius': 'var(--radius-md)',
            'box-shadow': 'var(--shadow-sm)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'min-height': '300px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ 'text-align': 'center' }}>
              <div style={{ 'font-size': '48px', 'margin-bottom': '12px' }}>👤</div>
              <p>选择一个凭证查看详情</p>
            </div>
          </div>
        }>
          <div style={{
            background: 'var(--white)',
            padding: '20px',
            'border-radius': 'var(--radius-md)',
            'box-shadow': 'var(--shadow-sm)'
          }}>
            <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>凭证详情</h3>
            
            <div style={{ 'margin-bottom': '12px' }}>
              <strong>凭证编号：</strong> {selectedCredential()!.credentialCode}
            </div>
            
            <div style={{ 'margin-bottom': '12px' }}>
              <strong>类型：</strong> {credentialTypeLabels[selectedCredential()!.credentialType]}
            </div>
            
            <div style={{ 'margin-bottom': '12px' }}>
              <strong>凭证号码：</strong> {selectedCredential()!.credentialNumber}
            </div>
            
            <div style={{ 'margin-bottom': '12px' }}>
              <strong>游客姓名：</strong> {selectedCredential()!.visitorName}
            </div>

            <Show when={selectedCredential()!.phone}>
              <div style={{ 'margin-bottom': '12px' }}>
                <strong>联系电话：</strong> {selectedCredential()!.phone}
              </div>
            </Show>
            
            <div style={{ 'margin-bottom': '12px' }}>
              <strong>入园日期：</strong> {selectedCredential()!.visitDate}
            </div>
            
            <div style={{ 'margin-bottom': '12px' }}>
              <strong>有效性：</strong>
              <StatusBadge status={selectedCredential()!.isValid ? 'confirmed' : 'rejected'} />
            </div>
            
            <div style={{ 'margin-bottom': '12px' }}>
              <strong>核销次数：</strong> {selectedCredential()!.verificationCount}
            </div>

            <Show when={selectedCredential()!.lastVerificationTime}>
              <div style={{ 'margin-bottom': '12px' }}>
                <strong>最后核销时间：</strong> {selectedCredential()!.lastVerificationTime}
              </div>
            </Show>

            <div style={{
              'margin-top': '16px',
              padding: '12px',
              background: '#f6f8fa',
              'border-radius': '4px',
              'font-size': '13px'
            }}>
              <strong>状态：</strong> <StatusBadge status={selectedCredential()!.status} />
            </div>
          </div>
        </Show>
      </div>

      <Show when={showResults() && testResults().length > 0}>
        <div style={{
          background: 'var(--white)',
          padding: '20px',
          'border-radius': 'var(--radius-md)',
          'box-shadow': 'var(--shadow-sm)',
          'margin-bottom': '24px'
        }}>
          <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>
            ✓ 规则测试结果：匹配 {testResults().length} 个凭证
          </h3>

          <div style={{ overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>凭证</th>
                  <th>姓名</th>
                  <th>类型</th>
                  <th>有效性</th>
                  <th>匹配条件</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <For each={testResults()}>
                  {(result) => (
                    <tr style={{ cursor: 'pointer' }} onClick={() => selectForDetail(result.credential)}>
                      <td><strong>{result.credential.credentialCode}</strong></td>
                      <td>{result.credential.visitorName}</td>
                      <td>{credentialTypeLabels[result.credential.credentialType]}</td>
                      <td><StatusBadge status={result.credential.isValid ? 'confirmed' : 'rejected'} size="small" /></td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f6ffed',
                          color: '#52c41a',
                          'border-radius': '4px',
                          'font-size': '13px'
                        }}>
                          {result.matchedConditions.filter((c: any) => c.isMatch).length}/{result.matchedConditions.length} 条条件匹配
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            selectForDetail(result.credential)
                          }}
                          style={{
                            padding: '4px 12px',
                            background: '#f0f0f0',
                            border: 'none',
                            'border-radius': '4px',
                            cursor: 'pointer'
                          }}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      <div style={{
        background: 'var(--white)',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <h3 style={{ padding: '20px 20px 0', color: 'var(--text-primary)', margin: 0 }}>所有凭证列表</h3>
        
        <table>
          <thead>
            <tr>
              <th>凭证编号</th>
              <th>姓名</th>
              <th>类型</th>
              <th>凭证号码</th>
              <th>有效性</th>
              <th>核销次数</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <For each={credentials()}>
              {(credential) => (
                <tr>
                  <td><strong>{credential.credentialCode}</strong></td>
                  <td>{credential.visitorName}</td>
                  <td>{credentialTypeLabels[credential.credentialType]}</td>
                  <td>{credential.credentialNumber.slice(0, 10)}...</td>
                  <td><StatusBadge status={credential.isValid ? 'confirmed' : 'rejected'} size="small" /></td>
                  <td>{credential.verificationCount}</td>
                  <td><StatusBadge status={credential.status} size="small" /></td>
                  <td>
                    <button
                      onClick={() => selectForDetail(credential)}
                      style={{
                        padding: '4px 12px',
                        background: '#f0f0f0',
                        border: 'none',
                        'border-radius': '4px',
                        cursor: 'pointer'
                      }}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RuleSandbox
