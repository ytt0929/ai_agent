/**
 * 企业诊断 Mock 数据 — 报告工作台
 */

// 模拟企业库（唐山物桥排在首位，作为默认演示场景）
export const enterpriseDB = [
  { creditCode: '91130203MA7EEQ2N0T', name: '唐山物桥商贸有限公司', industry: '建材批发' },
  { creditCode: '91330100MA2KJ8X26R', name: '杭州智造装备有限公司', industry: '制造业' },
  { creditCode: '91330200MA1FL5XQ9X', name: '浙江恒远制造股份有限公司', industry: '制造业' },
  { creditCode: '91330300MA2L0X9012', name: '宁波海川精密机械有限公司', industry: '机械制造' },
  { creditCode: '91330400MA2M0X3456', name: '温州精益模具有限公司', industry: '模具制造' },
  { creditCode: '91330500MA2N0Y6789', name: '绍兴某某贸易有限公司', industry: '贸易' },
]

// 八大维度定义
export const dimensionDefs = [
  { key: 'stability', name: '经营稳定性' },
  { key: 'growth', name: '经营成长性' },
  { key: 'authenticity', name: '业务真实性' },
  { key: 'tax', name: '税务风险' },
  { key: 'enterprise', name: '企业稳定性' },
  { key: 'supply-chain', name: '供应链稳定性' },
  { key: 'related-party', name: '关联交易' },
  { key: 'judicial', name: '司法负面' },
]

