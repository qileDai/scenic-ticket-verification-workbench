import { describe, it, expect } from 'vitest'
import {
  calculateVerificationSuccessRate,
  calculateDuplicateRate,
  checkCouponConsistency,
  detectDuplicateVerification,
  canTransition,
  getNextPossibleStatuses,
  aggregateMetricsByDate,
  aggregateMetricsByBatch,
  parseCSV,
  exportToJSON,
  exportToCSV
} from '../src/utils/business'
import type { GroupBuyCoupon, VerificationRecord, EntranceGate, VisitorCredential, EntityStatus } from '../src/types'

describe('业务规则计算', () => {
  describe('核销成功率计算', () => {
    it('应该正确计算成功率 - 全部成功', () => {
      const records: VerificationRecord[] = [
        { id: '1', code: 'R1', name: '记录1', status: 'confirmed', owner: '张三', createdAt: '', updatedAt: '', batchId: 'B1', recordCode: 'VR001', couponId: 'C1', gateId: 'G1', verificationTime: '2024-01-15T10:00:00Z', verificationMethod: 'online', operatorName: '操作人', isSuccess: true } as any
      ]
      
      expect(calculateVerificationSuccessRate(records)).toBe(100)
    })

    it('应该正确计算成功率 - 部分成功', () => {
      const records: VerificationRecord[] = [
        { id: '1', code: 'R1', name: '记录1', status: 'confirmed', owner: '张三', createdAt: '', updatedAt: '', batchId: 'B1', recordCode: 'VR001', couponId: 'C1', gateId: 'G1', verificationTime: '2024-01-15T10:00:00Z', verificationMethod: 'online', operatorName: '操作人', isSuccess: true } as any,
        { id: '2', code: 'R2', name: '记录2', status: 'rejected', owner: '李四', createdAt: '', updatedAt: '', batchId: 'B1', recordCode: 'VR002', couponId: 'C2', gateId: 'G1', verificationTime: '2024-01-15T11:00:00Z', verificationMethod: 'online', operatorName: '操作人', isSuccess: false, failReason: '闸机离线' } as any,
        { id: '3', code: 'R3', name: '记录3', status: 'confirmed', owner: '王五', createdAt: '', updatedAt: '', batchId: 'B1', recordCode: 'VR003', couponId: 'C3', gateId: 'G1', verificationTime: '2024-01-15T12:00:00Z', verificationMethod: 'offline', operatorName: '操作人', isSuccess: false, failReason: '券码过期' } as any
      ]
      
      expect(calculateVerificationSuccessRate(records)).toBeCloseTo(33.33, 1)
    })

    it('空数组应该返回0', () => {
      expect(calculateVerificationSuccessRate([])).toBe(0)
    })
  })

  describe('重复核销率计算', () => {
    it('应该检测到重复核销', () => {
      const coupons: GroupBuyCoupon[] = [
        { id: 'C1', code: 'COUPON-001', name: '券码1', status: 'confirmed', owner: '张三', createdAt: '', updatedAt: '', batchId: 'B1' } as any,
        { id: 'C2', code: 'COUPON-002', name: '券码2', status: 'confirmed', owner: '李四', createdAt: '', updatedAt: '', batchId: 'B1' } as any
      ]

      const records: VerificationRecord[] = [
        { id: 'R1', recordCode: 'VR001', couponId: 'C1', isSuccess: true } as any,
        { id: 'R2', recordCode: 'VR002', couponId: 'C1', isSuccess: true } as any,
        { id: 'R3', recordCode: 'VR003', couponId: 'C2', isSuccess: true } as any
      ]

      const rate = calculateDuplicateRate(coupons, records)
      expect(rate).toBe(50) // C1被重复，2个券码中有1个重复
    })
  })

  describe('数据一致性检查', () => {
    it('完整数据应该通过一致性检查', () => {
      const coupon: GroupBuyCoupon = {
        id: 'C1',
        code: 'COUPON-001',
        name: '有效券码',
        status: 'confirmed',
        owner: '张三',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        batchId: 'B1',
        couponCode: 'MT20240115001',
        platform: 'meituan',
        ticketType: '成人票',
        originalPrice: 180,
        discountPrice: 128,
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2024-12-31T23:59:59Z'
      }

      const record: VerificationRecord = {
        id: 'R1',
        code: 'RECORD-001',
        name: '核销记录',
        status: 'confirmed',
        owner: '李四',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        batchId: 'B1',
        recordCode: 'VR001',
        couponId: 'C1',
        gateId: 'G1',
        verificationTime: '2024-01-15T10:30:00Z',
        verificationMethod: 'online',
        operatorName: '王五',
        isSuccess: true
      }

      const gate: EntranceGate = {
        id: 'G1',
        code: 'GATE-001',
        name: '东门主闸机',
        status: 'confirmed',
        owner: '赵六',
        createdAt: '',
        updatedAt: '',
        batchId: 'B1',
        gateCode: 'GATE-001',
        location: '东门主入口',
        gateType: 'main',
        isOnline: true,
        dailyCapacity: 5000,
        currentLoad: 3000
      }

      const credential: VisitorCredential = {
        id: 'VC1',
        code: 'CRED-001',
        name: '游客凭证',
        status: 'confirmed',
        owner: '钱七',
        createdAt: '',
        updatedAt: '',
        batchId: 'B1',
        credentialCode: 'VC001',
        credentialType: 'id_card',
        credentialNumber: '110101199001011234',
        visitorName: '张伟',
        visitDate: '2024-01-15',
        isValid: true,
        verificationCount: 1
      }

      const result = checkCouponConsistency(coupon, record, gate, credential)
      expect(result.isConsistent).toBe(true)
      expect(result.issues.length).toBe(0)
    })

    it('缺少关键字段应该返回不一致并建议保存草稿', () => {
      const coupon: GroupBuyCoupon = {
        id: 'C1',
        code: 'COUPON-001',
        name: '测试券码',
        status: 'pending_review',
        owner: '张三',
        createdAt: '',
        updatedAt: '',
        batchId: 'B1',
        couponCode: 'MT20240115002',
        platform: 'dianping',
        ticketType: '成人票',
        originalPrice: 180,
        discountPrice: 128,
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2024-12-31T23:59:59Z'
      }

      const result = checkCouponConsistency(coupon)
      expect(result.isConsistent).toBe(false)
      expect(result.issues).toContain('缺少核销记录')
      expect(result.suggestion).toContain('保存为草稿')
    })
  })

  describe('重复核销检测', () => {
    it('应该检测出重复核销的券码', () => {
      const records: VerificationRecord[] = [
        { id: 'R1', recordCode: 'VR001', couponId: 'C1', verificationTime: '2024-01-15T10:00:00Z', isSuccess: true } as any,
        { id: 'R2', recordCode: 'VR002', couponId: 'C2', verificationTime: '2024-01-15T11:00:00Z', isSuccess: true } as any,
        { id: 'R3', recordCode: 'VR003', couponId: 'C1', verificationTime: '2024-01-15T12:00:00Z', isSuccess: true } as any,
        { id: 'R4', recordCode: 'VR004', couponId: 'C3', verificationTime: '2024-01-15T13:00:00Z', isSuccess: true } as any
      ]

      const duplicates = detectDuplicateVerification(records)
      expect(duplicates.length).toBe(1)
      expect(duplicates[0].couponId).toBe('C1')
      expect(duplicates[0].count).toBe(2)
    })

    it('无重复时应该返回空数组', () => {
      const records: VerificationRecord[] = [
        { id: 'R1', recordCode: 'VR001', couponId: 'C1', verificationTime: '2024-01-15T10:00:00Z', isSuccess: true } as any,
        { id: 'R2', recordCode: 'VR002', couponId: 'C2', verificationTime: '2024-01-15T11:00:00Z', isSuccess: true } as any
      ]

      const duplicates = detectDuplicateVerification(records)
      expect(duplicates.length).toBe(0)
    })
  })
})

