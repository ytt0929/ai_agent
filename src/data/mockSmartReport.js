/**
 * 智能报告 - Mock 数据
 */

// 工作区统计
export const reportWorkspaceStats = [
  { key: 'pending', label: '待确认报告', value: 3, tone: 'warning' },
  { key: 'evidence', label: '证据不足', value: 2, tone: 'danger' },
  { key: 'draft', label: '草稿报告', value: 8, tone: 'primary' },
  { key: 'exported', label: '已导出', value: 5, tone: 'success' },
]

// 报告实例
export const reportInstances = [
  {
    id: 'RPT-DD-003',
    enterpriseName: '明达精工有限公司',
    name: '明达精工有限公司 - 单一客户授信调查报告',
    type: '单一客户授信调查报告',
    source: '智能尽调',
    version: 'V1 草稿',
    status: '待确认',
    statusTone: 'warning',
    evidenceCount: 31,
    riskCount: 8,
    pendingCount: 3,
    updatedAt: '2026-06-28 16:20',
    missingItems: [],
  },
  {
    id: 'RPT-DD-002',
    enterpriseName: '宁波天合新材料有限公司',
    name: '宁波天合新材料有限公司 - 授信调查报告',
    type: '授信调查报告',
    source: '智能尽调',
    version: 'V1 草稿',
    status: '证据不足',
    statusTone: 'danger',
    evidenceCount: 18,
    riskCount: 6,
    pendingCount: 5,
    updatedAt: '2026-06-27 11:45',
    missingItems: ['税票数据', '银行流水'],
  },
  {
    id: 'RPT-DIAG-001',
    enterpriseName: '杭州智造装备有限公司',
    name: '杭州智造装备有限公司 - 企业诊断报告',
    type: '企业诊断报告',
    source: '企业诊断',
    version: '正式版',
    status: '已导出',
    statusTone: 'success',
    evidenceCount: 26,
    riskCount: 4,
    pendingCount: 0,
    updatedAt: '2026-06-26 10:15',
    missingItems: [],
  },
]

// 报告模板
export const creditReportTemplates = [
  { id: 'credit', name: '单一客户授信调查报告', desc: '基于尽调证据生成可提交的授信调查报告', icon: 'DocumentChecked' },
  { id: 'risk-diag', name: '企业诊断风险报告', desc: '汇总诊断评分、风险信号和监控建议', icon: 'Warning' },
  { id: 'panorama', name: '企业全景报告', desc: '整合工商、税票、监测与经营视图', icon: 'DataAnalysis' },
]

// 数据源
export const creditReportSources = [
  { id: 'biz', name: '工商查询', status: 'ready', icon: 'OfficeBuilding' },
  { id: 'tax', name: '税票采集', status: 'partial', icon: 'Tickets' },
  { id: 'doc', name: '资料识别', status: 'ready', icon: 'Document' },
  { id: 'diagnosis', name: '企业诊断', status: 'ready', icon: 'Monitor' },
  { id: 'monitor', name: '企业监测', status: 'ready', icon: 'View' },
  { id: 'evidence', name: '尽调证据包', status: 'ready', icon: 'Files' },
]

// 报告上下文（编辑器中使用）
export const reportContext = {
  enterpriseName: '明达精工有限公司',
  reportType: '单一客户授信调查报告',
  source: '智能尽调',
  version: 'V1 草稿',
  status: '待确认',
  evidenceCount: 31,
  riskCount: 8,
  pendingCount: 3,
}

// 规则检查
export const ruleCheckSummary = {
  missingEvidence: 3,
  pendingConclusions: 3,
  forbiddenWords: 0,
  templateRules: 2,
}

// 快捷操作
export const assistantQuickActions = [
  '展开风险分析',
  '补充税票数据',
  '改成审批口吻',
  '检查缺失证据',
  '生成授信方案',
  '检查禁用词',
]

