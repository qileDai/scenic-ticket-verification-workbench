import type { Component } from 'solid-js'
import { createSignal, createMemo, For, Show } from 'solid-js'
import ChartWidget from '../components/ChartWidget'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import { state } from '../stores'
import {
  calculateVerificationSuccessRate,
  calculateDuplicateRate,
  aggregateMetricsByDate,
  aggregateMetricsByBatch,
  aggregateMetricsByOwner
} from '../utils/business'
import type { VerificationRecord, GroupBuyCoupon, ChartDataPoint } from '../types'

const ChartPanel: Component = () => {
  const [selectedMetric, setSelectedMetric] = createSignal<string>('success_rate')
  const [timeRange, setTimeRange] = createSignal<string>('7d')
  const [drillDownData, setDrillDownData] = createSignal<any[]>([])

  const records = () => state.records
  const coupons = () => state.coupons

  const successRate = createMemo(() => calculateVerificationSuccessRate(records()))
  const duplicateRate = createMemo(() => calculateDuplicateRate(coupons(), records()))

  const metrics = () => [
    {
      label: '核销成功率',
      value: `${successRate().toFixed(1)}`,
      unit: '%',
      change: 2.3
    },
    {
      label: '重复核销率',
      value: `${duplicateRate().toFixed(1)}`,
      unit: '%',
      change: -1.8
    },
    {
      label: '总核销记录',
      value: records().length,
      unit: '条'
    },
    {
      label: '今日核销',
      value: records().filter(r => r.verificationTime.startsWith(new Date().toISOString().slice(0, 10))).length,
      unit: '条'
    }
  ]

  const successRateByDate = createMemo<ChartDataPoint[]>(() => {
    return aggregateMetricsByDate(
      records(),
      (r) => r.verificationTime.slice(0, 10),
      (r) => r.isSuccess ? 1 : 0
    ).map(item => ({
      time: item.date,
      value: item.value,
      category: '成功数'
    }))
  })

  const totalRecordsByDate = createMemo<ChartDataPoint[]>(() => {
    return aggregateMetricsByDate(
      records(),
      (r) => r.verificationTime.slice(0, 10),
      () => 1
    ).map(item => ({
      time: item.date,
      value: item.value,
      category: '总数'
    }))
  })

  const successRateByBatch = createMemo<ChartDataPoint[]>(() => {
    return aggregateMetricsByBatch(
      records(),
      (r) => r.isSuccess ? 1 : 0
    ).map(item => ({
      time: item.batchId.slice(0, 10),
      value: item.value,
      category: '批次成功率'
    }))
  })

  const successRateByOwner = createMemo(() => {
    return aggregateMetricsByOwner(
      records(),
      (r) => r.isSuccess ? 1 : 0
    )
  })

  const handleMetricClick = (metricLabel: string) => {
    setSelectedMetric(metricLabel)
    
    if (metricLabel === '核销成功率') {
      setDrillDownData(successRateByDate())
    } else if (metricLabel === '重复核销率') {
      setDrillDownData([])
    } else if (metricLabel === '总核销记录') {
      setDrillDownData(totalRecordsByDate())
    } else if (metricLabel === '今日核销') {
      const todayRecords = records().filter(r => 
        r.verificationTime.startsWith(new Date().toISOString().slice(0, 10))
      )
      setDrillDownData(todayRecords.map(r => ({
        time: r.verificationTime.slice(11, 16),
        value: 1,
        category: r.isSuccess ? '成功' : '失败'
      })))
    }
  }

  const getFilteredChartData = (): ChartDataPoint[] => {
    switch (selectedMetric()) {
      case 'success_rate':
        return successRateByDate()
      case 'total_records':
        return totalRecordsByDate()
      default:
        return successRateByDate()
    }
  }

  const getChartTitle = (): string => {
    switch (selectedMetric()) {
      case 'success_rate': return '核销成功率趋势（按日）'
      case 'total_records': return '核销总量趋势（按日）'
      case 'batch_rate': return '各批次核销情况'
      default: return '数据趋势图'
    }
  }

  return (
    <div class="chart-panel">
      <div style={{
        display: 'grid',
        'grid-template-columns': 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        'margin-bottom': '24px'
      }}>
        <For each={metrics()}>
          {(metric) => <MetricCard data={metric} onClick={() => handleMetricClick(metric.label)} />}
        </For>
      </div>

      <div style={{
        display: 'grid',
        'grid-template-columns': '2fr 1fr',
        gap: '20px',
        'margin-bottom': '24px'
      }}>
        <ChartWidget
          data={getFilteredChartData()}
          title={getChartTitle()}
          height={400}
          color="#1890ff"
        />

        <div style={{
          background: 'var(--white)',
          padding: '20px',
          'border-radius': 'var(--radius-md)',
          'box-shadow': 'var(--shadow-sm)'
        }}>
          <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>数据维度切换</h3>
          
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
            <button
              onClick={() => { setSelectedMetric('success_rate'); handleMetricClick('核销成功率') }}
              style={{
                padding: '12px 16px',
                background: selectedMetric() === 'success_rate' ? '#e6f7ff' : '#f5f5f5',
                border: `1px solid ${selectedMetric() === 'success_rate' ? '#91d5ff' : 'transparent'}`,
                'border-radius': 'var(--radius-sm)',
                cursor: 'pointer',
                'text-align': 'left',
                color: selectedMetric() === 'success_rate' ? 'var(--primary-color)' : 'var(--text-primary)'
              }}
            >
              📈 核销成功率趋势
            </button>

            <button
              onClick={() => { setSelectedMetric('total_records'); handleMetricClick('总核销记录') }}
              style={{
                padding: '12px 16px',
                background: selectedMetric() === 'total_records' ? '#e6f7ff' : '#f5f5f5',
                border: `1px solid ${selectedMetric() === 'total_records' ? '#91d5ff' : 'transparent'}`,
                'border-radius': 'var(--radius-sm)',
                cursor: 'pointer',
                'text-align': 'left',
                color: selectedMetric() === 'total_records' ? 'var(--primary-color)' : 'var(--text-primary)'
              }}
            >
              📊 核销总量趋势
            </button>

            <button
              onClick={() => { setSelectedMetric('batch_rate'); setDrillDownData(successRateByBatch()) }}
              style={{
                padding: '12px 16px',
                background: selectedMetric() === 'batch_rate' ? '#e6f7ff' : '#f5f5f5',
                border: `1px solid ${selectedMetric() === 'batch_rate' ? '#91d5ff' : 'transparent'}`,
                'border-radius': 'var(--radius-sm)',
                cursor: 'pointer',
                'text-align': 'left',
                color: selectedMetric() === 'batch_rate' ? 'var(--primary-color)' : 'var(--text-primary)'
              }}
            >
              📦 按批次分析
            </button>

            <button
              onClick={() => alert('显示按责任角色聚合的数据')}
              style={{
                padding: '12px 16px',
                background: '#f5f5f5',
                border: 'none',
                'border-radius': 'var(--radius-sm)',
                cursor: 'pointer',
                'text-align': 'left'
              }}
            >
              👥 按负责人分析
            </button>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', 'border-top': '1px solid var(--border-color)' }} />

          <h4 style={{ 'margin-bottom': '12px' }}>时间范围</h4>
          
          <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
            {['7d', '30d', '90d', 'all'].map(range => (
              <button
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '6px 12px',
                  background: timeRange() === range ? 'var(--primary-color)' : '#f5f5f5',
                  color: timeRange() === range ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  'border-radius': '4px',
                  cursor: 'pointer',
                  'font-size': '13px'
                }}
              >
                {{ '7d': '近7天', '30d': '近30天', '90d': '近90天', 'all': '全部' }[range]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Show when={selectedMetric() === 'batch_rate'}>
        <ChartWidget
          data={successRateByBatch()}
          title="各批次核销情况"
          height={300}
          color="#52c41a"
        />
      </Show>

      <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '20px', 'margin-top': '24px' }}>
        <div style={{
          background: 'var(--white)',
          padding: '20px',
          'border-radius': 'var(--radius-md)',
          'box-shadow': 'var(--shadow-sm)'
        }}>
          <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>按负责人统计</h3>
          
          <For each={successRateByOwner()}>
            {(item) => (
              <div style={{
                display: 'flex',
                'justify-content': 'space-between',
                'align-items': 'center',
                padding: '12px',
                'margin-bottom': '8px',
                background: '#fafafa',
                'border-radius': '4px'
              }}>
                <span>{item.owner}</span>
                <strong style={{ color: 'var(--primary-color)' }}>{item.value} 条</strong>
              </div>
            )}
          </For>
        </div>

        <div style={{
          background: 'var(--white)',
          padding: '20px',
          'border-radius': 'var(--radius-md)',
          'box-shadow': 'var(--shadow-sm)'
        }}>
          <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>最近核销记录明细</h3>
          
          <div style={{ 'max-height': '300px', overflow: 'auto' }}>
            <For each={records().slice(-10).reverse()}>
              {(record) => (
                <div style={{
                  padding: '10px',
                  'margin-bottom': '8px',
                  border: `1px solid ${record.isSuccess ? '#b7eb8f' : '#ffccc7'}`,
                  'border-radius': '4px',
                  background: record.isSuccess ? '#f6ffed' : '#fff2f0'
                }}>
                  <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
                    <strong>{record.recordCode}</strong>
                    <StatusBadge status={record.isSuccess ? 'confirmed' : 'rejected'} size="small" />
                  </div>
                  
                  <div style={{ 'font-size': '13px', color: 'var(--text-secondary)', 'margin-top': '4px' }}>
                    时间：{record.verificationTime.slice(0, 16)} | 操作人：{record.operatorName}
                  </div>

                  <Show when={!record.isSuccess}>
                    <div style={{ 'font-size': '13px', color: '#f5222d', 'margin-top': '4px' }}>
                      原因：{record.failReason}
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartPanel
