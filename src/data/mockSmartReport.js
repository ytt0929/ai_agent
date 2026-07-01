/**
 * 智能报告 - Mock 数据
 * 新定位：AI 报告交付工作台
 * 兼容旧导出：reportTemplates, dataSources, reportHistory, getReportContent
 */

// ════════════════════════════════════════
// 新数据（AI 报告交付工作台）
// ════════════════════════════════════════

// 交付概览统计
export const deliveryStats = {
  pendingReports: 3,
  missingMaterials: 2,
  templateVersion: 6,
  pendingExport: 4,
}

// 报告任务列表
export const reportTasks = [
  {
    id: 'RPT-001',
    enterpriseName: '明达精工有限公司',
    reportName: '单户授信调查报告',
    source: '智能尽调',
    templateName: '单户授信调查报告通用版 V2021',
    status: '待确认',
    pendingCount: 3,
    materialComplete: 86,
    aiNote: '第8章收入真实性、第12章风险分析、第14章授信方案需要客户经理确认',
    updatedAt: '2026-06-28 16:20',
  },
  {
    id: 'RPT-002',
    enterpriseName: '宁波天合新材料有限公司',
    reportName: '授信调查报告',
    source: '资料附件生成',
    templateName: '单户授信调查报告通用版 V2021',
    status: '资料缺失',
    missingMaterials: ['税票数据', '银行流水'],
    materialComplete: 62,
    aiNote: '当前资料只能生成草稿，收入真实性章节证据不足',
    updatedAt: '2026-06-27 11:45',
  },
  {
    id: 'RPT-003',
    enterpriseName: '杭州智造装备有限公司',
    reportName: '企业全景报告',
    source: '上传资料生成',
    templateName: '企业全景报告模板 V2',
    status: '待导出',
    materialComplete: 94,
    aiNote: '报告正文已完成，可连同资料包导出',
    updatedAt: '2026-06-26 10:15',
  },
]

// 报告模板库
export const reportTemplates = [
  {
    id: 'credit-v2021',
    name: '单户授信调查报告通用版 V2021',
    desc: '适用于单一客户授信审批的标准调查报告模板',
    version: 'V2021',
    type: '授信调查',
    sectionsCount: 15,
    requiredMaterials: 8,
    updatedAt: '2026-05-15',
    status: 'active',
  },
  {
    id: 'panorama-v2',
    name: '企业全景报告模板 V2',
    desc: '整合工商、税票、监测与经营视图的全景报告',
    version: 'V2',
    type: '全景报告',
    sectionsCount: 12,
    requiredMaterials: 6,
    updatedAt: '2026-06-01',
    status: 'active',
  },
  {
    id: 'diagnosis-v1',
    name: '企业诊断报告模板 V1',
    desc: '基于企业诊断评分和风险信号生成的诊断报告',
    version: 'V1',
    type: '诊断报告',
    sectionsCount: 8,
    requiredMaterials: 5,
    updatedAt: '2026-04-20',
    status: 'active',
  },
]

