// Mock 数据 - 智能尽调

// 统一 8 节点流程（详情页 / store / mock 共用）
export const steps = [
  { key: 'verify-business', label: '工商核验', icon: 'Verified' },
  { key: 'verify-legal',    label: '司法查询', icon: 'Search' },
  { key: 'tax-rpa',         label: '税票采集', icon: 'Printer' },
  { key: 'materials',       label: '资料补充', icon: 'DocumentAdd' },
  { key: 'evidence',        label: '证据整合', icon: 'Collection' },
  { key: 'risk',            label: '风险诊断', icon: 'WarningFilled' },
  { key: 'artifacts',       label: '产物确认', icon: 'Finished' },
  { key: 'delivery-package',label: '交付包下载', icon: 'Download' },
]

// 进度映射
export const STAGE_PROGRESS = {
  'verify-business': 13,
  'verify-legal':    25,
  'tax-rpa':         38,
  'materials':       50,
  'evidence':        63,
  'risk':            75,
  'artifacts':       100,
  'delivery-package':100,
}

// 状态映射
export const STAGE_STATUS_MAP = {
  'tax-rpa':          { status: '等待客户', statusText: '税票采集 / 待授权' },
  'materials':        { status: '等待客户', statusText: '资料补充 / 待上传' },
  'risk':             { status: '进行中',   statusText: '风险诊断' },
  'artifacts':        { status: '待确认',   statusText: '报告待确认' },
  'delivery-package': { status: '已完成',   statusText: '交付包已生成' },
  'completed':        { status: '已完成',   statusText: '尽调完成' },
}

/**
 * 尽调任务对象
 * 字段：id, name, creditCode, industry, region, amount,
 *      templateName, source, manager, priority,
 *      status, statusText, currentStage, currentStep,
 *      progress, riskLevel, score, grade, materialCompleteness,
 *      nextAction, updatedAt, reportDraftId,
 *      autoCapabilities（兼容旧字段）
 */
export const dueDiligenceTasks = [
  {
    id: 'dd-ts-wq-001',
    name: '唐山物桥商贸有限公司',
    creditCode: '91130203MA7EEQ2N0T',
    industry: '建材批发 / 商贸流通',
    region: '河北省唐山市',
    amount: '500万',
    templateName: '尽职调查报告',
    source: '工作台AI',
    manager: '张经理',
    priority: '普通',
    status: '等待客户',
    statusText: '税票采集 / 待授权',
    currentStage: 'tax-rpa',
    currentStep: 'tax-rpa',
    progress: 43,
    riskLevel: '中风险',
    score: 72,
    grade: 'C+',
    materialCompleteness: 67,
    nextAction: '继续处理',
    updatedAt: '2026-07-02 15:40',
    reportDraftId: '',
    autoCapabilities: ['自动拆解流程', '税票RPA', '跨天提醒', '自动生成产物'],
  },
  {
    id: 'dd-hz-zz-001',
    name: '杭州智造装备有限公司',
    creditCode: '91330100MA27XXXX3X',
    industry: '专用设备制造',
    region: '浙江杭州',
    amount: '500万',
    templateName: '尽职调查报告',
    source: '本页创建',
    manager: '张经理',
    priority: '普通',
    status: '进行中',
    statusText: '资料补充',
    currentStage: 'materials',
    currentStep: 'materials',
    progress: 57,
    riskLevel: '低风险',
    score: 78,
    grade: 'B',
    materialCompleteness: 72,
    nextAction: '继续处理',
    updatedAt: '2026-07-02 14:20',
    reportDraftId: '',
    autoCapabilities: ['自动拆解流程', '税票RPA', '跨天提醒', '自动生成产物'],
  },
  {
    id: 'dd-nb-th-001',
    name: '宁波天合新材料有限公司',
    creditCode: '91330200MA2HXXXX8Y',
    industry: '新材料研发',
    region: '浙江宁波',
    amount: '800万',
    templateName: '尽职调查报告',
    source: '筛客转入',
    manager: '张经理',
    priority: '较高',
    status: '待确认',
    statusText: '报告待确认',
    currentStage: 'artifacts',
    currentStep: 'artifacts',
    progress: 100,
    riskLevel: '中风险',
    score: 70,
    grade: 'C+',
    materialCompleteness: 82,
    nextAction: '编辑报告',
    updatedAt: '2026-07-01 16:50',
    reportDraftId: '',
    autoCapabilities: ['自动拆解流程', '税票RPA', '跨天提醒', '自动生成产物'],
  },
  {
    id: 'dd-wz-rd-001',
    name: '温州瑞达机械制造有限公司',
    creditCode: '91330300MA28XXXX5R',
    industry: '机械制造',
    region: '浙江温州',
    amount: '300万',
    templateName: '尽职调查报告',
    source: '企业探查',
    manager: '张经理',
    priority: '普通',
    status: '已完成',
    statusText: '已完成',
    currentStage: 'completed',
    currentStep: 'artifacts',
    progress: 100,
    riskLevel: '低风险',
    score: 82,
    grade: 'B+',
    materialCompleteness: 95,
    nextAction: '查看报告',
    updatedAt: '2026-06-30 09:15',
    reportDraftId: 'RPT-WZ-RD-001',
    autoCapabilities: ['自动拆解流程', '税票RPA', '跨天提醒', '自动生成产物'],
  },
]

// 资料补充清单（兼容）
export const materialsList = [
  { id: 'm001', name: '财务报表附注', status: '待上传' },
  { id: 'm002', name: '主要采购合同', status: '待上传' },
  { id: 'm003', name: '征信授权书', status: '待客户签署' },
]

