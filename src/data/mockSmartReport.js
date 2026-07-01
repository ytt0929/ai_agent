/**
 * 智能报告 - Mock 数据
 * 新定位：AI 报告交付工作台
 * 兼容旧导出：reportTemplates, dataSources, reportHistory, getReportContent
 */

// ════════════════════════════════════════
// 银行机构数据
// ════════════════════════════════════════

export const bankOrgs = [
  { id: 'bank-zj', name: '浙江银行', shortName: '浙银', orgIds: ['zj-hq', 'zj-nb'] },
  { id: 'bank-nb', name: '宁波银行', shortName: '宁银', orgIds: ['nb-hq', 'nb-yz'] },
  { id: 'bank-hz', name: '杭州银行', shortName: '杭银', orgIds: ['hz-hq', 'hz-xh'] },
  { id: 'bank-js', name: '江苏银行', shortName: '苏银', orgIds: ['js-hq', 'js-nj'] },
  { id: 'bank-sh', name: '上海银行', shortName: '沪银', orgIds: ['sh-hq', 'sh-pd'] },
  { id: 'bank-icbc-zj', name: '工商银行浙江分行', shortName: '工行浙江', orgIds: ['icbc-zj-hq'] },
  { id: 'bank-ccb-zj', name: '建设银行浙江分行', shortName: '建行浙江', orgIds: ['ccb-zj-hq'] },
  { id: 'bank-abc-nb', name: '农业银行宁波分行', shortName: '农行宁波', orgIds: ['abc-nb-hq'] },
]

export const orgUnits = [
  { id: 'zj-hq', bankId: 'bank-zj', name: '浙江银行总行', city: '杭州' },
  { id: 'zj-nb', bankId: 'bank-zj', name: '浙江银行宁波分行', city: '宁波' },
  { id: 'nb-hq', bankId: 'bank-nb', name: '宁波银行总行', city: '宁波' },
  { id: 'nb-yz', bankId: 'bank-nb', name: '宁波银行鄞州支行', city: '宁波' },
  { id: 'hz-hq', bankId: 'bank-hz', name: '杭州银行总行', city: '杭州' },
  { id: 'hz-xh', bankId: 'bank-hz', name: '杭州银行下城支行', city: '杭州' },
  { id: 'js-hq', bankId: 'bank-js', name: '江苏银行总行', city: '南京' },
  { id: 'js-nj', bankId: 'bank-js', name: '江苏银行南京分行', city: '南京' },
  { id: 'sh-hq', bankId: 'bank-sh', name: '上海银行总行', city: '上海' },
  { id: 'sh-pd', bankId: 'bank-sh', name: '上海银行浦东支行', city: '上海' },
  { id: 'icbc-zj-hq', bankId: 'bank-icbc-zj', name: '工商银行浙江分行公司部', city: '杭州' },
  { id: 'ccb-zj-hq', bankId: 'bank-ccb-zj', name: '建设银行浙江分行公司部', city: '杭州' },
  { id: 'abc-nb-hq', bankId: 'bank-abc-nb', name: '农业银行宁波分行公司部', city: '宁波' },
]

// ════════════════════════════════════════
// 交付概览统计
// ════════════════════════════════════════

export const deliveryStats = {
  pendingReports: 3,
  missingMaterials: 2,
  templateVersion: 10,
  pendingExport: 4,
}

// 报告任务列表
export const reportTasks = [
  {
    id: 'RPT-001',
    enterpriseName: '明达精工有限公司',
    reportName: '单户授信调查报告',
    source: '智能尽调',
    templateId: 'credit-v2021',
    templateName: '单户授信调查报告通用版 V2021',
    materialPackageId: 'MAT-001',
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
    templateId: 'credit-v2021',
    templateName: '单户授信调查报告通用版 V2021',
    materialPackageId: 'MAT-002',
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
    templateId: 'panorama-v2',
    templateName: '企业全景报告模板 V2',
    materialPackageId: 'MAT-003',
    status: '待导出',
    materialComplete: 94,
    aiNote: '报告正文已完成，可连同资料包导出',
    updatedAt: '2026-06-26 10:15',
  },
]

// ════════════════════════════════════════
// AI 推荐任务
// ════════════════════════════════════════

export const aiRecommendedTasks = [
  { id: 'ai-rec-1', type: 'pending-confirm', title: '处理明达精工待确认报告', reportId: 'RPT-001', priority: 'high', summary: '3 个待确认项需要处理', label: '🔶 待确认' },
  { id: 'ai-rec-2', type: 'missing-materials', title: '检查宁波天合缺失资料', reportId: 'RPT-002', priority: 'high', summary: '2 份资料缺失，影响收入真实性章节', label: '🔴 缺资料' },
  { id: 'ai-rec-3', type: 'export', title: '导出杭州智造全景报告交付包', reportId: 'RPT-003', priority: 'medium', summary: '报告已完成，可导出交付', label: '🟢 可导出' },
  { id: 'ai-rec-4', type: 'template-upload', title: '上传浙江分行新版授信模板', reportId: null, priority: 'medium', summary: '当前模板 V2021，建议更新到分行 V2024', label: '📋 模板维护' },
  { id: 'ai-rec-5', type: 'regenerate', title: '按新模板重排明达精工报告', reportId: 'RPT-001', priority: 'medium', summary: '将明达精工报告重排为浙江分行 V2024 模板', label: '🔄 重排' },
]

// AI 任务卡预设
export const aiTaskCardPresets = [
  {
    id: 'preset-regenerate', type: 'regenerate', title: '按新模板重排报告',
    userGoal: '按浙江分行新模板重排明达精工授信调查报告',
    targetReportId: 'RPT-001', targetTemplateId: 'credit-v2021', targetNewTemplateId: 'credit-zj-v2024', targetMaterialPackageId: 'MAT-001',
    summary: '将明达精工报告从总行通用版重排为浙江分行新版',
    steps: [
      { label: '读取旧报告', status: 'pending' }, { label: '匹配新模板章节', status: 'pending' },
      { label: '检查资料包覆盖', status: 'pending' }, { label: '生成重排预览', status: 'pending' }, { label: '标记待确认项', status: 'pending' },
    ],
    actions: [{ key: 'check-template-diff', label: '查看模板差异' }, { key: 'start-regenerate', label: '开始重排' }, { key: 'check-missing-materials', label: '先检查资料缺口' }],
    result: null, status: 'planned',
  },
  {
    id: 'preset-missing-materials', type: 'missing-materials', title: '检查缺失资料',
    userGoal: '检查宁波天合缺失资料',
    targetReportId: 'RPT-002', targetTemplateId: 'credit-v2021', targetMaterialPackageId: 'MAT-002',
    summary: '宁波天合报告缺失银行流水和税票数据',
    steps: [
      { label: '扫描资料包', status: 'pending' }, { label: '比对模板资料要求', status: 'pending' },
      { label: '生成缺失清单', status: 'pending' }, { label: '标记阻断项', status: 'pending' },
    ],
    actions: [{ key: 'scan-materials', label: '扫描缺失' }, { key: 'supplement-material', label: '补充资料' }, { key: 'export-missing-list', label: '导出缺失清单' }],
    result: null, status: 'planned',
  },
  {
    id: 'preset-upload-template', type: 'upload-template', title: '上传并解析模板',
    userGoal: '上传浙江分行新版授信模板',
    targetReportId: null, targetTemplateId: null, targetMaterialPackageId: null,
    summary: '上传浙江分行 V2024 授信模板并解析章节结构',
    steps: [
      { label: '解析 Word 模板章节', status: 'pending' }, { label: '提取占位字段', status: 'pending' },
      { label: '推断资料要求', status: 'pending' }, { label: '与当前默认模板比较', status: 'pending' },
    ],
    actions: [{ key: 'upload-template', label: '上传模板' }, { key: 'parse-template', label: '解析模板' }, { key: 'compare-default', label: '比较差异' }],
    result: null, status: 'planned',
  },
  {
    id: 'preset-export', type: 'export-package', title: '导出交付包',
    userGoal: '导出杭州智造全景报告交付包',
    targetReportId: 'RPT-003', targetTemplateId: 'panorama-v2', targetMaterialPackageId: 'MAT-003',
    summary: '杭州智造报告已完成，导出报告正文+资料包+证据目录',
    steps: [
      { label: '执行交付前检查', status: 'pending' }, { label: '确认导出内容', status: 'pending' }, { label: '生成导出包', status: 'pending' },
    ],
    actions: [{ key: 'submit-check', label: '提交前检查' }, { key: 'export-package', label: '确认导出' }],
    result: null, status: 'planned',
  },
  {
    id: 'preset-pending-confirm', type: 'pending-confirm', title: '处理待确认项',
    userGoal: '处理明达精工待确认报告',
    targetReportId: 'RPT-001', targetTemplateId: 'credit-v2021', targetMaterialPackageId: 'MAT-001',
    summary: '明达精工报告有 3 个待确认项需要处理',
    steps: [
      { label: '定位待确认章节', status: 'pending' }, { label: '展示修改建议', status: 'pending' },
      { label: '逐项处理', status: 'pending' }, { label: '更新确认状态', status: 'pending' },
    ],
    actions: [{ key: 'process-pending', label: '逐项处理' }, { key: 'apply-ai-edit', label: '应用 AI 修改' }, { key: 'view-pending', label: '查看待确认' }],
    result: null, status: 'planned',
  },
]

