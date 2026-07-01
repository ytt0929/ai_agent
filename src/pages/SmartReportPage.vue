<template>
  <div class="sr-page">
    <div v-if="view === 'home'" class="sr-home">
      <div class="sr-home__header">
        <h1 class="sr-home__title">智能报告</h1>
        <p class="sr-home__subtitle">查询报告状态，继续修改报告，按新模板重排或生成可交付报告</p>
      </div>

      <!-- AI 自然语言输入区 -->
      <el-card shadow="never" class="sr-home__ai-input-card">
        <p class="sr-home__ai-label">告诉我你要处理什么报告任务？</p>
        <div class="sr-home__ai-input-row">
          <el-input v-model="aiTaskInput" class="sr-home__ai-input" placeholder="例如：明达精工现在报告到哪一步了？或者把明达精工报告按浙江分行 V2024 模板重新生成" @keydown.enter.exact.prevent="handleAiTask" clearable size="large">
            <template #append>
              <el-button type="primary" :disabled="!aiTaskInput.trim()" @click="handleAiTask" size="default">询问 AI</el-button>
            </template>
          </el-input>
        </div>
        <div class="sr-home__ai-chips">
          <el-button v-for="(chip, ci) in aiSuggestions" :key="ci" size="small" text @click="handleAiTask(chip)">{{ chip }}</el-button>
        </div>
      </el-card>

      <!-- 四项核心能力 -->
      <div class="sr-home__capabilities">
        <el-card shadow="hover" class="sr-cap-card" @click="startTaskDialog('查询明达精工报告状态')">
          <div class="sr-cap-card__icon">📊</div>
          <div class="sr-cap-card__title">查询报告状态</div>
          <div class="sr-cap-card__desc">查看报告进度、待确认章节和缺失材料</div>
        </el-card>
        <el-card shadow="hover" class="sr-cap-card" @click="startTaskDialog('继续修改明达精工授信调查报告')">
          <div class="sr-cap-card__icon">✏️</div>
          <div class="sr-cap-card__title">继续修改报告</div>
          <div class="sr-cap-card__desc">编辑、确认章节，完善证据链</div>
        </el-card>
        <el-card shadow="hover" class="sr-cap-card" @click="startTaskDialog('按浙江分行 V2024 模板重新生成明达精工报告')">
          <div class="sr-cap-card__icon">📋</div>
          <div class="sr-cap-card__title">按新模板生成</div>
          <div class="sr-cap-card__desc">用已有资料按新模板重排报告</div>
        </el-card>
        <el-card shadow="hover" class="sr-cap-card" @click="startTaskDialog('打开模板中心')">
          <div class="sr-cap-card__icon">⚙️</div>
          <div class="sr-cap-card__title">维护报告模板</div>
          <div class="sr-cap-card__desc">管理银行模板、章节规则和资料要求</div>
        </el-card>
      </div>

      <!-- 最近报告 -->
      <el-card shadow="never" class="sr-home__recent-card">
        <template #header>
          <div class="sr-home__recent-header">
            <span>最近报告</span>
          </div>
        </template>
        <el-table :data="reportTasks.slice(0, 3)" size="small" style="width: 100%">
          <el-table-column prop="enterpriseName" label="企业名称" width="160" />
          <el-table-column prop="reportName" label="报告名称" width="200" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status.includes('待确认') ? 'warning' : row.status.includes('缺失') ? 'danger' : 'success'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nextStep" label="下一步" />
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" text @click="openReport(row)">打开</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- AI 任务识别/确认页面 -->
    <div v-if="view === 'taskDialog'" class="sr-task-workspace">
      <div class="sr-task-workspace__header">
        <el-button size="small" text @click="view = 'home'">
          <el-icon><ArrowLeft /></el-icon> 返回首页
        </el-button>
        <div class="sr-task-workspace__header-title">
          <h2>AI 正在识别报告任务</h2>
          <p>请确认 AI 理解的企业、报告、模板、资料包和下一步动作</p>
        </div>
      </div>
      <div class="sr-task-workspace__body">
        <!-- 中间：结构化任务确认结果 -->
        <main class="sr-task-workspace__main">
          <!-- 用户原始输入 -->
          <div class="sr-task-main__input-display" v-if="taskDialogInput">
            <span class="sr-task-main__label">你的输入：</span>
            <span>{{ taskDialogInput }}</span>
          </div>
          <!-- 任务确认信息 -->
          <el-card shadow="never" class="sr-task-confirm-card" v-if="recognizedTask">
            <template #header>
              <div class="sr-task-confirm-card__header">
                <span class="sr-task-confirm-card__title">任务确认面板</span>
                <el-tag size="small" type="primary">{{ recognizedTask.type }}</el-tag>
              </div>
            </template>
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="任务类型">
                <el-tag size="small" type="primary">{{ recognizedTask.type }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="企业">
                {{ recognizedTask.enterprise || '明达精工有限公司' }}
              </el-descriptions-item>
              <el-descriptions-item v-if="recognizedTask.targetReportId" label="关联报告">
                <el-tag size="small" type="info">{{ getTaskCardReportName(recognizedTask.targetReportId) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="recognizedTask.currentStatus" label="当前状态">
                <el-tag size="small" :type="recognizedTask.currentStatus.includes('待确认') ? 'warning' : 'info'">{{ recognizedTask.currentStatus }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="recognizedTask.currentTpl" label="当前模板">
                {{ recognizedTask.currentTpl }}
              </el-descriptions-item>
              <el-descriptions-item v-if="recognizedTask.targetTpl" label="目标模板">
                <el-tag size="small" type="primary">{{ recognizedTask.targetTpl }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="recognizedTask.source" label="来源资料">
                {{ recognizedTask.source }}
              </el-descriptions-item>
              <el-descriptions-item v-if="recognizedTask.outputs" label="下一步动作">
                {{ recognizedTask.outputs }}
              </el-descriptions-item>
            </el-descriptions>
            <el-divider style="margin:12px 0" />
            <div v-if="recognizedTask.pendingItems.length" class="sr-task-confirm-card__section">
              <span class="sr-task-confirm-card__label">待确认章节：</span>
              <el-tag v-for="(item, pi) in recognizedTask.pendingItems" :key="pi" size="small" type="warning" style="margin:0 4px 4px 0">{{ item }}</el-tag>
            </div>
            <div v-if="recognizedTask.missingItems.length" class="sr-task-confirm-card__section sr-task-confirm-card__missing">
              <span class="sr-task-confirm-card__label">缺失材料：</span>
              <el-tag v-for="(item, mi) in recognizedTask.missingItems" :key="mi" size="small" type="danger" style="margin:0 4px 4px 0">{{ item }}</el-tag>
            </div>
            <div class="sr-task-confirm-card__actions">
              <el-button type="primary" @click="confirmRecognizedTask">确认创建任务</el-button>
              <el-button plain @click="adjustRecognizedTask">调整识别结果</el-button>
              <el-button text @click="view = 'home'">返回首页</el-button>
            </div>
          </el-card>
        </main>
        <!-- 右侧：AI 报告助手面板 -->
        <aside class="sr-task-workspace__assistant ai-assistant-panel">
          <div class="ai-assistant-panel__header">
            <span class="ai-assistant-panel__title">AI 报告助手</span>
          </div>
          <div class="ai-assistant-panel__body">
            <div class="sr-ai-msgs">
              <!-- 识别过程消息 -->
              <div v-for="(m, i) in aiMsgs" :key="i" class="ai-message" :class="m.role === 'ai' ? 'ai-message--ai' : 'ai-message--user'">
                <div class="ai-message__avatar">{{ m.role === 'ai' ? 'AI' : '&#25105;' }}</div>
                <div class="ai-message__bubble" v-html="renderMd(m.text)"></div>
                <!-- 推荐按钮在 AI 消息气泡下方 -->
                <div v-if="m.quickActions && m.quickActions.length" class="sr-ai-quick-inline">
                  <el-button v-for="(qa, qi) in m.quickActions" :key="qi" size="small" text type="primary" @click="qa.handler">{{ qa.label }}</el-button>
                </div>
              </div>
              <!-- 识别中状态 -->
              <div v-if="aiBusy" class="ai-message ai-message--ai">
                <div class="ai-message__avatar">AI</div>
                <div class="ai-message__bubble sr-ai-msg__typing">
                  <span class="sr-typing-dots"><span></span><span></span><span></span></span>
                  正在识别中...
                </div>
              </div>
            </div>
            <div class="ai-assistant-panel__footer">
              <el-input v-model="aiInput" class="ai-assistant-panel__input" placeholder="补充任务要求..." @keydown.enter="sendAiMessage" clearable />
              <el-button type="primary" size="small" @click="sendAiMessage" :disabled="!aiInput.trim() || aiBusy">发送</el-button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <div v-if="view === 'upload'" class="sr-upload">
      <div class="sr-upload__bar">
        <el-icon class="sr-back" @click="view = 'home'"><ArrowLeft /></el-icon>
        <span class="sr-upload__title">上传资料附件生成报告</span>
      </div>
      <div v-if="!uploadDone" class="sr-upload__panel">
        <div class="sr-upload__step">
          <label class="sr-upload__label">选择报告模板</label>
          <select v-model="uploadTplId" class="sr-upload__select">
            <option v-for="tpl in reportTemplates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
          </select>
        </div>
        <div class="sr-upload__step">
          <label class="sr-upload__label">上传资料附件</label>
          <div class="sr-upload__drop" @click="simulateUpload">
            <el-icon :size="32"><Upload /></el-icon>
            <span>点击模拟上传资料（演示模式）</span>
            <span class="sr-upload__hint">支持 PDF / Word / Excel / 图片</span>
          </div>
        </div>
        <div class="sr-upload__step">
          <label class="sr-upload__label">上传说明（可选）</label>
          <textarea v-model="uploadNote" class="sr-upload__note" placeholder="例如：请重点关注收入真实性章节" rows="2"></textarea>
        </div>
        <div class="sr-upload__actions">
          <button class="sr-btn sr-btn--primary" @click="startGenerate" :disabled="!uploadDone">生成报告草稿</button>
          <button class="sr-btn" @click="view = 'home'">取消</button>
        </div>
      </div>
      <div v-if="uploadDone" class="sr-upload__result">
        <div class="sr-upload__result__header">
          <el-icon :size="20" color="#22c55e"><CircleCheck /></el-icon>
          <span>AI 已识别 {{ identifiedMaterials.length }} 份资料</span>
        </div>
        <div class="sr-upload__materials">
          <div v-for="m in identifiedMaterials" :key="m" class="sr-upload__mat-item ok">
            <span class="sr-upload__mat-icon">&#10003;</span>
            <span>{{ m }}</span>
          </div>
        </div>
        <div v-if="missingMaterials.length" class="sr-upload__missing">
          <div class="sr-upload__missing__title">仍缺失 {{ missingMaterials.length }} 份资料：</div>
          <div v-for="m in missingMaterials" :key="m" class="sr-upload__mat-item miss">
            <span class="sr-upload__mat-icon">&#10007;</span>
            <span>{{ m }}</span>
          </div>
        </div>
        <div class="sr-upload__actions">
          <button class="sr-btn sr-btn--primary" @click="startGenerate">生成报告草稿</button>
          <button class="sr-btn" @click="uploadDone = false">继续上传资料</button>
          <button class="sr-btn" @click="view = 'home'">取消</button>
        </div>
      </div>
    </div>

    <div v-if="view === 'generating'" class="sr-generating">
      <div class="sr-generating__card">
        <div class="sr-generating__spinner"></div>
        <div class="sr-generating__title">AI 正在生成报告&#8230;</div>
        <div v-for="(gs, i) in genSteps" :key="i" class="sr-generating__step" :class="gs.status">
          <span class="sr-generating__step-icon">{{ gs.status === 'done' ? '&#10003;' : gs.status === 'active' ? '&#10227;' : '&#9675;' }}</span>
          <span>{{ gs.label }}</span>
        </div>
      </div>
    </div>

    <div v-if="view === 'editor'" class="sr-editor">
      <div class="sr-editor__header">
        <el-icon class="sr-back" @click="backToHome"><ArrowLeft /></el-icon>
        <div class="sr-editor__top-info">
          <span class="sr-editor__top-name">{{ activeReport?.enterpriseName }}</span>
          <span class="sr-editor__top-report">{{ activeReport?.reportName }}</span>
          <span class="sr-editor__top-meta">模板：{{ activeReport?.templateName }} &#183; 来源：{{ activeReport?.source }} &#183; 资料完整度 {{ activeReport?.materialComplete }}%</span>
          <span v-if="activeReport?.pendingCount" class="sr-editor__top-pending">待确认：{{ activeReport.pendingCount }} 项</span>
          <span class="sr-badge" :class="statusBadgeClass(activeReport?.status)">{{ activeReport?.status }}</span>
        </div>
        <div class="sr-editor__actions">
          <el-button size="small" @click="handleSaveDraft">保存草稿</el-button>
          <el-button size="small" @click="handleRegenerateByTemplate">按新模板生成</el-button>
          <el-button size="small" @click="handleExportReport">导出报告</el-button>
          <el-button size="small" type="primary" plain @click="handleExportAll">导出报告和资料包</el-button>
          <el-button size="small" type="primary" @click="handleSubmitConfirm">提交确认</el-button>
        </div>
      </div>
      <div class="sr-editor__body">
        <aside class="sr-editor__toc">
          <div class="sr-toc__header">报告目录</div>
          <div v-for="sec in reportSections" :key="sec.id" class="sr-toc__item" :class="{ active: activeSectionId === sec.id, pending: sec.status === '待确认', missing: sec.materialStatus === '部分缺失' || sec.materialStatus === '资料不足' }" @click="selectSection(sec.id)">
            <span class="sr-toc__num">{{ sec.no }}</span>
            <span class="sr-toc__text">{{ sec.title }}</span>
            <el-tag v-if="sec.status === '待确认'" size="small" type="warning" class="sr-toc__tag">待确认</el-tag>
            <el-tag v-else-if="sec.materialStatus === '部分缺失' || sec.materialStatus === '资料不足'" size="small" type="danger" class="sr-toc__tag">资料不足</el-tag>
            <el-tag v-else-if="sec.status === '已生成'" size="small" type="success" class="sr-toc__tag">已完成</el-tag>
          </div>
          <div class="sr-toc__item sr-toc__item--evidence" @click="scrollToEvidence">
            <span class="sr-toc__num">&#128206;</span>
            <span class="sr-toc__text">章节证据链</span>
          </div>
        </aside>
        <main class="sr-editor__content">
          <template v-if="currentSection">
            <div class="sr-sec-header">
              <h2 class="sr-sec-header__title">{{ currentSection.no }}、{{ currentSection.title }}</h2>
              <span class="sr-badge" :class="statusBadgeClass(currentSection.status)">{{ currentSection.status }}</span>
              <span class="sr-sec-header__mat" v-if="currentSection.materialStatus !== '完整'">资料：{{ currentSection.materialStatus }}</span>
            </div>
            <el-alert v-if="currentSection.aiNote" type="info" :closable="false" show-icon class="sr-sec-alert">
              <template #title>{{ currentSection.aiNote }}</template>
            </el-alert>
            <el-alert v-if="currentSection.status === '待确认'" type="warning" :closable="false" show-icon class="sr-sec-alert">
              <template #title>本节有待确认内容，请审阅后确认或修改</template>
            </el-alert>
            <el-alert v-if="currentSection.materialStatus === '部分缺失' || currentSection.materialStatus === '资料不足'" type="error" :closable="false" show-icon class="sr-sec-alert">
              <template #title>当前章节资料不足，可能影响结论准确性</template>
            </el-alert>
            <div class="sr-sec-body">
              <div v-if="editingSectionId === currentSection.id" class="sr-sec-edit">
                <textarea v-model="editText" class="sr-sec-edit__textarea" rows="12"></textarea>
                <div class="sr-sec-edit__actions">
                  <button class="sr-btn sr-btn--primary" @click="saveEdit">保存</button>
                  <button class="sr-btn" @click="cancelEdit">取消</button>
                </div>
              </div>
              <template v-else>
                <p v-for="(p, i) in (currentSection.body || [])" :key="i" class="sr-para">{{ p }}</p>
                <table v-if="currentSection.table" class="sr-info-table">
                  <tr v-for="(row, ri) in currentSection.table" :key="ri">
                    <td class="sr-info-table__label" v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                  </tr>
                </table>
                <table v-if="currentSection.tableHeaders" class="sr-data-table">
                  <thead><tr><th v-for="h in currentSection.tableHeaders" :key="h">{{ h }}</th></tr></thead>
                  <tbody><tr v-for="(row, ri) in (currentSection.tableRows || [])" :key="ri"><td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td></tr></tbody>
                </table>
                <div v-if="currentSection.risks" class="sr-risk-list">
                  <div class="sr-risk-list__title">风险事项</div>
                  <div v-for="(r, ri) in currentSection.risks" :key="ri" class="sr-risk-item" :class="riskLevelClass(r.level)">
                    <span class="sr-risk-item__level">{{ r.level }}</span>
                    <span class="sr-risk-item__title">{{ r.title }}</span>
                    <span class="sr-risk-item__basis">{{ r.basis }}</span>
                  </div>
                </div>
                <div v-if="currentSection.relatedMaterialIds?.length" class="sr-sec-material-ref">
                  <div class="sr-sec-material-ref__title">资料依据</div>
                  <div v-for="mid in currentSection.relatedMaterialIds" :key="mid" class="sr-sec-material-ref__item"><span>{{ getMaterialName(mid) }}</span></div>
                </div>
                <!-- 章节证据链 -->
                <section ref="sectionEvidenceRef" class="sr-section-evidence">
                  <div class="sr-section-evidence__header">
                    <h3>章节证据链</h3>
                    <span>本节关联 {{ currentSectionMaterials.length }} 份资料</span>
                  </div>
                  <div v-if="currentSectionMaterials.length === 0" class="sr-section-evidence__empty">暂无关联资料</div>
                  <div v-for="mat in currentSectionMaterials" :key="mat.id" class="sr-evidence-card">
                    <div class="sr-evidence-card__header">
                      <span class="sr-evidence-card__name">{{ mat.name }}</span>
                      <el-tag size="small" :type="mat.status === '已关联' ? 'success' : mat.status === '缺失' ? 'danger' : 'info'">{{ mat.status }}</el-tag>
                    </div>
                    <div class="sr-evidence-card__meta"><span>来源：{{ mat.source }}</span></div>
                    <div v-if="mat.extractedSummary" class="sr-evidence-card__summary">{{ mat.extractedSummary }}</div>
                    <div class="sr-evidence-card__actions">
                      <el-button link size="small" type="primary" @click="viewMaterialDetail(mat)">详情</el-button>
                      <el-button link size="small" @click="editMaterialSummary(mat)">修改摘要</el-button>
                      <el-button link size="small" type="warning" @click="uploadSupplement(mat)">补充</el-button>
                      <el-button link size="small" type="warning" @click="ElMessage.success('已转入智能尽调补充任务')">转入尽调补充</el-button>
                    </div>
                  </div>
                </section>
              </template>
            </div>
            <div v-if="editingSectionId !== currentSection.id" class="sr-sec-actions">
              <el-button size="small" @click="startEditSection">修改本节</el-button>
              <el-button size="small" @click="handleRegenerateSection">根据资料包重新生成本节</el-button>
            </div>
          </template>
        </main>
        <aside class="sr-editor__sidebar ai-assistant-panel">
          <div v-if="assistantCollapsed" class="sr-assistant-toggle" @click="toggleAssistant">
            <span class="sr-assistant-toggle__title">AI 写作助手</span>
            <el-button size="small" text>展开</el-button>
          </div>
          <template v-else>
            <div class="ai-assistant-panel__header">
              <span class="ai-assistant-panel__title">AI 写作助手</span>
              <el-button size="small" text @click="toggleAssistant">收起</el-button>
            </div>
            <div class="ai-assistant-panel__body">
              <div class="sr-ai-msgs">
                <!-- AI 第一条提示消息包含推荐动作 -->
                <div class="ai-message ai-message--ai">
                  <div class="ai-message__avatar">AI</div>
                  <div class="ai-message__bubble">
                    <template v-if="currentSection">
                      当前章节是《{{ currentSection.title }}》，本节已生成，关联证据 {{ currentSectionMaterials.length }} 条。你可以让我改写正文、检查证据链、生成缺失说明或标记本节确认。
                    </template>
                    <template v-else>我可以帮你查看当前章节、改写正文或检查材料完整性。</template>
                    <div class="sr-ai-quick-inline">
                      <el-button size="small" text type="primary" @click="handleAiSectionAction('改写')">改写当前章节</el-button>
                      <el-button size="small" text type="primary" @click="handleAiSectionAction('检查证据链')">检查证据链</el-button>
                      <el-button size="small" text type="primary" @click="handleAiSectionAction('缺失说明')">生成缺失说明</el-button>
                      <el-button size="small" text type="primary" @click="handleAiSectionAction('确认')">标记本节确认</el-button>
                      <el-button size="small" text type="warning" @click="handleAiSectionAction('尽调')">转入尽调补充</el-button>
                    </div>
                  </div>
                </div>
                <!-- 改写建议卡片 -->
                <div v-if="aiRewriteCard" class="ai-message ai-message--ai">
                  <div class="ai-message__avatar">AI</div>
                  <div class="ai-message__bubble">
                    <div class="sr-ai-rewrite-bubble">
                      <div class="sr-ai-rewrite-bubble__title">AI 改写建议</div>
                      <div class="sr-ai-rewrite-bubble__summary"><strong>原文摘要：</strong>{{ aiRewriteCard.summary }}</div>
                      <div class="sr-ai-rewrite-bubble__suggestion"><strong>改写建议：</strong>{{ aiRewriteCard.suggestion }}</div>
                      <div class="sr-ai-rewrite-bubble__evidence"><strong>引用证据：</strong>{{ aiRewriteCard.evidence }}</div>
                    </div>
                    <div class="sr-ai-rewrite-bubble__actions">
                      <el-button size="small" type="primary" @click="applyAiRewrite">应用修改</el-button>
                      <el-button size="small" @click="aiRewriteCard = null">继续调整</el-button>
                      <el-button size="small" plain @click="viewEvidenceFromRewrite">查看证据</el-button>
                    </div>
                  </div>
                </div>
                <!-- 其他对话消息 -->
                <div v-for="(m, i) in aiMsgs" :key="i" class="ai-message" :class="m.role === 'ai' ? 'ai-message--ai' : 'ai-message--user'">
                  <div class="ai-message__avatar">{{ m.role === 'ai' ? 'AI' : '&#25105;' }}</div>
                  <div class="ai-message__bubble" v-html="renderMd(m.text)"></div>
                </div>
                <div v-if="aiBusy" class="ai-message ai-message--ai">
                  <div class="ai-message__avatar">AI</div>
                  <div class="ai-message__bubble sr-ai-msg__typing">
                    <span class="sr-typing-dots"><span></span><span></span><span></span></span>
                    思考中...
                  </div>
                </div>
              </div>
              <div class="ai-assistant-panel__footer">
                <el-input v-model="aiInput" class="ai-assistant-panel__input" placeholder="告诉我想如何修改报告，或需要补充哪些资料..." @keydown.enter="sendAiMessage" clearable />
                <el-button type="primary" size="small" @click="sendAiMessage" :disabled="!aiInput.trim() || aiBusy">发送</el-button>
              </div>
            </div>
          </template>
        </aside>
      </div>
    </div>

    <!-- 资料详情弹窗 -->
    <el-dialog v-model="showMaterialDetail" :title="selectedMaterial?.name || '资料详情'" width="520px" destroy-on-close>
      <el-form v-if="selectedMaterial" label-position="top" class="sr-dialog-form">
        <el-form-item label="类型"><span>{{ selectedMaterial.type }}</span></el-form-item>
        <el-form-item label="来源"><span>{{ selectedMaterial.source }}</span></el-form-item>
        <el-form-item label="状态">
          <el-tag size="small" :type="selectedMaterial.status === '已关联' ? 'success' : selectedMaterial.status === '缺失' ? 'danger' : 'info'">{{ selectedMaterial.status }}</el-tag>
        </el-form-item>
        <el-form-item label="关联章节"><span>{{ (selectedMaterial.relatedSections || []).join('、') || '无' }}</span></el-form-item>
        <el-form-item label="识别摘要"><span>{{ selectedMaterial.extractedSummary || '无' }}</span></el-form-item>
        <el-form-item label="修改摘要">
          <el-input v-model="editingSummary" type="textarea" :rows="3" placeholder="修改资料识别摘要..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMaterialDetail = false">关闭</el-button>
        <el-button type="primary" @click="saveMaterialSummary">保存摘要</el-button>
      </template>
    </el-dialog>

    <!-- 导出弹窗 -->
    <el-dialog v-model="showExportDialog" title="批量导出报告和资料包" width="420px" destroy-on-close>
      <div class="sr-export-options">
        <el-checkbox-group v-model="selectedExportKeys">
          <el-checkbox v-for="opt in exportOptions" :key="opt.key" :label="opt.key" :value="opt.key">
            {{ opt.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="doExportAll">确认导出</el-button>
      </template>
    </el-dialog>

    <!-- 按新模板生成弹窗 -->
    <el-dialog v-model="showRegenDialog" title="按新模板重新生成报告" width="520px" destroy-on-close>
      <div class="sr-regen-tpl-list">
        <div class="sr-modal__label" style="margin-bottom: 8px">选择目标模板：</div>
        <el-radio-group v-model="regenTplId" class="sr-regen-radio-group">
          <el-radio v-for="tpl in reportTemplates" :key="tpl.id" :value="tpl.id" border class="sr-regen-radio-item">
            <div class="sr-regen-radio-item__name">{{ tpl.name }}</div>
            <div class="sr-regen-radio-item__desc">{{ tpl.sectionsCount }} 章 · 需 {{ tpl.requiredMaterials }} 份资料</div>
          </el-radio>
        </el-radio-group>
        <el-alert v-if="regenTplId" type="info" :closable="false" show-icon style="margin-top:12px">
          <template #title>章节映射提示</template>
          <template #default>模板「{{ getRegenTplName() }}」共 {{ getRegenTplSections() }} 章。生成时将保留已有章节内容，新增章节将根据资料包自动生成。</template>
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="showRegenDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!regenTplId" @click="doRegenerate">确认生成</el-button>
      </template>
    </el-dialog>

    <!-- 提交前检查弹窗 -->
    <el-dialog v-model="showPreSubmitCheck" title="提交前检查" width="560px" destroy-on-close>
      <el-table :data="preSubmitCheckResult" border size="small" class="sr-check-table">
        <el-table-column prop="title" label="检查项" width="140" />
        <el-table-column prop="detail" label="详情" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 'pass' ? 'success' : row.status === 'warn' ? 'warning' : 'danger'">
              {{ row.status === 'pass' ? '通过' : row.status === 'warn' ? '警告' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-alert v-if="hasPreSubmitBlocker" type="error" :closable="false" show-icon style="margin-top:12px">
        <template #title>存在阻断项，需处理后才能提交</template>
      </el-alert>
      <el-alert v-else-if="hasPreSubmitWarn" type="warning" :closable="false" show-icon style="margin-top:12px">
        <template #title>存在警告项，请评估风险后决定是否提交</template>
      </el-alert>
      <template #footer>
        <el-button @click="generateMissingListFromCheck">生成缺失清单</el-button>
        <el-button @click="showPreSubmitCheck = false">返回修改</el-button>
        <el-button :type="hasPreSubmitBlocker ? 'info' : 'warning'" :disabled="hasPreSubmitBlocker" @click="doForceSubmit">仍然提交</el-button>
        <el-button v-if="!hasPreSubmitBlocker && !hasPreSubmitWarn" type="primary" @click="doPreSubmitCheck">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Upload, CircleCheck, Close, Document } from '@element-plus/icons-vue'
import { ElMessage, ElDialog } from 'element-plus'
import {
  reportTasks,
  reportTemplates,
  materialPackages,
  uploadEntryOptions,
  reportSections,
  pendingConfirmations,
  aiDeliveryActions,
  exportPackages,
  aiTaskCardPresets,
  deliveryCheckItems,
} from '../data/mockSmartReport.js'

const view = ref('home')
const activeReport = ref(null)
const activeSectionId = ref('')
const editingSectionId = ref('')
const editText = ref('')

// ════════════════════════════════════════
// AI 报告交付任务卡
// ════════════════════════════════════════
const activeAiTaskCard = ref(null)

function buildTaskCard(type, overrides = {}) {
  const preset = aiTaskCardPresets.find(p => p.type === type)
  const defaults = preset ? { ...preset } : { type, steps: [], actions: [], result: null, status: 'planned' }
  return { ...defaults, ...overrides }
}

// ════════════════════════════════════════
// AI 任务识别/确认页面
// ════════════════════════════════════════
const taskDialogInput = ref('')
const taskDialogMessages = ref([])
const recognizedTask = ref(null)

function startTaskDialog(text) {
  taskDialogInput.value = text
  recognizedTask.value = null
  aiMsgs.value = [
    { role: 'ai', text: '🔍 正在识别你的任务...', quickActions: [] },
  ]
  aiBusy.value = true
  setTimeout(() => {
    aiMsgs.value = [
      { role: 'ai', text: '✅ 已识别企业：明达精工有限公司' },
      { role: 'ai', text: '✅ 已匹配报告：单户授信调查报告' },
      { role: 'ai', text: '✅ 当前模板：总行通用版 V2021' },
      { role: 'ai', text: '⚠️ 发现缺失材料：银行流水、征信授权' },
      {
        role: 'ai',
        text: '✅ 建议下一步：确认创建任务，进入报告工作台',
        quickActions: [
          { label: '解释识别结果', handler: () => aiMsgs.value.push({ role: 'ai', text: '识别结果基于你的输入自动分析，已匹配最近的企业报告和模板。' }) },
          { label: '更换目标模板', handler: () => aiMsgs.value.push({ role: 'ai', text: '你可以指定目标模板，如浙江分行 V2024。' }) },
          { label: '只检查材料', handler: () => aiMsgs.value.push({ role: 'ai', text: '可以只检查材料完整性，跳过模板重排。' }) },
          { label: '返回首页', handler: () => { view.value = 'home' } },
        ],
      },
    ]
    aiBusy.value = false
    recognizedTask.value = buildRecognizedTask(text)
  }, 800)
}

function buildRecognizedTask(text) {
  // 意图识别（模拟，不接后端）

  // 1. 查询状态
  if (text.includes('状态') || text.includes('到哪一步') || text.includes('进度')) {
    return {
      type: '查询报告状态',
      enterprise: '明达精工有限公司',
      targetReportId: 'RPT-001',
      currentStatus: '待确认',
      source: '智能尽调报告草稿',
      currentTpl: '总行通用版 V2021',
      targetTpl: null,
      outputs: '查看待确认章节和缺失材料',
      pendingItems: ['收入真实性', '主要风险分析', '授信方案'],
      missingItems: ['银行流水'],
    }
  }
  // 2. 继续修改
  if (text.includes('继续修改') || text.includes('修改报告') || text.includes('处理')) {
    return {
      type: '继续修改报告',
      enterprise: '明达精工有限公司',
      targetReportId: 'RPT-001',
      currentStatus: '待确认',
      source: '智能尽调报告草稿',
      currentTpl: '总行通用版 V2021',
      targetTpl: null,
      outputs: '打开报告详情，继续编辑和确认章节',
      pendingItems: ['收入真实性', '主要风险分析'],
      missingItems: [],
    }
  }
  // 3. 按模板重排/重生成
  if (text.includes('模板') && (text.includes('重排') || text.includes('重新生成') || text.includes('V2024') || text.includes('按'))) {
    return {
      type: '按模板重新生成报告',
      enterprise: '明达精工有限公司',
      targetReportId: 'RPT-001',
      currentStatus: '待确认',
      source: '旧版报告 + 智能尽调证据包',
      currentTpl: '总行通用版 V2021',
      targetTpl: '浙江分行 V2024',
      outputs: '确认生成新报告版本',
      pendingItems: ['收入真实性', '主要风险分析', '授信方案'],
      missingItems: ['银行流水', '征信授权'],
    }
  }
  // 4. 检查缺失材料
  if (text.includes('缺失材料') || text.includes('缺哪些') || text.includes('检查') || text.includes('宁波天合')) {
    return {
      type: '检查缺失材料',
      enterprise: '宁波天合新材料有限公司',
      targetReportId: 'RPT-002',
      currentStatus: '资料缺失',
      source: '资料包 MAT-002',
      currentTpl: '总行通用版 V2021',
      targetTpl: null,
      outputs: '查看缺失材料清单，决定补充方式',
      pendingItems: [],
      missingItems: ['银行流水', '征信授权'],
    }
  }
  // 5. 维护模板
  if (text.includes('模板中心') || text.includes('上传模板') || text.includes('维护')) {
    return {
      type: '维护报告模板',
      enterprise: null,
      targetReportId: null,
      currentStatus: null,
      source: '用户上传模板',
      currentTpl: null,
      targetTpl: '浙江分行 V2024',
      outputs: '进入模板维护流程',
      pendingItems: [],
      missingItems: [],
    }
  }
  // 兜底
  return {
    type: '查询报告',
    enterprise: reportTasks[0]?.enterpriseName || '明达精工有限公司',
    targetReportId: reportTasks[0]?.id || 'RPT-001',
    currentStatus: reportTasks[0]?.status || '待确认',
    source: '自动匹配',
    currentTpl: '总行通用版 V2021',
    targetTpl: null,
    outputs: '打开报告详情并查看状态',
    pendingItems: [],
    missingItems: [],
  }
}

function confirmRecognizedTask() {
  if (!recognizedTask.value) return
  const card = recognizedTask.value
  assistantCollapsed.value = true
  // 维护模板不走 editor
  if (card.type === '维护报告模板') {
    ElMessage.info('已进入模板维护流程')
    view.value = 'home'
    return
  }
  // 其他类型都进入报告详情
  ElMessage.info('任务已创建，正在打开报告详情...')
  if (reportTasks.length) openReport(reportTasks[0])
}

function adjustRecognizedTask() {
  taskDialogMessages.value.push(
    { role: 'user', text: '需要调整识别结果' },
    { role: 'ai', text: '你可以补充目标模板、报告名称或资料包范围，我会重新识别。也可以直接在左侧输入框中重新输入。' },
  )
}

const aiTaskInput = ref('')
const aiSuggestions = [
  '查询明达精工报告状态',
  '继续修改明达精工授信调查报告',
  '按浙江分行 V2024 模板重排报告',
  '检查宁波天合报告缺失材料',
  '打开模板中心',
]
function handleAiTask(label) {
  const text = label || aiTaskInput.value.trim()
  if (!text) return
  aiTaskInput.value = ''
  // 进入任务识别页，不在首页显示任务卡
  view.value = 'taskDialog'
  startTaskDialog(text)
}

const statCards = [
  { key: 'pending', label: '待修改报告', value: 3, tone: 'warning' },
  { key: 'missing', label: '资料缺失', value: 2, tone: 'danger' },
  { key: 'template', label: '模板版本', value: 6, tone: 'primary' },
  { key: 'export', label: '待导出', value: 4, tone: 'success' },
]

// 待处理报告交付任务（按 01-home.html 原型）
const pendingDeliveryTasks = computed(() => [
  {
    id: 'task-pending-confirm',
    title: '明达精工有限公司 - 授信调查报告待确认',
    desc: '3 个章节需要客户经理确认，涉及收入真实性、主要风险分析和授信方案。',
    source: '智能尽调',
    tag: '待确认',
    tagClass: 'sr-tag--warn',
    nextStep: '进入报告工作台逐项确认',
    actionLabel: '开始确认',
    action: () => { if (reportTasks.length) openReport(reportTasks[0]) },
  },
  {
    id: 'task-missing-materials',
    title: '宁波天合新材料有限公司 - 材料缺失',
    desc: '模板必填材料缺少近 12 个月银行流水和征信授权，会影响收入真实性章节。',
    source: '资料包',
    tag: '资料缺失',
    tagClass: 'sr-tag--danger',
    nextStep: '查看缺失材料或转入尽调补充',
    actionLabel: '检查材料',
    action: () => handleStartMissing(),
  },
  {
    id: 'task-export-ready',
    title: '杭州智造装备有限公司 - 企业全景报告可导出',
    desc: '报告已通过材料完整性检查，可生成 Word、附件目录和交付包。',
    source: '企业诊断',
    tag: '可导出',
    tagClass: 'sr-tag--success',
    nextStep: '生成导出包',
    actionLabel: '生成导出包',
    action: () => { handleExportReport() },
  },
])

function handleStartProcess() {
  view.value = 'taskDialog'
  startTaskDialog('处理明达精工待确认授信调查报告')
}

function handleStartMissing() {
  view.value = 'taskDialog'
  startTaskDialog('检查宁波天合报告缺哪些模板必填材料')
}

function handleStartGenerate() {
  view.value = 'taskDialog'
  startTaskDialog('把明达精工报告按浙江分行 V2024 模板生成新报告和材料包')
}

function handleStartTemplate() {
  view.value = 'taskDialog'
  startTaskDialog('上传浙江分行新版模板并生成章节规则')
}

function handleStartUploadTemplate() {
  view.value = 'taskDialog'
  startTaskDialog('上传浙江分行新版模板并生成章节规则')
}

// 右侧上下文 computed
const pendingReportCount = computed(() => reportTasks.filter(t => t.status.includes('待确认')).length)
const missingMaterialCount = computed(() => {
  let c = 0
  for (const pkg of materialPackages) c += (pkg.missingCount || 0)
  return c
})
const exportableCount = computed(() => reportTasks.filter(t => t.status.includes('待导出') || t.status.includes('已导出')).length)
const draftTplCount = computed(() => reportTemplates.filter(t => t.status === 'draft').length)
const defaultTemplateName = computed(() => {
  const d = reportTemplates.find(t => t.isDefault)
  return d ? d.name : '无'
})
const missingPkgCount = computed(() => materialPackages.filter(p => p.missingCount > 0).length)

const uploadTplId = ref('credit-v2021')
const uploadNote = ref('')
const uploadDone = ref(false)
const identifiedMaterials = ref([])
const missingMaterials = ref([])

function simulateUpload() {
  identifiedMaterials.value = ['营业执照', '审计报告', '纳税申报表', '销售合同', '访谈记录', '现场照片']
  missingMaterials.value = ['银行流水', '税票明细']
  uploadDone.value = true
}

const genSteps = ref([])

function startGenerate() {
  view.value = 'generating'
  genSteps.value = [
    { label: '读取报告模板', status: 'active', detail: '' },
    { label: '识别资料包内容', status: 'pending', detail: '' },
    { label: '匹配章节资料要求', status: 'pending', detail: '' },
    { label: '生成报告正文', status: 'pending', detail: '' },
    { label: '标记待确认和缺失资料', status: 'pending', detail: '' },
  ]
  const seq = [{ i: 0, t: 600 }, { i: 1, t: 1400 }, { i: 2, t: 2200 }, { i: 3, t: 3200 }, { i: 4, t: 4000 }]
  seq.forEach(s => {
    setTimeout(() => { if (s.i > 0) genSteps.value[s.i - 1].status = 'done'; genSteps.value[s.i].status = 'active' }, s.t)
  })
  setTimeout(() => { genSteps.value[4].status = 'done'; openReport(reportTasks[0]) }, 4800)
}

const currentSection = computed(() => reportSections.find(s => s.id === activeSectionId.value) || null)
const currentSectionMaterials = computed(() => {
  const sec = currentSection.value
  if (!sec || !sec.relatedMaterialIds) return []
  return materialPackages[0].materials.filter(m => sec.relatedMaterialIds.includes(m.id))
})

function selectSection(id) { activeSectionId.value = id }

function startEditSection() {
  if (!currentSection.value) return
  editingSectionId.value = currentSection.value.id
  editText.value = (currentSection.value.body || []).join('\n\n')
}
function saveEdit() {
  if (currentSection.value) currentSection.value.body = editText.value.split('\n\n').filter(Boolean)
  editingSectionId.value = ''
  editText.value = ''
  ElMessage.success('本节已保存')
}
function cancelEdit() { editingSectionId.value = ''; editText.value = '' }

function getMaterialName(mid) {
  for (const pkg of materialPackages) {
    const m = pkg.materials.find(x => x.id === mid)
    if (m) return m.name
  }
  return mid
}

const showMaterialDetail = ref(false)
const sectionEvidenceRef = ref(null)

function scrollToEvidence() {
  sectionEvidenceRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const selectedMaterial = ref(null)
const editingSummary = ref('')

function viewMaterialDetail(mat) { selectedMaterial.value = { ...mat }; editingSummary.value = mat.extractedSummary || ''; showMaterialDetail.value = true }
function editMaterialSummary(mat) { viewMaterialDetail(mat) }
function uploadSupplement(mat) { ElMessage.success(`已上传补充资料「${mat.name}」，可重新生成本节`) }
function saveMaterialSummary() {
  if (selectedMaterial.value) {
    selectedMaterial.value.extractedSummary = editingSummary.value
    for (const pkg of materialPackages) {
      const m = pkg.materials.find(x => x.id === selectedMaterial.value.id)
      if (m) { m.extractedSummary = editingSummary.value; m.status = '已修改'; break }
    }
    ElMessage.success('资料摘要已更新')
  }
  showMaterialDetail.value = false
}

const aiMsgs = ref([])
const aiInput = ref('')
const aiBusy = ref(false)

function sendAiMessage() {
  const t = aiInput.value.trim()
  if (!t) return
  aiMsgs.value.push({ role: 'user', text: t })
  aiInput.value = ''
  aiBusy.value = true
  setTimeout(() => { aiMsgs.value.push({ role: 'ai', text: getAiDeliveryReply(t) }); aiBusy.value = false }, 1000)
}

function handleAiDeliveryAction(action) {
  aiMsgs.value.push({ role: 'user', text: action })
  aiBusy.value = true
  setTimeout(() => { aiMsgs.value.push({ role: 'ai', text: getAiDeliveryReply(action) }); aiBusy.value = false }, 1000)
}

function getAiDeliveryReply(input) {
  const secTitle = currentSection.value ? `${currentSection.value.no}、${currentSection.value.title}` : '当前章节'
  const secMats = currentSectionMaterials.value.map(m => m.name).join('、') || '无'
  if (input.includes('改写') || input.includes('修改') || input.includes('压缩')) {
    return `已对「${secTitle}」进行改写优化。\n\n修改要点：\n· 调整了表述结构，使逻辑更清晰\n· 删除了冗余信息，保留核心数据\n· 统一了专有名词用法\n\n请在正文区查看效果，如需进一步调整可继续告诉我。`
  }
  if (input.includes('审批') || input.includes('口吻')) {
    return `已将「${secTitle}」调整为审批口吻。\n\n调整内容：\n· "建议关注" → "提请审批人重点关注"\n· "可能存在风险" → "经核查确认存在以下风险事项"\n· 结论段落调整为正式公文格式，符合授信审批阅读习惯`
  }
  if (input.includes('重新生成') || input.includes('资料包')) {
    return `已根据资料包重新生成「${secTitle}」。\n\n引用资料：${secMats}\n\n生成说明：基于上述资料包的识别摘要，已更新本节正文内容。关键数据均已标注资料来源，可直接用于授信审批。`
  }
  if (input.includes('缺失')) {
    if (currentSection.value?.materialStatus === '完整') return `「${secTitle}」资料状态：完整\n当前章节关联资料充足，无需补充。`
    return `「${secTitle}」缺失资料检查：\n\n⚠️ 当前章节资料${currentSection.value?.materialStatus}\n· 影响：可能导致本节结论缺乏充分证据支撑\n· 建议：补充相关财务凭证、银行流水或税票数据\n· 操作：可点击右侧资料包"补充"按钮上传缺失资料`
  }
  if (input.includes('引用') || input.includes('查看本节')) {
    return `「${secTitle}」引用资料：\n\n关联资料：${secMats}\n\n点击右侧"本章资料包"可查看详情、修改摘要或补充上传。`
  }
  if (input.includes('模板') || input.includes('重新生成报告')) {
    return `按新模板重新生成功能已就绪。\n\n操作步骤：\n1. 点击右上角「按新模板生成」按钮\n2. 选择目标模板\n3. 系统将展示章节映射提示\n4. 确认后自动重新生成\n\n当前报告模板：${activeReport.value?.templateName || '未选择'}\n可用模板：${reportTemplates.map(t => t.name).join('、')}`
  }
  if (input.includes('上传') || input.includes('补充')) {
    return `已为您打开补充资料上传入口。\n\n操作：\n· 点击右侧资料包"补充"按钮上传新资料\n· 上传后AI将自动识别并关联到对应章节\n· 资料补充完成后可重新生成本节\n\n当前章节关联资料：${secMats}`
  }
  if (input.includes('尽调') || input.includes('核验')) {
    return `已生成尽调核验事项。\n\n核验要点：\n· 核实收入真实性（需补充银行流水交叉验证）\n· 确认法人关联企业情况\n· 核实应收账款集中度\n\n核验结果将同步更新至报告对应章节。`
  }
  if (input.includes('导出') || input.includes('批量')) {
    return `已生成导出任务。\n\n导出内容：\n· 报告正文：15 章\n· 附件清单：5 项已归集\n· 资料包：6 份资料\n· 证据目录：31 项\n\n导出文件已生成，可在下载区获取。`
  }
  return `收到：「${input}」\n\n我可以帮您：\n· 改写/压缩当前章节\n· 调整为审批口吻\n· 根据资料包重新生成\n· 检查缺失资料\n· 上传补充资料\n· 按新模板重新生成\n· 批量导出报告和资料包\n\n请直接告诉我需要怎么做。`
}

function renderMd(text) {
  if (!text) return ''
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

function statusBadgeClass(s) {
  if (!s) return ''
  if (s.includes('待确认')) return 'sr-badge--warn'
  if (s.includes('缺失') || s.includes('证据不足') || s.includes('资料缺失')) return 'sr-badge--danger'
  if (s.includes('待导出') || s.includes('已导出') || s.includes('已确认')) return 'sr-badge--success'
  return 'sr-badge--info'
}

function matStatusClass(s) {
  if (s === '已关联') return 'sr-badge--ok'
  if (s === '已修改') return 'sr-badge--info'
  if (s === '缺失' || s === '部分缺失') return 'sr-badge--danger'
  if (s === '待确认') return 'sr-badge--warn'
  return 'sr-badge--info'
}

function riskLevelClass(level) {
  if (level === '高风险') return 'sr-risk-item--high'
  if (level === '中风险') return 'sr-risk-item--mid'
  return 'sr-risk-item--low'
}

function openReport(task) {
  activeReport.value = { ...task }
  activeSectionId.value = reportSections[0].id
  aiMsgs.value = [{ role: 'ai', text: `已打开「${task.enterpriseName} - ${task.reportName}」，共 ${reportSections.length} 个章节。AI 助手已收起，如需修改请点击展开。` }]
  assistantCollapsed.value = true
  view.value = 'editor'
}

function backToHome() { view.value = 'home'; activeReport.value = null }

function handleSaveDraft() { ElMessage.success('草稿已保存') }

const showRegenDialog = ref(false)
const regenTplId = ref('')

function handleRegenerateByTemplate() { showRegenDialog.value = true; regenTplId.value = '' }
function getRegenTplName() { const t = reportTemplates.find(x => x.id === regenTplId.value); return t ? t.name : '' }
function getRegenTplSections() { const t = reportTemplates.find(x => x.id === regenTplId.value); return t ? t.sectionsCount : 0 }
function getTaskCardReportName(id) {
  const t = reportTasks.find(x => x.id === id)
  return t ? `${t.enterpriseName} - ${t.reportName}` : id
}

function doRegenerate() {
  if (!regenTplId.value) return
  const tpl = reportTemplates.find(x => x.id === regenTplId.value)
  ElMessage.success(`已按「${tpl?.name}」重新生成报告，共 ${tpl?.sectionsCount} 章`)
  showRegenDialog.value = false
}

function handleRegenerateSection() {
  ElMessage.success('已根据资料包重新生成当前章节')
}

const showExportDialog = ref(false)
const exportOptions = ref(exportPackages.map(p => ({ ...p })))
const selectedExportKeys = ref(exportPackages.filter(p => p.checked).map(p => p.key))

function handleExportReport() { ElMessage.success('报告已导出为 Word 文档') }
function handleExportAll() { showExportDialog.value = true }
function doExportAll() {
  const items = exportOptions.value.filter(o => selectedExportKeys.value.includes(o.key)).map(o => o.label).join('、')
  ElMessage.success(`已导出：${items || '无'}，文件已生成`)
  showExportDialog.value = false
}

const showPreSubmitCheck = ref(false)

function handleSubmitConfirm() {
  showPreSubmitCheck.value = true
}

function doPreSubmitCheck() {
  showPreSubmitCheck.value = false
  const hasBlocker = preSubmitCheckResult.value.some(r => r.status === 'fail' && r.level === 'block')
  if (hasBlocker) {
    ElMessage.error('存在阻断项，不能提交，请先处理')
    return
  }
  ElMessage.success('报告已完成确认，可导出交付')
}

function doForceSubmit() {
  showPreSubmitCheck.value = false
  ElMessage.warning('已强制提交，请确保风险事项已评估')
}

function generateMissingListFromCheck() {
  ElMessage.success('缺失材料清单已生成')
  showPreSubmitCheck.value = false
}

const preSubmitCheckResult = computed(() => [
  {
    id: 'sc1', title: '待确认章节', level: 'block',
    detail: `${pendingConfirmations.filter(p => !p.confirmed).length} 项待确认`,
    status: pendingConfirmations.some(p => !p.confirmed) ? 'fail' : 'pass',
  },
  {
    id: 'sc2', title: '缺失材料', level: 'warn',
    detail: `${materialPackages[0]?.missingCount || 0} 份资料缺失`,
    status: (materialPackages[0]?.missingCount || 0) > 0 ? 'warn' : 'pass',
  },
  {
    id: 'sc3', title: '禁用词检查', level: 'warn',
    detail: '未发现禁用词',
    status: 'pass',
  },
  {
    id: 'sc4', title: '无证据结论', level: 'block',
    detail: '未发现无证据结论',
    status: 'pass',
  },
  {
    id: 'sc5', title: '附件清单完整性', level: 'info',
    detail: '附件清单已归集 5 项',
    status: 'pass',
  },
])

const hasPreSubmitBlocker = computed(() => preSubmitCheckResult.value.some(r => r.status === 'fail' && r.level === 'block'))
const hasPreSubmitWarn = computed(() => preSubmitCheckResult.value.some(r => r.status === 'warn'))

// ════════════════════════════════════════
// 右侧 AI 助手：章节任务卡 & 改写建议
// ════════════════════════════════════════
const aiRewriteCard = ref(null)

// ════════════════════════════════════════
// AI 助手收起/展开
// ════════════════════════════════════════
const assistantCollapsed = ref(true)

function toggleAssistant() {
  assistantCollapsed.value = !assistantCollapsed.value
}

function statusTagType(s) {
  if (s.includes('待确认')) return 'warning'
  if (s.includes('缺失') || s.includes('证据不足') || s.includes('资料不足')) return 'danger'
  if (s.includes('已确认')) return 'success'
  return 'info'
}

function getMissingMaterialCount() {
  return currentSectionMaterials.value.filter(m => m.status === '缺失').length
}

function getTplName(id) {
  const t = reportTemplates.find(x => x.id === id)
  return t ? t.name : id
}

function handleAiSectionAction(action) {
  const secTitle = currentSection.value ? `${currentSection.value.no}、${currentSection.value.title}` : '当前章节'
  aiMsgs.value.push({ role: 'user', text: `[快捷操作] ${action}` })
  aiBusy.value = true
  setTimeout(() => {
    if (action === '改写') {
      aiRewriteCard.value = {
        summary: `${secTitle} 当前内容侧重于数据罗列，缺乏分析视角`,
        suggestion: '建议将数据与行业基准对比，突出异常点。改写后将补充 2 处数据引用和 1 处风险提示，使逻辑链更完整。',
        evidence: `引用 ${currentSectionMaterials.value.length} 份关联资料`,
      }
    } else if (action === '检查证据链') {
      const linked = currentSectionMaterials.value.filter(m => m.status === '已关联').length
      const missing = getMissingMaterialCount()
      aiMsgs.value.push({ role: 'ai', text: `${secTitle} 证据链检查结果：\n\n✅ ${linked} 份资料已关联\n❌ ${missing} 份资料缺失\n\n${missing > 0 ? '⚠️ 建议补充缺失资料后再确认本节' : '✅ 证据链完整，可以确认本节'}` })
    } else if (action === '缺失说明') {
      const missing = currentSectionMaterials.value.filter(m => m.status === '缺失').map(m => m.name)
      aiMsgs.value.push({ role: 'ai', text: `${secTitle} 缺失资料说明：\n\n缺失资料：${missing.join('、') || '无'}\n影响：可能导致本节结论缺乏充分证据支撑\n建议：点击右侧资料包"补充"按钮上传缺失资料` })
    } else if (action === '确认') {
      ElMessage.success(`${secTitle} 已标记为确认`)
      aiMsgs.value.push({ role: 'ai', text: `${secTitle} 已标记为确认。` })
    } else if (action === '尽调') {
      ElMessage.success('已创建补充尽调任务')
      aiMsgs.value.push({ role: 'ai', text: '已创建补充尽调任务，尽调完成后结果将同步至本节。' })
    }
    aiBusy.value = false
  }, 800)
}

function applyAiRewrite() {
  if (aiRewriteCard.value && currentSection.value) {
    const existing = (currentSection.value.body || []).join('\n\n')
    currentSection.value.body = [existing, '（AI 改写已应用：调整表述结构，补充数据引用和风险提示）'].filter(Boolean)
    ElMessage.success('改写已应用到当前章节')
  }
  aiRewriteCard.value = null
}

function viewEvidenceFromRewrite() {
  ElMessage.info('已定位到关联资料，请在右侧证据链中查看')
  aiRewriteCard.value = null
}


</script>
<style scoped>
.sr-page { padding: 20px 28px; max-width: 1440px; margin: 0 auto; }

/* ═══ 首页 ═══ */
.sr-home { max-width: 960px; margin: 0 auto; }
.sr-home__header { margin-bottom: 20px; }
.sr-home__title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
.sr-home__subtitle { font-size: var(--font-size-sm); color: var(--text-tertiary); margin: 0; line-height: 1.5; }

/* AI 输入卡片 */
.sr-home__ai-input-card { margin-bottom: 16px; }
.sr-home__ai-label { font-size: 14px; font-weight: 500; color: var(--text-primary); margin: 0 0 10px; }
.sr-home__ai-input-row { margin-bottom: 8px; }
.sr-home__ai-chips { display: flex; flex-wrap: wrap; gap: 4px; }

/* 四项核心能力 */
.sr-home__capabilities { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.sr-cap-card { cursor: pointer; transition: border-color .15s, box-shadow .15s; padding: 16px !important; }
.sr-cap-card:hover { border-color: var(--color-primary); }
.sr-cap-card__icon { font-size: 24px; margin-bottom: 8px; }
.sr-cap-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.sr-cap-card__desc { font-size: var(--font-size-xs); color: var(--text-tertiary); line-height: 1.4; }

/* 最近报告 */
.sr-home__recent-header { font-size: 14px; font-weight: 600; color: var(--text-primary); }

/* 主体两栏（旧，保留兼容） */
.sr-workspace { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 18px; align-items: start; }
.sr-workspace__main { min-width: 0; }
.sr-section { margin-bottom: 18px; }
.sr-section__title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0 0 14px; }

/* 核心功能区（旧） */
.sr-func-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.sr-func-item { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; transition: border-color .15s; }
.sr-func-item:hover { border-color: var(--color-primary); }
.sr-func-item__icon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 6px; background: var(--color-primary-bg); font-size: 16px; margin-bottom: 4px; }
.sr-func-item__title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
.sr-func-item__desc { font-size: var(--font-size-xs); color: var(--text-tertiary); margin: 0; line-height: 1.5; flex: 1; }

/* 最近报告轻量列表（旧） */
.sr-recent-list { display: grid; gap: 6px; }
.sr-recent-list__row { display: grid; grid-template-columns: 1fr 1fr auto auto auto; gap: 10px; align-items: center; padding: 10px 14px; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); font-size: 13px; }
.sr-recent-list__name { color: var(--text-primary); font-weight: 500; }
.sr-recent-list__type { color: var(--text-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-recent-list__next { color: var(--text-tertiary); font-size: 12px; }

/* AI 输入区（旧） */
.sr-ai-box { padding: 18px; border-color: var(--color-primary); }
.sr-ai-box__desc { font-size: var(--font-size-sm); color: var(--text-tertiary); margin: 0 0 12px; line-height: 1.6; }
.sr-input-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 12px; }
.sr-input-row__input { height: 44px; border: 1px solid var(--border-default); border-radius: 7px; padding: 0 14px; font-size: var(--font-size-sm); outline: none; font-family: var(--font-family); }
.sr-input-row__input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
.sr-suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

/* 旧待处理列表（兼容保留，已不再使用） */
.sr-task-list-lite { display: grid; gap: 6px; }
.sr-task-list-lite__row { display: grid; grid-template-columns: 1fr auto auto auto; gap: 10px; align-items: center; padding: 10px 14px; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); font-size: 13px; }
.sr-task-list-lite__name { color: var(--text-primary); font-weight: 500; }
.sr-task-list-lite__next { color: var(--text-tertiary); font-size: 12px; }

/* AI 输入区 */
.sr-ai-box { padding: 18px; border-color: var(--color-primary); }
.sr-ai-box__desc { font-size: var(--font-size-sm); color: var(--text-tertiary); margin: 0 0 12px; line-height: 1.6; }
.sr-input-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 12px; }
.sr-input-row__input { height: 44px; border: 1px solid var(--border-default); border-radius: 7px; padding: 0 14px; font-size: var(--font-size-sm); outline: none; font-family: var(--font-family); }
.sr-input-row__input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
.sr-suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.sr-chip { border: 1px solid var(--border-default); border-radius: 999px; padding: 7px 10px; color: var(--text-secondary); background: var(--bg-page); font-size: 13px; cursor: pointer; transition: all .15s; }
.sr-chip:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }

/* 待处理报告交付任务（保留旧兼容，轻量行替代） */
.sr-task-list { display: grid; gap: 10px; }
.sr-pending-task-card { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; padding: 14px; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
.sr-pending-task-card__title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px; }
.sr-pending-task-card__desc { font-size: var(--font-size-sm); color: var(--text-tertiary); margin: 0 0 8px; line-height: 1.6; }
.sr-pending-task-card__meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--text-tertiary); }

/* 右侧上下文 */
.sr-context { display: grid; gap: 10px; align-content: start; position: sticky; top: 20px; }
.sr-context-card { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 14px; }
.sr-context-card__title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px; }
.sr-todo-list { display: grid; gap: 8px; }
.sr-todo-row { display: grid; grid-template-columns: 1fr auto; align-items: center; min-height: 34px; padding: 0 10px; border-radius: 6px; background: var(--bg-page); color: var(--text-secondary); font-size: 13px; }
.sr-facts { display: grid; gap: 10px; margin-top: 12px; }
.sr-fact { display: grid; grid-template-columns: 100px 1fr; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); font-size: 14px; }
.sr-fact strong { color: var(--text-primary); }
.sr-fact:last-child { border-bottom: none; }

/* 标签 */
.sr-tag { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: var(--bg-page); color: var(--text-tertiary); }
.sr-tag--warn { background: #fff7ed; color: #b45309; }
.sr-tag--danger { background: #fef2f2; color: #b91c1c; }
.sr-tag--success { background: #f0fdf4; color: #15803d; }

/* ═══ 通用 badge ═══ */
.sr-badge { font-size: var(--font-size-xs); padding: 2px 8px; border-radius: var(--radius-sm); display: inline-block; }
.sr-badge--warn { background: var(--color-warning-bg); color: var(--color-warning); }
.sr-badge--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.sr-badge--success { background: var(--color-success-bg); color: var(--color-success); }
.sr-badge--info { background: var(--bg-page); color: var(--text-tertiary); }
.sr-badge--ok { background: var(--color-success-bg); color: var(--color-success); }

/* ═══ 通用按钮 ═══ */
.sr-btn { padding: 6px 14px; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); font-size: var(--font-size-sm); cursor: pointer; color: var(--text-primary); transition: all .15s; white-space: nowrap; }
.sr-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.sr-btn--primary { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.sr-btn--primary:hover { background: #2563eb; }

.sr-back { cursor: pointer; font-size: 18px; color: var(--text-tertiary); }
.sr-back:hover { color: var(--color-primary); }

/* ═══ 上传态 ═══ */
.sr-upload { max-width: 800px; margin: 0 auto; }
.sr-upload__bar { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
.sr-upload__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); }
.sr-upload__panel { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-xl) 24px; display: flex; flex-direction: column; gap: var(--space-lg); }
.sr-upload__step { display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-upload__label { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
.sr-upload__select { border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm) 12px; font-size: var(--font-size-sm); outline: none; background: #fff; }
.sr-upload__drop { border: 2px dashed var(--border-default); border-radius: var(--radius-md); padding: 32px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); color: var(--text-tertiary); transition: border-color .15s; }
.sr-upload__drop:hover { border-color: var(--color-primary); color: var(--color-primary); }
.sr-upload__hint { font-size: var(--font-size-xs); }
.sr-upload__note { border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm) 12px; font-size: var(--font-size-sm); outline: none; resize: none; font-family: var(--font-family); }
.sr-upload__actions { display: flex; gap: var(--space-sm); justify-content: flex-end; }

.sr-upload__result { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-xl) 24px; }
.sr-upload__result__header { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-body); font-weight: 600; margin-bottom: var(--space-md); color: var(--color-success); }
.sr-upload__materials, .sr-upload__missing { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md); }
.sr-upload__mat-item { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: var(--radius-md); font-size: var(--font-size-sm); }
.sr-upload__mat-item.ok { background: var(--color-success-bg); color: var(--color-success); }
.sr-upload__mat-item.miss { background: var(--color-danger-bg); color: var(--color-danger); }
.sr-upload__mat-icon { font-weight: 700; font-size: 14px; }
.sr-upload__missing__title { width: 100%; font-size: var(--font-size-sm); font-weight: 600; color: var(--color-danger); margin-bottom: var(--space-xs); }

/* ═══ 生成态 ═══ */
.sr-generating { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.sr-generating__card { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-3xl) 40px; text-align: center; max-width: 480px; width: 100%; }
.sr-generating__spinner { width: 40px; height: 40px; border: 3px solid var(--border-light); border-top-color: var(--color-primary); border-radius: 50%; animation: sr-spin 1s linear infinite; margin: 0 auto var(--space-lg); }
@keyframes sr-spin { to { transform: rotate(360deg); } }
.sr-generating__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-xl); }
.sr-generating__step { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) 0; font-size: var(--font-size-body); color: var(--text-tertiary); }
.sr-generating__step.done { color: var(--color-success); }
.sr-generating__step.active { color: var(--color-primary); font-weight: 500; }
.sr-generating__step-icon { width: 20px; text-align: center; flex-shrink: 0; }