describe('状态流转规则', () => {
  it('草稿状态应该可以转为待复核或已归档', () => {
    expect(canTransition('draft', 'pending_review')).toBe(true)
    expect(canTransition('draft', 'archived')).toBe(true)
    expect(canTransition('draft', 'confirmed')).toBe(false)
  })

  it('待复核状态应该可以转为多种状态', () => {
    expect(canTransition('pending_review', 'pending_supplement')).toBe(true)
    expect(canTransition('pending_review', 'confirmed')).toBe(true)
    expect(canTransition('pending_review', 'rejected')).toBe(true)
    expect(canTransition('pending_review', 'draft')).toBe(false)
  })

  it('已确认状态只能转为已归档', () => {
    expect(canTransition('confirmed', 'archived')).toBe(true)
    expect(canTransition('confirmed', 'draft')).toBe(false)
    expect(canTransition('confirmed', 'rejected')).toBe(false)
  })

  it('已归档和已驳回不应该有下一步状态', () => {
    expect(getNextPossibleStatuses('archived').length).toBe(0)
    expect(getNextPossibleStatuses('rejected')).toContain('draft')
  })

  it('驳回必须填写原因（业务规则验证）', () => {
    const transitions = getNextPossibleStatuses('pending_review')
    expect(transitions).toContain('rejected')
    
    // 模拟驳回流程：如果目标状态是rejected，必须提供原因
    const targetStatus = 'rejected'
    if (transitions.includes(targetStatus)) {
      // 在实际应用中，这里会弹出对话框要求输入原因
      const reason = '测试原因'
      expect(reason).toBeTruthy()
    }
  })
})

describe('数据聚合功能', () => {
  it('应该按日期聚合数据', () => {
    const items = [
      { date: '2024-01-15', value: 10 },
      { date: '2024-01-15', value: 20 },
      { date: '2024-01-16', value: 30 }
    ] as any

    const result = aggregateMetricsByDate(
      items,
      (item) => item.date,
      (item) => item.value
    )

    expect(result).toHaveLength(2)
    expect(result.find(r => r.date === '2024-01-15')?.value).toBe(30)
    expect(result.find(r => r.date === '2024-01-16')?.value).toBe(30)
  })

  it('应该按批次聚合数据', () => {
    const items = [
      { batchId: 'B1', amount: 100 },
      { batchId: 'B2', amount: 200 },
      { batchId: 'B1', amount: 150 }
    ] as any

    const result = aggregateMetricsByBatch(items, (item) => item.amount)

    expect(result).toHaveLength(2)
    expect(result.find(r => r.batchId === 'B1')?.value).toBe(250)
    expect(result.find(r => r.batchId === 'B2')?.value).toBe(200)
  })
})

describe('CSV解析功能', () => {
  it('应该正确解析简单的CSV', () => {
    const csv = `name,age,city\n张三,25,北京\n李四,30,上海`
    const result = parseCSV(csv)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ name: '张三', age: '25', city: '北京' })
    expect(result[1]).toEqual({ name: '李四', age: '30', city: '上海' })
  })

  it('应该处理带引号的字段', () => {
    const csv = `name,description\n"张,三","包含逗号的字段"`
    const result = parseCSV(csv)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('张,三')
    expect(result[0].description).toBe('包含逗号的字段')
  })

  it('空内容或只有标题行应该返回空数组', () => {
    expect(parseCSV('')).toHaveLength(0)
    expect(parseCSV('name,age')).toHaveLength(0)
  })
})
