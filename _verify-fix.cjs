const fs = require('fs');
const c = fs.readFileSync('src/stores/workbenchAssistant.js', 'utf8');

const funcs = [
  { name: 'runScreening', stageId: 'screen' },
  { name: 'runEnterpriseExploration', stageId: 'explore' },
  { name: 'startMonitor', stageId: 'monitor' },
  { name: 'startDueDiligence', stageId: 'dueDiligence' },
  { name: 'runBusinessVerification', stageId: 'business' },
  { name: 'runTaxCollectionStep', stageId: 'tax' },
  { name: 'runMaterialCollectionStep', stageId: 'materials' },
  { name: 'runRiskDiagnosisStep', stageId: 'riskDiagnosis' },
  { name: 'generateDeliverables', stageId: 'deliverables' },
  { name: 'openReportEditor', stageId: 'reportEditor' },
];

funcs.forEach(f => {
  const idx = c.indexOf('async function ' + f.name);
  if (idx === -1) { console.log(f.name + ': NOT FOUND'); return; }
  const nextFunc = c.indexOf('async function', idx + 10);
  const block = c.substring(idx, nextFunc === -1 ? idx + 2000 : nextFunc);

  const setActiveStr = "setActiveStage('" + f.stageId + "')";
  const artifactStr = 'stage.artifactData = {';

  const setActiveIdx = block.indexOf(setActiveStr);
  const artifactIdx = block.indexOf(artifactStr);

  if (setActiveIdx === -1 && artifactIdx === -1) {
    console.log(f.name + ': no setActiveStage or artifactData');
  } else if (setActiveIdx !== -1 && artifactIdx !== -1) {
    console.log(f.name + ': ' + (artifactIdx < setActiveIdx ? 'OK' : 'BAD'));
  } else if (setActiveIdx !== -1) {
    console.log(f.name + ': only setActiveStage, no artifactData');
  } else {
    console.log(f.name + ': only artifactData, no setActiveStage');
  }
});
