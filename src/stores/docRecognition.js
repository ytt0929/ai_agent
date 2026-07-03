import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** Mock 字段提取结果 — key 为文件 id */
const mockFields = {
  f008: [
    { label: '企业名称', value: '唐山物桥商贸有限公司', confidence: 99 },
    { label: '统一社会信用代码', value: '91130203MA7EEQ2N0T', confidence: 99 },
    { label: '法定代表人', value: '马丽', confidence: 98 },
    { label: '注册资本', value: '500万元', confidence: 97 },
    { label: '成立日期', value: '2021-12-24', confidence: 96 },
    { label: '经营范围', value: '建材批发、商贸流通...', confidence: 85 },
  ],
  f009: [
    { label: '企业名称', value: '唐山物桥商贸有限公司', confidence: 98 },
    { label: '纳税人识别号', value: '91130203MA7EEQ2N0T', confidence: 99 },
    { label: '申报收入', value: '2175.46万元', confidence: 95 },
    { label: '应纳税额', value: '18.21万元', confidence: 91 },
    { label: '税负率', value: '0.8%', confidence: 93 },
  ],
  f010: [
    { label: '企业名称', value: '唐山物桥商贸有限公司', confidence: 97 },
    { label: '开票收入', value: '2275.98万元', confidence: 96 },
    { label: '进项发票', value: '128份', confidence: 94 },
    { label: '销项发票', value: '96份', confidence: 92 },
  ],
  // 唐山物桥 - 企业所得税
  f011: [
    { label: '企业名称', value: '唐山物桥商贸有限公司', confidence: 98 },
    { label: '所属年度', value: '2025年度', confidence: 99 },
    { label: '营业收入', value: '2175.46万元', confidence: 95 },
    { label: '营业成本', value: '1892.30万元', confidence: 93 },
    { label: '利润总额', value: '156.80万元', confidence: 91 },
    { label: '应纳税所得额', value: '148.20万元', confidence: 89 },
    { label: '应纳所得税额', value: '37.05万元', confidence: 94 },
  ],
  // 唐山物桥 - 发票明细
  f012: [
    { label: '企业名称', value: '唐山物桥商贸有限公司', confidence: 98 },
    { label: '发票总收入', value: '2275.98万元', confidence: 96 },
    { label: '进项税额', value: '186.42万元', confidence: 94 },
    { label: '销项税额', value: '203.18万元', confidence: 93 },
    { label: '进项发票份数', value: '128份', confidence: 95 },
    { label: '销项发票份数', value: '96份', confidence: 94 },
    { label: '前五大客户占比', value: '62.3%', confidence: 82 },
  ],
  // 唐山物桥 - 纳税评级
  f013: [
    { label: '企业名称', value: '唐山物桥商贸有限公司', confidence: 99 },
    { label: '纳税信用等级', value: 'B级', confidence: 98 },
    { label: '评定年度', value: '2025年度', confidence: 97 },
    { label: '评价指标得分', value: '82.5分', confidence: 90 },
    { label: '扣分原因', value: '逾期申报1次', confidence: 78 },
  ],
  // 唐山物桥 - 银行流水摘要 (核心新增)
  f014: [
    { label: '账户名称', value: '唐山物桥商贸有限公司', confidence: 99 },
    { label: '开户行', value: '中国民生银行唐山分行', confidence: 97 },
    { label: '账号', value: '6222 **** **** 8791', confidence: 96 },
    { label: '流水期间', value: '2025-01 至 2025-12', confidence: 98 },
    { label: '总入账金额', value: '2,086.32万元', confidence: 96 },
    { label: '总出账金额', value: '1,934.76万元', confidence: 95 },
    { label: '月均入账', value: '173.86万元', confidence: 93 },
    { label: '月均出账', value: '161.23万元', confidence: 92 },
    { label: '经营净现金流', value: '151.56万元', confidence: 91 },
    { label: '月收入标准差', value: '72.40万元', confidence: 88 },
    { label: '收入波动率', value: '41.6%', confidence: 85 },
    { label: '最大单月入账', value: '318.20万元', confidence: 92 },
    { label: '短期大额进出账', value: '4笔', confidence: 82 },
    { label: '整数规律交易', value: '12笔', confidence: 78 },
    { label: '关联账户互转', value: '3笔', confidence: 75 },
    { label: '临近授信异常转入', value: '2笔', confidence: 80 },
    { label: '债务本息支出', value: '186.00万元', confidence: 89 },
    { label: 'DSCR', value: '0.81', confidence: 86 },
  ],
  // 唐山物桥 - 工商登记信息
  f015: [
    { label: '企业名称', value: '唐山物桥商贸有限公司', confidence: 99 },
    { label: '统一社会信用代码', value: '91130203MA7EEQ2N0T', confidence: 99 },
    { label: '法定代表人', value: '马丽', confidence: 98 },
    { label: '注册资本', value: '500万元', confidence: 97 },
    { label: '成立日期', value: '2021-12-24', confidence: 98 },
    { label: '企业类型', value: '有限责任公司', confidence: 96 },
    { label: '登记机关', value: '唐山市路北区市场监督管理局', confidence: 94 },
    { label: '经营范围', value: '建材批发、五金交电、机械设备销售...', confidence: 82 },
    { label: '营业期限', value: '2021-12-24 至 长期', confidence: 95 },
  ],
  f001: [
    { label: '企业名称', value: '杭州智造装备有限公司', confidence: 98 },
    { label: '统一社会信用代码', value: '91330100MA27XXXX3X', confidence: 99 },
    { label: '法定代表人', value: '张某某', confidence: 97 },
    { label: '注册资本', value: '5000万元', confidence: 95 },
    { label: '成立日期', value: '2018-06-15', confidence: 96 },
    { label: '经营范围', value: '专用设备制造、加工、销售...', confidence: 72 },
  ],
  f002: [
    { label: '企业名称', value: '杭州智造装备有限公司', confidence: 99 },
    { label: '纳税人识别号', value: '91330100MA27XXXX3X', confidence: 99 },
    { label: '法定代表人', value: '张某某', confidence: 98 },
    { label: '营业期限', value: '2018-06-15 至 2038-06-14', confidence: 93 },
    { label: '登记机关', value: '杭州市市场监督管理局', confidence: 88 },
  ],
  f003: [
    { label: '姓名', value: '张某某', confidence: 97 },
    { label: '证件号码', value: '330106198001011234', confidence: 99 },
    { label: '住址', value: '杭州市西湖区文三路XXX号', confidence: 91 },
    { label: '签发机关', value: '杭州市公安局西湖分局', confidence: 85 },
    { label: '有效期限', value: '2020.01.01-2040.01.01', confidence: 68 },
  ],
  f004: [
    { label: '企业名称', value: '杭州智造装备有限公司', confidence: 96 },
    { label: '所属年度', value: '2025年度', confidence: 98 },
    { label: '营业收入', value: '73,900,000.00', confidence: 94 },
    { label: '应纳税额', value: '329,000.00', confidence: 92 },
    { label: '实纳税额', value: '315,600.00', confidence: 63 },
    { label: '税负率', value: '4.45%', confidence: 58 },
  ],
  f005: [
    { label: '合同编号', value: 'XS-2025-0892', confidence: 95 },
    { label: '甲方', value: '杭州智造装备有限公司', confidence: 98 },
    { label: '乙方', value: '江苏华锐机械有限公司', confidence: 96 },
    { label: '合同金额', value: '1,280,000.00', confidence: 91 },
    { label: '签订日期', value: '2025-03-20', confidence: 88 },
    { label: '付款条款', value: '预付30%，交货后付60%，质保金10%', confidence: 45 },
  ],
  f006: [
    { label: '企业名称', value: '宁波天合新材料有限公司', confidence: 97 },
    { label: '统一社会信用代码', value: '91330200MA2HXXXX8Y', confidence: 99 },
    { label: '法定代表人', value: '李某某', confidence: 96 },
    { label: '注册资本', value: '8000万元', confidence: 94 },
    { label: '成立日期', value: '2016-03-22', confidence: 95 },
  ],
  f007: [
    { label: '企业名称', value: '宁波天合新材料有限公司', confidence: 98 },
    { label: '报告编号', value: 'XYZ-2025-AUD-0156', confidence: 93 },
    { label: '审计意见', value: '标准无保留意见', confidence: 88 },
    { label: '总资产', value: '125,600,000.00', confidence: 95 },
    { label: '净资产', value: '42,300,000.00', confidence: 92 },
    { label: '营业收入', value: '98,700,000.00', confidence: 90 },
    { label: '净利润', value: '12,500,000.00', confidence: 87 },
  ],
}

