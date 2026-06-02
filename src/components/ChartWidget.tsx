import type { Component } from 'solid-js'
import { createSignal, createEffect, onMount, onCleanup, Show } from 'solid-js'
import { createChart, ColorType, LineData, Time, CrosshairMode } from 'lightweight-charts'
import type { ChartDataPoint } from '../types'

interface ChartWidgetProps {
  data: ChartDataPoint[]
  title?: string
  height?: number
  color?: string
}

const ChartWidget: Component<ChartWidgetProps> = (props) => {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(null)
  let chart: any = null
  let series: any = null

  const defaultColor = props.color || '#1890ff'

  onMount(() => {
    if (containerRef()) {
      chart = createChart(containerRef()!, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#595959',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: '#d9d9d9',
        },
        timeScale: {
          borderColor: '#d9d9d9',
          timeVisible: true,
        },
        width: containerRef()?.clientWidth || 800,
        height: props.height || 400,
      })

      series = chart.addLineSeries({
        color: defaultColor,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: defaultColor,
        crosshairMarkerBackgroundColor: defaultColor + '20',
        lastValueVisible: true,
        priceLineVisible: true,
        title: props.title || '',
      })

      if (props.data && props.data.length > 0) {
        const lineData: LineData[] = props.data.map(item => ({
          time: item.time as Time,
          value: item.value,
        }))
        series.setData(lineData)
        chart.timeScale().fitContent()
      }
    }
  })

  createEffect(() => {
    if (series && props.data && props.data.length > 0) {
      const lineData: LineData[] = props.data.map(item => ({
        time: item.time as Time,
        value: item.value,
      }))
      series.setData(lineData)
      
      if (chart) {
        chart.timeScale().fitContent()
      }
    }
  })

  onCleanup(() => {
    if (chart) {
      chart.remove()
    }
  })

  return (
    <div class="chart-widget" style={{
      background: 'var(--white)',
      padding: '20px',
      'border-radius': 'var(--radius-md)',
      'box-shadow': 'var(--shadow-sm)'
    }}>
      <Show when={props.title}>
        <h3 style={{ 'margin-bottom': '16px', color: 'var(--text-primary)' }}>
          {props.title}
        </h3>
      </Show>

      <div
        ref={setContainerRef}
        style={{
          width: '100%',
          height: `${props.height || 400}px`
        }}
      />

      <Show when={!props.data || props.data.length === 0}>
        <div style={{
          padding: '40px',
          'text-align': 'center',
          color: 'var(--text-secondary)'
        }}>
          暂无图表数据
        </div>
      </Show>
    </div>
  )
}

export default ChartWidget