/* ═══ 三栏编辑器 ═══ */
.sr-editor { display: flex; flex-direction: column; height: calc(100vh - 140px); }
.sr-editor__header { display: flex; align-items: center; gap: var(--space-md); background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-md) 20px; margin-bottom: var(--space-md); flex-shrink: 0; flex-wrap: wrap; }
.sr-editor__top-info { flex: 1; display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; min-width: 0; }
.sr-editor__top-name { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); }
.sr-editor__top-report { font-size: var(--font-size-body); color: var(--text-secondary); }
.sr-editor__top-meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-editor__top-pending { font-size: var(--font-size-xs); padding: 2px 6px; background: var(--color-warning-bg); color: var(--color-warning); border-radius: var(--radius-sm); }
.sr-editor__actions { margin-left: auto; display: flex; gap: var(--space-xs); flex-wrap: wrap; }

.sr-editor__body { display: grid; grid-template-columns: 240px minmax(0, 1fr) 360px; gap: var(--space-md); height: calc(100vh - 180px); overflow: hidden; min-height: 0; }

/* 左：目录 */
.sr-editor__toc { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); overflow-y: auto; padding: var(--space-md) 0; min-height: 0; }
.sr-toc__header { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); padding: 0 var(--space-md) var(--space-sm); border-bottom: 1px solid var(--border-light); margin-bottom: var(--space-xs); }
.sr-toc__item { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) var(--space-md); cursor: pointer; font-size: var(--font-size-xs); color: var(--text-secondary); }
.sr-toc__item:hover { background: var(--color-primary-bg); color: var(--color-primary); }
.sr-toc__item.active { background: var(--color-primary-bg); color: var(--color-primary); font-weight: 500; }
.sr-toc__item.pending { position: relative; }
.sr-toc__num { width: 20px; flex-shrink: 0; font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-toc__text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-toc__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.sr-toc__dot--warn { background: var(--color-warning); }
.sr-toc__dot--miss { background: var(--color-danger); }

/* 中：正文 */
.sr-editor__content { overflow-y: auto; padding-right: var(--space-sm); min-height: 0; }
.sr-sec-header { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
.sr-sec-header__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; }
.sr-sec-header__mat { font-size: var(--font-size-xs); color: var(--text-tertiary); }

.sr-sec-ai-note, .sr-sec-pending-note, .sr-sec-missing-note { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-md); font-size: var(--font-size-sm); margin-bottom: var(--space-md); }
.sr-sec-ai-note { background: var(--color-primary-bg); color: var(--color-primary); }
.sr-sec-pending-note { background: var(--color-warning-bg); color: var(--color-warning); }
.sr-sec-missing-note { background: #fef3c7; color: #92400e; }

.sr-sec-body { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-md); }
.sr-para { font-size: var(--font-size-body); color: var(--text-primary); line-height: 1.8; margin: 0 0 var(--space-md); }

.sr-info-table { width: 100%; border-collapse: collapse; margin: var(--space-md) 0; }
.sr-info-table td { padding: var(--space-sm) var(--space-md); font-size: var(--font-size-sm); border: 1px solid var(--border-light); }
.sr-info-table__label { font-weight: 500; color: var(--text-secondary); width: 25%; background: var(--bg-table-header); }

.sr-data-table { width: 100%; border-collapse: collapse; margin: var(--space-md) 0; font-size: var(--font-size-sm); }
.sr-data-table th { background: var(--bg-table-header); color: var(--text-secondary); font-weight: 600; padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-light); text-align: left; }
.sr-data-table td { padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-light); color: var(--text-primary); }

.sr-risk-list { margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-risk-list__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-xs); }
.sr-risk-item { display: flex; align-items: flex-start; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); background: var(--bg-page); font-size: var(--font-size-sm); }
.sr-risk-item--high { border-left: 3px solid var(--color-danger); }
.sr-risk-item--mid { border-left: 3px solid var(--color-warning); }
.sr-risk-item--low { border-left: 3px solid var(--color-success); }
.sr-risk-item__level { font-size: var(--font-size-xs); font-weight: 600; padding: 1px 6px; border-radius: 3px; color: #fff; background: var(--color-warning); white-space: nowrap; }
.sr-risk-item--high .sr-risk-item__level { background: var(--color-danger); }
.sr-risk-item--low .sr-risk-item__level { background: var(--color-success); }
.sr-risk-item__title { flex: 1; font-weight: 500; }
.sr-risk-item__basis { color: var(--text-tertiary); max-width: 50%; font-size: var(--font-size-xs); }

.sr-sec-material-ref { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); }
.sr-sec-material-ref__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-xs); }
.sr-sec-material-ref__item { padding: 4px 0; font-size: var(--font-size-sm); color: var(--text-primary); }

.sr-sec-edit { display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-sec-edit__textarea { border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md); font-size: var(--font-size-body); outline: none; resize: none; font-family: var(--font-family); line-height: 1.8; min-height: 200px; }
.sr-sec-edit__textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
.sr-sec-edit__actions { display: flex; gap: var(--space-sm); }
.sr-sec-actions { display: flex; gap: var(--space-sm); padding-top: var(--space-md); }

/* 右：侧栏 */
.sr-editor__sidebar { display: flex; flex-direction: column; overflow: hidden; min-height: 0; border-radius: var(--radius-md); }
.sr-editor__sidebar.ai-assistant-panel { border: 1px solid var(--border-default); background: var(--surface-card); }

.sr-sidebar__materials { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-md); max-height: 45%; overflow-y: auto; flex-shrink: 0; }
.sr-sidebar__section-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-sm); }
.sr-sidebar__empty { font-size: var(--font-size-xs); color: var(--text-tertiary); padding: var(--space-md) 0; }

.sr-mat-card { border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--space-sm) 10px; margin-bottom: var(--space-sm); font-size: var(--font-size-xs); }
.sr-mat-card.modified { border-color: var(--color-primary); background: var(--color-primary-bg); }
.sr-mat-card__name { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.sr-mat-card__meta { display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-tertiary); }
.sr-mat-card__summary { color: var(--text-secondary); line-height: 1.4; margin-bottom: 4px; }
.sr-mat-card__actions { display: flex; gap: var(--space-xs); }
.sr-mat-card__link { font-size: var(--font-size-xs); color: var(--color-primary); cursor: pointer; background: none; border: none; text-decoration: underline; padding: 0; }
.sr-mat-card__link:hover { color: #2563eb; }

/* AI 助手面板 */
.ai-assistant-panel { height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.ai-assistant-panel__body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.sr-ai-subtitle { font-size: var(--font-size-xs); color: var(--text-tertiary); padding: var(--space-sm) var(--space-md); }
.sr-ai-quick { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 var(--space-md) var(--space-sm); }
.sr-ai-msgs { flex: 1; overflow-y: auto; padding: var(--space-sm) var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); min-height: 0; }
.sr-ai-msg__thinking { color: var(--text-tertiary); font-style: italic; }
.sr-ai-msg__typing { color: var(--text-tertiary); font-style: italic; }
.ai-assistant-panel__footer { flex-shrink: 0; padding: 8px 12px; border-top: 1px solid var(--border-light); display: flex; gap: 8px; align-items: center; }

/* AI 内联快捷按钮 */
.sr-ai-quick-inline { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-light); }