// 资料包管理
export const materialPackages = [
  {
    id: 'MAT-001',
    enterpriseName: '明达精工有限公司',
    packageName: '明达精工尽调证据包',
    source: '智能尽调',
    materialCount: 6,
    missingCount: 0,
    updatedAt: '2026-06-28',
    materials: [
      { id: 'm1', name: '营业执照', type: '证照', source: '资料识别', status: '已关联', relatedSections: ['duty', 'basic'], extractedSummary: '企业名称：明达精工有限公司，统一信用代码：91330300MA29XXXX1Z，注册资本3000万' },
      { id: 'm2', name: '审计报告', type: '财务', source: '用户上传', status: '已关联', relatedSections: ['finance', 'income'], extractedSummary: '2025年度审计报告，资产总额6200万，负债总额3180万，净利润420万' },
      { id: 'm3', name: '纳税申报表', type: '税务', source: '资料识别', status: '已关联', relatedSections: ['finance', 'income'], extractedSummary: '2025年度企业所得税申报表，申报收入5480万' },
      { id: 'm4', name: '银行流水', type: '银行', source: '资料识别', status: '已关联', relatedSections: ['finance', 'income'], extractedSummary: '2025年1-12月主要账户流水，月均流入约480万' },
      { id: 'm5', name: '销售合同', type: '合同', source: '用户上传', status: '已关联', relatedSections: ['operation'], extractedSummary: '与杭州智造装备签订的主合同，金额1200万，账期90天' },
      { id: 'm6', name: '现场照片', type: '影像', source: '人工补充', status: '已关联', relatedSections: ['operation', 'duty'], extractedSummary: '生产经营场所照片12张，含车间、仓库、办公区' },
    ],
  },
  {
    id: 'MAT-002',
    enterpriseName: '宁波天合新材料有限公司',
    packageName: '宁波天合补充资料包',
    source: '用户上传',
    materialCount: 4,
    missingCount: 2,
    updatedAt: '2026-06-27',
    materials: [
      { id: 'm7', name: '营业执照', type: '证照', source: '资料识别', status: '已关联', relatedSections: ['duty', 'basic'], extractedSummary: '统一信用代码：91330200MA2CXXXX8Y，注册资本5000万' },
      { id: 'm8', name: '审计报告', type: '财务', source: '资料识别', status: '已关联', relatedSections: ['finance'], extractedSummary: '2025年度审计报告，资产总额9800万' },
      { id: 'm9', name: '纳税申报表', type: '税务', source: '资料识别', status: '已关联', relatedSections: ['finance', 'income'], extractedSummary: '部分纳税申报表，缺2024年Q3-Q4数据' },
      { id: 'm10', name: '访谈记录', type: '笔录', source: '人工补充', status: '已关联', relatedSections: ['duty', 'operation'], extractedSummary: '与法人张某的访谈记录，确认主营业务及主要客户' },
    ],
  },
  {
    id: 'MAT-003',
    enterpriseName: '杭州智造装备有限公司',
    packageName: '杭州智造全景资料包',
    source: '资料识别',
    materialCount: 5,
    missingCount: 1,
    updatedAt: '2026-06-26',
    materials: [
      { id: 'm11', name: '营业执照', type: '证照', source: '资料识别', status: '已关联', relatedSections: ['basic'], extractedSummary: '统一信用代码：91330100MA2BXXXX5T，注册资本2000万' },
      { id: 'm12', name: '审计报告', type: '财务', source: '用户上传', status: '已关联', relatedSections: ['finance'], extractedSummary: '2024-2025两年审计报告' },
      { id: 'm13', name: '纳税申报表', type: '税务', source: '资料识别', status: '已关联', relatedSections: ['finance'], extractedSummary: '2025年度完整纳税申报' },
      { id: 'm14', name: '销售合同', type: '合同', source: '用户上传', status: '已关联', relatedSections: ['operation'], extractedSummary: '主要销售合同3份，总额2800万' },
      { id: 'm15', name: '现场照片', type: '影像', source: '人工补充', status: '已关联', relatedSections: ['operation'], extractedSummary: '生产车间及办公区域照片8张' },
    ],
  },
]

// 上传入口选项
export const uploadEntryOptions = [
  { key: 'template', label: '上传报告模板', desc: '上传自定义报告模板文件' },
  { key: 'materials', label: '上传资料附件生成报告', desc: '上传企业资料，AI 自动识别并生成报告' },
  { key: 'supplement', label: '上传补缺资料', desc: '为已有报告补充缺失资料' },
  { key: 'regenerate', label: '上传旧报告按新模板生成', desc: '基于旧报告内容，按新模板重新编排' },
]