// AI 任务执行结果预设
export const aiTaskExecutions = [
  { id: 'exec-regenerate-done', type: 'regenerate', reportId: 'RPT-001', oldTemplateId: 'credit-v2021', newTemplateId: 'credit-zj-v2024', mappedChapters: 12, needSupplement: 2, needConfirm: 1, status: 'completed' },
  { id: 'exec-missing-done', type: 'missing-materials', reportId: 'RPT-002', missingCount: 2, missingItems: ['银行流水', '税票数据'], blockingItems: 1, status: 'completed' },
]

// ════════════════════════════════════════
// 5.1 模板维护数据（含 chapters / versions）— 扩展到 10 个+
// ════════════════════════════════════════

export const reportTemplates = [
  {
    id: 'credit-v2021',
    name: '单户授信调查报告通用版 V2021',
    desc: '适用于单一客户授信审批的标准调查报告模板',
    version: 'V2021', type: '授信调查', bankId: 'bank-zj', bankName: '浙江银行',
    orgId: 'zj-hq', orgName: '浙江银行总行', businessLine: '公司金融', scenario: '单户授信',
    sectionsCount: 15, requiredMaterials: 8, updatedAt: '2026-05-15',
    status: 'active', isDefault: true, isDefaultForOrg: true, usageCount: 128,
    chapters: [
      { id: 'c1', no: '一', title: '履职声明与基本信息', requiredMaterials: ['营业执照'], optionalMaterials: ['公司章程'], blockingMissingMaterials: [] },
      { id: 'c2', no: '二', title: '重要说明事项', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'c3', no: '三', title: '行内评级及授信情况', requiredMaterials: ['征信报告'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'c4', no: '四', title: '申请人基本信息', requiredMaterials: ['营业执照'], optionalMaterials: ['法人身份证明'], blockingMissingMaterials: [] },
      { id: 'c5', no: '五', title: '股权结构及实控人', requiredMaterials: ['营业执照', '公司章程'], optionalMaterials: [], blockingMissingMaterials: ['公司章程'] },
      { id: 'c6', no: '六', title: '经营情况', requiredMaterials: ['销售合同', '现场照片'], optionalMaterials: ['上下游清单'], blockingMissingMaterials: [] },
      { id: 'c7', no: '七', title: '财务状况', requiredMaterials: ['审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: ['银行流水'] },
      { id: 'c8', no: '八', title: '收入真实性核实', requiredMaterials: ['审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: ['银行流水', '纳税申报表'] },
      { id: 'c9', no: '九', title: '信用状况', requiredMaterials: ['征信报告'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'c10', no: '十', title: '行业地位比较', requiredMaterials: [], optionalMaterials: ['行业协会资料'], blockingMissingMaterials: [] },
      { id: 'c11', no: '十一', title: '诉讼与负面信息', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'c12', no: '十二', title: '主要风险分析', requiredMaterials: ['审计报告', '纳税申报表'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'c13', no: '十三', title: '授信额度依据', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'c14', no: '十四', title: '调查结论与授信方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'c15', no: '十五', title: '附件清单', requiredMaterials: ['营业执照', '审计报告', '纳税申报表'], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2021', status: '启用', updatedAt: '2026-05-15', changeNote: '正式版，调整收入核实章节资料要求' },
      { version: 'V2020', status: '已归档', updatedAt: '2024-12-01', changeNote: '初始版本' },
    ],
  },
  {
    id: 'credit-zj-v2024',
    name: '浙江分行单户授信调查报告 V2024',
    desc: '浙江分行2024版授信调查模板，增加风险预警章节',
    version: 'V2024', type: '授信调查', bankId: 'bank-zj', bankName: '浙江银行',
    orgId: 'zj-hq', orgName: '浙江银行总行', businessLine: '公司金融', scenario: '单户授信',
    sectionsCount: 16, requiredMaterials: 9, updatedAt: '2026-06-20',
    status: 'active', isDefault: false, isDefaultForOrg: false, usageCount: 12,
    chapters: [
      { id: 'z1', no: '一', title: '履职声明与基本信息', requiredMaterials: ['营业执照'], optionalMaterials: ['公司章程'], blockingMissingMaterials: [] },
      { id: 'z2', no: '二', title: '重要说明事项', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z3', no: '三', title: '行内评级及授信情况', requiredMaterials: ['征信报告'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z4', no: '四', title: '申请人基本信息', requiredMaterials: ['营业执照'], optionalMaterials: ['法人身份证明'], blockingMissingMaterials: [] },
      { id: 'z5', no: '五', title: '股权结构及实控人', requiredMaterials: ['营业执照', '公司章程'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z6', no: '六', title: '经营情况', requiredMaterials: ['销售合同', '现场照片'], optionalMaterials: ['上下游清单'], blockingMissingMaterials: [] },
      { id: 'z7', no: '七', title: '财务状况', requiredMaterials: ['审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z8', no: '八', title: '收入真实性核实', requiredMaterials: ['审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z9', no: '九', title: '信用状况', requiredMaterials: ['征信报告'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z10', no: '十', title: '行业地位比较', requiredMaterials: [], optionalMaterials: ['行业协会资料'], blockingMissingMaterials: [] },
      { id: 'z11', no: '十一', title: '诉讼与负面信息', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z12', no: '十二', title: '主要风险分析', requiredMaterials: ['审计报告', '纳税申报表'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z13', no: '十三', title: '风险预警事项', requiredMaterials: ['征信报告'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z14', no: '十四', title: '授信额度依据', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z15', no: '十五', title: '调查结论与授信方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'z16', no: '十六', title: '附件清单', requiredMaterials: ['营业执照', '审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2024', status: '启用', updatedAt: '2026-06-20', changeNote: '新增风险预警章节，强化附件要求' },
      { version: 'V2023', status: '已归档', updatedAt: '2025-03-01', changeNote: '上一版本' },
    ],
  },
  {
    id: 'panorama-v2',
    name: '企业全景报告模板 V2',
    desc: '整合工商、税票、监测与经营视图的全景报告',
    version: 'V2', type: '全景报告', bankId: 'bank-hz', bankName: '杭州银行',
    orgId: 'hz-hq', orgName: '杭州银行总行', businessLine: '公司金融', scenario: '全景报告',
    sectionsCount: 12, requiredMaterials: 6, updatedAt: '2026-06-01',
    status: 'active', isDefault: false, isDefaultForOrg: true, usageCount: 45,
    chapters: [
      { id: 'p1', no: '一', title: '企业概况', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'p2', no: '二', title: '工商视图', requiredMaterials: ['营业执照'], optionalMaterials: ['公司章程'], blockingMissingMaterials: [] },
      { id: 'p3', no: '三', title: '财务视图', requiredMaterials: ['审计报告', '纳税申报表'], optionalMaterials: ['银行流水'], blockingMissingMaterials: ['审计报告'] },
      { id: 'p4', no: '四', title: '经营视图', requiredMaterials: ['销售合同'], optionalMaterials: ['上下游清单'], blockingMissingMaterials: [] },
      { id: 'p5', no: '五', title: '风险视图', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'p6', no: '六', title: '税票视图', requiredMaterials: ['纳税申报表'], optionalMaterials: [], blockingMissingMaterials: ['纳税申报表'] },
      { id: 'p7', no: '七', title: '授信建议', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2', status: '启用', updatedAt: '2026-06-01', changeNote: '新增税票视图章节' },
      { version: 'V1', status: '已归档', updatedAt: '2025-09-01', changeNote: '初始版本' },
    ],
  },
  {
    id: 'diagnosis-v1',
    name: '企业诊断报告模板 V1',
    desc: '基于企业诊断评分和风险信号生成的诊断报告',
    version: 'V1', type: '诊断报告', bankId: 'bank-zj', bankName: '浙江银行',
    orgId: 'zj-hq', orgName: '浙江银行总行', businessLine: '风险管理', scenario: '诊断报告',
    sectionsCount: 8, requiredMaterials: 5, updatedAt: '2026-04-20',
    status: 'active', isDefault: false, isDefaultForOrg: false, usageCount: 67,
    chapters: [
      { id: 'd1', no: '一', title: '诊断结论', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'd2', no: '二', title: '企业基本信息', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'd3', no: '三', title: '评分详情', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'd4', no: '四', title: '风险信号清单', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'd5', no: '五', title: '财务分析', requiredMaterials: ['审计报告'], optionalMaterials: [], blockingMissingMaterials: ['审计报告'] },
      { id: 'd6', no: '六', title: '经营分析', requiredMaterials: ['销售合同'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'd7', no: '七', title: '建议方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'd8', no: '八', title: '附录', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V1', status: '启用', updatedAt: '2026-04-20', changeNote: '初始版本' },
    ],
  },
  {
    id: 'credit-nb-v2023',
    name: '宁波银行单户授信调查报告 V2023',
    desc: '宁波银行标准授信调查模板',
    version: 'V2023', type: '授信调查', bankId: 'bank-nb', bankName: '宁波银行',
    orgId: 'nb-hq', orgName: '宁波银行总行', businessLine: '公司金融', scenario: '单户授信',
    sectionsCount: 14, requiredMaterials: 7, updatedAt: '2026-03-10',
    status: 'active', isDefault: true, isDefaultForOrg: true, usageCount: 34,
    chapters: [
      { id: 'nb1', no: '一', title: '企业基本信息', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'nb2', no: '二', title: '股权结构', requiredMaterials: ['营业执照'], optionalMaterials: ['公司章程'], blockingMissingMaterials: [] },
      { id: 'nb3', no: '三', title: '经营分析', requiredMaterials: ['销售合同', '现场照片'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'nb4', no: '四', title: '财务分析', requiredMaterials: ['审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'nb5', no: '五', title: '信用状况', requiredMaterials: ['征信报告'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'nb6', no: '六', title: '担保分析', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'nb7', no: '七', title: '授信方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2023', status: '启用', updatedAt: '2026-03-10', changeNote: '简化章节结构' },
    ],
  },
  {
    id: 'credit-icbc-zj-v2024',
    name: '工商银行浙江分行授信调查报告 V2024',
    desc: '工商银行浙江分行标准授信模板',
    version: 'V2024', type: '授信调查', bankId: 'bank-icbc-zj', bankName: '工商银行浙江分行',
    orgId: 'icbc-zj-hq', orgName: '工商银行浙江分行公司部', businessLine: '公司金融', scenario: '单户授信',
    sectionsCount: 18, requiredMaterials: 10, updatedAt: '2026-06-15',
    status: 'active', isDefault: true, isDefaultForOrg: true, usageCount: 22,
    chapters: [
      { id: 'ic1', no: '一', title: '企业概况', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'ic2', no: '二', title: '行业分析', requiredMaterials: [], optionalMaterials: ['行业协会资料'], blockingMissingMaterials: [] },
      { id: 'ic3', no: '三', title: '财务分析', requiredMaterials: ['审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'ic4', no: '四', title: '授信方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2024', status: '启用', updatedAt: '2026-06-15', changeNote: '工行浙江标准版' },
    ],
  },
  {
    id: 'credit-ccb-zj-v2023',
    name: '建设银行浙江分行综合授信报告 V2023',
    desc: '建设银行浙江分行综合授信模板',
    version: 'V2023', type: '授信调查', bankId: 'bank-ccb-zj', bankName: '建设银行浙江分行',
    orgId: 'ccb-zj-hq', orgName: '建设银行浙江分行公司部', businessLine: '公司金融', scenario: '综合授信',
    sectionsCount: 16, requiredMaterials: 8, updatedAt: '2026-04-01',
    status: 'active', isDefault: true, isDefaultForOrg: true, usageCount: 18,
    chapters: [
      { id: 'cb1', no: '一', title: '企业基本信息', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'cb2', no: '二', title: '财务分析', requiredMaterials: ['审计报告', '纳税申报表'], optionalMaterials: ['银行流水'], blockingMissingMaterials: [] },
      { id: 'cb3', no: '三', title: '授信建议', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2023', status: '启用', updatedAt: '2026-04-01', changeNote: '建行浙江标准版' },
    ],
  },
  {
    id: 'credit-abc-nb-v2024',
    name: '农业银行宁波分行农户授信报告 V2024',
    desc: '农业银行宁波分行农户和小微授信模板',
    version: 'V2024', type: '授信调查', bankId: 'bank-abc-nb', bankName: '农业银行宁波分行',
    orgId: 'abc-nb-hq', orgName: '农业银行宁波分行公司部', businessLine: '普惠金融', scenario: '小微授信',
    sectionsCount: 10, requiredMaterials: 5, updatedAt: '2026-05-20',
    status: 'active', isDefault: true, isDefaultForOrg: true, usageCount: 56,
    chapters: [
      { id: 'ab1', no: '一', title: '客户基本信息', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'ab2', no: '二', title: '经营情况', requiredMaterials: ['销售合同'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'ab3', no: '三', title: '授信方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2024', status: '启用', updatedAt: '2026-05-20', changeNote: '农行宁波普惠版' },
    ],
  },
  {
    id: 'credit-js-nb-v2022',
    name: '江苏银行南京分行授信调查报告 V2022',
    desc: '江苏银行南京分行授信模板',
    version: 'V2022', type: '授信调查', bankId: 'bank-js', bankName: '江苏银行',
    orgId: 'js-nj', orgName: '江苏银行南京分行', businessLine: '公司金融', scenario: '单户授信',
    sectionsCount: 14, requiredMaterials: 7, updatedAt: '2025-11-01',
    status: 'active', isDefault: true, isDefaultForOrg: true, usageCount: 15,
    chapters: [
      { id: 'js1', no: '一', title: '企业概况', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'js2', no: '二', title: '财务分析', requiredMaterials: ['审计报告', '纳税申报表'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'js3', no: '三', title: '授信方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2022', status: '启用', updatedAt: '2025-11-01', changeNote: '江苏银行南京版' },
    ],
  },
  {
    id: 'credit-sh-pd-v2024',
    name: '上海银行浦东支行授信调查报告 V2024',
    desc: '上海银行浦东支行授信模板',
    version: 'V2024', type: '授信调查', bankId: 'bank-sh', bankName: '上海银行',
    orgId: 'sh-pd', orgName: '上海银行浦东支行', businessLine: '公司金融', scenario: '单户授信',
    sectionsCount: 15, requiredMaterials: 8, updatedAt: '2026-06-10',
    status: 'draft', isDefault: false, isDefaultForOrg: false, usageCount: 0,
    chapters: [
      { id: 'sh1', no: '一', title: '企业基本信息', requiredMaterials: ['营业执照'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'sh2', no: '二', title: '经营分析', requiredMaterials: ['销售合同'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'sh3', no: '三', title: '财务分析', requiredMaterials: ['审计报告', '纳税申报表', '银行流水'], optionalMaterials: [], blockingMissingMaterials: [] },
      { id: 'sh4', no: '四', title: '授信方案', requiredMaterials: [], optionalMaterials: [], blockingMissingMaterials: [] },
    ],
    versions: [
      { version: 'V2024', status: '草稿', updatedAt: '2026-06-10', changeNote: '浦东支行待审版' },
    ],
  },
]

// ════════════════════════════════════════
// 5.2 模板解析结果数据
// ════════════════════════════════════════

export const templateParseResult = {
  fileName: '自定义授信调查报告模板.docx',
  status: '解析成功',
  recognizedChapters: 14,
  placeholders: ['{{企业名称}}', '{{统一社会信用代码}}', '{{授信额度}}', '{{授信期限}}', '{{担保方式}}', '{{还款方式}}'],
  requiredMaterials: ['营业执照', '审计报告', '纳税申报表', '银行流水', '销售合同', '征信报告'],
  warnings: ['第 3 章缺少必需的财务数据占位符', '第 8 章风险分析未关联具体资料类型'],
}

// ════════════════════════════════════════
// 5.3 章节映射数据
// ════════════════════════════════════════

export const templateMappingPreview = [
  { oldChapter: '一、履职声明与基本信息', newChapter: '一、企业概况', mappingStatus: '已映射', note: '内容基本对应' },
  { oldChapter: '二、重要说明事项', newChapter: '二、工商视图', mappingStatus: '部分映射', note: '需补充工商查询数据' },
  { oldChapter: '三、行内评级及授信情况', newChapter: '三、财务视图', mappingStatus: '已映射', note: '评级信息将整合至财务视图' },
  { oldChapter: '四、申请人基本信息', newChapter: '四、经营视图', mappingStatus: '已映射', note: '基本信息保留，经营内容合并' },
  { oldChapter: '五、股权结构及实控人', newChapter: '五、风险视图', mappingStatus: '待映射', note: '股权信息将迁移至风险视图' },
  { oldChapter: '六、经营情况', newChapter: '六、税票视图', mappingStatus: '部分映射', note: '经营数据保留，税票需补充' },
  { oldChapter: '七、财务状况', newChapter: '七、授信建议', mappingStatus: '已映射', note: '财务数据将用于授信建议' },
  { oldChapter: '八、收入真实性核实', newChapter: '（新增）行业对比', mappingStatus: '新增章节', note: '将基于资料包自动生成' },
  { oldChapter: '九至十五章', newChapter: '（合并）附录', mappingStatus: '已合并', note: '附件、结论等合并为附录章节' },
]

// ════════════════════════════════════════
// 5.4 交付检查数据
// ════════════════════════════════════════

export const deliveryCheckItems = [
  { id: 'dc1', type: 'blocking', title: '银行流水缺失', level: 'block', status: '未解决', relatedSection: '八、收入真实性核实', actionText: '补充银行流水' },
  { id: 'dc2', type: 'blocking', title: '税票数据不完整', level: 'block', status: '未解决', relatedSection: '七、财务状况', actionText: '补充完整纳税申报表' },
  { id: 'dc3', type: 'warning', title: '待确认项 3 条未确认', level: 'warn', status: '待处理', relatedSection: '多章节', actionText: '逐章确认' },
  { id: 'dc4', type: 'info', title: '行业协会资料未关联', level: 'info', status: '可跳过', relatedSection: '十、行业地位比较', actionText: '忽略或补充' },
  { id: 'dc5', type: 'info', title: '现场调查照片不足', level: 'info', status: '可跳过', relatedSection: '六、经营情况', actionText: '忽略或补充' },
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
    relatedReportId: 'RPT-001',
    updatedAt: '2026-06-28',
    materials: [
      { id: 'm1', name: '营业执照', type: '证照', source: '资料识别', status: '已关联', relatedSections: ['duty', 'basic'], extractedSummary: '企业名称：明达精工有限公司，统一信用代码：91330300MA29XXXX1Z，注册资本3000万', usedInGeneration: true, confidence: 0.96, updatedAt: '2026-06-28' },
      { id: 'm2', name: '审计报告', type: '财务', source: '用户上传', status: '已关联', relatedSections: ['finance', 'income'], extractedSummary: '2025年度审计报告，资产总额6200万，负债总额3180万，净利润420万', usedInGeneration: true, confidence: 0.98, updatedAt: '2026-06-28' },
      { id: 'm3', name: '纳税申报表', type: '税务', source: '资料识别', status: '已关联', relatedSections: ['finance', 'income'], extractedSummary: '2025年度企业所得税申报表，申报收入5480万', usedInGeneration: true, confidence: 0.91, updatedAt: '2026-06-28' },
      { id: 'm4', name: '银行流水', type: '银行', source: '资料识别', status: '缺失', relatedSections: ['finance', 'income'], extractedSummary: '2025年1-12月主要账户流水缺失', usedInGeneration: false, confidence: 0, updatedAt: '2026-06-28' },
      { id: 'm5', name: '销售合同', type: '合同', source: '用户上传', status: '已关联', relatedSections: ['operation'], extractedSummary: '与杭州智造装备签订的主合同，金额1200万，账期90天', usedInGeneration: true, confidence: 0.95, updatedAt: '2026-06-28' },
      { id: 'm6', name: '现场照片', type: '影像', source: '人工补充', status: '已关联', relatedSections: ['operation', 'duty'], extractedSummary: '生产经营场所照片12张，含车间、仓库、办公区', usedInGeneration: true, confidence: 0.82, updatedAt: '2026-06-28' },
    ],
  },
  {
    id: 'MAT-002',
    enterpriseName: '宁波天合新材料有限公司',
    packageName: '宁波天合补充资料包',
    source: '用户上传',
    materialCount: 4,
    missingCount: 2,
    relatedReportId: 'RPT-002',
    updatedAt: '2026-06-27',
    materials: [
      { id: 'm7', name: '营业执照', type: '证照', source: '资料识别', status: '已关联', relatedSections: ['duty', 'basic'], extractedSummary: '统一信用代码：91330200MA2CXXXX8Y，注册资本5000万', usedInGeneration: true, confidence: 0.94, updatedAt: '2026-06-27' },
      { id: 'm8', name: '审计报告', type: '财务', source: '资料识别', status: '已关联', relatedSections: ['finance'], extractedSummary: '2025年度审计报告，资产总额9800万', usedInGeneration: true, confidence: 0.97, updatedAt: '2026-06-27' },
      { id: 'm9', name: '纳税申报表', type: '税务', source: '资料识别', status: '已关联', relatedSections: ['finance', 'income'], extractedSummary: '部分纳税申报表，缺2024年Q3-Q4数据', usedInGeneration: true, confidence: 0.73, updatedAt: '2026-06-27' },
      { id: 'm10', name: '访谈记录', type: '笔录', source: '人工补充', status: '已关联', relatedSections: ['duty', 'operation'], extractedSummary: '与法人张某的访谈记录，确认主营业务及主要客户', usedInGeneration: true, confidence: 0.88, updatedAt: '2026-06-27' },
    ],
  },
  {
    id: 'MAT-003',
    enterpriseName: '杭州智造装备有限公司',
    packageName: '杭州智造全景资料包',
    source: '资料识别',
    materialCount: 5,
    missingCount: 1,
    relatedReportId: 'RPT-003',
    updatedAt: '2026-06-26',
    materials: [
      { id: 'm11', name: '营业执照', type: '证照', source: '资料识别', status: '已关联', relatedSections: ['basic'], extractedSummary: '统一信用代码：91330100MA2BXXXX5T，注册资本2000万', usedInGeneration: true, confidence: 0.95, updatedAt: '2026-06-26' },
      { id: 'm12', name: '审计报告', type: '财务', source: '用户上传', status: '已关联', relatedSections: ['finance'], extractedSummary: '2024-2025两年审计报告', usedInGeneration: true, confidence: 0.93, updatedAt: '2026-06-26' },
      { id: 'm13', name: '纳税申报表', type: '税务', source: '资料识别', status: '已关联', relatedSections: ['finance'], extractedSummary: '2025年度完整纳税申报', usedInGeneration: true, confidence: 0.97, updatedAt: '2026-06-26' },
      { id: 'm14', name: '销售合同', type: '合同', source: '用户上传', status: '已关联', relatedSections: ['operation'], extractedSummary: '主要销售合同3份，总额2800万', usedInGeneration: true, confidence: 0.91, updatedAt: '2026-06-26' },
      { id: 'm15', name: '现场照片', type: '影像', source: '人工补充', status: '已关联', relatedSections: ['operation'], extractedSummary: '生产车间及办公区域照片8张', usedInGeneration: true, confidence: 0.85, updatedAt: '2026-06-26' },
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