/* AI 改写气泡 */
.sr-ai-rewrite-bubble { margin-top: 4px; }
.sr-ai-rewrite-bubble__title { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.sr-ai-rewrite-bubble__summary, .sr-ai-rewrite-bubble__suggestion, .sr-ai-rewrite-bubble__evidence { font-size: 12px; line-height: 1.5; margin-bottom: 4px; }
.sr-ai-rewrite-bubble__actions { display: flex; gap: 6px; margin-top: 8px; }

/* ═══ 弹窗 ═══ */
.sr-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.sr-modal { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); width: 480px; max-width: 90vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
.sr-modal__header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-light); }
.sr-modal__header h3 { font-size: var(--font-size-body); font-weight: 600; color: var(--text-primary); margin: 0; }
.sr-modal__close { cursor: pointer; font-size: 18px; color: var(--text-tertiary); }
.sr-modal__close:hover { color: var(--color-primary); }
.sr-modal__body { padding: var(--space-lg); }
.sr-modal__row { display: flex; gap: var(--space-sm); margin-bottom: var(--space-sm); font-size: var(--font-size-sm); }
.sr-modal__label { color: var(--text-tertiary); min-width: 80px; flex-shrink: 0; }
.sr-modal__edit { flex: 1; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-sm); font-size: var(--font-size-sm); outline: none; resize: none; font-family: var(--font-family); width: 100%; }
.sr-modal__footer { display: flex; justify-content: flex-end; gap: var(--space-sm); padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border-light); }
.sr-modal__checkbox { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) 0; cursor: pointer; font-size: var(--font-size-sm); color: var(--text-primary); }
.sr-modal__cb-box { font-size: 16px; }
.sr-modal__radio { display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) var(--space-md); border: 1px solid var(--border-default); border-radius: var(--radius-md); margin-bottom: var(--space-sm); cursor: pointer; font-size: var(--font-size-sm); }
.sr-modal__radio:hover { border-color: var(--color-primary); }
.sr-modal__radio.on { border-color: var(--color-primary); background: var(--color-primary-bg); }
.sr-modal__radio-desc { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-modal__mapping { margin-top: var(--space-md); padding: var(--space-md); background: var(--bg-page); border-radius: var(--radius-md); font-size: var(--font-size-sm); color: var(--text-secondary); }
.sr-modal__mapping-title { font-weight: 600; margin-bottom: var(--space-xs); }
.sr-modal__mapping-text { margin: 0; line-height: 1.5; }

@media (max-width: 1200px) {
  .sr-func-grid { grid-template-columns: repeat(2, 1fr); }
  .sr-recent-list__row { grid-template-columns: 1fr; }
  .sr-editor__body { grid-template-columns: 1fr; }
  .sr-editor__toc { max-height: 200px; }
  .sr-editor__sidebar { max-height: 400px; }
  .sr-task-workspace__body { grid-template-columns: 1fr; }
}

@media (max-width: 960px) {
  .sr-home__capabilities { grid-template-columns: repeat(2, 1fr); }
}

/* ═══ 新增：Element Plus 适配 & 任务卡样式 ═══ */

/* el-card 扁平化覆盖 */
:deep(.el-card--flat.sr-start-card), :deep(.el-card.el-card--flat.sr-pending-task-card) {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
}
:deep(.el-card--flat .el-card__body) {
  padding: 16px;
}

/* el-input 覆盖 */
:deep(.sr-input-row__input .el-input__wrapper) {
  height: 44px;
}

/* 建议按钮 */
:deep(.sr-suggestions .el-button) {
  margin: 0 4px 4px 0;
  font-size: 13px;
}

/* 任务卡区 */
.sr-task-card-section { margin-bottom: 18px; }
.sr-task-card-header { display: flex; justify-content: space-between; align-items: center; }
.sr-task-card-header .sr-section__title { display: flex; align-items: center; gap: 6px; font-size: 18px; font-weight: 600; color: var(--text-primary); }
.sr-task-card { border: 1px solid var(--color-primary); }
.sr-task-card__title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.sr-task-card__goal { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.5; }
.sr-task-card__meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; margin-bottom: 8px; }
.sr-task-card__meta-item { font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.sr-task-card__label { color: var(--text-tertiary); white-space: nowrap; }
.sr-task-card__expect { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.5; }
.sr-task-card__pending, .sr-task-card__missing { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; font-size: 13px; }
.sr-task-card__actions { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); }