// 报告章节（单户授信调查报告 15 章）
export const reportSections = [
  {
    id: 'duty', no: '一', title: '履职声明与基本信息', status: '已生成', materialStatus: '完整',
    relatedMaterialIds: ['m1'],
    aiNote: '',
    body: ['明达精工有限公司单一客户授信调查报告', '本报告基于现场调查、客户访谈、企业资料、工商司法查询、税票采集及资料识别结果生成，待客户经理确认后用于授信审批。'],
    table: [
      ['申报机构', '浙江分行公司金融部', '主办客户经理', '张经理'],
      ['协办客户经理', '李经理', '风险经理', '王经理'],
      ['完成日期', '2026-06-28', '申请授信额度', '300 万元'],
      ['申请期限', '12 个月', '报告版本', 'V1 草稿'],
    ],
  },
  {
    id: 'important', no: '二', title: '重要说明事项', status: '已生成', materialStatus: '完整',
    relatedMaterialIds: [],
    aiNote: '',
    body: ['异地授信说明：不涉及。', '政策比对：申请人所属行业符合当前政策准入要求。', '风险政策：需关注税票授权缺口及法人关联企业说明。'],
  },
  {
    id: 'rating', no: '三', title: '行内评级及授信情况', status: '已生成', materialStatus: '完整',
    relatedMaterialIds: [],
    aiNote: '',
    tableHeaders: ['评级年度', '评级结果', '授信额度', '提用余额', '担保方式', '备注'],
    tableRows: [
      ['2024', 'A-', '280 万', '160 万', '保证', '正常还款'],
      ['2025', 'A', '300 万', '180 万', '保证+质押', '无逾期'],
      ['2026', 'A-', '300 万', '—', '拟补强', '本次申请'],
    ],
    body: ['申请人近三年评级整体稳定，本次授信额度与历史额度及经营规模基本匹配。'],
  },
  {
    id: 'basic', no: '四', title: '申请人基本信息', status: '已生成', materialStatus: '完整',
    relatedMaterialIds: ['m1'],
    aiNote: '',
    body: [],
    table: [
      ['企业名称', '明达精工有限公司', '统一社会信用代码', '91330300MA29XXXX1Z'],
      ['所属行业', '精密机械制造', '注册地址', '浙江温州'],
      ['实际办公地址', '温州市瓯海区制造园', '成立日期', '2016-05-18'],
      ['注册资本', '3000 万元', '法定代表人', '张某某'],
      ['实际控制人', '张某某', '是否上市', '否'],
    ],
  },
  {
    id: 'equity', no: '五', title: '股权结构及实控人', status: '待确认', materialStatus: '待确认',
    relatedMaterialIds: ['m1'],
    aiNote: '需客户经理确认实控人说明及关联企业情况',
    tableHeaders: ['股东名称', '持股比例', '出资金额', '出资形式', '是否关联交易', '备注'],
    tableRows: [
      ['张某某', '62%', '1860 万', '货币', '否', '实际控制人'],
      ['温州明达投资合伙企业', '25%', '750 万', '货币', '是', '员工持股平台'],
      ['李某', '13%', '390 万', '货币', '否', '财务投资人'],
    ],
    body: ['股权结构已根据工商查询和资料识别结果生成，需客户经理确认实控人说明及关联企业情况。'],
  },
  {
    id: 'operation', no: '六', title: '经营情况', status: '已生成', materialStatus: '部分缺失',
    relatedMaterialIds: ['m5', 'm6'],
    aiNote: '建议补充现场调查照片',
    tableHeaders: ['类别', '名称', '合作年限', '交易占比', '结算方式'],
    tableRows: [
      ['上游供应商', '温州华新钢材', '5 年', '24%', '月结'],
      ['上游供应商', '宁波精密配件', '3 年', '18%', '票到付款'],
      ['下游客户', '杭州智造装备', '4 年', '31%', '90 天账期'],
      ['下游客户', '台州自动化设备', '2 年', '21%', '60 天账期'],
    ],
    body: ['申请人主营业务为精密机械零部件加工及成套设备配套，主要客户集中在长三角制造业企业。', '生产经营场所位于温州市瓯海区制造园，经营场所为租赁，主要生产设备与当前产能基本匹配。'],
  },
  {
    id: 'finance', no: '七', title: '财务状况', status: '待确认', materialStatus: '部分缺失',
    relatedMaterialIds: ['m2', 'm3', 'm4'],
    aiNote: '税票覆盖率78%，2024年部分税票缺失，建议补充银行流水',
    table: [
      ['资产总额', '6200 万', '负债总额', '3180 万'],
      ['营业收入', '5800 万', '净利润', '420 万'],
      ['资产负债率', '51.3%', '流动比率', '1.42'],
      ['刚性负债', '1850 万', '刚性负债净敞口', '960 万'],
    ],
    body: ['税票数据覆盖率 78%，2024 年部分税票缺失，收入连续性判断需补充银行流水。'],
  },
  {
    id: 'income', no: '八', title: '收入真实性核实', status: '待确认', materialStatus: '部分缺失',
    relatedMaterialIds: ['m2', 'm3', 'm4'],
    aiNote: '报表收入与税票差异8.6%，银行流水缺失导致交叉验证不充分',
    tableHeaders: ['核验项目', '金额', '差异情况', '核验结论'],
    tableRows: [
      ['报表收入', '5800 万', '—', '待交叉验证'],
      ['增值税开票', '5300 万', '差异 8.6%', '需说明'],
      ['所得税申报收入', '5480 万', '差异 5.5%', '基本匹配'],
    ],
    body: ['报表收入与税票开票存在 8.6% 差异，需补充银行流水进行交叉验证。'],
  },
  {
    id: 'credit', no: '九', title: '信用状况', status: '已生成', materialStatus: '完整',
    relatedMaterialIds: [],
    aiNote: '',
    body: ['征信查询状态正常，未发现当前逾期及关注类不良记录。', '银行融资余额 180 万元，对外担保余额 80 万元，未发现非标融资和民间融资异常。'],
  },
  {
    id: 'industry', no: '十', title: '行业地位比较', status: '已生成', materialStatus: '资料不足',
    relatedMaterialIds: [],
    aiNote: '建议补充行业协会或公开行业资料来源',
    body: ['申请人处于精密机械制造细分行业中游，具备稳定客户基础，但规模优势有限。', '同业对比数据待补充，建议客户经理补充行业协会或公开行业资料来源。'],
  },
  {
    id: 'negative', no: '十一', title: '诉讼与负面信息', status: '已生成', materialStatus: '完整',
    relatedMaterialIds: [],
    aiNote: '',
    body: ['司法风险：无重大诉讼。', '行政处罚：1 项轻微环保处罚，已整改。', '舆情：无重大负面。', '预警：命中 2 条经营波动预警。'],
  },
  {
    id: 'risk', no: '十二', title: '主要风险分析', status: '待确认', materialStatus: '部分缺失',
    relatedMaterialIds: ['m2', 'm3'],
    aiNote: '税票缺口影响收入真实性判断',
    body: ['客户授信核心风险集中在收入真实性、关联企业披露和应收账款集中度。'],
    risks: [
      { level: '高风险', title: '税票数据授权存在缺口', basis: '2024 年部分税票缺失，影响收入连续性判断。' },
      { level: '高风险', title: '法人关联企业异常', basis: '法人名下 3 家关联企业，其中 1 家已注销未披露。' },
      { level: '中风险', title: '应收账款集中度高', basis: '前两大客户应收占比约 68%。' },
      { level: '中风险', title: '存货周转率下降', basis: '近三个季度连续下降。' },
    ],
  },
  {
    id: 'limit', no: '十三', title: '授信额度依据', status: '已生成', materialStatus: '完整',
    relatedMaterialIds: [],
    aiNote: '',
    table: [
      ['申请额度', '300 万', '评级模型参考额度', '350 万'],
      ['同业授信参考', '280-400 万', '建议控制额度', '不超过 300 万'],
    ],
    body: ['本次额度与申请人经营规模、历史授信表现及风险缓释措施基本匹配。'],
  },
  {
    id: 'solution', no: '十四', title: '调查结论与授信方案', status: '待确认', materialStatus: '待确认',
    relatedMaterialIds: [],
    aiNote: '授信方案需客户经理最终确认',
    table: [
      ['授信金额', '300 万', '币种', '人民币'],
      ['期限', '12 个月', '品种', '流动资金贷款'],
      ['用途', '采购原材料及日常经营周转', '担保方式', '实际控制人连带责任保证 + 应收账款质押'],
      ['还款方式', '按月付息，到期还本', '资金监管', '回款账户纳入监测'],
      ['提款条件', '补充 2024 年税票说明、确认法人关联企业情况', '贷后管理', '重点跟踪税票波动、司法风险和应收账款集中度'],
    ],
    body: ['调查意见：在落实提款条件及贷后监测要求后，可按上述方案办理授信。'],
  },
  {
    id: 'attachments', no: '十五', title: '附件清单', status: '待补充', materialStatus: '部分缺失',
    relatedMaterialIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
    aiNote: '待补充：银行流水、现场调查照片、实控人访谈记录',
    body: ['已归集附件：营业执照、公司章程、审计报告、纳税申报表、主要销售合同。', '待补充附件：银行流水、现场调查照片、实控人访谈记录。'],
  },
]

