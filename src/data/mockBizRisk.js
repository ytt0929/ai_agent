/**
 * 工商风险查询 Mock 数据
 */

// ====== 企业基础数据 ======
export const enterprises = [
  {
    id: 'ENT001',
    name: '杭州智造装备有限公司',
    creditCode: '91330100MA2KJ8X26R',
    registeredCapital: '1000万',
    establishDate: '2018-03-15',
    status: '存续',
    industry: '制造业',
    region: '浙江省杭州市',
    legalPerson: '陈伟',
    riskLevel: '关注级',
    riskSummary: '工商状态正常，但法人关联存在风险，建议尽调阶段重点核实',
    riskItems: [
      {
        id: 'R001',
        level: '需核实',
        type: '法人关联异常',
        fact: '法人陈伟关联6家企业，其中绍兴某某贸易有限公司经营异常（列入原因：通过登记住所无法联系）',
        suggestion: '核实该异常企业与目标公司是否存在业务往来、资金往来或担保关系',
        status: '待核实',
        detail: {
          relations: [
            { role: '法人', name: '杭州智造装备有限公司', status: '正常' },
            { role: '法人', name: '宁波精工制造有限公司', status: '正常' },
            { role: '股东', name: '杭州智联设备有限公司', status: '正常' },
            { role: '股东', name: '温州创新科技有限公司', status: '正常' },
            { role: '高管', name: '宁波海川精密制造有限公司', status: '正常' },
            { role: '关联', name: '绍兴某某贸易有限公司', status: '经营异常', reason: '通过登记住所无法联系' },
          ]
        }
      },
      {
        id: 'R002',
        level: '关注',
        type: '频繁变更',
        fact: '近12个月法人变更2次，注册资本从500万增至1000万',
        suggestion: '核实变更原因，关注公司治理稳定性',
        status: '待核实',
        detail: {
          changes: [
            { date: '2025-06-20', type: '法人变更', from: '李明', to: '陈伟' },
            { date: '2025-09-15', type: '注册资本变更', from: '500万', to: '1000万' },
            { date: '2026-01-10', type: '经营范围变更', from: '...', to: '...' },
          ]
        }
      },
      {
        id: 'R003',
        level: '关注',
        type: '股权出质',
        fact: '2笔股权出质，质押金额合计500万，质权人为招商银行杭州分行',
        suggestion: '核实质押资金用途，评估对偿债能力影响',
        status: '待核实',
        detail: {
          pledges: [
            { date: '2025-04-01', pledgor: '陈伟', pledgee: '招商银行杭州分行', amount: '300万', status: '有效' },
            { date: '2025-08-20', pledgor: '杭州智联设备有限公司', pledgee: '招商银行杭州分行', amount: '200万', status: '有效' },
          ]
        }
      },
    ],
    normalItems: [
      '工商状态正常（存续）',
      '无被执行记录',
      '无行政处罚',
      '无失信记录',
      '无重大司法诉讼',
    ],
  },
  {
    id: 'ENT002',
    name: '浙江恒远制造有限公司',
    creditCode: '91330000MA2H0X1234',
    registeredCapital: '5000万',
    establishDate: '2010-08-20',
    status: '存续',
    industry: '制造业',
    region: '浙江省宁波市',
    legalPerson: '王强',
    riskLevel: '正常级',
    riskSummary: '工商状态正常，未发现重大风险项',
    riskItems: [],
    normalItems: [
      '工商状态正常（存续）',
      '无被执行记录',
      '无行政处罚',
      '无失信记录',
      '法人无异常关联',
      '无股权出质',
    ],
  },
  {
    id: 'ENT003',
    name: '宁波海川精密制造有限公司',
    creditCode: '91330200MA2K9X5678',
    registeredCapital: '2000万',
    establishDate: '2015-01-10',
    status: '存续',
    industry: '制造业',
    region: '浙江省宁波市',
    legalPerson: '赵磊',
    riskLevel: '高风险',
    riskSummary: '存在3条未结执行记录，法人关联高风险企业',
    riskItems: [
      {
        id: 'R101',
        level: '需核实',
        type: '被执行记录',
        fact: '3条未结执行记录，总执行金额约1200万',
        suggestion: '立即核实执行情况，评估对偿债能力影响，建议暂缓授信',
        status: '待核实',
        detail: {
          executions: [
            { court: '宁波市中级人民法院', caseNo: '(2025)浙02执1234号', amount: '500万', status: '执行中' },
            { court: '宁波市中级人民法院', caseNo: '(2025)浙02执1567号', amount: '300万', status: '执行中' },
            { court: '杭州市上城区人民法院', caseNo: '(2026)浙01执890号', amount: '400万', status: '执行中' },
          ]
        }
      },
      {
        id: 'R102',
        level: '需核实',
        type: '法人失信',
        fact: '法人赵磊为失信被执行人（限制消费令）',
        suggestion: '法人失信直接影响企业信用评级，建议拒贷',
        status: '待核实',
        detail: {}
      },
      {
        id: 'R103',
        level: '关注',
        type: '行政处罚',
        fact: '2025年11月因环保问题被宁波市生态环境局处罚，罚款20万',
        suggestion: '关注整改情况，确认是否已缴纳罚款并完成整改',
        status: '待核实',
        detail: {}
      },
    ],
    normalItems: [
      '工商状态正常（存续）',
    ],
  },
  {
    id: 'ENT004',
    name: '温州精益模具有限公司',
    creditCode: '91330300MA2L0X9012',
    registeredCapital: '800万',
    establishDate: '2012-05-18',
    status: '存续',
    industry: '制造业',
    region: '浙江省温州市',
    legalPerson: '张伟',
    riskLevel: '关注级',
    riskSummary: '经营范围变更频繁，建议关注实际经营情况',
    riskItems: [
      {
        id: 'R201',
        level: '关注',
        type: '经营范围变更',
        fact: '近24个月经营范围变更4次，跨度从模具制造扩展到进出口贸易、房地产咨询',
        suggestion: '核实实际主营业务，关注跨行业经营风险',
        status: '待核实',
        detail: {}
      },
    ],
    normalItems: [
      '工商状态正常（存续）',
      '无被执行记录',
      '无行政处罚',
      '无失信记录',
    ],
  },
  {
    id: 'ENT005',
    name: '绍兴某某贸易有限公司',
    creditCode: '91330600MA2M0X3456',
    registeredCapital: '200万',
    establishDate: '2019-11-02',
    status: '存续（经营异常）',
    industry: '贸易',
    region: '浙江省绍兴市',
    legalPerson: '孙某某',
    riskLevel: '高风险',
    riskSummary: '经营异常，通过登记住所无法联系',
    riskItems: [
      {
        id: 'R301',
        level: '需核实',
        type: '经营异常',
        fact: '2026-01-15被列入经营异常名录，原因：通过登记的住所或者经营场所无法联系',
        suggestion: '确认企业是否实际经营，如为空壳公司则拒绝合作',
        status: '待核实',
        detail: {}
      },
    ],
    normalItems: [
      '无被执行记录',
      '无行政处罚',
    ],
  },
]

