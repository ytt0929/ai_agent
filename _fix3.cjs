const fs = require('fs');
const path = 'src/stores/workbenchAssistant.js';
let c = fs.readFileSync(path, 'utf8');

// ===== Fix: Ensure leftPanelData is properly synced in ALL tax-related functions =====

// 1. runTaxCollectionStep: setActiveStage wipes leftPanelData with empty stage.artifactData
//    Move leftPanelData assignment AFTER stage.artifactData is populated
const oldTaxStep = `  async function runTaxCollectionStep() {
    layoutMode.value = 'workspace'
    activeTool.value = 'tax'

    const stage = { id: 'tax', label: '税票采集', icon: '', status: 'active', artifactData: {} }
    upsertStage(stage)
    setActiveStage('tax')
    Object.assign(leftPanelData, {
      customer: selectedEnterprise.value,
      chain: '生成授权链接 → 企业扫码授权 → RPA采集 → 数据入库',
      linkStatus: '未发送',
      authStatus: '待确认发送',
      status: '等待确认',
    })

    await pushStep('tax', '生成税票采集授权链接', 'done', [
      { label: '进项发票', value: '待采集' },
      { label: '销项发票', value: '待采集' },
      { label: '纳税申报', value: '待采集' },
    ])

    updateStageStatus('tax', 'active')
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer: selectedEnterprise.value,
      chain: '生成授权链接 → 企业扫码授权 → RPA采集 → 数据入库',
      status: '待确认发送',
      authStatus: '待确认发送',
      linkStatus: '未发送',
      input: { count: 0, total: 0, unit: '份' },
      output: { count: 0, total: 0, unit: '份' },
      filing: { status: '未采集' },
      autoLog: [
        { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
        { time: '—', desc: '等待用户确认发送', status: 'waiting' },
      ],
    }
    currentArtifactType.value = 'tax'
    Object.assign(artifactData, stage.artifactData)`;

const newTaxStep = `  async function runTaxCollectionStep() {
    layoutMode.value = 'workspace'
    activeTool.value = 'tax'

    const stage = { id: 'tax', label: '税票采集', icon: '🎫', status: 'active', artifactData: {} }
    upsertStage(stage)

    // Populate stage.artifactData FIRST
    stage.artifactData = {
      steps: stage.artifactData.steps || [],
      customer: selectedEnterprise.value,
      chain: '生成授权链接 → 企业扫码授权 → RPA采集 → 数据入库',
      status: '等待确认',
      authStatus: '待确认发送',
      linkStatus: '未发送',
      input: { count: 0, total: 0, unit: '份' },
      output: { count: 0, total: 0, unit: '份' },
      filing: { status: '未采集' },
      autoLog: [
        { time: '10:33', desc: '已生成税票采集授权链接', status: 'done' },
        { time: '—', desc: '等待用户确认发送', status: 'waiting' },
      ],
    }
    currentArtifactType.value = 'tax'
    Object.assign(artifactData, stage.artifactData)

    // THEN setActiveStage (which reads from stage.artifactData)
    setActiveStage('tax')

    await pushStep('tax', '生成税票采集授权链接', 'done', [
      { label: '进项发票', value: '待采集' },
      { label: '销项发票', value: '待采集' },
      { label: '纳税申报', value: '待采集' },
    ])

    updateStageStatus('tax', 'active')`;

c = c.replace(oldTaxStep, newTaxStep);

// 2. confirmTaxSend: update leftPanelData with stage.artifactData
const oldConfirmTax = `    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, { linkStatus: '已发送', authStatus: '等待授权' })`;
const newConfirmTax = `    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, stage.artifactData)`;
c = c.replace(oldConfirmTax, newConfirmTax);

// 3. mockTaxAuthorized: update leftPanelData with stage.artifactData
const oldMockTax = `    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, {
      linkStatus: '已使用',
      authStatus: '已授权',
      input: stage.artifactData.input,
      output: stage.artifactData.output,
      filing: stage.artifactData.filing,
      autoLog: stage.artifactData.autoLog,
    })`;
const newMockTax = `    Object.assign(artifactData, stage.artifactData)
    Object.assign(leftPanelData, stage.artifactData)`;
c = c.replace(oldMockTax, newMockTax);

fs.writeFileSync(path, c, 'utf8');
console.log('Tax collection left panel sync fixes applied');
console.log('- runTaxCollectionStep: artifactData populated before setActiveStage');
console.log('- confirmTaxSend: leftPanelData synced from stage.artifactData');
console.log('- mockTaxAuthorized: leftPanelData synced from stage.artifactData');