// 授信报告章节（15 章）
export const creditReportSections = [
  {
    id: 'duty',
    no: '一',
    title: '履职声明与基本信息',
    status: '已生成',
    evidenceStatus: '证据完整',
    pending: false,
    body: [
      '明达精工有限公司单一客户授信调查报告',
      '本报告基于现场调查、客户访谈、企业资料、工商司法查询、税票采集及资料识别结果生成，待客户经理确认后用于授信审批。',
    ],
    table: [
      ['申报机构', '浙江分行公司金融部', '主办客户经理', '张经理'],
      ['协办客户经理', '李经理', '风险经理', '王经理'],
      ['完成日期', '2026-06-28', '申请授信额度', '300 万元'],
      ['申请期限', '12 个月', '报告版本', 'V1 草稿'],
    ],
    evidence: [
      { name: '尽调任务记录', status: '已生成', source: '智能尽调' },
      { name: '客户经理现场调查记录', status: '待确认', source: '人工补充' },
    ],
  },
  {
    id: 'important',
    no: '二',
    title: '重要说明事项',
    status: '已生成',
    evidenceStatus: '待人工确认',
    body: [
      '异地授信说明：不涉及。',
      '政策比对：申请人所属行业符合当前政策准入要求。',
      '风险政策：需关注税票授权缺口及法人关联企业说明。',
    ],
    evidence: [
      { name: '行业准入规则', status: '已引用', source: '风险政策库' },
      { name: '异地授信判断', status: '已确认', source: '客户经理确认' },
    ],
  },
  {
    id: 'rating',
    no: '三',
    title: '行内评级及授信情况',
    status: '已生成',
    evidenceStatus: '证据完整',
    tableHeaders: ['评级年度', '评级结果', '授信额度', '提用余额', '担保方式', '备注'],
    tableRows: [
      ['2024', 'A-', '280 万', '160 万', '保证', '正常还款'],
      ['2025', 'A', '300 万', '180 万', '保证+质押', '无逾期'],
      ['2026', 'A-', '300 万', '—', '拟补强', '本次申请'],
    ],
    body: ['申请人近三年评级整体稳定，本次授信额度与历史额度及经营规模基本匹配。'],
    evidence: [
      { name: '行内评级记录', status: '已采集', source: '行内系统' },
      { name: '存量授信台账', status: '已采集', source: '授信系统' },
    ],
  },
  {
    id: 'basic',
    no: '四',
    title: '申请人基本信息',
    status: '已生成',
    evidenceStatus: '证据完整',
    table: [
      ['企业名称', '明达精工有限公司', '统一社会信用代码', '91330300MA29XXXX1Z'],
      ['所属行业', '精密机械制造', '注册地址', '浙江温州'],
      ['实际办公地址', '温州市瓯海区制造园', '成立日期', '2016-05-18'],
      ['注册资本', '3000 万元', '法定代表人', '张某某'],
      ['实际控制人', '张某某', '是否上市', '否'],
    ],
    evidence: [
      { name: '营业执照', status: '已核验', source: '资料识别' },
      { name: '工商登记查询记录', status: '已采集', source: '工商查询' },
    ],
  },
  {
    id: 'equity',
    no: '五',
    title: '股权结构及实控人',
    status: '待确认',
    evidenceStatus: '待人工确认',
    pending: true,
    tableHeaders: ['股东名称', '持股比例', '出资金额', '出资形式', '是否关联交易', '备注'],
    tableRows: [
      ['张某某', '62%', '1860 万', '货币', '否', '实际控制人'],
      ['温州明达投资合伙企业', '25%', '750 万', '货币', '是', '员工持股平台'],
      ['李某', '13%', '390 万', '货币', '否', '财务投资人'],
    ],
    body: ['股权结构已根据工商查询和资料识别结果生成，需客户经理确认实控人说明及关联企业情况。'],
    evidence: [
      { name: '股权穿透记录', status: '已采集', source: '工商查询' },
      { name: '公司章程', status: '已识别', source: '资料识别' },
      { name: '实控人访谈记录', status: '待补充', source: '人工补充' },
    ],
  },
  {
    id: 'operation',
    no: '六',
    title: '经营情况',
    status: '已生成',
    evidenceStatus: '部分缺失',
    body: [
      '申请人主营业务为精密机械零部件加工及成套设备配套，主要客户集中在长三角制造业企业。',
      '生产经营场所位于温州市瓯海区制造园，经营场所为租赁，主要生产设备与当前产能基本匹配。',
    ],
    tableHeaders: ['类别', '名称', '合作年限', '交易占比', '结算方式'],
    tableRows: [
      ['上游供应商', '温州华新钢材', '5 年', '24%', '月结'],
      ['上游供应商', '宁波精密配件', '3 年', '18%', '票到付款'],
      ['下游客户', '杭州智造装备', '4 年', '31%', '90 天账期'],
      ['下游客户', '台州自动化设备', '2 年', '21%', '60 天账期'],
    ],
    evidence: [
      { name: '主要销售合同', status: '已识别', source: '资料识别' },
      { name: '供应商开票记录', status: '已采集', source: '税票采集' },
      { name: '现场照片', status: '待补充', source: '人工补充' },
    ],
  },
  {
    id: 'finance',
    no: '七',
    title: '财务状况',
    status: '证据不足',
    evidenceStatus: '部分缺失',
    pending: true,
    table: [
      ['资产总额', '6200 万', '负债总额', '3180 万'],
      ['营业收入', '5800 万', '净利润', '420 万'],
      ['资产负债率', '51.3%', '流动比率', '1.42'],
      ['刚性负债', '1850 万', '刚性负债净敞口', '960 万'],
    ],
    body: ['税票数据覆盖率 78%，2024 年部分税票缺失，收入连续性判断需补充银行流水。'],
    evidence: [
      { name: '2025 年审计报告', status: '已识别', source: '资料识别' },
      { name: '税票数据', status: '部分缺失', source: '税票采集' },
      { name: '银行流水', status: '缺失', source: '待补资料' },
    ],
  },
  {
    id: 'income',
    no: '八',
    title: '收入真实性核实',
    status: '证据不足',
    evidenceStatus: '部分缺失',
    tableHeaders: ['核验项目', '金额', '差异情况', '核验结论'],
    tableRows: [
      ['报表收入', '5800 万', '—', '待交叉验证'],
      ['增值税开票', '5300 万', '差异 8.6%', '需说明'],
      ['所得税申报收入', '5480 万', '差异 5.5%', '基本匹配'],
    ],
    body: ['报表收入与税票开票存在 8.6% 差异，需补充银行流水进行交叉验证。'],
    evidence: [
      { name: '税票 RPA', status: '已采集', source: '税票采集' },
      { name: '纳税申报表', status: '已识别', source: '资料识别' },
      { name: '银行流水', status: '缺失', source: '待补资料' },
      { name: '审计报告', status: '已识别', source: '资料识别' },
    ],
  },
  {
    id: 'credit-check',
    no: '九',
    title: '信用状况',
    status: '已生成',
    evidenceStatus: '证据完整',
    body: [
      '征信查询状态正常，未发现当前逾期及关注类不良记录。',
      '银行融资余额 180 万元，对外担保余额 80 万元，未发现非标融资和民间融资异常。',
    ],
    evidence: [
      { name: '企业征信授权书', status: '已识别', source: '资料识别' },
      { name: '征信报告', status: '已采集', source: '征信查询' },
    ],
  },
  {
    id: 'industry',
    no: '十',
    title: '行业地位比较',
    status: '待补充',
    evidenceStatus: '待人工确认',
    body: [
      '申请人处于精密机械制造细分行业中游，具备稳定客户基础，但规模优势有限。',
      '同业对比数据待补充，建议客户经理补充行业协会或公开行业资料来源。',
    ],
    evidence: [
      { name: '行业公开资料', status: '待补充', source: '人工补充' },
    ],
  },
  {
    id: 'negative',
    no: '十一',
    title: '诉讼与负面信息',
    status: '已生成',
    evidenceStatus: '证据完整',
    body: [
      '司法风险：无重大诉讼。',
      '行政处罚：1 项轻微环保处罚，已整改。',
      '舆情：无重大负面。',
      '预警：命中 2 条经营波动预警。',
    ],
    evidence: [
      { name: '司法查询', status: '已采集', source: '工商司法' },
      { name: '企业监测预警', status: '已采集', source: '企业监测' },
    ],
  },
  {
    id: 'risk',
    no: '十二',
    title: '主要风险分析',
    status: '待确认',
    evidenceStatus: '部分缺失',
    pending: true,
    risks: [
      { level: '高风险', title: '税票数据授权存在缺口', basis: '2024 年部分税票缺失，影响收入连续性判断。' },
      { level: '高风险', title: '法人关联企业异常', basis: '法人名下 3 家关联企业，其中 1 家已注销未披露。' },
      { level: '中风险', title: '应收账款集中度高', basis: '前两大客户应收占比约 68%。' },
      { level: '中风险', title: '存货周转率下降', basis: '近三个季度连续下降。' },
    ],
    body: ['客户授信核心风险集中在收入真实性、关联企业披露和应收账款集中度。'],
    evidence: [
      { name: '风险诊断摘要', status: '已生成', source: '企业诊断' },
      { name: '税票采集记录', status: '部分缺失', source: '税票采集' },
    ],
  },
  {
    id: 'limit',
    no: '十三',
    title: '授信额度依据',
    status: '已生成',
    evidenceStatus: '证据完整',
    table: [
      ['申请额度', '300 万', '评级模型参考额度', '350 万'],
      ['同业授信参考', '280-400 万', '建议控制额度', '不超过 300 万'],
    ],
    body: ['本次额度与申请人经营规模、历史授信表现及风险缓释措施基本匹配。'],
    evidence: [
      { name: '评级模型测算', status: '已生成', source: '行内模型' },
      { name: '同业授信参考', status: '已采集', source: '征信查询' },
    ],
  },
  {
    id: 'solution',
    no: '十四',
    title: '调查结论与授信方案',
    status: '待确认',
    evidenceStatus: '待人工确认',
    pending: true,
    table: [
      ['授信金额', '300 万', '币种', '人民币'],
      ['期限', '12 个月', '品种', '流动资金贷款'],
      ['用途', '采购原材料及日常经营周转', '担保方式', '实际控制人连带责任保证 + 应收账款质押'],
      ['还款方式', '按月付息，到期还本', '资金监管', '回款账户纳入监测'],
      ['提款条件', '补充 2024 年税票说明、确认法人关联企业情况', '贷后管理', '重点跟踪税票波动、司法风险和应收账款集中度'],
    ],
    body: ['调查意见：在落实提款条件及贷后监测要求后，可按上述方案办理授信。'],
    evidence: [
      { name: '风险诊断摘要', status: '已生成', source: '企业诊断' },
      { name: '授信方案测算', status: '已生成', source: '智能报告' },
    ],
  },
  {
    id: 'attachments',
    no: '十五',
    title: '附件清单',
    status: '待补充',
    evidenceStatus: '部分缺失',
    body: [
      '已归集附件：营业执照、公司章程、审计报告、纳税申报表、主要销售合同。',
      '待补充附件：银行流水、现场调查照片、实控人访谈记录。',
    ],
    evidence: [
      { name: '资料识别结果', status: '已生成', source: '资料识别' },
      { name: '基础调查工作表', status: '待补充', source: '人工补充' },
    ],
  },
]

// 待确认事项（编辑器中）
export const pendingItems = [
  { id: 'p1', title: '税票授权缺口说明', confirmed: false },
  { id: 'p2', title: '法人关联企业说明', confirmed: false },
  { id: 'p3', title: '偿债能力结论', confirmed: false },
]