// 已上传文件（兼容）
export const uploadedFiles = [
  { id: 'f001', name: '2025年度审计报告.pdf', status: '已识别', size: '2.3MB' },
  { id: 'f002', name: '营业执照.pdf', status: '已识别', size: '1.1MB' },
  { id: 'f003', name: '法人身份证.jpg', status: '已识别', size: '856KB' },
  { id: 'f004', name: '近三年纳税申报表.xlsx', status: '已识别', size: '1.8MB' },
  { id: 'f005', name: '主要销售合同.pdf', status: '已识别', size: '3.2MB' },
]

// 尽调产物（兼容）
export const artifactsList = [
  { name: '尽职调查报告', status: 'V2待确认', count: '3处待确认', icon: 'Document' },
  { name: '工商核验报告', status: '已生成', count: '1份', icon: 'Files' },
  { name: '司法查询报告', status: '已生成', count: '1份', icon: 'Search' },
  { name: '税票分析报告', status: '已生成', count: '1份', icon: 'Printer' },
  { name: '风险诊断报告', status: '已生成', count: '8项风险', icon: 'Warning' },
  { name: '证据链文件', status: '已生成', count: '31条证据', icon: 'Collection' },
]

// 风险事项（兼容）
export const riskItems = [
  { level: 'high', title: '税票数据授权存在缺口', desc: '客户仅授权2025年数据，2024年税票缺失' },
  { level: 'high', title: '法人关联企业异常', desc: '法人张某某名下3家关联企业，其中1家已注销未披露' },
  { level: 'medium', title: '应收账款集中度高', desc: '前两大客户占比68%，存在依赖风险' },
  { level: 'medium', title: '存货周转率下降', desc: '近三个季度连续下降，需关注滞销情况' },
  { level: 'low', title: '环保处罚记录', desc: '2024年有一次轻微环保处罚，已整改' },
  { level: 'low', title: '社保缴纳人数波动', desc: '近6个月缴纳人数波动较大，需核实用工情况' },
]

// 各步骤的对话消息（兼容）
export const stepChats = {
  launch: [
    { role: 'ai', content: '已为您自动拆解尽调流程，涵盖7个步骤。系统会自动推进，您只需要在关键节点确认即可。', type: 'insight' },
    { role: 'user', content: '这个流程需要准备什么？' },
    { role: 'ai', content: '基础资料系统会自动获取（工商、司法等）。税票需要客户授权，资料补充环节您可以上传或发送链接让客户提交。', type: 'normal' },
  ],
  'verify-business': [
    { role: 'ai', content: '工商核验已完成，主体信息、经营状态、注册资本已核实，无异常。', type: 'insight' },
    { role: 'user', content: '有发现异常吗？' },
    { role: 'ai', content: '未发现工商异常，经营状态存续，股权结构清晰。', type: 'normal' },
  ],
  'verify-legal': [
    { role: 'ai', content: '司法查询发现：被执行人 1 条、裁判文书 2 条、限制高消 1 条，建议关注高风险项。', type: 'insight' },
    { role: 'user', content: '高风险项是什么？' },
    { role: 'ai', content: '存在一条被执行记录，金额较大。建议在尽调报告中做专项说明。', type: 'normal' },
  ],
  'tax-rpa': [
    { role: 'ai', content: '税票RPA正在等待客户授权。授权链接已发送，有效期24小时。超时会自动发送提醒。', type: 'insight' },
    { role: 'user', content: '客户一直没授权怎么办？' },
    { role: 'ai', content: '可以选择：①继续等待并定时提醒 ②改为上传材料模式，由您手动收集税票文件。', type: 'normal' },
  ],
  materials: [
    { role: 'ai', content: '已收到5份资料，还有3项待补充。您可以直接上传，也可以发送补充链接让客户提交。', type: 'insight' },
    { role: 'user', content: '上传后下一步是什么？' },
    { role: 'ai', content: '上传完成后系统会自动识别文件内容并写入证据链，然后进入证据整合环节。', type: 'normal' },
  ],
  evidence: [
    { role: 'ai', content: '已完成证据整合，共收集31条有效证据，覆盖工商、税票、合同、财务等多个维度。', type: 'insight' },
    { role: 'user', content: '证据覆盖率怎么样？' },
    { role: 'ai', content: '核心维度覆盖率92%，税票维度因授权缺口仅覆盖78%，已在风险诊断中特别说明。', type: 'normal' },
  ],
  risk: [
    { role: 'ai', content: '正在生成风险诊断摘要，已识别8项风险事项，其中2项高风险需要重点关注。', type: 'insight' },
    { role: 'user', content: '高风险项是什么？' },
    { role: 'ai', content: '①税票数据授权存在缺口 ②法人关联企业异常。建议在尽调报告中做专项说明。', type: 'normal' },
  ],
  artifacts: [
    { role: 'ai', content: '尽调产物已全部生成。报告草稿V2有3处结论待您确认，确认后即可提交。', type: 'insight' },
    { role: 'user', content: '可以把结论改成审批口吻吗？' },
    { role: 'ai', content: '可以，我会将描述调整为更符合审批阅读习惯的表达方式。点击"进入智能报告"即可开始修改。', type: 'normal' },
  ],
}

// 各步骤的快捷 chips（兼容）
export const stepChips = {
  launch: ['生成客户材料清单', '说明流程', '保存草稿'],
  'verify-business': ['查看工商详情', '下载报告'],
  'verify-legal': ['查看司法风险', '进入风险诊断'],
  'tax-rpa': ['复制授权链接', '发送提醒', '改为上传材料'],
  materials: ['上传文件', '发送补充链接', '开始识别'],
  evidence: ['查看证据详情', '进入风险诊断'],
  risk: ['查看风险详情', '进入产物确认'],
  artifacts: ['进入智能报告', '导出产物包', '提交确认'],
}
