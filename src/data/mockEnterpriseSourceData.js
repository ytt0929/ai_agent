// ═══════════════════════════════════════════════════
// mockEnterpriseSourceData.js
// Demo mock source data extracted from NS004.txt / ns010.txt
// These are demo values for 唐山物桥商贸有限公司, inspired by
// the structure of the source files.
// ═══════════════════════════════════════════════════

export const enterpriseSourceData = {
  '91130203MA7EEQ2N0T': {
    identity: {
      name: '唐山物桥商贸有限公司',
      creditCode: '91130203MA7EEQ2N0T',
      industry: '建材批发',
      taxpayerType: '一般纳税人',
      legalRep: '马丽',
      establishedYear: 2022,
      employeeCount: 5
    },
    coverage: {
      business: true,
      judicial: true,
      tax: true,
      flow: false,
      socialSecurity: true
    },
    shareholders: [
      { name: '马丽', idType: '居民身份证', amount: 350, ratio: '70.00' },
      { name: '李某', idType: '居民身份证', amount: 150, ratio: '30.00' }
    ],
    taxDeclarations: [
      { periodStart: '2025-04-01', periodEnd: '2025-04-30', submitDate: '2025-05-13', project: '增值税', salesAmount: 34035.40, taxAmount: 1261.86,减免Amount: 0 },
      { periodStart: '2025-05-01', periodEnd: '2025-05-31', submitDate: '2025-06-08', project: '增值税', salesAmount: 5376.11, taxAmount: 514.07, 减免Amount: 0 },
      { periodStart: '2025-06-01', periodEnd: '2025-06-30', submitDate: '2025-07-14', project: '增值税', salesAmount: 1052477.08, taxAmount: 39.79, 减免Amount: 0 },
      { periodStart: '2025-07-01', periodEnd: '2025-07-31', submitDate: '2025-08-14', project: '增值税', salesAmount: 2242424.88, taxAmount: 687.70, 减免Amount: 0 },
      { periodStart: '2025-08-01', periodEnd: '2025-08-31', submitDate: '2026-01-09', project: '增值税', salesAmount: 2461074.16, taxAmount: 1741.55, 减免Amount: 0 },
      { periodStart: '2025-09-01', periodEnd: '2025-09-30', submitDate: '2026-01-09', project: '增值税', salesAmount: 490884.90, taxAmount: 1217.93, 减免Amount: 0 },
      { periodStart: '2025-10-01', periodEnd: '2025-10-31', submitDate: '2026-01-09', project: '增值税', salesAmount: 143598.03, taxAmount: 1395.21, 减免Amount: 0 },
      { periodStart: '2025-11-01', periodEnd: '2025-11-30', submitDate: '2026-01-09', project: '增值税', salesAmount: 3285203.86, taxAmount: 1200.24, 减免Amount: 0 },
      { periodStart: '2025-12-01', periodEnd: '2025-12-31', submitDate: '2026-01-09', project: '增值税', salesAmount: 5297872.14, taxAmount: 10218.07, 减免Amount: 0 },
    ],
    incomeTaxDeclarations: [
      { periodStart: '2025-01-01', periodEnd: '2025-03-31', submitDate: '2025-04-15', salesAmount: 523532.47, taxAmount: 0 },
      { periodStart: '2025-04-01', periodEnd: '2025-06-30', submitDate: '2025-07-14', salesAmount: 1091888.59, taxAmount: 0 },
      { periodStart: '2025-07-01', periodEnd: '2025-09-30', submitDate: '2025-10-10', salesAmount: 5194383.94, taxAmount: 0 },
      { periodStart: '2025-10-01', periodEnd: '2025-12-31', submitDate: '2026-01-09', salesAmount: 8726674.03, taxAmount: 0 },
    ],
    socialSecurity: {
      employeeCount: 5,
      note: '从业人数来自企业所得税申报附表（104从业人数），缴保连续性基于工商登记信息推算，非完整社保费明细。',
      isEstimated: true
    },
    // ══ 工商分析详细数据 ══
    businessDetail: {
      registry: {
        name: '唐山物桥商贸有限公司',
        creditNo: '91130203MA7EEQ2N0T',
        operName: '马丽',
        startDate: '2022-03-15',
        registCapi: '500万',
        status: '存续',
        industryName: '建材批发',
        econKind: '有限责任公司(自然人投资或控股)',
        address: '河北省唐山市路南区新华道15号',
        scope: '建材、钢材、水泥制品、五金交电、电子产品批发零售；机械设备租赁；普通货物装卸服务。',
        termStart: '2022-03-15',
        termEnd: '长期',
        checkDate: '2024-06-20',
        domains: '建材批发',
        registeredOrg: '唐山市市场监督管理局',
      },
      taxRegistry: {
        hymc: '建材批发',
        mlmc: '批发和零售业',
        zcrq: '2022-03-15',
        cyrs: '5',
        djzclx: '私营有限责任公司',
        frName: '马丽',
        zczb: '5000000.0',
        zgswjg: '唐山市路南区税务局',
        nsrztdm: '一般纳税人',
      },
      shareholders: [
        { name: '马丽', stockRate: '70.00%', totalShouldCapi: '350万', stockType: '自然人股东', maxShouldCapiDate: '2043-03-20', totalRealCapi: '0' },
        { name: '李某', stockRate: '30.00%', totalShouldCapi: '150万', stockType: '自然人股东', maxShouldCapiDate: '2043-03-20', totalRealCapi: '0' },
      ],
      employees: [
        { name: '马丽', jobTitle: '执行董事兼总经理' },
        { name: '张某', jobTitle: '监事' },
      ],
      changes: [
        { changeDate: '2024-06-20', changeItem: '章程备案', beforeContent: '', afterContent: '' },
        { changeDate: '2024-06-20', changeItem: '经营范围变更', beforeContent: '建材、钢材批发零售', afterContent: '建材、钢材、水泥制品、五金交电、电子产品批发零售' },
        { changeDate: '2023-12-10', changeItem: '住所变更', beforeContent: '唐山市路北区建设路88号', afterContent: '唐山市路南区新华道15号' },
        { changeDate: '2022-03-15', changeItem: '设立登记', beforeContent: '', afterContent: '公司成立' },
      ],
      patents: [],
      taxPersons: [
        { name: '马丽', type: '法定代表人', phone: '138****1234' },
        { name: '王某', type: '财务负责人', phone: '139****5678' },
      ],
      abnormal: [],
      judicialRisks: [],
      wenshu: [],
      penalties: [],
      infoPrompt: {
        wenshuCount: 0,
        disruptCount: 0,
        cntOperChange3yr: 2,
        totalAmount: 0,
        applierConsumLimited: 0,
      },
    },
    metrics: {
      vatBurdenRate: 0.8,       // 增值税税负率 %
      revenueYoY: 188.3,        // 营收同比增速 %
      invoiceIncome: 2275.98,   // 开票收入（万元）
      declaredIncome: 2175.46,  // 申报收入（万元）
      declarationDiffRate: 4.4, // 开票申报差异 %
      vatPaid: 18.2,            // 应纳增值税（万元）
      industryAvgVatRate: 2.8   // 行业均值税负率 %
    },
    evidenceSources: [
      { source: '增值税纳税申报系统', type: 'sbxx' },
      { source: '企业所得税年度申报', type: 'ns010' },
      { source: '国家企业信用信息公示系统', type: 'gs' }
    ]
  }
}