/** Mock 交叉比对结果 — key 为任务 id */
const mockCrossCompare = {
  // ========== 唐山物桥商贸有限公司 交叉比对 ==========
  'dd-ts-wq': {
    // 数据一致性验证
    consistencyChecks: [
      { label: '企业主体一致', status: 'match', detail: '营业执照、纳税申报、发票明细、银行流水、工商登记均指向唐山物桥商贸有限公司', sources: '营业执照, 纳税申报, 发票, 银行流水, 工商登记' },
      { label: '统一社会信用代码一致', status: 'match', detail: '营业执照 = 纳税申报 = 工商登记 = 91130203MA7EEQ2N0T', sources: '营业执照, 纳税申报, 工商登记' },
      { label: '发票收入 vs 纳税申报', status: 'match', detail: '发票收入 2275.98 万元，纳税申报收入 2175.46 万元，差异 4.4%，在合理范围内', sources: '增值税发票 vs 纳税申报表' },
      { label: '银行流水 vs 发票收入', status: 'warning', detail: '银行流水入账 2086.32 万元，发票收入 2275.98 万元，差异 8.3%，需关注未回款部分', sources: '银行流水 vs 增值税发票' },
      { label: '银行流水 vs 纳税申报收入', status: 'match', detail: '银行流水入账 2086.32 万元，纳税申报收入 2175.46 万元，差异 4.1%，基本匹配', sources: '银行流水 vs 纳税申报表' },
      { label: '流水异常交易', status: 'warning', detail: '短期大额进出账 4 笔，整数规律交易 12 笔，关联账户互转 3 笔，临近授信异常转入 2 笔', sources: '银行流水摘要' },
      { label: '偿债能力', status: 'conflict', detail: '经营净现金流 151.56 万元，债务本息支出 186 万元，DSCR 0.81，低于 1，现金流覆盖不足', sources: '银行流水 vs 财报' },
    ],
    // 经营指标分析
    businessMetrics: [
      { label: '月均入账', value: '173.86万元', benchmark: '参考行业均值', status: 'match', delta: '正常' },
      { label: '月均出账', value: '161.23万元', benchmark: '流入 > 流出', status: 'match', delta: '净流入' },
      { label: '经营净现金流', value: '151.56万元', benchmark: '应覆盖债务', status: 'warning', delta: '不足' },
      { label: '收入波动率', value: '41.6%', benchmark: '建议 ≤ 30%', status: 'warning', delta: '偏高' },
      { label: '流水发票匹配度', value: '91.7%', benchmark: '合理区间 ≥ 85%', status: 'match', delta: '可验证' },
      { label: '流水纳税匹配度', value: '95.9%', benchmark: '合理区间 ≥ 90%', status: 'match', delta: '基本匹配' },
      { label: 'DSCR', value: '0.81', benchmark: '安全线 ≥ 1.2', status: 'danger', delta: '覆盖不足' },
      { label: '短期冲量交易', value: '4笔', benchmark: '应关注', status: 'warning', delta: '需复核' },
      { label: '整数规律交易', value: '12笔', benchmark: '应关注', status: 'warning', delta: '需复核' },
      { label: '关联互转交易', value: '3笔', benchmark: '应关注', status: 'danger', delta: '需重点复核' },
      { label: '临近授信异常转入', value: '2笔', benchmark: '应关注', status: 'danger', delta: '需重点复核' },
    ],
    // AI 初步判断
    aiJudgment: {
      summary: '综合银行流水、发票、纳税申报和工商资料，唐山物桥商贸有限公司主体资料一致，收入数据整体可交叉验证。但现金流偿债覆盖不足，且存在若干异常交易信号，建议人工复核异常流水和关联账户往来。',
      points: [
        { level: 'match', text: '收入真实性：流水与发票差异 8.3%，未超过 30% 阈值，整体可交叉验证，但需复核异常交易对收入的影响。' },
        { level: 'warning', text: '经营稳定性：收入波动率 41.6%，显著高于 30% 建议线，月度收入波动较大，经营稳定性偏弱。' },
        { level: 'danger', text: '偿债能力：DSCR 0.81，低于 1.0 安全线，经营净现金流不足以覆盖债务本息支出，存在违约风险。' },
        { level: 'warning', text: '异常交易：短期大额进出账 4 笔、整数规律交易 12 笔、关联账户互转 3 笔、临近授信异常转入 2 笔，均建议人工复核。' },
        { level: 'info', text: '综合建议：建议补充尽调核实异常流水来源、关联账户交易背景及临近授信转入的资金性质。' },
      ],
    },
  },
  // ========== 杭州智造装备有限公司 ==========
  dd001: {
    consistencyChecks: [
      { label: '企业名称', status: 'match', detail: '5 份文件均为「杭州智造装备有限公司」', sources: '营业执照×2, 身份证, 纳税申报, 销售合同' },
      { label: '法定代表人', status: 'match', detail: '营业执照 = 法人身份证 = 张某某', sources: '营业执照, 身份证' },
      { label: '统一社会信用代码', status: 'match', detail: '营业执照 = 纳税申报 = 91330100MA27XXXX3X', sources: '营业执照, 纳税申报' },
      { label: '营业收入', status: 'conflict', detail: '纳税申报 739 万 vs 审计报告推算 987 万，差异 33.6%', sources: '纳税申报 vs 审计报告' },
      { label: '合同回款', status: 'warning', detail: '销售合同金额 128 万，银行流水到账仅 64 万，回款率 50%', sources: '销售合同 vs 银行流水' },
      { label: '实缴税款', status: 'warning', detail: '应纳税 32.9 万，实缴 31.56 万，欠缴 1.34 万', sources: '纳税申报' },
    ],
    businessMetrics: [
      { label: '税负率', value: '4.45%', benchmark: '行业均值 6.8%', status: 'warning', delta: '-34.6%' },
      { label: '客户集中度', value: 'CR2 = 68%', benchmark: '安全线 ≤ 50%', status: 'warning', delta: '超标' },
      { label: '应收回款率', value: '50%', benchmark: '健康线 ≥ 80%', status: 'danger', delta: '-30%' },
      { label: '注册资本实缴', value: '5000 万 / 实缴 0', benchmark: '应实缴到位', status: 'danger', delta: '未实缴' },
    ],
    aiJudgment: {
      summary: '综合已有材料，企业存在以下异常，建议在尽调中重点关注：',
      points: [
        { level: 'danger', text: '营业收入在不同材料中差异 33.6%，需核实真实营收规模' },
        { level: 'danger', text: '实缴资本为 0，资本风险较大' },
        { level: 'warning', text: '合同回款率仅 50%，需关注现金流和应收账款质量' },
        { level: 'warning', text: '税负率显著低于同行业，可能存在低报风险' },
        { level: 'info', text: '建议补充银行流水验证真实资金流向' },
      ],
    },
  },
  dd002: {
    consistencyChecks: [
      { label: '企业名称', status: 'match', detail: '营业执照与审计报告主体一致', sources: '营业执照, 审计报告' },
      { label: '统一社会信用代码', status: 'pending', detail: '审计报告未提取信用代码，待 RPA 补全', sources: '营业执照 vs 审计报告' },
      { label: '注册资本', status: 'match', detail: '营业执照 8000 万，审计报告实收资本一致', sources: '营业执照, 审计报告' },
    ],
    businessMetrics: [
      { label: '资产负债率', value: '66.3%', benchmark: '行业均值 55%', status: 'warning', delta: '+11.3%' },
      { label: '净利率', value: '12.7%', benchmark: '行业均值 8.5%', status: 'match', delta: '+4.2%' },
      { label: 'ROE', value: '29.6%', benchmark: '行业均值 12%', status: 'warning', delta: '异常偏高' },
    ],
    aiJudgment: {
      summary: '材料尚不完整（仅 2 份），以下为初步判断：',
      points: [
        { level: 'warning', text: 'ROE 29.6% 远超行业均值，需核实利润真实性' },
        { level: 'warning', text: '资产负债率 66.3% 偏高，偿债压力较大' },
        { level: 'info', text: '建议补充税票数据和银行流水后再做判断' },
      ],
    },
  },
}

