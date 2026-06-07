import type {
  GroupBuyCoupon,
  VerificationRecord,
  EntranceGate,
  ExceptionReason,
  SupplementApplication,
  VisitorCredential,
  ReconciliationBatch,
  StatusTransitionRecord,
  RuleConfig,
  ExceptionEvent
} from '../types'
import { mockApiService } from '../services/storage'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function generateDate(daysAgo = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const owners = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
const platforms = ['meituan', 'dianping', 'ctrip', 'fliggy'] as const
const ticketTypes = ['成人票', '儿童票', '学生票', '老人票']
const visitorNames = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨磊']

export async function initializeSeedData() {
  const hasData = await mockApiService.checkHasData()
  if (hasData) {
    console.log('数据已存在，跳过初始化')
    return
  }

  const batches: ReconciliationBatch[] = [
    {
      id: generateId(),
      code: 'BATCH-2026-001',
      name: '美团对账批次',
      status: 'reconciled',
      owner: '张三',
      createdAt: generateDate(30),
      updatedAt: generateDate(3),
      batchId: 'BATCH-2026-001',
      batchCode: 'BATCH-2026-001',
      platform: 'meituan',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T23:59:59.999Z',
      totalCoupons: 120,
      verifiedCount: 112,
      exceptionCount: 8,
      revenueAmount: 12800
    },
    {
      id: generateId(),
      code: 'BATCH-2026-002',
      name: '携程对账批次',
      status: 'processing',
      owner: '李四',
      createdAt: generateDate(20),
      updatedAt: generateDate(1),
      batchId: 'BATCH-2026-002',
      batchCode: 'BATCH-2026-002',
      platform: 'ctrip',
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-02-28T23:59:59.999Z',
      totalCoupons: 95,
      verifiedCount: 80,
      exceptionCount: 15,
      revenueAmount: 9800
    },
    {
      id: generateId(),
      code: 'BATCH-2026-003',
      name: '飞猪对账批次',
      status: 'exception',
      owner: '王五',
      createdAt: generateDate(10),
      updatedAt: generateDate(0),
      batchId: 'BATCH-2026-003',
      batchCode: 'BATCH-2026-003',
      platform: 'fliggy',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T23:59:59.999Z',
      totalCoupons: 88,
      verifiedCount: 70,
      exceptionCount: 18,
      revenueAmount: 8600
    }
  ]

  const gates: EntranceGate[] = [
    {
      id: generateId(),
      code: 'GATE-001',
      name: '东门主闸机-A',
      status: 'confirmed',
      owner: '赵六',
      createdAt: generateDate(60),
      updatedAt: generateDate(0),
      batchId: batches[0].id,
      gateCode: 'GATE-001',
      location: '东门主入口',
      gateType: 'main',
      isOnline: true,
      lastHeartbeatTime: generateDate(0),
      firmwareVersion: 'V3.2.1',
      dailyCapacity: 5000,
      currentLoad: 3200
    },
    {
      id: generateId(),
      code: 'GATE-002',
      name: '西门次闸机-B',
      status: 'confirmed',
      owner: '钱七',
      createdAt: generateDate(60),
      updatedAt: generateDate(1),
      batchId: batches[0].id,
      gateCode: 'GATE-002',
      location: '西门次入口',
      gateType: 'sub',
      isOnline: true,
      lastHeartbeatTime: generateDate(0),
      firmwareVersion: 'V3.2.0',
      dailyCapacity: 2400,
      currentLoad: 1200
    },
    {
      id: generateId(),
      code: 'GATE-003',
      name: '北门VIP闸机-C',
      status: 'pending_supplement',
      owner: '孙八',
      createdAt: generateDate(45),
      updatedAt: generateDate(2),
      batchId: batches[1].id,
      gateCode: 'GATE-003',
      location: '北门VIP通道',
      gateType: 'vip',
      isOnline: false,
      firmwareVersion: 'V3.1.8',
      dailyCapacity: 1000,
      currentLoad: 450
    },
    {
      id: generateId(),
      code: 'GATE-004',
      name: '南门临时闸机-D',
      status: 'rejected',
      owner: '张三',
      createdAt: generateDate(35),
      updatedAt: generateDate(5),
      batchId: batches[2].id,
      gateCode: 'GATE-004',
      location: '南门临时通道',
      gateType: 'sub',
      isOnline: false,
      firmwareVersion: 'V2.9.5',
      dailyCapacity: 1600,
      currentLoad: 820
    }
  ]

  const credentials: VisitorCredential[] = Array.from({ length: 12 }, (_, index) => ({
    id: generateId(),
    code: `CRED-${String(index + 1).padStart(3, '0')}`,
    name: `游客凭证-${visitorNames[index % visitorNames.length]}`,
    status: (['confirmed', 'pending_review', 'rejected', 'archived'] as const)[index % 4],
    owner: owners[index % owners.length],
    createdAt: generateDate(index + 1),
    updatedAt: generateDate(Math.max(index - 1, 0)),
    batchId: batches[index % batches.length].id,
    credentialCode: `VC${String(index + 1).padStart(4, '0')}`,
    credentialType: (['id_card', 'passport', 'ticket_qr', 'order_number'] as const)[index % 4],
    credentialNumber: `NO${Date.now()}${index}`,
    visitorName: visitorNames[index % visitorNames.length],
    phone: `1380000${String(index).padStart(4, '0')}`,
    visitDate: generateDate(index % 5).slice(0, 10),
    isValid: index % 5 !== 0,
    verificationCount: index % 3,
    lastVerificationTime: index > 0 ? generateDate(index % 4) : undefined
  }))

  const coupons: GroupBuyCoupon[] = Array.from({ length: 18 }, (_, index) => ({
    id: generateId(),
    code: `COUPON-${String(index + 1).padStart(4, '0')}`,
    name: `${ticketTypes[index % ticketTypes.length]}-${visitorNames[index % visitorNames.length]}`,
    status: (['pending_review', 'confirmed', 'archived', 'rejected', 'pending_supplement', 'draft'] as const)[index % 6],
    owner: owners[index % owners.length],
    createdAt: generateDate(index + 1),
    updatedAt: generateDate(index % 4),
    remark: index % 5 === 0 ? `需要关注的券码 ${index + 1}` : undefined,
    batchId: batches[index % batches.length].id,
    couponCode: `CP${String(index + 1).padStart(6, '0')}`,
    platform: platforms[index % platforms.length],
    ticketType: ticketTypes[index % ticketTypes.length],
    originalPrice: [180, 90, 120, 240][index % 4],
    discountPrice: [128, 68, 88, 188][index % 4],
    validFrom: '2026-01-01T00:00:00.000Z',
    validTo: '2099-12-31T23:59:59.999Z',
    usedAt: index < 12 ? generateDate(index % 6) : undefined,
    gateId: gates[index % gates.length].id,
    visitorId: credentials[index % credentials.length].id
  }))

  const records: VerificationRecord[] = Array.from({ length: 20 }, (_, index) => {
    const coupon = coupons[index % coupons.length]
    const duplicateCoupon = index < 4 ? coupons[0] : index < 7 ? coupons[1] : coupon
    const success = index % 6 !== 0

    return {
      id: generateId(),
      code: `RECORD-${String(index + 1).padStart(4, '0')}`,
      name: `核销记录-${duplicateCoupon.couponCode}`,
      status: success ? 'confirmed' : 'pending_review',
      owner: owners[(index + 1) % owners.length],
      createdAt: generateDate(index % 7),
      updatedAt: generateDate(index % 5),
      remark: success ? undefined : `异常待复核 ${index + 1}`,
      batchId: duplicateCoupon.batchId,
      recordCode: `VR${String(index + 1).padStart(5, '0')}`,
      couponId: duplicateCoupon.id,
      gateId: gates[index % gates.length].id,
      verificationTime: generateDate(index % 6),
      verificationMethod: index % 2 === 0 ? 'online' : 'offline',
      operatorName: owners[(index + 2) % owners.length],
      isSuccess: success,
      failReason: success ? undefined : ['闸机离线无法验证', '券码重复核销', '游客凭证缺失'][index % 3],
      evidenceUrl: index % 4 === 0 ? `https://evidence.example.com/${index + 1}` : undefined
    }
  })

  const exceptions: ExceptionReason[] = [
    {
      id: generateId(),
      code: 'EXCP-001',
      name: '重复核销异常',
      status: 'pending_review',
      owner: '张三',
      createdAt: generateDate(3),
      updatedAt: generateDate(1),
      batchId: batches[0].id,
      exceptionType: 'duplicate_verification',
      severity: 'high',
      description: '检测到同一券码短时间多次核销',
      sourceField: 'couponCode',
      thresholdValue: 1,
      actualValue: 3,
      handler: '张三',
      deadline: generateDate(-1)
    },
    {
      id: generateId(),
      code: 'EXCP-002',
      name: '闸机离线异常',
      status: 'pending_supplement',
      owner: '孙八',
      createdAt: generateDate(5),
      updatedAt: generateDate(2),
      batchId: batches[1].id,
      exceptionType: 'gate_offline',
      severity: 'high',
      description: '北门VIP闸机持续离线',
      handler: '孙八'
    },
    {
      id: generateId(),
      code: 'EXCP-003',
      name: '游客凭证缺失',
      status: 'confirmed',
      owner: '李四',
      createdAt: generateDate(6),
      updatedAt: generateDate(4),
      batchId: batches[1].id,
      exceptionType: 'missing_evidence',
      severity: 'medium',
      description: '游客未提供有效身份证件',
      handler: '李四'
    }
  ]

  const applications: SupplementApplication[] = [
    {
      id: generateId(),
      code: 'APP-001',
      name: '补录申请-核销记录',
      status: 'pending_review',
      owner: '钱七',
      createdAt: generateDate(4),
      updatedAt: generateDate(2),
      batchId: batches[0].id,
      applicationCode: 'SA-2026-001',
      recordId: records[2].id,
      applicationType: 'verification_record',
      reason: '离线期间纸质票据需要补录'
    },
    {
      id: generateId(),
      code: 'APP-002',
      name: '补录申请-游客身份证件',
      status: 'confirmed',
      owner: '吴十',
      createdAt: generateDate(6),
      updatedAt: generateDate(3),
      batchId: batches[1].id,
      applicationCode: 'SA-2026-002',
      recordId: records[5].id,
      applicationType: 'visitor_evidence',
      reason: '护照信息录入错误，需更正',
      approvedBy: '李四',
      approvalTime: generateDate(3)
    }
  ]

  const transitions: StatusTransitionRecord[] = [
    {
      id: generateId(),
      code: 'TRANS-001',
      name: '状态流转-草稿到待复核',
      status: 'confirmed',
      owner: '系统',
      createdAt: generateDate(5),
      updatedAt: generateDate(5),
      batchId: batches[0].id,
      entityId: coupons[0].id,
      entityType: 'coupon',
      fromStatus: 'draft',
      toStatus: 'pending_review',
      action: 'submit_for_review',
      operator: '张三'
    },
    {
      id: generateId(),
      code: 'TRANS-002',
      name: '状态流转-待复核到已确认',
      status: 'confirmed',
      owner: '系统',
      createdAt: generateDate(4),
      updatedAt: generateDate(4),
      batchId: batches[0].id,
      entityId: records[0].id,
      entityType: 'record',
      fromStatus: 'pending_review',
      toStatus: 'confirmed',
      action: 'approve',
      operator: '李四'
    }
  ]

  const rules: RuleConfig[] = [
    {
      id: generateId(),
      code: 'RULE-001',
      name: '重复核销检测规则',
      status: 'confirmed',
      owner: '系统管理员',
      createdAt: generateDate(20),
      updatedAt: generateDate(15),
      batchId: batches[0].id,
      ruleCode: 'DUPLICATE_CHECK',
      ruleType: 'alert',
      condition: 'couponCode相同且verificationTime间隔<2小时',
      action: '加入异常队列并通知负责人',
      priority: 1,
      isEnabled: true
    },
    {
      id: generateId(),
      code: 'RULE-002',
      name: '闸机离线告警规则',
      status: 'confirmed',
      owner: '系统管理员',
      createdAt: generateDate(18),
      updatedAt: generateDate(16),
      batchId: batches[0].id,
      ruleCode: 'GATE_OFFLINE_ALERT',
      ruleType: 'alert',
      condition: 'isOnline=false且持续时间>30分钟',
      action: '通知运维人员',
      priority: 2,
      isEnabled: true
    }
  ]

  const events: ExceptionEvent[] = [
    {
      id: generateId(),
      code: 'EVENT-001',
      name: '系统告警-重复核销检测',
      status: 'confirmed',
      owner: '监控系统',
      createdAt: generateDate(3),
      updatedAt: generateDate(2),
      batchId: batches[0].id,
      eventCode: 'SYS-ALERT-001',
      eventType: 'auto_detect',
      relatedEntityIds: [exceptions[0].id, records[0].id, records[1].id],
      description: '系统自动检测到重复核销异常',
      impactScope: 'batch',
      resolutionStatus: 'investigating'
    },
    {
      id: generateId(),
      code: 'EVENT-002',
      name: '人工上报-闸机故障',
      status: 'pending_review',
      owner: '现场运维',
      createdAt: generateDate(5),
      updatedAt: generateDate(4),
      batchId: batches[1].id,
      eventCode: 'MANUAL-REPORT-001',
      eventType: 'manual_report',
      relatedEntityIds: [gates[2].id, exceptions[1].id],
      description: '现场工作人员上报北门VIP闸机故障',
      impactScope: 'single',
      resolutionStatus: 'open'
    }
  ]

  await mockApiService.batchCreate('batches', batches)
  await mockApiService.batchCreate('gates', gates)
  await mockApiService.batchCreate('coupons', coupons)
  await mockApiService.batchCreate('records', records)
  await mockApiService.batchCreate('credentials', credentials)
  await mockApiService.batchCreate('exceptions', exceptions)
  await mockApiService.batchCreate('applications', applications)
  await mockApiService.batchCreate('transitions', transitions)
  await mockApiService.batchCreate('rules', rules)
  await mockApiService.batchCreate('events', events)

  console.log('✅ Seed数据初始化完成')
}
