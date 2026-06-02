import { createStore } from 'solid-js/store'
import type { GroupBuyCoupon, VerificationRecord, EntranceGate, ExceptionReason, SupplementApplication, VisitorCredential, ReconciliationBatch, StatusTransitionRecord, RuleConfig, ExceptionEvent, FilterCriteria, ImportPreview, RecentOperation, EntityStatus } from '../types'
import { mockApiService } from '../services/storage'

interface AppState {
  coupons: GroupBuyCoupon[]
  records: VerificationRecord[]
  gates: EntranceGate[]
  exceptions: ExceptionReason[]
  applications: SupplementApplication[]
  credentials: VisitorCredential[]
  batches: ReconciliationBatch[]
  transitions: StatusTransitionRecord[]
  rules: RuleConfig[]
  events: ExceptionEvent[]
  
  filterCriteria: FilterCriteria
  selectedIds: string[]
  
  importPreview: ImportPreview | null
  
  recentOperations: RecentOperation[]
  
  isLoading: boolean
  error: string | null
  
  commandPaletteOpen: boolean
  shortcutHelpOpen: boolean
}

const initialState: AppState = {
  coupons: [],
  records: [],
  gates: [],
  exceptions: [],
  applications: [],
  credentials: [],
  batches: [],
  transitions: [],
  rules: [],
  events: [],
  
  filterCriteria: {},
  selectedIds: [],
  
  importPreview: null,
  
  recentOperations: [],
  
  isLoading: false,
  error: null,
  
  commandPaletteOpen: false,
  shortcutHelpOpen: false
}

export const [state, setState] = createStore<AppState>(initialState)

export async function loadData() {
  setState('isLoading', true)
  try {
    const [
      coupons,
      records,
      gates,
      exceptions,
      applications,
      credentials,
      batches,
      transitions,
      rules,
      events
    ] = await Promise.all([
      mockApiService.getCoupons(),
      mockApiService.getRecords(),
      mockApiService.getGates(),
      mockApiService.getExceptions(),
      mockApiService.getApplications(),
      mockApiService.getCredentials(),
      mockApiService.getBatches(),
      mockApiService.getStatusTransitions(),
      mockApiService.getRules(),
      mockApiService.getEvents()
    ])
    
    setState({
      coupons,
      records,
      gates,
      exceptions,
      applications,
      credentials,
      batches,
      transitions,
      rules,
      events,
      isLoading: false,
      error: null
    })
  } catch (error) {
    setState('isLoading', false)
    setState('error', '数据加载失败')
  }
}

export async function addCoupon(coupon: GroupBuyCoupon) {
  const newCoupon = await mockApiService.createCoupon(coupon)
  setState('coupons', [...state.coupons, newCoupon])
  addRecentOperation('create', `创建团购券码 ${coupon.couponCode}`, coupon.id)
}

export async function updateCoupon(id: string, data: Partial<GroupBuyCoupon>) {
  const updated = await mockApiService.updateCoupon(id, data)
  if (updated) {
    setState('coupons', state.coupons.map(c => c.id === id ? updated : c))
    addRecentOperation('update', `更新团购券码 ${updated.couponCode}`, id)
  }
}

export async function deleteCoupon(id: string) {
  await mockApiService.deleteCoupon(id)
  setState('coupons', state.coupons.filter(c => c.id !== id))
  addRecentOperation('delete', `删除团购券码`, id)
}

export async function batchUpdateCoupons(updates: Array<{ id: string; data: Partial<GroupBuyCoupon> }>) {
  const updated = await mockApiService.batchUpdate('coupons', updates)
  setState('coupons', state.coupons.map(c => {
    const update = updated.find((u: any) => u.id === c.id)
    return update || c
  }))
  addRecentOperation('batch_update', `批量更新 ${updates.length} 条团购券码`)
}

export async function addRecord(record: VerificationRecord) {
  const newRecord = await mockApiService.createRecord(record)
  setState('records', [...state.records, newRecord])
  addRecentOperation('create', `创建核销记录 ${record.recordCode}`, record.id)
}

export async function updateRecord(id: string, data: Partial<VerificationRecord>) {
  const updated = await mockApiService.updateRecord(id, data)
  if (updated) {
    setState('records', state.records.map(r => r.id === id ? updated : r))
    addRecentOperation('update', `更新核销记录 ${updated.recordCode}`, id)
  }
}

export async function addGate(gate: EntranceGate) {
  const newGate = await mockApiService.createGate(gate)
  setState('gates', [...state.gates, newGate])
  addRecentOperation('create', `创建入园闸机 ${gate.gateCode}`, gate.id)
}

export async function updateGate(id: string, data: Partial<EntranceGate>) {
  const updated = await mockApiService.updateGate(id, data)
  if (updated) {
    setState('gates', state.gates.map(g => g.id === id ? updated : g))
    addRecentOperation('update', `更新入园闸机 ${updated.gateCode}`, id)
  }
}

export async function addException(exception: ExceptionReason) {
  const newException = await mockApiService.createException(exception)
  setState('exceptions', [...state.exceptions, newException])
  addRecentOperation('create', `创建异常记录 ${exception.code}`)
}

export async function updateException(id: string, data: Partial<ExceptionReason>) {
  const updated = await mockApiService.updateException(id, data)
  if (updated) {
    setState('exceptions', state.exceptions.map(e => e.id === id ? updated : e))
    addRecentOperation('update', `更新异常记录 ${updated.code}`)
  }
}

