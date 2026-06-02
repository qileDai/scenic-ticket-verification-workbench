import type { GroupBuyCoupon, VerificationRecord, EntranceGate, ExceptionReason, SupplementApplication, VisitorCredential, ReconciliationBatch, StatusTransitionRecord, RuleConfig, ExceptionEvent } from '../types'

const STORAGE_PREFIX = 'ticket_verification_'

export class LocalStorageService {
  private getStorageKey(entity: string): string {
    return `${STORAGE_PREFIX}${entity}`
  }

  async getAll<T = any>(entity: string): Promise<T[]> {
    const data = localStorage.getItem(this.getStorageKey(entity))
    return data ? JSON.parse(data) : []
  }

  async getById<T = any>(entity: string, id: string): Promise<T | null> {
    const items = await this.getAll<T>(entity)
    return items.find((item: any) => item.id === id) || null
  }

  async create<T = any>(entity: string, item: T & { id: string }): Promise<T & { id: string }> {
    const items = await this.getAll<T & { id: string }>(entity)
    items.push(item)
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(items))
    return item
  }

  async update<T = any>(entity: string, id: string, updates: Partial<T>): Promise<(T & { id: string }) | null> {
    const items = await this.getAll<T & { id: string }>(entity)
    const index = items.findIndex((item: any) => item.id === id)
    if (index === -1) return null
    
    items[index] = { ...items[index], ...updates }
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(items))
    return items[index]
  }

  async delete(entity: string, id: string): Promise<boolean> {
    const items = await this.getAll<any>(entity)
    const filteredItems = items.filter((item: any) => item.id !== id)
    
    if (filteredItems.length === items.length) return false
    
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(filteredItems))
    return true
  }

  async batchCreate<T = any>(entity: string, items: Array<T & { id: string }>): Promise<Array<T & { id: string }>> {
    const existingItems = await this.getAll<T & { id: string }>(entity)
    const allItems = [...existingItems, ...items]
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(allItems))
    return items
  }

  async batchUpdate<T = any>(entity: string, updates: Array<{ id: string; data: Partial<T> }>): Promise<Array<T & { id: string }>> {
    const items = await this.getAll<T & { id: string }>(entity)
    const updatedItems = items.map((item: any) => {
      const update = updates.find(u => u.id === item.id)
      return update ? { ...item, ...update.data } : item
    })
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(updatedItems))
    return updatedItems.filter((item: any) => updates.some(u => u.id === item.id))
  }

  async batchDelete(entity: string, ids: string[]): Promise<boolean> {
    const items = await this.getAll<any>(entity)
    const filteredItems = items.filter((item: any) => !ids.includes(item.id))
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(filteredItems))
    return true
  }

  async clearAll(entity: string): Promise<void> {
    localStorage.removeItem(this.getStorageKey(entity))
  }

  async clearAllData(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX))
    keys.forEach(key => localStorage.removeItem(key))
  }

  exportAllData(): Record<string, any[]> {
    const data: Record<string, any[]> = {}
    const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX))
    
    keys.forEach(key => {
      const entityName = key.replace(STORAGE_PREFIX, '')
      const storedData = localStorage.getItem(key)
      if (storedData) {
        data[entityName] = JSON.parse(storedData)
      }
    })
    
    return data
  }

  importData(data: Record<string, any[]>): void {
    Object.entries(data).forEach(([entity, items]) => {
      localStorage.setItem(this.getStorageKey(entity), JSON.stringify(items))
    })
  }

  hasData(): boolean {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX))
    return keys.length > 0
  }
}

export const storageService = new LocalStorageService()

export class MockApiService {
  private storage = storageService

  async getCoupons(): Promise<GroupBuyCoupon[]> {
    return this.storage.getAll<GroupBuyCoupon>('coupons')
  }

  async getCouponById(id: string): Promise<GroupBuyCoupon | null> {
    return this.storage.getById<GroupBuyCoupon>('coupons', id)
  }

  async createCoupon(coupon: GroupBuyCoupon): Promise<GroupBuyCoupon> {
    return this.storage.create('coupons', coupon)
  }

  async updateCoupon(id: string, data: Partial<GroupBuyCoupon>): Promise<GroupBuyCoupon | null> {
    return this.storage.update('coupons', id, data)
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.storage.delete('coupons', id)
  }

  async getRecords(): Promise<VerificationRecord[]> {
    return this.storage.getAll<VerificationRecord>('records')
  }

