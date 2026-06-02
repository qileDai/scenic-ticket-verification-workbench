export type EntityStatus = 'draft' | 'pending_review' | 'pending_supplement' | 'confirmed' | 'archived' | 'rejected'

export interface BaseEntity {
  id: string
  code: string
  name: string
  status: EntityStatus
  owner: string
  createdAt: string
  updatedAt: string
  remark?: string
  batchId: string
}

export interface GroupBuyCoupon extends BaseEntity {
  couponCode: string
  platform: 'meituan' | 'dianping' | 'ctrip' | 'fliggy' | 'other'
  ticketType: string
  originalPrice: number
  discountPrice: number
  validFrom: string
  validTo: string
  usedAt?: string
  gateId?: string
  visitorId?: string
}

export interface VerificationRecord extends BaseEntity {
  recordCode: string
  couponId: string
  gateId: string
  verificationTime: string
  verificationMethod: 'online' | 'offline'
  operatorName: string
  isSuccess: boolean
  failReason?: string
  evidenceUrl?: string
}

export interface EntranceGate extends BaseEntity {
  gateCode: string
  location: string
  gateType: 'main' | 'sub' | 'vip'
  isOnline: boolean
  lastHeartbeatTime?: string
  firmwareVersion?: string
  dailyCapacity: number
  currentLoad: number
}

export interface ExceptionReason extends BaseEntity {
  exceptionType: 'duplicate_verification' | 'gate_offline' | 'missing_evidence' | 'expired_coupon' | 'invalid_coupon' | 'other'
  severity: 'high' | 'medium' | 'low'
  description: string
  sourceField?: string
  thresholdValue?: number
  actualValue?: number
  handler?: string
  deadline?: string
}

export interface SupplementApplication extends BaseEntity {
  applicationCode: string
  recordId: string
  applicationType: 'verification_record' | 'visitor_evidence' | 'gate_log'
  reason: string
  evidenceFiles?: string[]
  approvedBy?: string
  approvalTime?: string
  rejectionReason?: string
}

export interface VisitorCredential extends BaseEntity {
  credentialCode: string
  credentialType: 'id_card' | 'passport' | 'ticket_qr' | 'order_number'
  credentialNumber: string
  visitorName: string
  phone?: string
  visitDate: string
  isValid: boolean
  verificationCount: number
  lastVerificationTime?: string
}

export interface ReconciliationBatch extends Omit<BaseEntity, 'status'> {
  batchCode: string
  platform: string
  startDate: string
  endDate: string
  totalCoupons: number
  verifiedCount: number
  exceptionCount: number
  revenueAmount: number
  status: 'processing' | 'completed' | 'exception' | 'reconciled'
}

export interface StatusTransitionRecord extends BaseEntity {
  entityId: string
  entityType: 'coupon' | 'record' | 'gate' | 'exception' | 'application' | 'credential' | 'batch'
  fromStatus: EntityStatus
  toStatus: EntityStatus
  action: string
  operator: string
  reason?: string
}

export interface RuleConfig extends BaseEntity {
  ruleCode: string
  ruleType: 'validation' | 'calculation' | 'alert' | 'workflow'
  condition: string
  action: string
  priority: number
  isEnabled: boolean
  executionResult?: string
}

export interface ExceptionEvent extends BaseEntity {
  eventCode: string
  eventType: 'system_alert' | 'manual_report' | 'auto_detect'
  relatedEntityIds: string[]
  description: string
  impactScope: 'single' | 'batch' | 'system'
  resolutionStatus: 'open' | 'investigating' | 'resolved' | 'closed'
}

export interface FilterCriteria {
  status?: EntityStatus[]
  dateRange?: [string, string]
  keyword?: string
  owner?: string
  batchId?: string
  [key: string]: any
}

export interface BatchAction {
  type: 'status_change' | 'delete' | 'export' | 'assign'
  targetIds: string[]
  payload: any
}

export interface ImportPreview {
  fileName: string
  totalRows: number
  validRows: number
  errorRows: number
  data: any[]
  errors: Array<{ row: number; field: string; message: string }>
  fieldMapping: Record<string, string>
}

export interface MetricData {
  label: string
  value: number | string
  change?: number
  unit?: string
}

export interface ChartDataPoint {
  time: string
  value: number
  category?: string
}

export interface RecentOperation {
  id: string
  type: string
  description: string
  timestamp: string
  entityId?: string
}