export const useDocRecognitionStore = defineStore('docRecognition', () => {
  // 按任务/企业分组的文件列表
  const tasks = ref([
    {
      id: 'dd-ts-wq',
      name: '唐山物桥商贸有限公司',
      industry: '建材批发 / 商贸流通',
      region: '河北唐山',
      amount: '500万',
      files: [
        { id: 'f008', name: '营业执照.pdf', type: '营业执照', status: '已完成', size: '920KB', uploadedAt: '2026-07-02 08:20' },
        { id: 'f009', name: '纳税申报表.xlsx', type: '纳税申报', status: '待确认', size: '1.5MB', uploadedAt: '2026-07-02 08:22' },
        { id: 'f010', name: '增值税发票.pdf', type: '发票', status: '已完成', size: '2.1MB', uploadedAt: '2026-07-02 08:25' },
        { id: 'f011', name: '企业所得税.pdf', type: '税务', status: '已完成', size: '1.8MB', uploadedAt: '2026-07-02 08:28' },
        { id: 'f012', name: '发票明细.xlsx', type: '发票', status: '已完成', size: '3.2MB', uploadedAt: '2026-07-02 08:30' },
        { id: 'f013', name: '纳税评级.pdf', type: '税务', status: '已完成', size: '560KB', uploadedAt: '2026-07-02 08:32' },
        { id: 'f014', name: '银行流水摘要.pdf', type: '银行', status: '待确认', size: '4.1MB', uploadedAt: '2026-07-02 08:35' },
        { id: 'f015', name: '工商登记信息.pdf', type: '工商', status: '已完成', size: '780KB', uploadedAt: '2026-07-02 08:38' },
      ],
    },
    {
      id: 'dd001',
      name: '杭州智造装备有限公司',
      industry: '专用设备制造',
      region: '浙江杭州',
      amount: '500万',
      files: [
        { id: 'f001', name: '营业执照.pdf', type: '营业执照', status: '已完成', size: '1.1MB', uploadedAt: '2026-06-26 10:30' },
        { id: 'f002', name: '营业执照副本.pdf', type: '营业执照', status: '已完成', size: '856KB', uploadedAt: '2026-06-26 10:31' },
        { id: 'f003', name: '法人身份证.jpg', type: '身份证', status: '待确认', size: '856KB', uploadedAt: '2026-06-26 14:15' },
        { id: 'f004', name: '2025年纳税申报表.xlsx', type: '纳税申报', status: '待确认', size: '1.8MB', uploadedAt: '2026-06-27 09:20' },
        { id: 'f005', name: '主要销售合同.pdf', type: '销售合同', status: '识别中', size: '3.2MB', uploadedAt: '2026-06-27 14:05' },
      ],
    },
    {
      id: 'dd002',
      name: '宁波天合新材料有限公司',
      industry: '新材料研发',
      region: '浙江宁波',
      amount: '800万',
      files: [
        { id: 'f006', name: '营业执照.pdf', type: '营业执照', status: '已完成', size: '980KB', uploadedAt: '2026-06-27 11:00' },
        { id: 'f007', name: '2025年度审计报告.pdf', type: '审计报告', status: '识别中', size: '4.5MB', uploadedAt: '2026-06-27 16:30' },
      ],
    },
  ])

  const currentTaskId = ref('dd-ts-wq')
  const currentFileId = ref('f014')
  const isUploading = ref(false)
  const statusFilter = ref('all')
  const searchQuery = ref('')
  const chatInput = ref('')
  const chatMessages = ref([])
  const isChatProcessing = ref(false)

  // 右侧面板切换：file（字段识别） / compare（交叉比对）
  const activePanel = ref('file')

  // 字段分组规则 — key 为文件类型
  const fieldGroupRules = {
    '银行': [
      { name: '基础信息', keys: ['账户名称', '开户行', '账号', '流水期间'] },
      { name: '流水规模', keys: ['总入账金额', '总出账金额', '月均入账', '月均出账', '经营净现金流'] },
      { name: '经营稳定性', keys: ['月收入标准差', '收入波动率', '最大单月入账'] },
      { name: '异常交易识别', keys: ['短期大额进出账', '整数规律交易', '关联账户互转', '临近授信异常转入'] },
      { name: '偿债能力', keys: ['债务本息支出', 'DSCR'] },
    ],
    _default: [
      { name: '基础信息', keys: ['企业名称', '统一社会信用代码', '法定代表人', '注册资本', '成立日期'] },
      { name: '经营信息', keys: ['经营范围', '企业类型', '营业期限', '登记机关'] },
      { name: '税务信息', keys: ['纳税人识别号', '申报收入', '应纳税额', '税负率', '纳税信用等级'] },
      { name: '其他字段', keys: null }, // null = 其余未分组的
    ],
  }

  // 关键指标解释
  const metricExplanations = {
    '收入波动率': '收入波动率 = 月收入标准差 / 月均收入。偏高说明月度收入波动较大，经营稳定性偏弱。',
    'DSCR': 'DSCR = 经营净现金流 / 债务本息支出。低于 1 表示现金流不足以覆盖债务本息，存在违约风险。',
  }

  // 可同步章节映射
  const syncChapterMap = {
    '银行': ['财务状况', '收入真实性核实', '主要风险分析'],
    '税务': ['纳税合规', '财务状况'],
    '工商': ['企业基本信息', '工商合规'],
    '_default': ['资料附件'],
  }

  // 用于核验
  const verifyPurposeMap = {
    '银行': ['收入真实性', '经营稳定性', '偿债能力'],
    '税务': ['纳税合规', '申报真实性'],
    '工商': ['主体真实性', '工商合规'],
    '_default': ['资料完整性'],
  }

  // ---- computed ----

  const stats = computed(() => {
    let pending = 0, processing = 0, done = 0
    tasks.value.forEach(t => {
      t.files.forEach(f => {
        if (f.status === '待确认') pending++
        else if (f.status === '识别中') processing++
        else if (f.status === '已完成') done++
      })
    })
    return { total: pending + processing + done, pending, processing, done }
  })

  const currentTask = computed(() =>
    tasks.value.find(t => t.id === currentTaskId.value) || null
  )

  const currentFile = computed(() => {
    if (!currentTask.value || !currentFileId.value) return null
    return currentTask.value.files.find(f => f.id === currentFileId.value) || null
  })

  const currentFileFields = computed(() => {
    if (!currentFileId.value) return []
    return mockFields[currentFileId.value] || []
  })

  const lowConfidenceFields = computed(() =>
    currentFileFields.value.filter(f => f.confidence < 70)
  )

  const filteredTasks = computed(() => {
    let list = tasks.value
    if (statusFilter.value !== 'all') {
      const map = { pending: '待确认', processing: '识别中', done: '已完成' }
      const target = map[statusFilter.value]
      list = list.filter(t => t.files.some(f => f.status === target))
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.files.some(f => f.name.toLowerCase().includes(q))
      )
    }
    return list
  })

  // 交叉比对数据
  const crossCompare = computed(() => {
    if (!currentTaskId.value) return null
    return mockCrossCompare[currentTaskId.value] || null
  })

  const conflictCount = computed(() => {
    const cc = crossCompare.value
    if (!cc) return 0
    return cc.consistencyChecks.filter(c => c.status === 'conflict').length
  })

  const warningCount = computed(() => {
    const cc = crossCompare.value
    if (!cc) return 0
    return cc.consistencyChecks.filter(c => c.status === 'warning').length +
           cc.businessMetrics.filter(m => m.status === 'warning' || m.status === 'danger').length
  })

  const judgmentCount = computed(() => {
    const cc = crossCompare.value
    if (!cc) return 0
    return cc.aiJudgment.points.filter(p => p.level === 'danger').length
  })

  // ========== P1 增强 computed ==========

  // 字段分组
  const groupedFields = computed(() => {
    const fields = currentFileFields.value
    if (!fields.length) return []
    const fileType = currentFile.value?.type || ''
    const rules = fieldGroupRules[fileType] || fieldGroupRules._default
    const result = []
    const assigned = new Set()

    for (const group of rules) {
      if (group.keys === null) continue // _default 其他字段组
      const items = fields.filter(f => group.keys.includes(f.label) && !assigned.has(f.label))
      items.forEach(f => assigned.add(f.label))
      if (items.length) result.push({ name: group.name, fields: items })
    }
    // 其他字段
    const rest = fields.filter(f => !assigned.has(f.label))
    const otherGroup = rules.find(g => g.keys === null)
    if (rest.length) {
      result.push({ name: otherGroup?.name || '其他字段', fields: rest })
    }
    return result
  })

  // 识别摘要卡
  const fileSummary = computed(() => {
    const file = currentFile.value
    const fields = currentFileFields.value
    if (!file || !fields.length) return null
    const avgConf = Math.round(fields.reduce((s, f) => s + f.confidence, 0) / fields.length)
    const fileType = file.type || ''
    const chapters = syncChapterMap[fileType] || syncChapterMap._default
    const purposes = verifyPurposeMap[fileType] || verifyPurposeMap._default
    return {
      fileName: file.name,
      fileType: file.type,
      fieldCount: fields.length,
      avgConfidence: avgConf,
      status: file.status,
      syncChapters: chapters,
      verifyPurposes: purposes,
    }
  })

  // 关键指标解释
  function getMetricExplanation(label) {
    return metricExplanations[label] || null
  }

  // 交叉比对总览
  const crossCompareOverview = computed(() => {
    const cc = crossCompare.value
    if (!cc) return null
    const entityOk = cc.consistencyChecks.some(c => c.label === '企业主体一致' && c.status === 'match')
    const flowMatch = cc.businessMetrics.find(m => m.label === '流水发票匹配度')
    const dscr = cc.businessMetrics.find(m => m.label === 'DSCR')
    const manualReview = cc.consistencyChecks.filter(c => c.status === 'warning' || c.status === 'conflict' || c.status === 'danger').length
      + cc.businessMetrics.filter(m => m.status === 'warning' || m.status === 'danger').length
    return {
      entityConsistent: entityOk ? '通过' : '未通过',
      incomeMatch: flowMatch?.value || '—',
      materialCompleteness: '86%',
      dscr: dscr?.value || '—',
      manualReview,
    }
  })

  // ---- actions ----

  function selectTask(taskId) {
    currentTaskId.value = taskId
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.files.length > 0) {
      currentFileId.value = task.files[0].id
    } else {
      currentFileId.value = null
    }
    // 切任务时默认回到字段面板
    activePanel.value = 'file'
  }

  function selectFile(fileId) {
    currentFileId.value = fileId
  }

  function togglePanel(panel) {
    activePanel.value = panel
  }

  function confirmField(fieldLabel, newValue) {
    const fields = mockFields[currentFileId.value]
    if (fields) {
      const field = fields.find(f => f.label === fieldLabel)
      if (field) {
        field.confidence = 100
        if (newValue !== undefined) field.value = newValue
      }
    }
  }

  function simulateUpload(fileName, fileSize) {
    isUploading.value = true
    const newId = `f${Date.now()}`
    const newFile = {
      id: newId,
      name: fileName,
      type: fileName.split('.').pop(),
      status: '识别中',
      size: fileSize || '1.2MB',
      uploadedAt: new Date().toLocaleString('zh-CN'),
    }
    const targetTask = tasks.value.find(t => t.id === currentTaskId.value) || tasks.value[0]
    targetTask.files.push(newFile)
    mockFields[newId] = [
      { label: '企业名称', value: targetTask.name, confidence: 95 },
      { label: '文档类型', value: newFile.type, confidence: 88 },
      { label: '提取内容', value: '待人工确认...', confidence: 55 },
    ]
    setTimeout(() => {
      const file = targetTask.files.find(f => f.id === newId)
      if (file) file.status = '待确认'
      isUploading.value = false
    }, 3000)
    return newId
  }

  function syncToDueDiligence(fileId) {
    for (const task of tasks.value) {
      const file = task.files.find(f => f.id === fileId)
      if (file) {
        file.status = '已完成'
        const fields = mockFields[fileId]
        if (fields) fields.forEach(f => (f.confidence = 100))
        return { success: true, taskName: task.name }
      }
    }
    return { success: false }
  }

  function addChatMessage(msg) { chatMessages.value.push(msg) }

  function sendChat() {
    const input = chatInput.value.trim()
    if (!input || isChatProcessing.value) return
    chatMessages.value.push({ role: 'user', content: input })
    chatInput.value = ''
    isChatProcessing.value = true
    setTimeout(() => {
      chatMessages.value.push({
        role: 'ai',
        content: '收到，我正在处理您的请求。在 demo 中这是预设回复。',
      })
      isChatProcessing.value = false
    }, 800)
  }

  return {
    tasks,
    currentTaskId,
    currentFileId,
    isUploading,
    statusFilter,
    searchQuery,
    chatInput,
    chatMessages,
    isChatProcessing,
    activePanel,
    stats,
    currentTask,
    currentFile,
    currentFileFields,
    lowConfidenceFields,
    filteredTasks,
    crossCompare,
    conflictCount,
    warningCount,
    judgmentCount,
    groupedFields,
    fileSummary,
    crossCompareOverview,
    selectTask,
    selectFile,
    togglePanel,
    confirmField,
    getMetricExplanation,
    simulateUpload,
    syncToDueDiligence,
    addChatMessage,
    sendChat,
  }
})