export async function addApplication(application: SupplementApplication) {
  const newApplication = await mockApiService.createApplication(application)
  setState('applications', [...state.applications, newApplication])
  addRecentOperation('create', `创建补录申请 ${application.applicationCode}`)
}

export async function updateApplication(id: string, data: Partial<SupplementApplication>) {
  const updated = await mockApiService.updateApplication(id, data)
  if (updated) {
    setState('applications', state.applications.map(a => a.id === id ? updated : a))
    addRecentOperation('update', `更新补录申请 ${updated.applicationCode}`)
  }
}

export async function addCredential(credential: VisitorCredential) {
  const newCredential = await mockApiService.createCredential(credential)
  setState('credentials', [...state.credentials, newCredential])
  addRecentOperation('create', `创建游客凭证 ${credential.credentialCode}`)
}

export async function updateCredential(id: string, data: Partial<VisitorCredential>) {
  const updated = await mockApiService.updateCredential(id, data)
  if (updated) {
    setState('credentials', state.credentials.map(c => c.id === id ? updated : c))
    addRecentOperation('update', `更新游客凭证 ${updated.credentialCode}`)
  }
}

export async function addBatch(batch: ReconciliationBatch) {
  const newBatch = await mockApiService.createBatch(batch)
  setState('batches', [...state.batches, newBatch])
  addRecentOperation('create', `创建对账批次 ${batch.batchCode}`)
}

export async function updateBatch(id: string, data: Partial<ReconciliationBatch>) {
  const updated = await mockApiService.updateBatch(id, data)
  if (updated) {
    setState('batches', state.batches.map(b => b.id === id ? updated : b))
    addRecentOperation('update', `更新对账批次 ${updated.batchCode}`)
  }
}

export async function addTransition(transition: StatusTransitionRecord) {
  const newTransition = await mockApiService.createTransition(transition)
  setState('transitions', [...state.transitions, newTransition])
}

export async function addRule(rule: RuleConfig) {
  const newRule = await mockApiService.createRule(rule)
  setState('rules', [...state.rules, newRule])
  addRecentOperation('create', `创建规则配置 ${rule.ruleCode}`)
}

export async function updateRule(id: string, data: Partial<RuleConfig>) {
  const updated = await mockApiService.updateRule(id, data)
  if (updated) {
    setState('rules', state.rules.map(r => r.id === id ? updated : r))
    addRecentOperation('update', `更新规则配置 ${updated.ruleCode}`)
  }
}

export async function addEvent(event: ExceptionEvent) {
  const newEvent = await mockApiService.createEvent(event)
  setState('events', [...state.events, newEvent])
}

export function setFilterCriteria(criteria: FilterCriteria) {
  setState('filterCriteria', criteria)
}

export function setSelectedIds(ids: string[]) {
  setState('selectedIds', ids)
}

export function toggleSelection(id: string) {
  const currentIds = state.selectedIds
  if (currentIds.includes(id)) {
    setState('selectedIds', currentIds.filter(i => i !== id))
  } else {
    setState('selectedIds', [...currentIds, id])
  }
}

export function clearSelection() {
  setState('selectedIds', [])
}

export function setImportPreview(preview: ImportPreview | null) {
  setState('importPreview', preview)
}

function addRecentOperation(type: string, description: string, entityId?: string) {
  const operation: RecentOperation = {
    id: Date.now().toString(),
    type,
    description,
    timestamp: new Date().toISOString(),
    entityId
  }
  setState('recentOperations', [operation, ...state.recentOperations].slice(0, 50))
}

export function setCommandPaletteOpen(open: boolean) {
  setState('commandPaletteOpen', open)
}

export function setShortcutHelpOpen(open: boolean) {
  setState('shortcutHelpOpen', open)
}

export async function exportAllData() {
  return await mockApiService.exportData()
}

export async function importData(data: Record<string, any[]>) {
  await mockApiService.importData(data)
  await loadData()
}

export async function resetAllData() {
  await mockApiService.resetAllData()
  setState(initialState)
}

export function getFilteredCoupons(): GroupBuyCoupon[] {
  let filtered = [...state.coupons]
  const criteria = state.filterCriteria
  
  if (criteria.status && criteria.status.length > 0) {
    filtered = filtered.filter(c => criteria.status!.includes(c.status))
  }
  
  if (criteria.dateRange) {
    const [start, end] = criteria.dateRange
    filtered = filtered.filter(c => c.createdAt >= start && c.createdAt <= end)
  }
  
  if (criteria.keyword) {
    const keyword = criteria.keyword.toLowerCase()
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(keyword) ||
      c.code.toLowerCase().includes(keyword) ||
      (c as any).couponCode?.toLowerCase().includes(keyword)
    )
  }
  
  if (criteria.owner) {
    filtered = filtered.filter(c => c.owner === criteria.owner)
  }
  
  if (criteria.batchId) {
    filtered = filtered.filter(c => c.batchId === criteria.batchId)
  }
  
  return filtered
}

export function getFilteredRecords(): VerificationRecord[] {
  let filtered = [...state.records]
  const criteria = state.filterCriteria
  
  if (criteria.status && criteria.status.length > 0) {
    filtered = filtered.filter(r => criteria.status!.includes(r.status))
  }
  
  if (criteria.keyword) {
    const keyword = criteria.keyword.toLowerCase()
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(keyword) ||
      r.code.toLowerCase().includes(keyword) ||
      (r as any).recordCode?.toLowerCase().includes(keyword)
    )
  }
  
  return filtered
}
