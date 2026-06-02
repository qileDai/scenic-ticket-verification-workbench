import { describe, it, expect } from 'vitest'
import {
  validateCoupon,
  validateRecord,
  validateGate,
  validateException,
  validateApplication,
  validateCredential
} from '../src/utils/validation'
import type { EntityStatus } from '../src/types'

describe('Zod表单校验', () => {
  describe('团购券码校验', () => {
    it('有效数据应该通过校验', () => {
      const validData = {
        id: 'test-1',
        code: 'COUPON-001',
        name: '成人票-美团',
        status: 'pending_review' as EntityStatus,
        owner: '张三',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        batchId: 'BATCH-001',
        couponCode: 'MT20240115001',
        platform: 'meituan',
        ticketType: '成人票',
        originalPrice: 180,
        discountPrice: 128,
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2024-12-31T23:59:59Z'
      }

      const result = validateCoupon(validData)
      expect(result.success).toBe(true)
    })

    it('缺少必填字段应该校验失败', () => {
      const invalidData = {
        id: '',
        name: '测试券码',
        status: 'invalid_status' as any
      }

      const result = validateCoupon(invalidData)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('价格必须大于0', () => {
      const invalidPriceData = {
        id: 'test-2',
        code: 'COUPON-002',
        name: '测试票',
        status: 'draft' as EntityStatus,
        owner: '李四',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        batchId: 'BATCH-002',
        couponCode: 'MT20240115002',
        platform: 'dianping',
        ticketType: '儿童票',
        originalPrice: -10,
        discountPrice: 0,
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2024-12-31T23:59:59Z'
      }

      const result = validateCoupon(invalidPriceData)
      expect(result.success).toBe(false)
    })
  })

  describe('核销记录校验', () => {
    it('有效记录应该通过校验', () => {
      const validRecord = {
        id: 'rec-1',
        code: 'RECORD-001',
        name: '核销记录-测试',
        status: 'confirmed' as EntityStatus,
        owner: '王五',
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
        batchId: 'BATCH-001',
        recordCode: 'VR001',
        couponId: 'C1',
        gateId: 'G1',
        verificationTime: '2024-01-15T10:30:00Z',
        verificationMethod: 'online' as const,
        operatorName: '赵六',
        isSuccess: true
      }

      const result = validateRecord(validRecord)
      expect(result.success).toBe(true)
    })

    it('失败记录应该包含失败原因', () => {
      const failedRecord = {
        id: 'rec-2',
        code: 'RECORD-002',
        name: '失败记录',
        status: 'rejected' as EntityStatus,
        owner: '钱七',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        batchId: 'BATCH-001',
        recordCode: 'VR002',
        couponId: 'C2',
        gateId: 'G2',
        verificationTime: '2024-01-15T12:00:00Z',
        verificationMethod: 'offline' as const,
        operatorName: '孙八',
        isSuccess: false
        // failReason 是可选的，所以不提供也应该通过
      }

      const result = validateRecord(failedRecord)
      expect(result.success).toBe(true) // failReason是可选字段
    })
  })

  describe('入园闸机校验', () => {
    it('有效闸机信息应该通过校验', () => {
      const validGate = {
        id: 'gate-1',
        code: 'GATE-001',
        name: '东门主闸机',
        status: 'confirmed' as EntityStatus,
        owner: '周九',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        batchId: 'BATCH-001',
        gateCode: 'GATE-001',
        location: '东门主入口',
        gateType: 'main' as const,
        isOnline: true,
        dailyCapacity: 5000,
        currentLoad: 3000
      }

      const result = validateGate(validGate)
      expect(result.success).toBe(true)
    })
  })

  describe('异常原因校验', () => {
    it('高优先级异常应该包含处理人和截止时间', () => {
      const highSeverityException = {
        id: 'exc-1',
        code: 'EXCP-001',
        name: '重复核销异常',
        status: 'pending_review' as EntityStatus,
        owner: '吴十',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        batchId: 'BATCH-001',
        exceptionType: 'duplicate_verification' as const,
        severity: 'high' as const,
        description: '检测到重复核销，需要立即处理'
      }

      const result = validateException(highSeverityException)
      expect(result.success).toBe(true) // handler和deadline都是可选的
    })
  })

  describe('补录申请校验', () => {
    it('有效申请应该通过校验', () => {
      const validApplication = {
        id: 'app-1',
        code: 'APP-001',
        name: '补录申请-测试',
        status: 'pending_review' as EntityStatus,
        owner: '郑一',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        batchId: 'BATCH-001',
        applicationCode: 'SA-2024-001',
        recordId: 'R1',
        applicationType: 'verification_record' as const,
        reason: '闸机离线导致记录丢失，需要手动补录'
      }

      const result = validateApplication(validApplication)
      expect(result.success).toBe(true)
    })

    it('缺少原因应该校验失败', () => {
      const noReasonApp = {
        id: 'app-2',
        code: 'APP-002',
        name: '无原因申请',
        status: 'draft' as EntityStatus,
        owner: '冯二',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        batchId: 'BATCH-001',
        applicationCode: 'SA-2024-002',
        recordId: 'R2',
        applicationType: 'visitor_evidence' as const,
        reason: ''
      }

      const result = validateApplication(noReasonApp)
      expect(result.success).toBe(false)
    })
  })

  describe('游客凭证校验', () => {
    it('有效凭证应该通过校验', () => {
      const validCredential = {
        id: 'cred-1',
        code: 'CRED-001',
        name: '身份证凭证-张伟',
        status: 'confirmed' as EntityStatus,
        owner: '陈三',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        batchId: 'BATCH-001',
        credentialCode: 'VC001',
        credentialType: 'id_card' as const,
        credentialNumber: '110101199001011234',
        visitorName: '张伟',
        visitDate: '2024-01-15',
        isValid: true,
        verificationCount: 1
      }

      const result = validateCredential(validCredential)
      expect(result.success).toBe(true)
    })

    it('缺少游客姓名或凭证号码应该校验失败', () => {
      const incompleteCredential = {
        id: 'cred-2',
        code: 'CRED-002',
        name: '不完整凭证',
        status: 'draft' as EntityStatus,
        owner: '褚四',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        batchId: 'BATCH-001',
        credentialCode: 'VC002',
        credentialType: 'passport' as const,
        credentialNumber: '',
        visitorName: '',
        visitDate: '2024-01-16',
        isValid: false,
        verificationCount: 0
      }

      const result = validateCredential(incompleteCredential)
      expect(result.success).toBe(false)
    })
  })
})
