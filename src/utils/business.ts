import type { GroupBuyCoupon, VerificationRecord, EntranceGate, VisitorCredential, ReconciliationBatch, EntityStatus } from '../types'

export const STATUS_TRANSITIONS: Record<EntityStatus, EntityStatus[]> = {
  draft: ['pending_review', 'archived'],
  pending_review: ['pending_supplement', 'confirmed', 'rejected'],
  pending_supplement: ['pending_review', 'confirmed', 'rejected'],
  confirmed: ['archived'],
  archived: [],
  rejected: ['draft']
}

export const STATUS_LABELS: Record<EntityStatus, string> = {
  draft: '草稿',
  pending_review: '待复核',
  pending_supplement: '待补充',
  confirmed: '已确认',
  archived: '已归档',
  rejected: '已驳回'
}

export const STATUS_COLORS: Record<EntityStatus, string> = {
  draft: '#bfbfbf',
  pending_review: '#1890ff',
  pending_supplement: '#faad14',
  confirmed: '#52c41a',
  archived: '#8c8c8c',
  rejected: '#f5222d'
}

export function canTransition(fromStatus: EntityStatus, toStatus: EntityStatus): boolean {
  return STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) || false
}

export function getNextPossibleStatuses(currentStatus: EntityStatus): EntityStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function calculateVerificationSuccessRate(records: VerificationRecord[]): number {
  if (records.length === 0) return 0
  const successCount = records.filter(r => r.isSuccess).length
  return (successCount / records.length) * 100
}

export function calculateDuplicateRate(coupons: GroupBuyCoupon[], records: VerificationRecord[]): number {
  if (records.length === 0) return 0
  const couponIdCounts = new Map<string, number>()
  
  records.forEach(record => {
    couponIdCounts.set(record.couponId, (couponIdCounts.get(record.couponId) || 0) + 1)
  })
  
  let duplicateCount = 0
  couponIdCounts.forEach(count => {
    if (count > 1) duplicateCount++
  })
  
  return (duplicateCount / coupons.length) * 100
}

export function calculateExceptionSupplementRate(applications: any[], totalRecords: number): number {
  if (totalRecords === 0) return 0
  return (applications.length / totalRecords) * 100
}

export function checkCouponConsistency(
  coupon: GroupBuyCoupon,
  record?: VerificationRecord,
  gate?: EntranceGate,
  credential?: VisitorCredential
): { isConsistent: boolean; issues: string[]; suggestion: string } {
  const issues: string[] = []
  const referenceTime = record?.verificationTime || credential?.visitDate || new Date().toISOString()
  const isExpired = new Date(coupon.validTo) < new Date(referenceTime)
  
  if (!record) {
    issues.push('缺少核销记录')
  }
  
  if (!gate) {
    issues.push('缺少闸机信息')
  }
  
  if (!credential) {
    issues.push('缺少游客凭证')
  }
  
  if (isExpired) {
    issues.push('券码已过期')
  }
  
  if (coupon.usedAt && record && new Date(coupon.usedAt) > new Date(record.verificationTime)) {
    issues.push('使用时间与核销时间不一致')
  }
  
  if (gate && !gate.isOnline && record?.verificationMethod === 'online') {
    issues.push('闸机离线但记录为在线核销')
  }
  
  if (issues.length === 0) {
    return { isConsistent: true, issues: [], suggestion: '数据一致，可以正常处理' }
  }
  
  let suggestion = ''
  if (issues.includes('缺少核销记录') || issues.includes('缺少闸机信息') || issues.includes('缺少游客凭证')) {
    suggestion = '建议保存为草稿，补充完整信息后再处理'
  } else if (issues.includes('券码已过期')) {
    suggestion = '券码已过期，需要特殊审批或补录申请'
  } else {
    suggestion = '存在数据异常，需要人工复核'
  }
  
  return { isConsistent: false, issues, suggestion }
}

export function detectDuplicateVerification(records: VerificationRecord[]): Array<{
  couponId: string
  count: number
  firstTime: string
  lastTime: string
}> {
  const couponRecords = new Map<string, VerificationRecord[]>()
  
  records.forEach(record => {
    const existing = couponRecords.get(record.couponId) || []
    existing.push(record)
    couponRecords.set(record.couponId, existing)
  })
  
  const duplicates: Array<{
    couponId: string
    count: number
    firstTime: string
    lastTime: string
  }> = []
  
  couponRecords.forEach((records, couponId) => {
    if (records.length > 1) {
      const sortedTimes = records.map(r => r.verificationTime).sort()
      duplicates.push({
        couponId,
        count: records.length,
        firstTime: sortedTimes[0],
        lastTime: sortedTimes[sortedTimes.length - 1]
      })
    }
  })
  
  return duplicates
}

export function aggregateMetricsByDate(
  items: any[],
  getDateFn: (item: any) => string,
  valueFn: (item: any) => number
): Array<{ date: string; value: number }> {
  const dateMap = new Map<string, number>()
  
  items.forEach(item => {
    const date = getDateFn(item)
    const value = valueFn(item)
    dateMap.set(date, (dateMap.get(date) || 0) + value)
  })
  
  return Array.from(dateMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function aggregateMetricsByBatch(
  items: any[],
  valueFn: (item: any) => number
): Array<{ batchId: string; value: number }> {
  const batchMap = new Map<string, number>()
  
  items.forEach(item => {
    const batchId = item.batchId
    const value = valueFn(item)
    batchMap.set(batchId, (batchMap.get(batchId) || 0) + value)
  })
  
  return Array.from(batchMap.entries())
    .map(([batchId, value]) => ({ batchId, value }))
}

export function aggregateMetricsByOwner(
  items: any[],
  valueFn: (item: any) => number
): Array<{ owner: string; value: number }> {
  const ownerMap = new Map<string, number>()
  
  items.forEach(item => {
    const value = valueFn(item)
    ownerMap.set(item.owner, (ownerMap.get(item.owner) || 0) + value)
  })
  
  return Array.from(ownerMap.entries())
    .map(([owner, value]) => ({ owner, value }))
}

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        const stringValue = String(value ?? '')
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${formatDate(new Date()).replace(/[: ]/g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function exportToJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${formatDate(new Date()).replace(/[: ]/g, '-')}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  
  return lines.slice(1).map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    
    values.push(current.trim().replace(/^"|"$/g, ''))
    
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    
    return obj
  })
}
