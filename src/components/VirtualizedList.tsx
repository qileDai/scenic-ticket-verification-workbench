import type { Component } from 'solid-js'
import { createSignal, createEffect, For, Show, onMount, onCleanup } from 'solid-js'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => any
  overscan?: number
}

function VirtualizedList<T>(props: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = createSignal(0)
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(null)

  const totalHeight = () => props.items.length * props.itemHeight
  
  const visibleRange = () => {
    const start = Math.floor(scrollTop() / props.itemHeight)
    const end = Math.min(
      props.items.length,
      start + Math.ceil(props.containerHeight / props.itemHeight) + (props.overscan || 5)
    )
    return { start: Math.max(0, start - (props.overscan || 5)), end }
  }

  const offsetY = () => visibleRange().start * props.itemHeight

  let scrollHandler: ((e: Event) => void) | undefined

  onMount(() => {
    if (containerRef()) {
      scrollHandler = (e: Event) => {
        setScrollTop((e.target as HTMLElement).scrollTop)
      }
      containerRef()?.addEventListener('scroll', scrollHandler)
    }
  })

  onCleanup(() => {
    if (containerRef() && scrollHandler) {
      containerRef()?.removeEventListener('scroll', scrollHandler)
    }
  })

  return (
    <div
      ref={setContainerRef}
      style={{
        height: `${props.containerHeight}px`,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: `${totalHeight()}px`, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: `${offsetY()}px`,
          left: 0,
          right: 0
        }}>
          <For each={props.items.slice(visibleRange().start, visibleRange().end)}>
            {(item, index) => (
              <div style={{
                height: `${props.itemHeight}px`,
                display: 'flex',
                'align-items': 'center'
              }}>
                {props.renderItem(item, visibleRange().start + index())}
              </div>
            )}
          </For>
        </div>
      </div>

      <Show when={props.items.length === 0}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--text-secondary)',
          'text-align': 'center'
        }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>📭</div>
          <p>暂无数据</p>
        </div>
      </Show>
    </div>
  )
}

export default VirtualizedList as <T>(props: VirtualizedListProps<T>) => ReturnType<Component<VirtualizedListProps<T>>>