  async getRecordById(id: string): Promise<VerificationRecord | null> {
    return this.storage.getById<VerificationRecord>('records', id)
  }

  async createRecord(record: VerificationRecord): Promise<VerificationRecord> {
    return this.storage.create('records', record)
  }

  async updateRecord(id: string, data: Partial<VerificationRecord>): Promise<VerificationRecord | null> {
    return this.storage.update('records', id, data)
  }

  async getGates(): Promise<EntranceGate[]> {
    return this.storage.getAll<EntranceGate>('gates')
  }

  async getGateById(id: string): Promise<EntranceGate | null> {
    return this.storage.getById<EntranceGate>('gates', id)
  }

  async createGate(gate: EntranceGate): Promise<EntranceGate> {
    return this.storage.create('gates', gate)
  }

  async updateGate(id: string, data: Partial<EntranceGate>): Promise<EntranceGate | null> {
    return this.storage.update('gates', id, data)
  }

  async getExceptions(): Promise<ExceptionReason[]> {
    return this.storage.getAll<ExceptionReason>('exceptions')
  }

  async createException(exception: ExceptionReason): Promise<ExceptionReason> {
    return this.storage.create('exceptions', exception)
  }

  async updateException(id: string, data: Partial<ExceptionReason>): Promise<ExceptionReason | null> {
    return this.storage.update('exceptions', id, data)
  }

  async getApplications(): Promise<SupplementApplication[]> {
    return this.storage.getAll<SupplementApplication>('applications')
  }

  async createApplication(application: SupplementApplication): Promise<SupplementApplication> {
    return this.storage.create('applications', application)
  }

  async updateApplication(id: string, data: Partial<SupplementApplication>): Promise<SupplementApplication | null> {
    return this.storage.update('applications', id, data)
  }

  async getCredentials(): Promise<VisitorCredential[]> {
    return this.storage.getAll<VisitorCredential>('credentials')
  }

  async createCredential(credential: VisitorCredential): Promise<VisitorCredential> {
    return this.storage.create('credentials', credential)
  }

  async updateCredential(id: string, data: Partial<VisitorCredential>): Promise<VisitorCredential | null> {
    return this.storage.update('credentials', id, data)
  }

  async getBatches(): Promise<ReconciliationBatch[]> {
    return this.storage.getAll<ReconciliationBatch>('batches')
  }

  async createBatch(batch: ReconciliationBatch): Promise<ReconciliationBatch> {
    return this.storage.create('batches', batch)
  }

  async updateBatch(id: string, data: Partial<ReconciliationBatch>): Promise<ReconciliationBatch | null> {
    return this.storage.update('batches', id, data)
  }

  async getStatusTransitions(): Promise<StatusTransitionRecord[]> {
    return this.storage.getAll<StatusTransitionRecord>('transitions')
  }

  async createTransition(transition: StatusTransitionRecord): Promise<StatusTransitionRecord> {
    return this.storage.create('transitions', transition)
  }

  async getRules(): Promise<RuleConfig[]> {
    return this.storage.getAll<RuleConfig>('rules')
  }

  async createRule(rule: RuleConfig): Promise<RuleConfig> {
    return this.storage.create('rules', rule)
  }

  async updateRule(id: string, data: Partial<RuleConfig>): Promise<RuleConfig | null> {
    return this.storage.update('rules', id, data)
  }

  async getEvents(): Promise<ExceptionEvent[]> {
    return this.storage.getAll<ExceptionEvent>('events')
  }

  async createEvent(event: ExceptionEvent): Promise<ExceptionEvent> {
    return this.storage.create('events', event)
  }

  async exportData(): Promise<Record<string, any[]>> {
    return this.storage.exportAllData()
  }

  async importData(data: Record<string, any[]>): Promise<void> {
    this.storage.importData(data)
  }

  async resetAllData(): Promise<void> {
    await this.storage.clearAllData()
  }

  async checkHasData(): Promise<boolean> {
    return this.storage.hasData()
  }

  async batchCreate<T extends { id: string } = any>(entity: string, items: T[]): Promise<T[]> {
    return this.storage.batchCreate(entity, items)
  }

  async batchUpdate<T extends { id: string } = any>(entity: string, updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> {
    return this.storage.batchUpdate(entity, updates)
  }
}

export const mockApiService = new MockApiService()