// 指标（8 风险 + 9 亮点 = 17）
export const indicators = [
  // ── 风险项 (8) ──
  {
    id: 'R1', name: '营收增长异常', type: 'risk', level: 'high',
    dimensionKey: 'stability', dimensionName: '经营稳定性',
    fact: '近12月开票收入同比增长188.3%，增速远超行业平均水平',
    evidenceIds: ['E1', 'E2', 'E3'], reportStatus: 'included',
  },
  {
    id: 'R2', name: '购销两头在外', type: 'risk', level: 'medium',
    dimensionKey: 'authenticity', dimensionName: '业务真实性',
    fact: '主要供应商和客户均位于外地，存在两头在外经营模式',
    evidenceIds: ['E4', 'E5'], reportStatus: 'included',
  },
  {
    id: 'R3', name: '短期偿债压力过大', type: 'risk', level: 'high',
    dimensionKey: 'stability', dimensionName: '经营稳定性',
    fact: '短期借款50万元，占流动资产61%，偿债压力较大',
    evidenceIds: ['E6', 'E7'], reportStatus: 'included',
  },
  {
    id: 'R4', name: '应收账款周转率下降', type: 'risk', level: 'medium',
    dimensionKey: 'stability', dimensionName: '经营稳定性',
    fact: '应收账款周转率从8.2降至5.6，回款速度变慢',
    evidenceIds: ['E8', 'E9'], reportStatus: 'included',
  },
  {
    id: 'R5', name: '税负率显著低于行业', type: 'risk', level: 'high',
    dimensionKey: 'tax', dimensionName: '税务风险',
    fact: '增值税税负率0.8%，仅为行业均值2.8%的29%',
    evidenceIds: ['E10', 'E11', 'E12'], reportStatus: 'included',
  },
  {
    id: 'R6', name: '开票收入与申报收入不一致', type: 'risk', level: 'medium',
    dimensionKey: 'authenticity', dimensionName: '业务真实性',
    fact: '开票收入2275.98万元，申报收入2175.46万元，差异4.4%',
    evidenceIds: ['E13', 'E14'], reportStatus: 'included',
  },
  {
    id: 'R7', name: '电费与收入相关性低', type: 'risk', level: 'low',
    dimensionKey: 'authenticity', dimensionName: '业务真实性',
    fact: '近12月电费与收入相关性仅0.18，低于正常水平',
    evidenceIds: ['E15', 'E16'], reportStatus: 'pending',
  },
  {
    id: 'R8', name: '公司成立时间较短', type: 'risk', level: 'medium',
    dimensionKey: 'enterprise', dimensionName: '企业稳定性',
    fact: '企业成立39个月，经营历史相对较短',
    evidenceIds: ['E17'], reportStatus: 'ignored',
  },

  // ── 亮点项 (9) ──
  {
    id: 'H1', name: '近三年应税收入持续增长', type: 'highlight', level: 'strong',
    dimensionKey: 'growth', dimensionName: '经营成长性',
    fact: '2025年应税销售收入达2275.98万元，同比增长188.3%，连续三年保持增长趋势',
    evidenceIds: ['E18', 'E19'], reportStatus: 'included',
  },
  {
    id: 'H2', name: '司法记录清白', type: 'highlight', level: 'strong',
    dimensionKey: 'judicial', dimensionName: '司法负面',
    fact: '无被执行、无失信、无限制高消费记录，司法风险为零',
    evidenceIds: ['E20'], reportStatus: 'included',
  },
  {
    id: 'H3', name: '纳税信用等级A级', type: 'highlight', level: 'normal',
    dimensionKey: 'tax', dimensionName: '税务风险',
    fact: '纳税信用等级评定为A级，具有良好的基础信用背书',
    evidenceIds: ['E21'], reportStatus: 'included',
  },
  {
    id: 'H4', name: '管理层连续稳定', type: 'highlight', level: 'normal',
    dimensionKey: 'enterprise', dimensionName: '企业稳定性',
    fact: '法定代表人马丽自公司成立以来一直任职，无变更记录',
    evidenceIds: ['E22'], reportStatus: 'included',
  },
  {
    id: 'H5', name: '客户集中度明确', type: 'highlight', level: 'normal',
    dimensionKey: 'supply-chain', dimensionName: '供应链稳定性',
    fact: '前五大客户贡献营收72%，客户结构清晰且合作关系稳定',
    evidenceIds: ['E23', 'E24'], reportStatus: 'included',
  },
  {
    id: 'H6', name: '无关联方资金占用', type: 'highlight', level: 'strong',
    dimensionKey: 'related-party', dimensionName: '关联交易',
    fact: '未发现关联方资金占用或异常往来，财务独立性良好',
    evidenceIds: ['E25', 'E26'], reportStatus: 'included',
  },
  {
    id: 'H7', name: '增值税进项抵扣正常', type: 'highlight', level: 'normal',
    dimensionKey: 'tax', dimensionName: '税务风险',
    fact: '进项税额抵扣链条完整，与采购规模基本匹配',
    evidenceIds: ['E27'], reportStatus: 'included',
  },
  {
    id: 'H8', name: '社保缴纳连续', type: 'highlight', level: 'normal',
    dimensionKey: 'enterprise', dimensionName: '企业稳定性',
    fact: '近12个月连续为员工缴纳社保，无中断记录',
    evidenceIds: ['E28'], reportStatus: 'included',
  },
  {
    id: 'H9', name: '无行政处罚记录', type: 'highlight', level: 'normal',
    dimensionKey: 'judicial', dimensionName: '司法负面',
    fact: '无工商、税务、环保等部门行政处罚记录',
    evidenceIds: ['E29'], reportStatus: 'included',
  },
]