// 章节资料关联（编辑页右侧展示）
export const sectionMaterials = reportSections.map(s => ({
  sectionId: s.id,
  materials: materialPackages[0].materials.filter(m => (s.relatedMaterialIds || []).includes(m.id)),
}))

// 待确认事项
export const pendingConfirmations = [
  { id: 'pc1', title: '税票授权缺口说明', confirmed: false, relatedSectionIds: ['finance', 'income'] },
  { id: 'pc2', title: '法人关联企业说明', confirmed: false, relatedSectionIds: ['equity', 'risk'] },
  { id: 'pc3', title: '偿债能力结论', confirmed: false, relatedSectionIds: ['finance', 'solution'] },
]

// AI 报告交付助手快捷动作
export const aiDeliveryActions = [
  '按新模板重新生成',
  '改写当前章节',
  '改成审批口吻',
  '压缩本节内容',
  '根据资料包重新生成本节',
  '检查本节缺失资料',
  '查看本节引用资料',
  '上传补充资料',
  '发起尽调核验',
  '批量导出报告和资料包',
]

// 导出包选项
export const exportPackages = [
  { key: 'report', label: '报告正文', checked: true },
  { key: 'attachments', label: '附件清单', checked: true },
  { key: 'materials', label: '资料包', checked: true },
  { key: 'evidence', label: '证据目录', checked: false },
]

