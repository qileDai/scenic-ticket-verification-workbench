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
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateDate(daysAgo: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const owners = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
const platforms = ['meituan', 'dianping', 'ctrip', 'fliggy'] as const
const ticketTypes = ['成人票', '儿童票', '学生票', '老人票', '家庭套票', 'VIP票']
const locations = ['东门主入口', '西门次入口', '北门VIP通道', '南门临时通道', '停车场入口']

export async function initializeSeedData() {
  const hasData = await mockApiService.checkHasData()
  if (hasData) {
    console.log('数据已存在，跳过初始化')
    return
  }

  console.log('开始初始化Seed数据...')

  const batches: ReconciliationBatch[] = [
    {
      id: generateId(),
      code: 'BATCH-2024-001',
      name: '2024年1月美团对账批次',
      owner: '张三',
      createdAt: generateDate(30),
      updatedAt: generateDate(5),
      batchId: 'BATCH-2024-001',
      batchCode: 'BATCH-2024-001',
      platform: 'meituan',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-31T23:59:59.999Z',
      totalCoupons: 1250,
      verifiedCount: 1180,
      exceptionCount: 70,
      revenueAmount: 125000,
      status: 'reconciled' as any
    },
    {
      id: generateId(),
      code: 'BATCH-2024-002',
      name: '2024年2月携程对账批次',
      owner: '李四',
      createdAt: generateDate(15),
      updatedAt: generateDate(2),
      batchId: 'BATCH-2024-002',
      batchCode: 'BATCH-2024-002',
      platform: 'ctrip',
      startDate: '2024-02-01T00:00:00.000Z',
      endDate: '2024-02-29T23:59:59.999Z',
      totalCoupons: 980,
      verifiedCount: 890,
      exceptionCount: 90,
      revenueAmount: 98000,
      status: 'processing' as any
    },
    {
      id: generateId(),
      code: 'BATCH-2024-003',
      name: '2024年3月飞猪对账批次',
      owner: '王五',
      createdAt: generateDate(7),
      updatedAt: generateDate(1),
      batchId: 'BATCH-2024-003',
      batchCode: 'BATCH-2024-003',
      platform: 'fliggy',
      startDate: '2024-03-01T00:00:00.000Z',
      endDate: '2024-03-31T23:59:59.999Z',
      totalCoupons: 1100,
      verifiedCount: 950,
      exceptionCount: 150,
      revenueAmount: 110000,
      status: 'exception' as any
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
      updatedAt: generateDate(1),
      batchId: batches[0].id,
      gateCode: 'GATE-001',
      location: '东门主入口',
      gateType: 'main',
      isOnline: true,
      lastHeartbeatTime: new Date().toISOString(),
      firmwareVersion: 'V3.2.1',
      dailyCapacity: 5000,
      currentLoad: 3200
    },
    {
      id: generateId(),
      code: 'GATE-002',
      name: '西门口闸机-B',
      status: 'confirmed',
      owner: '钱七',
      createdAt: generateDate(60),
      updatedAt: generateDate(2),
      batchId: batches[0].id,
      gateCode: 'GATE-002',
      location: '西门次入口',
      gateType: 'sub',
      isOnline: true,
      lastHeartbeatTime: new Date(Date.now() - 300000).toISOString(),
      firmwareVersion: 'V3.2.0',
      dailyCapacity: 2000,
      currentLoad: 1200
    },
    {
      id: generateId(),
      code: 'GATE-003',
      name: '北门VIP闸机-C',
      status: 'pending_supplement',
      owner: '孙八',
      createdAt: generateDate(45),
      updatedAt: generateDate(10),
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
      owner: '周九',
      createdAt: generateDate(30),
      updatedAt: generateDate(15),
      batchId: batches[2].id,
      gateCode: 'GATE-004',
      location: '南门临时通道',
      gateType: 'sub',
      isOnline: false,
      firmwareVersion: 'V2.9.5',
      dailyCapacity: 1500,
      currentLoad: 800
    }
  ]

  const coupons: GroupBuyCoupon[] = Array.from({ length: 35 }, (_, i) => ({
    id: generateId(),
    code: `COUPON-${String(i + 1).padStart(4, '0')}`,
    name: `${ticketTypes[i % ticketTypes.length]}-${owners[i % owners.length]}`,
    status: (['pending_review', 'confirmed', 'archived', 'rejected', 'pending_supplement', 'draft'] as const)[i % 6],
    owner: owners[i % owners.length],
    createdAt: generateDate(Math.floor(i / 5) * 5 + Math.floor(Math.random() * 5)),
    updatedAt: generateDate(Math.floor(i / 7)),
    remark: i % 7 === 0 ? `需要特殊处理的券码-${i}` : undefined,
    batchId: batches[i % 3].id,
    couponCode: `MT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    platform: platforms[i % platforms.length],
    ticketType: ticketTypes[i % ticketTypes.length],
    originalPrice: [180, 90, 45, 360, 600][i % 5],
    discountPrice: [128, 68, 35, 280, 480][i % 5],
    validFrom: generateDate(-30 + Math.floor(i / 12) * 10),
    validTo: generateDate(30 - Math.floor(i / 12) * 10),
    usedAt: i < 25 ? generateDate(Math.floor(i / 5)) : undefined,
    gateId: gates[i % gates.length].id,
    visitorId: undefined
  }))

  const records: VerificationRecord[] = Array.from({ length: 40 }, (_, i) => ({
    id: generateId(),
    code: `RECORD-${String(i + 1).padStart(4, '0')}`,
    name: `核销记录-${coupons[Math.min(i, coupons.length - 1)].couponCode}`,
    status: (['pending_review', 'confirmed', 'archived', 'rejected', 'pending_supplement'] as const)[i % 5],
    owner: owners[(i + 2) % owners.length],
    createdAt: generateDate(Math.floor(i / 8)),
    updatedAt: generateDate(Math.floor(i / 10)),
    remark: i % 11 === 0 ? `异常记录需要复核-${i}` : undefined,
    batchId: batches[i % 3].id,
    recordCode: `VR${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    couponId: coupons[Math.min(i, coupons.length - 1)].id,
    gateId: gates[i % gates.length].id,
    verificationTime: generateDate(Math.floor(i / 6) + (i % 3)),
    verificationMethod: (['online', 'offline'] as const)[i % 2],
    operatorName: owners[(i + 3) % owners.length],
    isSuccess: i % 8 !== 0,
    failReason: i % 8 === 0 ? ['闸机离线无法验证', '券码已过期', '游客凭证缺失', '重复核销异常'][i % 4] : undefined,
    evidenceUrl: i % 3 === 0 ? `https://evidence.example.com/${generateId()}` : undefined
  }))

  const credentials: VisitorCredential[] = Array.from({ length: 32 }, (_, i) => ({
    id: generateId(),
    code: `CRED-${String(i + 1).padStart(4, '0')}`,
    name: `游客凭证-${['张伟', '王芳', '李娜', '刘洋', '陈静', '杨磊', '黄敏', '周杰'][i % 8]}`,
    status: (['confirmed', 'pending_review', 'rejected', 'archived'] as const)[i % 4],
    owner: owners[(i + 1) % owners.length],
    createdAt: generateDate(Math.floor(i / 6)),
    updatedAt: generateDate(Math.floor(i / 8)),
    batchId: batches[i % 3].id,
    credentialCode: `VC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    credentialType: (['id_card', 'passport', 'ticket_qr', 'order_number'] as const)[i % 4],
    credentialNumber: i % 4 === 0 
      ? `11010119900101123${String(i).padStart(2, '0')}`
      : i % 4 === 1 
        ? `E${String(Math.floor(Math.random() * 900000000) + 100000000)}${String(i).padStart(3, '0')}`
        : `QR${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    visitorName: ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨磊', '黄敏', '周杰'][i % 8],
    phone: `138${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
    visitDate: generateDate(Math.floor(i / 8)).slice(0, 10),
    isValid: i % 7 !== 0,
    verificationCount: Math.min(i, 3),
    lastVerificationTime: i > 0 ? generateDate(Math.floor(i / 5)) : undefined
  }))

  const exceptions: ExceptionReason[] = [
    {
      id: generateId(),
      code: 'EXCP-001',
      name: '重复核销异常-MT20240115001',
      status: 'pending_review',
      owner: '张三',
      createdAt: generateDate(3),
      updatedAt: generateDate(1),
      batchId: batches[0].id,
      exceptionType: 'duplicate_verification',
      severity: 'high',
      description: '检测到同一券码在2小时内被核销3次，疑似系统故障或恶意操作',
      sourceField: 'couponCode',
      thresholdValue: 1,
      actualValue: 3,
      handler: '张三',
      deadline: generateDate(1)
    },
    {
      id: generateId(),
      code: 'EXCP-002',
      name: '闸机离线-GATE-003',
      status: 'pending_supplement',
      owner: '孙八',
      createdAt: generateDate(5),
      updatedAt: generateDate(2),
      batchId: batches[1].id,
      exceptionType: 'gate_offline',
      severity: 'high',
      description: '北门VIP闸机持续离线超过48小时，影响约150名游客入园',
      sourceField: 'isOnline',
      thresholdValue: 1,
      actualValue: 0,
      handler: '孙八',
      deadline: generateDate(0)
    },
    {
      id: generateId(),
      code: 'EXCP-003',
      name: '游客凭证缺失-订单ORD20240228',
      status: 'confirmed',
      owner: '李四',
      createdAt: generateDate(7),
      updatedAt: generateDate(4),
      batchId: batches[1].id,
      exceptionType: 'missing_evidence',
      severity: 'medium',
      description: '携程订单游客未提供有效身份证件，无法完成实名制核验',
      handler: '李四'
    },
    {
      id: generateId(),
      code: 'EXCP-004',
      name: '券码过期异常-MT20240101005',
      status: 'rejected',
      owner: '王五',
      createdAt: generateDate(10),
      updatedAt: generateDate(8),
      batchId: batches[2].id,
      exceptionType: 'expired_coupon',
      severity: 'low',
      description: '游客尝试使用已过期的团购券码，有效期至2024年1月31日',
      handler: '王五'
    },
    {
      id: generateId(),
      code: 'EXCP-005',
      name: '无效券码-MT20240215008',
      status: 'draft',
      owner: '赵六',
      createdAt: generateDate(2),
      updatedAt: generateDate(1),
      batchId: batches[2].id,
      exceptionType: 'invalid_coupon',
      severity: 'medium',
      description: '券码格式校验失败，可能是伪造或篡改的券码'
    }
  ]

  const applications: SupplementApplication[] = [
    {
      id: generateId(),
      code: 'APP-001',
      name: '补录申请-核销记录VR20240115003',
      status: 'pending_review',
      owner: '钱七',
      createdAt: generateDate(4),
      updatedAt: generateDate(2),
      batchId: batches[0].id,
      applicationCode: 'SA-2024-001',
      recordId: records[2]?.id || '',
      applicationType: 'verification_record',
      reason: '闸机离线期间手动核销记录丢失，需补录纸质票据信息'
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
      applicationCode: 'SA-2024-002',
      recordId: records[5]?.id || '',
      applicationType: 'visitor_evidence',
      reason: '外国游客护照信息录入错误，需更正并重新上传扫描件',
      approvedBy: '李四',
      approvalTime: generateDate(3)
    },
    {
      id: generateId(),
      code: 'APP-003',
      name: '补录申请-闸机日志恢复',
      status: 'rejected',
      owner: '周九',
      createdAt: generateDate(8),
      updatedAt: generateDate(5),
      batchId: batches[2].id,
      applicationCode: 'SA-2024-003',
      recordId: records[8]?.id || '',
      applicationType: 'gate_log',
      reason: 'GATE-004闸机数据损坏，请求从备份恢复日志数据',
      rejectionReason: '备份数据不完整，无法完全恢复，建议重新部署设备'
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
    },
    {
      id: generateId(),
      code: 'TRANS-003',
      name: '状态流转-已驳回返回草稿',
      status: 'confirmed',
      owner: '系统',
      createdAt: generateDate(3),
      updatedAt: generateDate(3),
      batchId: batches[1].id,
      entityId: exceptions[3].id,
      entityType: 'exception',
      fromStatus: 'pending_review',
      toStatus: 'rejected',
      action: 'reject',
      operator: '王五',
      reason: '券码确实已过期，不符合补录条件'
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
      action: '发送短信和邮件通知运维人员',
      priority: 2,
      isEnabled: true
    },
    {
      id: generateId(),
      code: 'RULE-003',
      name: '自动审批规则-小额正常核销',
      status: 'pending_review',
      owner: '业务经理',
      createdAt: generateDate(10),
      updatedAt: generateDate(8),
      batchId: batches[1].id,
      ruleCode: 'AUTO_APPROVE_SMALL',
      ruleType: 'workflow',
      condition: 'isSuccess=true且discountPrice<=100且verificationMethod=online',
      action: '自动通过审核',
      priority: 3,
      isEnabled: false
    }
  ]

  const events: ExceptionEvent[] = [
    {
      id: generateId(),
      code: 'EVENT-001',
      name: '系统告警-批量重复核销检测',
      status: 'confirmed',
      owner: '监控系统',
      createdAt: generateDate(3),
      updatedAt: generateDate(2),
      batchId: batches[0].id,
      eventCode: 'SYS-ALERT-001',
      eventType: 'auto_detect',
      relatedEntityIds: [exceptions[0].id, records[0].id, records[1].id],
      description: '系统自动检测到3组重复核销异常，已自动生成异常工单',
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
      description: '现场工作人员上报北门VIP闸机硬件故障，正在维修中',
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

  console.log(`✅ Seed数据初始化完成！`)
  console.log(`   - 对账批次: ${batches.length} 条`)
  console.log(`   - 入园闸机: ${gates.length} 台`)
  console.log(`   - 团购券码: ${coupons.length} 张`)
  console.log(`   - 核销记录: ${records.length} 条`)
  console.log(`   - 游客凭证: ${credentials.length} 个`)
  console.log(`   - 异常原因: ${exceptions.length} 条`)
  console.log(`   - 补录申请: ${applications.length} 个`)
  console.log(`   - 状态流转: ${transitions.length} 条`)
  console.log(`   - 规则配置: ${rules.length} 条`)
  console.log(`   - 异常事件: ${events.length} 条`)
}