// 证据链
export const evidenceChain = {
  E1: { id: 'E1', source: '税票数据', title: '近12月销项发票总额', value: '2275.98万元', comparison: '上年同期789.5万元，增长188.3%', collectedAt: '2026-06-25', confidence: 0.95 },
  E2: { id: 'E2', source: '税票数据', title: '月度开票趋势', value: '连续12月增长', comparison: '2025年Q4环比增长45%，2026年Q1环比增长62%', collectedAt: '2026-06-25', confidence: 0.92 },
  E3: { id: 'E3', source: '行业数据', title: '建材批发行业平均增速', value: '12.5%', comparison: '该企业增速188.3%为行业均值15倍', collectedAt: '2026-06-20', confidence: 0.88 },
  E4: { id: 'E4', source: '工商数据', title: '供应商注册地分析', value: 'Top5供应商均不在唐山', comparison: '河北本地供应商占比仅15%', collectedAt: '2026-06-22', confidence: 0.90 },
  E5: { id: 'E5', source: '工商数据', title: '客户注册地分析', value: 'Top5客户均在外省市', comparison: '河北本地客户占比8%', collectedAt: '2026-06-22', confidence: 0.90 },
  E6: { id: 'E6', source: '企业征信', title: '短期借款余额', value: '50万元', comparison: '占流动资产82万元的61%', collectedAt: '2026-06-24', confidence: 0.93 },
  E7: { id: 'E7', source: '企业征信', title: '流动比率', value: '1.64', comparison: '低于行业均值2.1，短期偿债能力偏弱', collectedAt: '2026-06-24', confidence: 0.91 },
  E8: { id: 'E8', source: '财务报表', title: '应收账款周转率', value: '5.6次', comparison: '上年同期8.2次，下降31.7%', collectedAt: '2026-06-23', confidence: 0.89 },
  E9: { id: 'E9', source: '财务报表', title: '应收账款余额', value: '380万元', comparison: '占年营收16.7%，回款周期约65天', collectedAt: '2026-06-23', confidence: 0.87 },
  E10: { id: 'E10', source: '税票数据', title: '增值税税负率', value: '0.8%', comparison: '行业均值2.8%，仅为29%', collectedAt: '2026-06-25', confidence: 0.96 },
  E11: { id: 'E11', source: '税票数据', title: '销项税额', value: '18.2万元', comparison: '基于2275.98万元应税收入，税负率偏低', collectedAt: '2026-06-25', confidence: 0.94 },
  E12: { id: 'E12', source: '行业数据', title: '建材批发行业税负率分布', value: '2.8%（中位数）', comparison: '该企业0.8%处于行业底部5%分位', collectedAt: '2026-06-20', confidence: 0.85 },
  E13: { id: 'E13', source: '税票数据', title: '开票收入总额', value: '2275.98万元', comparison: '已核实税票系统数据', collectedAt: '2026-06-25', confidence: 0.97 },
  E14: { id: 'E14', source: '纳税申报', title: '申报收入总额', value: '2175.46万元', comparison: '差异100.52万元（4.4%），需核实差异原因', collectedAt: '2026-06-24', confidence: 0.93 },
  E15: { id: 'E15', source: '用电数据', title: '月均电费', value: '1.2万元', comparison: '与营收相关性仅0.18，远低于正常值0.6+', collectedAt: '2026-06-21', confidence: 0.78 },
  E16: { id: 'E16', source: '用电数据', title: '近12月电费波动', value: '±15%', comparison: '营收波动±50%，两者不匹配', collectedAt: '2026-06-21', confidence: 0.75 },
  E17: { id: 'E17', source: '工商数据', title: '成立日期', value: '2022年3月', comparison: '经营39个月，处于初创期向成长期过渡阶段', collectedAt: '2026-06-22', confidence: 0.99 },
  E18: { id: 'E18', source: '纳税申报', title: '2023年应税收入', value: '789.5万元', comparison: '基期数据', collectedAt: '2026-06-24', confidence: 0.95 },
  E19: { id: 'E19', source: '纳税申报', title: '2024年应税收入', value: '1280.3万元', comparison: '同比增长62.2%，连续增长第二年', collectedAt: '2026-06-24', confidence: 0.94 },
  E20: { id: 'E20', source: '司法查询', title: '司法风险扫描', value: '无记录', comparison: '被执行/失信/限高/诉讼均无', collectedAt: '2026-06-22', confidence: 0.98 },
  E21: { id: 'E21', source: '税务数据', title: '纳税信用等级', value: 'A级', comparison: '最高等级，无欠税/违规记录', collectedAt: '2026-06-25', confidence: 0.97 },
  E22: { id: 'E22', source: '工商数据', title: '法人变更记录', value: '无变更', comparison: '马丽自2022年3月任职至今', collectedAt: '2026-06-22', confidence: 0.99 },
  E23: { id: 'E23', source: '合同数据', title: '前五大客户列表', value: '5家', comparison: '贡献营收72%，最长合作3年', collectedAt: '2026-06-23', confidence: 0.88 },
  E24: { id: 'E24', source: '合同数据', title: '客户续约率', value: '92%', comparison: '近12个月仅1家客户流失', collectedAt: '2026-06-23', confidence: 0.86 },
  E25: { id: 'E25', source: '财务报表', title: '关联方交易扫描', value: '无异常', comparison: '关联交易金额占营收<5%，价格公允', collectedAt: '2026-06-23', confidence: 0.92 },
  E26: { id: 'E26', source: '财务报表', title: '资金占用分析', value: '无占用', comparison: '其他应收款中无关联方异常往来', collectedAt: '2026-06-23', confidence: 0.90 },
  E27: { id: 'E27', source: '税票数据', title: '进项税额', value: '156.8万元', comparison: '与采购规模1800万元基本匹配', collectedAt: '2026-06-25', confidence: 0.91 },
  E28: { id: 'E28', source: '社保数据', title: '社保缴纳记录', value: '连续12月无中断', comparison: '参保人数5人，与员工总数一致', collectedAt: '2026-06-24', confidence: 0.96 },
  E29: { id: 'E29', source: '行政处罚', title: '行政处罚扫描', value: '无记录', comparison: '工商/税务/环保/安监均无处罚', collectedAt: '2026-06-22', confidence: 0.97 },
}

