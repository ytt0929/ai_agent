const fs = require('fs');
const path = 'src/stores/workbenchAssistant.js';
let c = fs.readFileSync(path, 'utf8');

// ===== Fix 1: upsertStage infinite recursion =====
const brokenUpsert = `/** 阶段 upsert：保证 flowStages 中 id 唯一 */
  function upsertStage(stage) {
    const existing = flowStages.find(s => s.id === stage.id)
    if (existing) {
      Object.assign(existing, stage)
      return existing
    }
    upsertStage(stage)
    return stage
  }`;

const fixedUpsert = `/** 阶段 upsert：保证 flowStages 中 id 唯一 */
  function upsertStage(stage) {
    const existing = flowStages.find(s => s.id === stage.id)
    if (existing) {
      Object.assign(existing, stage)
      return existing
    }
    flowStages.push(stage)
    return stage
  }`;

c = c.replace(brokenUpsert, fixedUpsert);

// ===== Fix 2: setActiveStage must set activeTool for stage tab clicks =====
// setActiveStage should sync activeTool (for left panel component switching)
// but should NOT touch leftPanelData (managed by flow functions)
const currentSetStage = `function setActiveStage(id) {
    activeStageId.value = id
    Object.keys(artifactData).forEach(k => delete artifactData[k])

    const stage = flowStages.find(s => s.id === id)
    if (!stage) return

    currentArtifactType.value = id
    Object.assign(artifactData, stage.artifactData || {})

    layoutMode.value = 'workspace'
  }`;

const newSetStage = `function setActiveStage(id) {
    activeStageId.value = id
    Object.keys(artifactData).forEach(k => delete artifactData[k])

    const stage = flowStages.find(s => s.id === id)
    if (!stage) return

    currentArtifactType.value = id
    Object.assign(artifactData, stage.artifactData || {})

    layoutMode.value = 'workspace'

    // Sync activeTool based on stage id — needed for left panel component switching
    const stageToolMap = {
      screen: 'screening',
      explore: 'exploration',
      monitor: 'monitor',
      dueDiligence: 'dueDiligence',
      business: 'business',
      tax: 'tax',
      materials: 'materials',
      riskDiagnosis: 'riskDiagnosis',
      deliverables: 'deliverables',
      reportEditor: 'reportEditor',
    }
    const mappedTool = stageToolMap[id]
    if (mappedTool) {
      activeTool.value = mappedTool
    }
    // Note: leftPanelData is NOT touched here — it's managed by flow functions.
  }`;

c = c.replace(currentSetStage, newSetStage);

fs.writeFileSync(path, c, 'utf8');
console.log('Fixes applied:');
console.log('1. upsertStage infinite recursion: FIXED');
console.log('2. setActiveStage now sets activeTool (but not leftPanelData): FIXED');