/**
 * 从输入文本中识别企业信用代码或名称
 * 返回 { creditCode, name } 或 null
 */
export function findEnterpriseFromText(text) {
  if (!text) return null
  const t = text.trim()

  // 18位统一社会信用代码
  const creditMatch = t.match(/[0-9A-HJ-NPQRTUWXY]{18}/)
  if (creditMatch) {
    const code = creditMatch[0]
    const ent = enterpriseSourceData[code]
    if (ent) return { creditCode: code, name: ent.identity.name }
    return { creditCode: code, name: null }
  }

  // 按名称匹配
  for (const [code, ent] of Object.entries(enterpriseSourceData)) {
    if (t.includes(ent.identity.name)) {
      return { creditCode: code, name: ent.identity.name }
    }
  }

  return null
}

/**
 * 获取企业完整源数据
 */
export function getEnterpriseSourceData(creditCode) {
  return enterpriseSourceData[creditCode] || null
}

/**
 * 获取数据覆盖状态
 */
export function getDataCoverage(creditCode) {
  const src = enterpriseSourceData[creditCode]
  if (!src) return null
  return src.coverage
}

/**
 * 获取申报明细行
 */
export function getTaxDeclarationRows(creditCode, limit = 9) {
  const src = enterpriseSourceData[creditCode]
  if (!src) return []
  return src.taxDeclarations.slice(0, limit)
}

/**
 * 获取股东明细行
 */
export function getShareholderRows(creditCode) {
  const src = enterpriseSourceData[creditCode]
  if (!src) return []
  return src.shareholders
}

/**
 * 计算/返回税负率
 */
export function calculateVatBurden(creditCode) {
  const src = enterpriseSourceData[creditCode]
  if (!src || !src.coverage.tax) return null
  const m = src.metrics
  return {
    vatBurdenRate: m.vatBurdenRate,
    vatPaid: m.vatPaid,
    invoiceIncome: m.invoiceIncome,
    formula: `税负率 = ${m.vatPaid}万 ÷ ${m.invoiceIncome}万 = ${m.vatBurdenRate}%`,
    industryAvg: m.industryAvgVatRate,
    judgment: m.vatBurdenRate < m.industryAvgVatRate * 0.5 ? '异常偏低' :
              m.vatBurdenRate < m.industryAvgVatRate * 0.7 ? '偏低' : '正常'
  }
}

/**
 * 获取工商分析详细数据
 */
export function getBusinessDetail(creditCode) {
  const src = enterpriseSourceData[creditCode]
  if (!src) return null
  return src.businessDetail || null
}