// 报告草稿
export const reportDraft = {
  status: 'draft',
  title: '唐山物桥商贸有限公司企业诊断报告',
  includedConclusions: indicators.filter(i => i.reportStatus === 'included').map(i => i.id),
  evidenceCount: Object.keys(evidenceChain).length,
  pendingConfirmations: indicators.filter(i => i.reportStatus === 'pending').length,
}

// 企业画像
// 企业画像（纳税信用 A 级是正面亮点，综合评级 D 是诊断结果）
export const enterpriseProfile = {
  name: '唐山物桥商贸有限公司',
  creditCode: '91130203MA7EEQ2N0T',
  industry: '建材批发',
  taxpayerType: '一般纳税人',
  taxCreditGrade: 'A',
  score: 513,
  legalRep: '马丽',
  establishedYear: '2022年',
  employeeCount: 5,
  operatingMonths: 39,
  revenue2025: '2275.98万元',
  revenueGrowth: '+188.3%',
  vatBurdenRate: '0.8%',
  industryAvgVatRate: '2.8%',
}

// 诊断结果主入口
export function getDiagnosisMock(creditCode) {
  const ent = enterpriseDB.find(e => e.creditCode === creditCode)

  // 唐山物桥 — 报告工作台模式
  if (creditCode === '91130203MA7EEQ2N0T') {
    return buildTangshanDiagnosis(ent)
  }

  // 其他企业保持简单场景
  if (creditCode && creditCode.includes('MA1FL5XQ9X')) {
    return buildSimpleDiagnosis(ent, 'high', 35, '该企业存在多项重大风险信号，建议暂停授信审批。')
  }
  if (creditCode && creditCode.includes('MA2L0X9012')) {
    return buildSimpleDiagnosis(ent, 'medium', 58, '企业存在部分风险信号，整体可控，建议持续关注。')
  }

  return buildSimpleDiagnosis(ent, 'low', 82, '企业经营稳定，各项指标正常。')
}

