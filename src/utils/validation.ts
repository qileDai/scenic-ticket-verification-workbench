import { z } from 'zod'
import type { EntityStatus } from '../types'

export const couponSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  code: z.string().min(1, '编号不能为空'),
  name: z.string().min(1, '名称不能为空'),
  status: z.enum(['draft', 'pending_review', 'pending_supplement', 'confirmed', 'archived', 'rejected']),
  owner: z.string().min(1, '负责人不能为空'),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string().optional(),
  batchId: z.string().min(1, '关联批次不能为空'),
  couponCode: z.string().min(1, '团购券码不能为空'),
  platform: z.enum(['meituan', 'dianping', 'ctrip', 'fliggy', 'other']),
  ticketType: z.string().min(1, '票种不能为空'),
  originalPrice: z.number().positive('原价必须大于0'),
  discountPrice: z.number().positive('优惠价必须大于0'),
  validFrom: z.string().min(1, '有效期开始时间不能为空'),
  validTo: z.string().min(1, '有效期结束时间不能为空'),
  usedAt: z.string().optional(),
  gateId: z.string().optional(),
  visitorId: z.string().optional()
})

export const recordSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['draft', 'pending_review', 'pending_supplement', 'confirmed', 'archived', 'rejected']),
  owner: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string().optional(),
  batchId: z.string().min(1),
  recordCode: z.string().min(1, '核销记录编号不能为空'),
  couponId: z.string().min(1, '关联券码ID不能为空'),
  gateId: z.string().min(1, '闸机ID不能为空'),
  verificationTime: z.string().min(1, '核销时间不能为空'),
  verificationMethod: z.enum(['online', 'offline']),
  operatorName: z.string().min(1, '操作人姓名不能为空'),
  isSuccess: z.boolean(),
  failReason: z.string().optional(),
  evidenceUrl: z.string().optional()
})

export const gateSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['draft', 'pending_review', 'pending_supplement', 'confirmed', 'archived', 'rejected']),
  owner: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string().optional(),
  batchId: z.string().min(1),
  gateCode: z.string().min(1, '闸机编号不能为空'),
  location: z.string().min(1, '位置不能为空'),
  gateType: z.enum(['main', 'sub', 'vip']),
  isOnline: z.boolean(),
  lastHeartbeatTime: z.string().optional(),
  firmwareVersion: z.string().optional(),
  dailyCapacity: z.number().positive(),
  currentLoad: z.number().min(0)
})

export const exceptionSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['draft', 'pending_review', 'pending_supplement', 'confirmed', 'archived', 'rejected']),
  owner: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string().optional(),
  batchId: z.string().min(1),
  exceptionType: z.enum(['duplicate_verification', 'gate_offline', 'missing_evidence', 'expired_coupon', 'invalid_coupon', 'other']),
  severity: z.enum(['high', 'medium', 'low']),
  description: z.string().min(1, '异常描述不能为空'),
  sourceField: z.string().optional(),
  thresholdValue: z.number().optional(),
  actualValue: z.number().optional(),
  handler: z.string().optional(),
  deadline: z.string().optional()
})

export const applicationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['draft', 'pending_review', 'pending_supplement', 'confirmed', 'archived', 'rejected']),
  owner: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string().optional(),
  batchId: z.string().min(1),
  applicationCode: z.string().min(1, '申请编号不能为空'),
  recordId: z.string().min(1, '关联记录ID不能为空'),
  applicationType: z.enum(['verification_record', 'visitor_evidence', 'gate_log']),
  reason: z.string().min(1, '补录原因不能为空'),
  evidenceFiles: z.array(z.string()).optional(),
  approvedBy: z.string().optional(),
  approvalTime: z.string().optional(),
  rejectionReason: z.string().optional()
})

export const credentialSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['draft', 'pending_review', 'pending_supplement', 'confirmed', 'archived', 'rejected']),
  owner: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string().optional(),
  batchId: z.string().min(1),
  credentialCode: z.string().min(1, '凭证编号不能为空'),
  credentialType: z.enum(['id_card', 'passport', 'ticket_qr', 'order_number']),
  credentialNumber: z.string().min(1, '凭证号码不能为空'),
  visitorName: z.string().min(1, '游客姓名不能为空'),
  phone: z.string().optional(),
  visitDate: z.string().min(1, '入园日期不能为空'),
  isValid: z.boolean(),
  verificationCount: z.number().min(0),
  lastVerificationTime: z.string().optional()
})

export function validateCoupon(data: unknown) {
  return couponSchema.safeParse(data)
}

export function validateRecord(data: unknown) {
  return recordSchema.safeParse(data)
}

export function validateGate(data: unknown) {
  return gateSchema.safeParse(data)
}

export function validateException(data: unknown) {
  return exceptionSchema.safeParse(data)
}

export function validateApplication(data: unknown) {
  return applicationSchema.safeParse(data)
}

export function validateCredential(data: unknown) {
  return credentialSchema.safeParse(data)
}
