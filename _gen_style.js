const fs = require('fs');

const L = '\\n';
const B = '\\*\\*';

const S = `
<style scoped>
.page { padding: 24px 32px; max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: #94a3b8; }
.card-animate { animation: fadeUp .3s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.empty-hint { text-align: center; color: #94a3b8; font-size: 13px; padding: 32px 0; }
.create-entry { display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg, #eef2ff, #f5f3ff); border: 1.5px dashed #8b5cf6; border-radius: 12px; padding: 22px 28px; cursor: pointer; margin-bottom: 20px; }
.create-entry:hover { border-color: #7c3aed; }
.create-icon { font-size: 28px; }
.create-title { font-size: 15px; font-weight: 600; color: #7c3aed; }
.create-desc { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.history-title { font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 10px; }
.report-card { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 10px; padding: 16px 20px; border: 1px solid #dbe7f5; margin-bottom: 8px; cursor: pointer; }
.report-card:hover { border-color: #2563eb; }
.rc-icon { font-size: 24px; }
.rc-name { font-size: 14px; font-weight: 600; color: #1a1a2e; }
.rc-meta { display: flex; gap: 10px; margin-top: 3px; font-size: 11.5px; flex-wrap: wrap; align-items: center; }
.rc-tag { padding: 2px 8px; border-radius: 4px; }
.rc-tag.done { background: #ecfdf5; color: #059669; }
.rc-tag.draft { background: #fffbeb; color: #d97706; }
.rc-time { color: #94a3b8; }
.rc-credit { color: #94a3b8; }
.rc-progress { color: #2563eb; font-weight: 500; }
.step-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.back { font-size: 20px; cursor: pointer; color: #64748b; }
.back:hover { color: #1a1a2e; }
.step-t { font-size: 16px; font-weight: 600; color: #1a1a2e; }
.fg { margin-bottom: 20px; }
.fl { display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 10px; }
.tpl-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.tpl-card { background: #fff; border-radius: 12px; padding: 22px 20px; border: 1.5px solid #dbe7f5; cursor: pointer; text-align: center; }
.tpl-card:hover { border-color: #2563eb; }
.tpl-card.on { border-color: #2563eb; background: #eef2ff; }
.tpl-i { font-size: 28px; margin-bottom: 8px; }
.tpl-n { font-size: 14px; font-weight: 600; color: #1a1a2e; }
.tpl-d { font-size: 12px; color: #94a3b8; margin-top: 4px; }
.ent-w { position: relative; }
.ent-in { width: 100%; border: 1.5px solid #dbe7f5; border-radius: 10px; padding: 12px 14px; font-size: 14px; outline: none; background: #fafbfd; }
.ent-in:focus { border-color: #2563eb; }
.ent-drop { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #dbe7f5; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.08); z-index: 10; margin-top: 4px; overflow: hidden; }
.ent-opt { padding: 12px 14px; cursor: pointer; display: flex; justify-content: space-between; }
.ent-opt:hover { background: #f5f7ff; }
.ent-oc { font-size: 11.5px; color: #94a3b8; }
.ent-ok { margin-top: 10px; font-size: 13px; }
.ds-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.ds-card { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 10px; padding: 14px 16px; border: 1.5px solid #dbe7f5; cursor: pointer; }
.ds-card:hover { border-color: #2563eb; }
.ds-card.on { border-color: #2563eb; background: #f0f5ff; }
.ds-n { font-size: 13px; font-weight: 600; }
.ds-s { font-size: 11px; }
.ds-s.ready { color: #10b981; }
.ds-s.partial { color: #f59e0b; }
.gen-wrap { display: flex; justify-content: center; padding: 16px 0; }
.gen-box { text-align: center; padding: 60px 20px; }
.gen-spin { width: 36px; height: 36px; border: 3px solid #e5eaf2; border-top-color: #2563eb; border-radius: 50%; animation: sp 1s linear infinite; margin: 0 auto 16px; }
@keyframes sp { to { transform: rotate(360deg); } }
.gen-t { font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; }
.gen-steps { text-align: left; max-width: 280px; margin: 0 auto; }
.gs { font-size: 13px; color: #94a3b8; padding: 4px 0; }
.gs.done { color: #10b981; }
.gs.active { color: #2563eb; font-weight: 500; }
.ed-top { display: flex; align-items: center; gap: 14px; background: #fff; border-radius: 12px; padding: 16px 20px; border: 1px solid #dbe7f5; margin-bottom: 16px; }
.ed-t { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.ed-btns { margin-left: auto; }
.ed-body { display: grid; grid-template-columns: 1fr 380px; gap: 16px; min-height: 600px; }
.ed-left { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 70vh; padding-right: 8px; }
.sec-card { background: #fff; border-radius: 10px; padding: 20px; border: 1px solid #dbe7f5; }
.sec-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sec-num { width: 28px; height: 28px; background: #eef2ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.sec-title { font-size: 14px; font-weight: 600; color: #1a1a2e; flex: 1; }
.sec-edit { font-size: 16px; color: #94a3b8; cursor: pointer; }
.sec-edit:hover { color: #2563eb; }
.sec-body { font-size: 13.5px; color: #1a1a2e; line-height: 1.8; white-space: pre-wrap; cursor: text; }
.sec-ta { width: 100%; border: 1.5px solid #dbe7f5; border-radius: 8px; padding: 10px 12px; font-size: 13px; font-family: inherit; resize: vertical; outline: none; line-height: 1.6; }
.sec-ta:focus { border-color: #2563eb; }
.sec-act { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
.ed-right { background: #fff; border-radius: 12px; border: 1px solid #dbe7f5; display: flex; flex-direction: column; overflow: hidden; }
.ch-head { padding: 14px 16px; background: #f8f9fc; font-size: 13px; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #e5eaf2; }
.ch-msgs { flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; max-height: 400px; }
.ch-m { display: flex; gap: 8px; }
.ch-m.user { flex-direction: row-reverse; }
.ch-av { font-size: 18px; flex-shrink: 0; }
.ch-bubble { max-width: 85%; padding: 10px 12px; border-radius: 10px; font-size: 12.5px; line-height: 1.6; }
.ch-m.ai .ch-bubble { background: #f8f9fc; border-bottom-left-radius: 4px; }
.ch-m.user .ch-bubble { background: #eef2ff; border-bottom-right-radius: 4px; }
.ch-think { color: #94a3b8; font-style: italic; }
.ch-input-row { display: flex; gap: 6px; padding: 10px 14px; border-top: 1px solid #f1f5f9; }
.ch-input { flex: 1; border: 1px solid #dbe7f5; border-radius: 6px; padding: 8px 10px; font-size: 12.5px; outline: none; }
.ch-input:focus { border-color: #2563eb; }
.ch-quick { padding: 8px 14px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ch-ql { font-size: 10.5px; color: #94a3b8; }
.ch-q { padding: 3px 10px; background: #f7faff; border: 1px solid #e5eaf2; border-radius: 14px; font-size: 10.5px; color: #4a5568; cursor: pointer; }
.ch-q:hover { background: #eef2ff; border-color: #2563eb; color: #2563eb; }
</style>
`;

fs.writeFileSync('D:\\demo\\ai-copilot\\_smartreport_style.css', S);
console.log('style part written, length:', S.length);