function buildTangshanDiagnosis(ent) {
  const dimensions = [
    { key: 'stability', name: '经营稳定性', score: 42, level: 'high', riskCount: 3, highlightCount: 0, conclusion: '短期偿债压力大，应收账款周转率持续下降，经营稳定性存疑' },
    { key: 'growth', name: '经营成长性', score: 78, level: 'low', riskCount: 0, highlightCount: 1, conclusion: '近三年应税收入持续增长，2025年达2275.98万元' },
    { key: 'authenticity', name: '业务真实性', score: 38, level: 'high', riskCount: 3, highlightCount: 0, conclusion: '两头在外模式+电费不匹配+收入申报差异，业务真实性需重点核实' },
    { key: 'tax', name: '税务风险', score: 35, level: 'high', riskCount: 1, highlightCount: 2, conclusion: '增值税税负率显著低于行业均值，但纳税信用A级、进项抵扣正常' },
    { key: 'enterprise', name: '企业稳定性', score: 65, level: 'medium', riskCount: 1, highlightCount: 2, conclusion: '成立时间较短，但法人稳定、社保连续缴纳' },
    { key: 'supply-chain', name: '供应链稳定性', score: 70, level: 'low', riskCount: 0, highlightCount: 1, conclusion: '客户结构清晰，续约率高，但上下游均在外地' },
    { key: 'related-party', name: '关联交易', score: 80, level: 'low', riskCount: 0, highlightCount: 1, conclusion: '无关联方资金占用，财务独立性良好' },
    { key: 'judicial', name: '司法负面', score: 95, level: 'low', riskCount: 0, highlightCount: 2, conclusion: '司法记录清白，无行政处罚，信用基础良好' },
  ]

  const riskItems = indicators.filter(i => i.type === 'risk')
  const highlightItems = indicators.filter(i => i.type === 'highlight')

  return {
    enterprise: ent,
    riskLevel: 'high',
    score: 513,
    grade: 'D',
    dimensions,
    riskItems,
    highlightItems,
    allIndicators: indicators,
    evidenceChain,
    reportDraft,
    profile: enterpriseProfile,
    // 兼容旧字段
    summary: '唐山物桥商贸有限公司成立于2022年，从事建材批发业务。近三年应税收入持续增长（2025年达2275.98万元，同比增长188.3%），但存在多项重大风险信号：增值税税负率仅0.8%（行业均值2.8%），购销"两头在外"模式导致业务真实性存疑，短期偿债压力较大。司法记录清白、纳税信用A级为亮点。综合评分513，建议审慎推进授信。',
    suggestions: [
      { level: 'critical', text: '核实营收增长的真实来源，重点审查大额订单和交易对手' },
      { level: 'critical', text: '调查"两头在外"经营模式下物流和资金流匹配情况' },
      { level: 'important', text: '核查增值税税负率异常偏低（0.8%）的原因，要求企业专项说明' },
      { level: 'important', text: '关注客户集中度过高（前5大客户贡献72%营收）带来的经营风险' },
      { level: 'info', text: '督促企业优化债务结构，降低短期偿债压力' },
    ],
  }
}

function buildSimpleDiagnosis(ent, level, score, summary) {
  return {
    enterprise: ent,
    riskLevel: level,
    score,
    grade: level === 'high' ? 'D' : level === 'medium' ? 'C' : 'A',
    dimensions: [
      { key: 'stability', name: '经营稳定性', score: level === 'high' ? 35 : level === 'medium' ? 60 : 85, level, riskCount: level === 'high' ? 3 : 1, highlightCount: level === 'high' ? 0 : 2, conclusion: summary },
      { key: 'growth', name: '经营成长性', score: level === 'high' ? 30 : level === 'medium' ? 55 : 80, level: level === 'high' ? 'high' : level === 'medium' ? 'medium' : 'low', riskCount: 0, highlightCount: 1, conclusion: '经营趋势稳定' },
      { key: 'authenticity', name: '业务真实性', score: level === 'high' ? 40 : level === 'medium' ? 65 : 82, level, riskCount: level === 'high' ? 2 : 0, highlightCount: 1, conclusion: '业务基本真实' },
      { key: 'tax', name: '税务风险', score: level === 'high' ? 35 : level === 'medium' ? 58 : 88, level, riskCount: level === 'high' ? 1 : 0, highlightCount: 1, conclusion: '税务状况基本正常' },
      { key: 'enterprise', name: '企业稳定性', score: level === 'high' ? 50 : level === 'medium' ? 70 : 85, level: level === 'high' ? 'medium' : 'low', riskCount: level === 'high' ? 1 : 0, highlightCount: 1, conclusion: '企业运行稳定' },
      { key: 'supply-chain', name: '供应链稳定性', score: level === 'high' ? 45 : level === 'medium' ? 65 : 80, level: level === 'high' ? 'medium' : 'low', riskCount: 0, highlightCount: 1, conclusion: '供应链基本稳定' },
      { key: 'related-party', name: '关联交易', score: 80, level: 'low', riskCount: 0, highlightCount: 1, conclusion: '无异常关联交易' },
      { key: 'judicial', name: '司法负面', score: 95, level: 'low', riskCount: 0, highlightCount: 1, conclusion: '无司法风险' },
    ],
    riskItems: [],
    highlightItems: [],
    allIndicators: [],
    evidenceChain: {},
    reportDraft: null,
    profile: null,
    summary,
    suggestions: level === 'high'
      ? [{ level: 'critical', text: '建议暂停授信，启动深度尽调' }]
      : [{ level: 'info', text: '可正常推进授信流程' }],
  }
}
