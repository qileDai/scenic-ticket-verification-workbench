import type { Component } from 'solid-js'
import { createSignal, onMount, For, Show } from 'solid-js'
import AdvancedFilterBar from '../components/AdvancedFilterBar'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import BatchActionToolbar from '../components/BatchActionToolbar'
import DetailDrawer from '../components/DetailDrawer'
import VirtualizedList from '../components/VirtualizedList'
import { state, getFilteredCoupons, setFilterCriteria, setSelectedIds, toggleSelection, clearSelection, batchUpdateCoupons, updateCoupon } from '../stores'
import type { GroupBuyCoupon, EntityStatus, FilterCriteria } from '../types'
import { STATUS_LABELS, calculateVerificationSuccessRate, exportToCSV } from '../utils/business'

const CouponOverview: Component = () => {
  const [selectedItem, setSelectedItem] = createSignal<GroupBuyCoupon | null>(null)
  const [drawerOpen, setDrawerOpen] = createSignal(false)

  const filteredCoupons = () => getFilteredCoupons()

  const metrics = () => [
    {
      label: '总券码数',
      value: filteredCoupons().length,
      unit: '条'
    },
    {
      label: '待复核',
      value: filteredCoupons().filter(c => c.status === 'pending_review').length,
      unit: '条',
      change: -5.2
    },
    {
      label: '异常数量',
      value: filteredCoupons().filter(c => c.status === 'rejected' || c.status === 'pending_supplement').length,
      unit: '条',
      change: 12.8
    },
    {
      label: '已确认',
      value: filteredCoupons().filter(c => c.status === 'confirmed').length,
      unit: '条',
      change: 8.3
    }
  ]

  const handleFilter = (criteria: FilterCriteria) => {
    setFilterCriteria(criteria)
  }

  const openDetail = (coupon: GroupBuyCoupon) => {
    setSelectedItem(coupon)
    setDrawerOpen(true)
  }

  const closeDetail = () => {
    setDrawerOpen(false)
    setSelectedItem(null)
  }

  const handleSave = async (data: Record<string, any>) => {
    if (selectedItem()) {
      await updateCoupon(selectedItem()!.id, data as Partial<GroupBuyCoupon>)
      closeDetail()
    }
  }

  const handleBatchStatusChange = async (newStatus: EntityStatus) => {
    const updates = state.selectedIds.map(id => ({
      id,
      data: { status: newStatus, updatedAt: new Date().toISOString() } as Partial<GroupBuyCoupon>
    }))
    await batchUpdateCoupons(updates)
    clearSelection()
  }

  const handleExportSelected = () => {
    const selectedData = filteredCoupons().filter(c => state.selectedIds.includes(c.id))
    exportToCSV(selectedData, 'coupons_selected')
  }

  const fields = [
    { key: 'id', label: 'ID', editable: false },
    { key: 'code', label: '编号', editable: false },
    { key: 'name', label: '名称', editable: true },
    { key: 'couponCode', label: '券码', editable: false },
    { key: 'platform', label: '平台', editable: true, type: 'select' as const, options: [
      { value: 'meituan', label: '美团' },
      { value: 'dianping', label: '大众点评' },
      { value: 'ctrip', label: '携程' },
      { value: 'fliggy', label: '飞猪' }
    ]},
    { key: 'status', label: '状态', editable: false },
    { key: 'owner', label: '负责人', editable: true },
    { key: 'createdAt', label: '创建时间', editable: false },
    { key: 'remark', label: '备注', editable: true, type: 'textarea' as const }
  ]

  return (
    <div class="coupon-overview">
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

      <AdvancedFilterBar
        criteria={state.filterCriteria}
        onFilterChange={handleFilter}
      />

      <BatchActionToolbar
        selectedCount={state.selectedIds.length}
        totalCount={filteredCoupons().length}
        onSelectAll={() => setSelectedIds(filteredCoupons().map(c => c.id))}
        onClearSelection={() => clearSelection()}
        actions={[
          {
            label: '批量确认',
            onClick: () => handleBatchStatusChange('confirmed'),
            variant: 'primary'
          },
          {
            label: '批量驳回',
            onClick: () => handleBatchStatusChange('rejected'),
            variant: 'danger'
          },
          {
            label: '导出选中',
            onClick: handleExportSelected
          },
          {
            label: '删除',
            onClick: () => {},
            variant: 'danger'
          }
        ]}
      />

      <div style={{
        background: 'var(--white)',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={state.selectedIds.length === filteredCoupons().length && filteredCoupons().length > 0}
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      setSelectedIds(filteredCoupons().map(c => c.id))
                    } else {
                      clearSelection()
                    }
                  }}
                />
              </th>
              <th>券码编号</th>
              <th>名称</th>
              <th>平台</th>
              <th>状态</th>
              <th>负责人</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <For each={filteredCoupons()}>
              {(coupon) => (
                <tr
                  style={{ cursor: 'pointer', background: state.selectedIds.includes(coupon.id) ? '#e6f7ff' : '' }}
                  onClick={() => toggleSelection(coupon.id)}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={state.selectedIds.includes(coupon.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelection(coupon.id)
                      }}
                    />
                  </td>
                  <td><strong>{coupon.couponCode}</strong></td>
                  <td>{coupon.name}</td>
                  <td>{coupon.platform}</td>
                  <td><StatusBadge status={coupon.status} /></td>
                  <td>{coupon.owner}</td>
                  <td>{coupon.createdAt.slice(0, 16)}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openDetail(coupon)
                      }}
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

        <Show when={filteredCoupons().length === 0}>
          <div style={{
            padding: '60px',
            'text-align': 'center',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>📭</div>
            <p>暂无符合条件的券码数据</p>
          </div>
        </Show>
      </div>

      <DetailDrawer
        open={drawerOpen()}
        title="券码详情"
        data={selectedItem() || {}}
        fields={fields}
        onClose={closeDetail}
        onSave={handleSave}
        statusOptions={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        onStatusChange={async (newStatus) => {
          if (selectedItem()) {
            await updateCoupon(selectedItem()!.id, { status: newStatus as EntityStatus })
            closeDetail()
          }
        }}
      />
    </div>
  )
}

export default CouponOverview
