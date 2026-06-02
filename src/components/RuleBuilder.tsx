import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

interface RuleCondition {
  id: string
  field: string
  operator: string
  value: string
}

interface RuleAction {
  type: string
  params: Record<string, any>
}

interface RuleBuilderProps {
  conditions?: RuleCondition[]
  actions?: RuleAction[]
  onChange?: (conditions: RuleCondition[], actions: RuleAction[]) => void
  onTest?: (rule: { conditions: RuleCondition[]; actions: RuleAction[] }) => void
}

const FIELD_OPTIONS = [
  { value: 'status', label: '状态' },
  { value: 'verificationMethod', label: '核销方式' },
  { value: 'isSuccess', label: '是否成功' },
  { value: 'isOnline', label: '闸机在线' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'owner', label: '负责人' }
]

const OPERATOR_OPTIONS = [
  { value: 'equals', label: '等于' },
  { value: 'notEquals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'greaterThan', label: '大于' },
  { value: 'lessThan', label: '小于' },
  { value: 'in', label: '在列表中' }
]

const ACTION_TYPE_OPTIONS = [
  { value: 'alert', label: '发出警告' },
  { value: 'block', label: '阻止操作' },
  { value: 'autoApprove', label: '自动审批' },
  { value: 'addToQueue', label: '加入异常队列' },
  { value: 'notify', label: '发送通知' }
]

const RuleBuilder: Component<RuleBuilderProps> = (props) => {
  const [conditions, setConditions] = createSignal<RuleCondition[]>(props.conditions || [])
  const [actions, setActions] = createSignal<RuleAction[]>(props.actions || [])
  const [testResult, setTestResult] = createSignal<string | null>(null)

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: Date.now().toString(),
      field: '',
      operator: '',
      value: ''
    }
    setConditions([...conditions(), newCondition])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions().filter(c => c.id !== id))
  }

  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    setConditions(conditions().map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const addAction = () => {
    const newAction: RuleAction = {
      type: '',
      params: {}
    }
    setActions([...actions(), newAction])
  }

  const removeAction = (index: number) => {
    setActions(actions().filter((_, i) => i !== index))
  }

  const updateAction = (index: number, updates: Partial<RuleAction>) => {
    setActions(actions().map((a, i) => i === index ? { ...a, ...updates } : a))
  }

  const handleTest = () => {
    if (props.onTest) {
      props.onTest({ conditions: conditions(), actions: actions() })
      setTestResult('规则测试已触发，请查看预览结果')
      setTimeout(() => setTestResult(null), 3000)
    }
  }

  return (
    <div class="rule-builder" style={{
      background: 'var(--white)',
      padding: '20px',
      'border-radius': 'var(--radius-md)',
      'box-shadow': 'var(--shadow-sm)'
    }}>
      <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>规则配置器</h3>
      
      <div style={{ 'margin-bottom': '24px' }}>
        <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '12px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>条件（AND 关系）</strong>
          <button
            onClick={addCondition}
            style={{
              padding: '6px 12px',
              background: '#f0f0f0',
              border: '1px dashed var(--border-color)',
              'border-radius': 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            + 添加条件
          </button>
        </div>

        <For each={conditions()}>
          {(condition, index) => (
            <div style={{
              display: 'flex',
              gap: '8px',
              'margin-bottom': '8px',
              'align-items': 'center',
              padding: '12px',
              background: '#fafafa',
              'border-radius': 'var(--radius-sm)'
            }}>
              <select
                value={condition.field}
                onChange={(e) => updateCondition(condition.id, { field: e.currentTarget.value })}
                style={{ flex: 2 }}
              >
                <option value="">选择字段</option>
                <For each={FIELD_OPTIONS}>
                  {(opt) => <option value={opt.value}>{opt.label}</option>}
                </For>
              </select>

              <select
                value={condition.operator}
                onChange={(e) => updateCondition(condition.id, { operator: e.currentTarget.value })}
                style={{ flex: 1 }}
              >
                <option value="">选择操作符</option>
                <For each={OPERATOR_OPTIONS}>
                  {(opt) => <option value={opt.value}>{opt.label}</option>}
                </For>
              </select>

              <input
                type="text"
                value={condition.value}
                onInput={(e) => updateCondition(condition.id, { value: e.currentTarget.value })}
                placeholder="输入值"
                style={{ flex: 2 }}
              />

              <button
                onClick={() => removeCondition(condition.id)}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  color: 'var(--error-color)',
                  border: 'none',
                  cursor: 'pointer',
                  'font-size': '16px'
                }}
              >
                ×
              </button>
            </div>
          )}
        </For>
      </div>

      <div style={{ 'margin-bottom': '24px' }}>
        <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '12px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>执行动作</strong>
          <button
            onClick={addAction}
            style={{
              padding: '6px 12px',
              background: '#f0f0f0',
              border: '1px dashed var(--border-color)',
              'border-radius': 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            + 添加动作
          </button>
        </div>

        <For each={actions()}>
          {(action, index) => (
            <div style={{
              display: 'flex',
              gap: '8px',
              'margin-bottom': '8px',
              'align-items': 'center',
              padding: '12px',
              background: '#fafafa',
              'border-radius': 'var(--radius-sm)'
            }}>
              <select
                value={action.type}
                onChange={(e) => updateAction(index(), { type: e.currentTarget.value })}
                style={{ flex: 2 }}
              >
                <option value="">选择动作类型</option>
                <For each={ACTION_TYPE_OPTIONS}>
                  {(opt) => <option value={opt.value}>{opt.label}</option>}
                </For>
              </select>

              <input
                type="text"
                placeholder="参数（可选）"
                style={{ flex: 3 }}
              />

              <button
                onClick={() => removeAction(index())}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  color: 'var(--error-color)',
                  border: 'none',
                  cursor: 'pointer',
                  'font-size': '16px'
                }}
              >
                ×
              </button>
            </div>
          )}
        </For>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleTest}
          disabled={conditions().length === 0}
          style={{
            padding: '10px 24px',
            background: 'var(--primary-color)',
            color: 'var(--white)',
            'border-radius': 'var(--radius-sm)',
            opacity: conditions().length === 0 ? 0.5 : 1,
            cursor: conditions().length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          测试规则
        </button>

        <Show when={testResult()}>
          <span style={{
            padding: '10px 16px',
            background: '#f6ffed',
            color: '#52c41a',
            border: '1px solid #b7eb8f',
            'border-radius': 'var(--radius-sm)',
            display: 'flex',
            'align-items': 'center'
          }}>
            ✓ {testResult()}
          </span>
        </Show>
      </div>
    </div>
  )
}

export default RuleBuilder