/* 待处理任务卡片 */
.sr-pending-task-card { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }
.sr-pending-task-card__body { min-width: 0; }
.sr-pending-task-card__next { font-size: 12px; color: var(--text-tertiary); }

/* 右侧目录 tag */
.sr-toc__tag { font-size: 10px; padding: 0 4px; height: 18px; line-height: 18px; }

/* 正文 alert 替代 */
.sr-sec-alert { margin-bottom: 12px; }
.sr-sec-alert :deep(.el-alert__title) { font-size: var(--font-size-sm); }

/* 章节任务卡 */
.sr-ai-section-card { background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px 12px; margin: 0 var(--space-md) var(--space-sm); }
.sr-ai-section-card__title { font-size: 12px; font-weight: 600; color: var(--text-tertiary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.sr-ai-section-card__meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 13px; color: var(--text-primary); }
.sr-ai-section-card__stats { font-size: 12px; color: var(--text-tertiary); display: flex; gap: 12px; margin-bottom: 8px; }
.sr-ai-section-card__warn { color: var(--color-danger); }
.sr-ai-section-card__actions { display: flex; flex-wrap: wrap; gap: 4px; }

/* AI 改写建议卡 */
.sr-ai-rewrite-card { background: var(--surface-card); border: 1px solid var(--color-primary); border-radius: var(--radius-md); padding: 12px; margin-top: 8px; }
.sr-ai-rewrite-card__title { font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px; }
.sr-ai-rewrite-card__summary, .sr-ai-rewrite-card__suggestion, .sr-ai-rewrite-card__evidence { font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 6px; }
.sr-ai-rewrite-card__actions { display: flex; gap: 4px; margin-top: 8px; }

/* 证据链资料卡 */
.sr-mat-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }

/* 快捷按钮 */
:deep(.sr-ai-quick .el-button) {
  margin: 0 4px 4px 0;
  font-size: 11px;
}

/* AI footer input */
:deep(.ai-assistant-panel__input .el-input__wrapper) {
  background: var(--bg-page);
}
:deep(.ai-assistant-panel__footer) {
  display: flex; gap: 6px; padding: var(--space-sm) var(--space-md);
}

/* 资料详情弹窗 */
.sr-dialog-form { padding: 0 4px; }

/* 导出选项 */
.sr-export-options { padding: 4px 0; }
:deep(.sr-export-options .el-checkbox) {
  display: block;
  margin-bottom: 8px;
}

/* 按新模板生成模板列表 */
.sr-regen-tpl-list { padding: 0 4px; }
.sr-regen-radio-group { display: flex; flex-direction: column; gap: 8px; }
.sr-regen-radio-item { margin: 0; width: 100%; padding: 10px 14px; }
:deep(.sr-regen-radio-item .el-radio__label) { width: 100%; }
.sr-regen-radio-item__name { font-size: 14px; font-weight: 500; color: var(--text-primary); }
.sr-regen-radio-item__desc { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

/* 提交前检查表 */
.sr-check-table { width: 100%; }

/* ═══ AI 任务确认工作区 ═══ */
.sr-task-workspace { max-width: 1200px; margin: 0 auto; }
.sr-task-workspace__header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
.sr-task-workspace__header-title h2 { font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
.sr-task-workspace__header-title p { font-size: 13px; color: var(--text-tertiary); margin: 0; }
.sr-task-workspace__body { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; height: calc(100vh - 160px); overflow: hidden; }
.sr-task-workspace__main { min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding-right: 8px; }
.sr-task-workspace__assistant { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }

/* 任务主内容区 */
.sr-task-main__input-display { padding: 12px 16px; background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; }
.sr-task-main__label { color: var(--text-tertiary); font-weight: 500; }
.sr-task-main__ai-summary { display: flex; gap: 10px; padding: 12px 16px; }
.sr-task-main__ai-summary-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-bg); color: var(--color-primary); display: grid; place-items: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.sr-task-main__ai-summary-text { font-size: 13px; color: var(--text-primary); line-height: 1.6; }
.sr-task-main__ai-summary-text p { margin: 0 0 6px; }

/* 任务确认面板（复用到工作区中间） */
.sr-task-confirm-card { border: 1px solid var(--border-default); }
.sr-task-confirm-card :deep(.el-card__header) { padding: 12px 16px; border-bottom: 1px solid var(--border-light); }
.sr-task-confirm-card__header { display: flex; justify-content: space-between; align-items: center; }
.sr-task-confirm-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.sr-task-confirm-card__section { margin-top: 12px; font-size: 13px; }
.sr-task-confirm-card__label { color: var(--text-tertiary); font-weight: 500; }
.sr-task-confirm-card__missing { color: var(--color-danger); }
.sr-task-confirm-card__actions { display: flex; gap: 8px; margin-top: 14px; padding-top: 8px; border-top: 1px solid var(--border-light); }

/* 任务工作区 AI 面板上下文标签 */
.sr-ai-context { padding: 8px 14px; background: var(--bg-page); border-radius: var(--radius-sm); font-size: 12px; margin-bottom: 8px; }
.sr-ai-context__label { color: var(--text-tertiary); margin-right: 4px; }

/* ═══ 章节证据链（中间正文下方） ═══ */
.sr-section-evidence { margin-top: 24px; padding: 16px; background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
.sr-section-evidence__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.sr-section-evidence__header h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
.sr-section-evidence__header span { font-size: 12px; color: var(--text-tertiary); }
.sr-section-evidence__empty { font-size: 12px; color: var(--text-tertiary); padding: 12px 0; }

.sr-evidence-card { border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px 12px; margin-bottom: 8px; font-size: 13px; }
.sr-evidence-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.sr-evidence-card__name { font-weight: 600; color: var(--text-primary); }
.sr-evidence-card__meta { font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px; }
.sr-evidence-card__summary { font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
.sr-evidence-card__actions { display: flex; gap: 4px; flex-wrap: wrap; }

/* ═══ AI 助手收起/展开 ═══ */
.sr-assistant-toggle { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 14px; background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer; color: var(--text-tertiary); font-size: 12px; transition: all .15s; }
.sr-assistant-toggle:hover { border-color: var(--color-primary); color: var(--color-primary); }
.sr-assistant-toggle__title { font-weight: 600; color: var(--text-secondary); white-space: nowrap; }
.sr-assistant-toggle__desc { flex: 1; color: var(--text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ai-assistant-panel__header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--border-light); }
.ai-assistant-panel__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); }

@media (max-width: 1200px) {
  .sr-task-dialog__body { grid-template-columns: 1fr; }
}

@media (max-width: 1200px) {
  .sr-task-dialog__body { grid-template-columns: 1fr; }
}
</style>