// ════════════════════════════════════════
// 兼容旧导出（smartReport.js 使用）
// ════════════════════════════════════════

export const dataSources = [
  { id: 'biz', name: '工商查询', status: 'ready' },
  { id: 'tax', name: '税票采集', status: 'partial' },
  { id: 'doc', name: '资料识别', status: 'ready' },
  { id: 'diagnosis', name: '企业诊断', status: 'ready' },
  { id: 'monitor', name: '企业监测', status: 'ready' },
  { id: 'evidence', name: '尽调证据包', status: 'ready' },
]

export const reportHistory = [
  {
    id: 'RPT-DD-003',
    enterpriseName: '明达精工有限公司',
    name: '明达精工有限公司 - 单一客户授信调查报告',
    type: '单一客户授信调查报告',
    template: '单一客户授信调查报告',
    status: '待确认',
    pendingCount: 3,
    updatedAt: '2026-06-28 16:20',
  },
  {
    id: 'RPT-DD-002',
    enterpriseName: '宁波天合新材料有限公司',
    name: '宁波天合新材料有限公司 - 授信调查报告',
    type: '授信调查报告',
    template: '单一客户授信调查报告',
    status: '证据不足',
    pendingCount: 5,
    updatedAt: '2026-06-27 11:45',
  },
  {
    id: 'RPT-DIAG-001',
    enterpriseName: '杭州智造装备有限公司',
    name: '杭州智造装备有限公司 - 企业诊断报告',
    type: '企业诊断报告',
    template: '企业诊断报告',
    status: '已导出',
    pendingCount: 0,
    updatedAt: '2026-06-26 10:15',
  },
]

export function getReportContent(templateId, enterprise) {
  const sections = reportSections.map(s => ({
    id: s.id,
    title: s.no + '、' + s.title,
    content: (s.body || []).join('\n\n'),
    dataItems: [],
  }))
  return {
    id: 'RPT-' + Date.now(),
    enterpriseName: enterprise?.name || '未知企业',
    template: templateId || 'credit-v2021',
    sections,
  }
}