// ====== 批量扫描 Mock ======
export const batchEnterprises = enterprises.map(e => ({
  ...e,
  coreRisk: e.riskItems.length > 0
    ? e.riskItems.find(r => r.level === '需核实')?.type || e.riskItems[0]?.type
    : '无',
}))

export const batchTemplates = [
  { id: 'pre-loan', name: '贷前初筛', icon: '🔍', desc: '快速判断是否值得做' },
  { id: 'post-loan', name: '贷后巡检', icon: '📊', desc: '查看最近有什么变化' },
  { id: 'annual', name: '年审排查', icon: '📋', desc: '年度工商风险全景' },
  { id: 'custom', name: '自定义', icon: '⚙️', desc: '自选维度和阈值' },
]

export const templateConfig = {
  'pre-loan': {
    scanDimensions: ['工商状态', '关联风险', '被执行', '失信', '行政处罚', '经营异常'],
    riskThreshold: 'low',
    reportType: '精简版',
    quickIntents: ['关联穿透', '执行/诉讼', '股权穿透'],
    summaryFocus: '能不能做',
  },
  'post-loan': {
    scanDimensions: ['工商变更', '新增诉讼', '新增处罚', '经营异常', '股权变更'],
    riskThreshold: 'medium',
    reportType: '对比版',
    quickIntents: ['变更对比', '新增风险', '恶化分析'],
    summaryFocus: '有没有恶化',
  },
  'annual': {
    scanDimensions: ['全量扫描'],
    riskThreshold: 'high',
    reportType: '完整版',
    quickIntents: ['全景扫描', '关联穿透', '股权穿透', '变更对比', '执行/诉讼'],
    summaryFocus: '年度风险评估',
  },
  'custom': {
    scanDimensions: [],
    riskThreshold: 'custom',
    reportType: '自定义',
    quickIntents: [],
    summaryFocus: '自定义',
  },
}
