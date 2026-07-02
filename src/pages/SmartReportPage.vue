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
          <el-input v-model="aiTaskInput" class="sr-home__ai-input" placeholder="例如：明达精工现在报告到哪一步了？或者把明达精工报告按浙江分行 V2024 模板重新生成" @keydown.enter.exact.prevent="handleAiTask" clearable size="large" />
          <el-button type="primary" size="large" :disabled="!aiTaskInput.trim()" @click="handleAiTask">识别任务</el-button>
        </div>
        <div class="sr-home__ai-chips">
          <el-button v-for="(chip, ci) in aiSuggestions" :key="ci" size="small" text @click="handleAiTask(chip)">{{ chip }}</el-button>
        </div>
      </el-card>

      <!-- 四项核心能力 -->
      <div class="sr-home__capabilities">
        <el-card shadow="hover" class="sr-cap-card sr-cap-card--compact">
          <div class="sr-cap-card__icon">
            <el-icon :size="24"><DataAnalysis /></el-icon>
          </div>
          <div class="sr-cap-card__title">查询报告状态</div>
          <div class="sr-cap-card__desc">查看报告进度、待确认章节和缺失材料</div>
          <el-button size="small" text type="primary" class="sr-cap-card__btn" @click="startTaskDialog('查询明达精工报告状态')">查询状态</el-button>
        </el-card>
        <el-card shadow="hover" class="sr-cap-card sr-cap-card--compact">
          <div class="sr-cap-card__icon">
            <el-icon :size="24"><EditPen /></el-icon>
          </div>
          <div class="sr-cap-card__title">继续修改报告</div>
          <div class="sr-cap-card__desc">编辑、确认章节，完善证据链</div>
          <el-button size="small" type="primary" class="sr-cap-card__btn" @click="startTaskDialog('继续修改明达精工授信调查报告')">继续修改</el-button>
        </el-card>
        <el-card shadow="hover" class="sr-cap-card sr-cap-card--compact">
          <div class="sr-cap-card__icon">
            <el-icon :size="24"><DocumentCopy /></el-icon>
          </div>
          <div class="sr-cap-card__title">按新模板生成</div>
          <div class="sr-cap-card__desc">用已有资料按新模板重排报告</div>
          <el-button size="small" text type="primary" class="sr-cap-card__btn" @click="startTaskDialog('按浙江分行 V2024 模板重新生成明达精工报告')">选择模板生成</el-button>
        </el-card>
        <el-card shadow="hover" class="sr-cap-card sr-cap-card--compact">
          <div class="sr-cap-card__icon">
            <el-icon :size="24"><Setting /></el-icon>
          </div>
          <div class="sr-cap-card__title">维护报告模板</div>
          <div class="sr-cap-card__desc">管理银行模板、章节规则和资料要求</div>
          <el-button size="small" text type="primary" class="sr-cap-card__btn" @click="view = 'templateCenter'">进入模板中心</el-button>
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
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button v-if="row.status.includes('待确认')" size="small" type="primary" text @click="openReport(row, 'continue-edit')">继续修改</el-button>
              <el-button v-else-if="row.status.includes('缺失')" size="small" type="danger" text @click="openReport(row, 'view-missing')">查看缺失</el-button>
              <el-button v-else size="small" type="primary" text @click="openReport(row, 'open')">打开</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 模板中心 -->
    <div v-if="view === 'templateCenter'" class="sr-template-center">
      <!-- 页面顶部 -->
      <div class="sr-tc__top-bar">
        <div class="sr-tc__top-left">
          <el-button size="small" text @click="view = 'home'">
            <el-icon><ArrowLeft /></el-icon> 返回首页
          </el-button>
          <div class="sr-tc__top-title-group">
            <h2 class="sr-tc__title">报告模板中心</h2>
            <p class="sr-tc__sub">维护不同银行/分行的报告模板、章节规则、资料要求、AI 生成提示词和禁用词。</p>
          </div>
        </div>
      </div>

      <!-- 筛选区 -->
      <div class="sr-tc__filters">
        <el-input v-model="templateKeyword" placeholder="搜索模板名称/银行/报告类型" clearable size="small" style="width:220px" />
        <el-select v-model="templateBankFilter" placeholder="银行/机构" clearable size="small" style="width:160px">
          <el-option v-for="b in allBanks" :key="b" :label="b" :value="b" />
        </el-select>
        <el-select v-model="templateTypeFilter" placeholder="报告类型" clearable size="small" style="width:140px">
          <el-option v-for="t in allReportTypes" :key="t" :label="t" :value="t" />
        </el-select>
        <el-select v-model="templateStatusFilter" placeholder="状态" clearable size="small" style="width:100px">
          <el-option label="启用" value="启用" />
          <el-option label="草稿" value="草稿" />
        </el-select>
        <div class="sr-tc-filter__actions">
          <el-button size="small" type="primary" @click="openNewTplDialog()">新建模板</el-button>
          <el-button size="small" plain @click="goToTemplateUpload()">上传新模板</el-button>
        </div>
      </div>

      <!-- 左右布局 -->
      <div class="sr-tc__layout">
        <!-- 左侧：模板名称列表 -->
        <aside class="sr-tc__sidebar">
          <div class="sr-tc__sidebar-title">模板列表</div>
          <div class="sr-tc__sidebar-list">
            <div v-for="row in filteredTemplateRows" :key="row.id" class="sr-tc-sidebar-item" :class="{ active: selectedTpl?.id === row.id }" @click="selectTemplate(row)">
              <div class="sr-tc-sidebar-item__name">{{ row.name }}</div>
              <div class="sr-tc-sidebar-item__meta">
                <el-tag size="small" :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag>
                <el-tag v-if="row.isDefault" size="small" type="primary" effect="dark">默认</el-tag>
                <span>{{ row.bank }}</span>
              </div>
            </div>
            <div v-if="filteredTemplateRows.length === 0" class="sr-tc-sidebar-empty">
              没有匹配的模板
            </div>
          </div>
        </aside>

        <!-- 右侧：模板详情 + 章节规则 + 关联资料/证据链 -->
        <main class="sr-tc__detail">
          <template v-if="selectedTpl">
            <!-- 基本信息 -->
            <div class="sr-tc-detail__info-card">
              <div class="sr-tc-detail__info-title">
                <h3>{{ selectedTpl.name }}</h3>
                <div class="sr-tc-detail__info-tags">
                  <el-tag size="small" :type="selectedTpl.status === '启用' ? 'success' : 'info'">{{ selectedTpl.status }}</el-tag>
                  <el-tag v-if="selectedTpl.isDefault" size="small" type="primary" effect="dark">默认</el-tag>
                </div>
              </div>
              <div class="sr-tc-detail__info-meta">
                <div class="sr-tc-detail__info-row"><span class="sr-tc-detail__info-label">银行/机构</span><span>{{ selectedTpl.bank || '—' }}</span></div>
                <div class="sr-tc-detail__info-row"><span class="sr-tc-detail__info-label">报告类型</span><span>{{ selectedTpl.reportType || '授信调查' }}</span></div>
                <div class="sr-tc-detail__info-row"><span class="sr-tc-detail__info-label">章节数</span><span>{{ selectedTpl.sectionsCount }} 章</span></div>
                <div class="sr-tc-detail__info-row"><span class="sr-tc-detail__info-label">必需资料</span><span>{{ selectedTpl.requiredMaterials }} 份</span></div>
                <div class="sr-tc-detail__info-row"><span class="sr-tc-detail__info-label">最近使用</span><span>{{ selectedTpl.recentUsage }} 次</span></div>
                <div class="sr-tc-detail__info-row"><span class="sr-tc-detail__info-label">禁用词规则</span><span>{{ selectedTpl.forbiddenWords }} 条</span></div>
              </div>
              <!-- 操作区 -->
              <div class="sr-tc-detail__actions">
                <el-button size="small" @click="setAsDefault(selectedTpl.id)" :disabled="selectedTpl.isDefault">{{ selectedTpl.isDefault ? '已是默认' : '设为默认' }}</el-button>
                <el-button size="small" type="primary" @click="viewTemplateRules(selectedTpl)">查看章节规则</el-button>
                <el-button size="small" type="warning" @click="goToTemplateUpload(selectedTpl)">上传新版模板</el-button>
                <el-button size="small" type="success" @click="generateReportFromTpl(selectedTpl)">用此模板生成报告</el-button>
                <el-button size="small" plain @click="openNewTplDialog()">新建模板</el-button>
              </div>
            </div>

            <!-- 章节规则表 -->
            <div class="sr-tc-detail__section" id="section-rules">
              <h4 class="sr-tc-detail__section-title">章节规则</h4>
              <el-table :data="selectedTplDetailSections" size="small" stripe class="sr-tc-rules-table" :header-cell-style="{ background: '#fafbfd', color: '#64748b', fontWeight: 600, fontSize: '12px' }">
                <el-table-column label="章节" min-width="120">
                  <template #default="{ row }"><span class="sr-rule-name">{{ row.name }}</span></template>
                </el-table-column>
                <el-table-column label="是否必填" width="80" align="center">
                  <template #default="{ row }"><el-tag size="small" :type="row.required === '是' ? 'primary' : 'info'">{{ row.required }}</el-tag></template>
                </el-table-column>
                <el-table-column label="所需资料" min-width="120">
                  <template #default="{ row }"><span class="sr-rule-mats">{{ row.materials }}</span></template>
                </el-table-column>
                <el-table-column label="生成规则" min-width="140">
                  <template #default="{ row }"><span class="sr-rule-gen">{{ row.genRule }}</span></template>
                </el-table-column>
                <el-table-column label="状态" width="80" align="center">
                  <template #default="{ row }"><el-tag size="small" :type="row.ruleStatus === '已配置' ? 'success' : row.ruleStatus === '待确认' ? 'warning' : 'danger'">{{ row.ruleStatus }}</el-tag></template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 禁用词规则 -->
            <div class="sr-tc-detail__section">
              <h4 class="sr-tc-detail__section-title">禁用词规则</h4>
              <div class="sr-tc-rules-forbidden-list">
                <span v-for="(fw, fi) in selectedTplForbiddenWords" :key="fi" class="sr-forbidden-tag">{{ fw }}</span>
              </div>
            </div>

            <!-- 关联资料 / 证据链面板 -->
            <div class="sr-tc-detail__section sr-tc-detail__evidence">
              <h4 class="sr-tc-detail__section-title">关联资料 / 证据链</h4>
              <p class="sr-tc-detail__evidence-desc">模板需要的资料链映射状态（资料 → 用途章节 → 来源 → 已映射/待确认/缺规则）</p>
              <el-table :data="selectedTemplateEvidenceRows" size="small" stripe class="sr-tc-rules-table" :header-cell-style="{ background: '#fafbfd', color: '#64748b', fontWeight: 600, fontSize: '12px' }">
                <el-table-column label="资料名称" min-width="100">
                  <template #default="{ row }"><span class="sr-rule-name">{{ row.name }}</span></template>
                </el-table-column>
                <el-table-column label="用途章节" min-width="100">
                  <template #default="{ row }"><span class="sr-rule-mats">{{ row.purpose }}</span></template>
                </el-table-column>
                <el-table-column label="来源" min-width="80">
                  <template #default="{ row }"><span class="sr-rule-gen">{{ row.source }}</span></template>
                </el-table-column>
                <el-table-column label="状态" width="80" align="center">
                  <template #default="{ row }"><el-tag size="small" :type="row.status === '已映射' ? 'success' : row.status === '待确认' ? 'warning' : 'danger'">{{ row.status }}</el-tag></template>
                </el-table-column>
                <el-table-column label="说明" min-width="140">
                  <template #default="{ row }"><span class="sr-rule-mats">{{ row.note }}</span></template>
                </el-table-column>
              </el-table>
            </div>
          </template>

          <div v-else class="sr-tc-detail__empty">
            <p>请在左侧选择一个模板查看详情</p>
          </div>
        </main>
      </div>
    </div>

    <!-- 新建模板 Dialog -->
    <el-dialog v-model="showNewTplDialog" title="新建模板" width="480px" destroy-on-close>
      <el-form label-width="100px" size="small" label-position="right">
        <el-form-item label="模板名称">
          <el-input v-model="newTplForm.name" placeholder="例如：浙江分行授信调查报告 V2025" />
        </el-form-item>
        <el-form-item label="银行/机构">
          <el-input v-model="newTplForm.bank" placeholder="例如：浙江银行杭州分行" />
        </el-form-item>
        <el-form-item label="报告类型">
          <el-select v-model="newTplForm.reportType" style="width:100%">
            <el-option label="授信调查" value="授信调查" />
            <el-option label="综合授信" value="综合授信" />
            <el-option label="全景报告" value="全景报告" />
            <el-option label="诊断报告" value="诊断报告" />
            <el-option label="农户授信" value="农户授信" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="newTplForm.version" placeholder="例如：V2025" />
        </el-form-item>
        <el-form-item label="创建方式">
          <el-radio-group v-model="newTplForm.createMode">
            <el-radio value="blank">空白模板</el-radio>
            <el-radio value="copy">复制当前模板</el-radio>
            <el-radio value="upload">上传文件解析</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="newTplForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewTplDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmNewTemplate()">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 章节规则 Drawer（辅助查看方式） -->
    <el-drawer v-model="showTplRules" :title="selectedTpl?.name + ' — 章节规则'" size="520px" :close-on-click-modal="false">
      <template #header>
        <div class="sr-drawer-header">
          <span class="sr-drawer-title">{{ selectedTpl?.name }} — 章节规则</span>
        </div>
      </template>
      <div v-if="selectedTpl" class="sr-tc-rules">
        <div class="sr-tc-rules-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="模板名称">{{ selectedTpl.name }}</el-descriptions-item>
            <el-descriptions-item label="银行/机构">{{ selectedTpl.bank }}</el-descriptions-item>
            <el-descriptions-item label="报告类型">{{ selectedTpl.reportType }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag size="small" :type="selectedTpl.status === '启用' ? 'success' : 'info'">{{ selectedTpl.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="章节数">{{ selectedTpl.sectionsCount }}</el-descriptions-item>
            <el-descriptions-item label="必需资料数">{{ selectedTpl.requiredMaterials }}</el-descriptions-item>
            <el-descriptions-item label="禁用词规则">{{ selectedTpl.forbiddenWords || 8 }} 条</el-descriptions-item>
            <el-descriptions-item label="最近使用">{{ selectedTpl.recentUsage || 0 }} 次</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="sr-tc-rules-sections">
          <h4 class="sr-tc-rules-title">章节列表与资料要求</h4>
          <el-table :data="selectedTplDetailSections" size="small" stripe class="sr-tc-rules-table" :header-cell-style="{ background: '#fafbfd', color: '#64748b', fontWeight: 600, fontSize: '12px' }">
            <el-table-column label="章节" min-width="120"><template #default="{ row }"><span class="sr-rule-name">{{ row.name }}</span></template></el-table-column>
            <el-table-column label="是否必填" width="80" align="center"><template #default="{ row }"><el-tag size="small" :type="row.required === '是' ? 'primary' : 'info'">{{ row.required }}</el-tag></template></el-table-column>
            <el-table-column label="所需资料" min-width="120"><template #default="{ row }"><span class="sr-rule-mats">{{ row.materials }}</span></template></el-table-column>
            <el-table-column label="生成规则" min-width="140"><template #default="{ row }"><span class="sr-rule-gen">{{ row.genRule }}</span></template></el-table-column>
            <el-table-column label="状态" width="80" align="center"><template #default="{ row }"><el-tag size="small" :type="row.ruleStatus === '已配置' ? 'success' : row.ruleStatus === '待确认' ? 'warning' : 'danger'">{{ row.ruleStatus }}</el-tag></template></el-table-column>
          </el-table>
        </div>
        <div class="sr-tc-rules-sections sr-tc-rules-forbidden">
          <h4 class="sr-tc-rules-title">禁用词规则</h4>
          <div class="sr-tc-rules-forbidden-list">
            <span v-for="(fw, fi) in selectedTplForbiddenWords" :key="fi" class="sr-forbidden-tag">{{ fw }}</span>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 上传新版模板 -->
    <div v-if="view === 'templateUpload'" class="sr-template-upload">
      <!-- 页面顶部 -->
      <div class="sr-tu__top-bar">
        <div class="sr-tu__top-left">
          <el-button size="small" text @click="view = 'templateCenter'">
            <el-icon><ArrowLeft /></el-icon> 返回模板中心
          </el-button>
          <div class="sr-tu__top-title-group">
            <h2 class="sr-tu__title">上传新版模板</h2>
            <p class="sr-tu__sub">上传 Word/PDF 模板，AI 将解析章节结构、资料要求、生成规则和禁用词。</p>
          </div>
        </div>
      </div>

      <!-- 主体：上传区 + AI 解析结果 -->
      <div class="sr-tu__body">
        <div class="sr-tu__upload-zone">
          <el-card shadow="never" class="sr-tu-card">
            <template #header><span class="sr-tu-card-title">1. 上传模板文件</span></template>
            <div class="sr-tu-upload-area" @click="simulateTplUpload" :class="{ 'sr-tu-upload-area--done': tplUploadDone }">
              <template v-if="!tplUploadDone">
                <el-icon :size="40" color="#94a3b8"><Upload /></el-icon>
                <p class="sr-tu-upload-text">点击或拖拽上传模板文件</p>
                <p class="sr-tu-upload-hint">支持 .docx / .pdf / .doc 格式</p>
              </template>
              <template v-else>
                <el-icon :size="32" color="#10b981"><CircleCheck /></el-icon>
                <p class="sr-tu-upload-text">{{ tplFileName || '授信调查报告模板 V2025.docx' }}</p>
                <p class="sr-tu-upload-hint">上传成功，AI 正在解析...</p>
              </template>
            </div>
          </el-card>

          <el-card shadow="never" class="sr-tu-card">
            <template #header><span class="sr-tu-card-title">2. 模板基本信息</span></template>
            <el-form label-width="90px" size="small" label-position="top">
              <el-form-item label="模板名称">
                <el-input v-model="tplForm.name" placeholder="例如：浙江分行授信调查报告 V2025" />
              </el-form-item>
              <el-form-item label="所属银行/机构">
                <el-input v-model="tplForm.bank" placeholder="例如：浙江银行杭州分行" />
              </el-form-item>
              <el-form-item label="报告类型">
                <el-select v-model="tplForm.reportType" style="width:100%">
                  <el-option label="授信调查报告" value="授信调查报告" />
                  <el-option label="综合授信报告" value="综合授信报告" />
                  <el-option label="农户授信报告" value="农户授信报告" />
                  <el-option label="全景报告" value="全景报告" />
                </el-select>
              </el-form-item>
              <el-form-item label="版本号">
                <el-input v-model="tplForm.version" placeholder="例如：V2025" />
              </el-form-item>
              <el-form-item label="设为默认模板">
                <el-switch v-model="tplForm.isDefault" />
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <div class="sr-tu__parse-zone">
          <!-- AI 解析步骤 -->
          <el-card shadow="never" class="sr-tu-card">
            <template #header><span class="sr-tu-card-title">3. AI 解析进度</span></template>
            <el-steps :active="tplParseStep" align-center finish-status="success" class="sr-tu-steps">
              <el-step title="上传模板" description="文件上传" />
              <el-step title="解析章节目录" description="识别章节结构" />
              <el-step title="识别必填资料" description="资料映射" />
              <el-step title="生成章节规则" description="规则生成" />
              <el-step title="检查禁用词" description="合规检查" />
              <el-step title="保存模板" description="完成" />
            </el-steps>
          </el-card>

          <!-- AI 解析结果预览 -->
          <el-card shadow="never" class="sr-tu-card" v-if="tplParseStep >= 2">
            <template #header><span class="sr-tu-card-title">4. AI 解析结果预览</span></template>
            <div class="sr-tu-parse-summary">
              <div class="sr-tu-parse-stat">
                <span class="sr-tu-parse-stat__value">{{ tplParseResult.sections || 0 }}</span>
                <span class="sr-tu-parse-stat__label">识别章节数</span>
              </div>
              <div class="sr-tu-parse-stat">
                <span class="sr-tu-parse-stat__value">{{ tplParseResult.requiredMaterials || 0 }}</span>
                <span class="sr-tu-parse-stat__label">必填资料</span>
              </div>
              <div class="sr-tu-parse-stat">
                <span class="sr-tu-parse-stat__value">{{ tplParseResult.materialRules || 0 }}</span>
                <span class="sr-tu-parse-stat__label">资料规则</span>
              </div>
              <div class="sr-tu-parse-stat">
                <span class="sr-tu-parse-stat__value">{{ tplParseResult.forbiddenRules || 0 }}</span>
                <span class="sr-tu-parse-stat__label">禁用词规则</span>
              </div>
              <div class="sr-tu-parse-stat sr-tu-parse-stat--warn">
                <span class="sr-tu-parse-stat__value">{{ tplParseResult.pendingRules || 0 }}</span>
                <span class="sr-tu-parse-stat__label">待确认规则</span>
              </div>
            </div>

            <!-- 解析出的章节规则表 -->
            <div class="sr-tu-parse-table-wrap" v-if="tplParseStep >= 4">
              <h4 class="sr-tu-parse-title">章节规则预览</h4>
              <el-table :data="tplParseSections" size="small" stripe class="sr-tc-rules-table" :header-cell-style="{ background: '#fafbfd', color: '#64748b', fontWeight: 600, fontSize: '12px' }">
                <el-table-column label="章节" min-width="120">
                  <template #default="{ row }"><span class="sr-rule-name">{{ row.name }}</span></template>
                </el-table-column>
                <el-table-column label="是否必填" width="80" align="center">
                  <template #default="{ row }"><el-tag size="small" :type="row.required === '是' ? 'primary' : 'info'">{{ row.required }}</el-tag></template>
                </el-table-column>
                <el-table-column label="所需资料" min-width="120">
                  <template #default="{ row }"><span class="sr-rule-mats">{{ row.materials }}</span></template>
                </el-table-column>
                <el-table-column label="生成规则" min-width="140">
                  <template #default="{ row }"><span class="sr-rule-gen">{{ row.genRule }}</span></template>
                </el-table-column>
                <el-table-column label="状态" width="80" align="center">
                  <template #default="{ row }"><el-tag size="small" :type="row.ruleStatus === '已配置' ? 'success' : row.ruleStatus === '待确认' ? 'warning' : 'danger'">{{ row.ruleStatus }}</el-tag></template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>

          <!-- AI 解析建议 -->
          <el-card shadow="never" class="sr-tu-card" v-if="tplParseStep >= 3">
            <template #header><span class="sr-tu-card-title">AI 解析建议</span></template>
            <div class="sr-tu-ai-tips">
              <div v-for="(tip, ti) in tplAiTips" :key="ti" class="sr-tu-ai-tip">
                <el-icon color="#2563eb"><MagicStick /></el-icon>
                <span>{{ tip }}</span>
              </div>
            </div>
          </el-card>

          <!-- 操作按钮 -->
          <div class="sr-tu-actions">
            <el-button size="default" plain @click="view = 'templateCenter'">返回模板中心</el-button>
            <el-button size="default" plain @click="resetTplUpload()">重新上传</el-button>
            <el-button size="default" @click="saveTplAsDraft()" :disabled="tplParseStep < 5">保存为草稿</el-button>
            <el-button size="default" type="primary" @click="saveTplAndEnable()" :disabled="tplParseStep < 5">保存并启用</el-button>
          </div>
        </div>
      </div>
    </div><!-- AI 任务识别/确认页面 -->
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
                <div class="ai-message__content">
                  <div class="ai-message__bubble" v-html="renderMd(m.text)"></div>
                  <div v-if="m.quickActions && m.quickActions.length" class="sr-ai-quick-inline">
                    <el-button v-for="(qa, qi) in m.quickActions" :key="qi" size="small" plain @click="qa.handler">{{ qa.label }}</el-button>
                  </div>
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
          <el-select v-model="uploadTplId" placeholder="请选择模板" style="width:100%">
            <el-option v-for="tpl in reportTemplates" :key="tpl.id" :label="tpl.name" :value="tpl.id" />
          </el-select>
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
          <el-input v-model="uploadNote" type="textarea" :rows="2" placeholder="例如：请重点关注收入真实性章节" />
        </div>
        <div class="sr-upload__actions">
          <el-button type="primary" @click="startGenerate" :disabled="!uploadDone">生成报告草稿</el-button>
          <el-button @click="view = 'home'">取消</el-button>
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
          <el-button type="primary" @click="startGenerate">生成报告草稿</el-button>
          <el-button @click="uploadDone = false">继续上传资料</el-button>
          <el-button @click="view = 'home'">取消</el-button>
        </div>
      </div>
    </div>

    <div v-if="view === 'generating'" class="sr-generating">
      <el-card shadow="never" class="sr-generating__card">
        <el-result icon="info" title="AI 正在生成报告" sub-title="请稍候，生成过程将自动跳转" />
        <el-progress :percentage="genProgressPercent" :stroke-width="8" :show-text="true" class="sr-generating__progress" />
        <el-steps :active="genStepsActiveIndex" finish-status="success" align-center class="sr-generating__steps">
          <el-step v-for="(gs, i) in genSteps" :key="i" :title="gs.label" :description="gs.status === 'done' ? '已完成' : gs.status === 'active' ? '进行中' : '等待中'" />
        </el-steps>
      </el-card>
    </div>

    <div v-if="view === 'editor'" class="sr-editor">
      <div class="sr-editor__header">
        <el-icon class="sr-back" @click="backToHome"><ArrowLeft /></el-icon>
        <div class="sr-editor__top-info">
          <span class="sr-editor__top-name">{{ activeReport?.enterpriseName }}</span>
          <span class="sr-editor__top-report">{{ activeReport?.reportName }}</span>
          <span class="sr-editor__top-meta">模板：{{ activeReport?.templateName }} &#183; 来源：{{ activeReport?.source }} &#183; 资料完整度 {{ activeReport?.materialComplete }}%</span>
          <span v-if="activeReport?.pendingCount" class="sr-editor__top-pending">待确认：{{ activeReport.pendingCount }} 项</span>
          <el-tag v-if="activeReport?.status" size="small" :type="statusTagType(activeReport?.status)">{{ activeReport?.status }}</el-tag>
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
              <el-tag size="small" :type="statusTagType(currentSection.status)">{{ currentSection.status }}</el-tag>
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
                <el-input v-model="editText" type="textarea" :rows="12" />
                <div class="sr-sec-edit__actions">
                  <el-button type="primary" @click="saveEdit">保存</el-button>
                  <el-button @click="cancelEdit">取消</el-button>
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
                <!-- 每章正文下方：可展开证据链 -->
                <section ref="sectionEvidenceRef" class="sr-section-evidence-collapsed">
                  <el-collapse v-model="openEvidenceKeys">
                    <el-collapse-item :title="`本章证据链（已关联 ${currentSectionMaterials.length} 份资料）`" :name="'evidence-' + currentSection.id">
                      <div v-if="currentSectionMaterials.length === 0" class="sr-section-evidence__empty">
                        本章暂无关联资料，建议补充资料或转入尽调补充。
                      </div>
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
                    </el-collapse-item>
                  </el-collapse>
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
                      <div class="sr-ai-first-msg__section-info">
                        <span class="sr-ai-first-msg__name">《{{ currentSection.title }}》</span>
                        <span class="sr-ai-first-msg__status">
                          <el-tag size="small" :type="currentSection.status === '待确认' ? 'warning' : 'success'">{{ currentSection.status }}</el-tag>
                        </span>
                        <span class="sr-ai-first-msg__evidence">关联证据 {{ currentSectionMaterials.length }} 条</span>
                      </div>
                      <div class="sr-ai-first-msg__suggestion">
                        <span class="sr-ai-first-msg__suggestion-label">AI 建议：</span>{{ getSectionAiSuggestion(currentSection) }}
                      </div>
                    </template>
                    <template v-else>已打开报告，请选择左侧章节查看内容。</template>
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
import { ArrowLeft, Upload, CircleCheck, Close, Document, MagicStick, DataAnalysis, EditPen, DocumentCopy, Setting } from '@element-plus/icons-vue'
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

// === Template center extended data (local, not in mock) ===
const templateCenterRows = ref([
  { id: 'tpl-001', name: '单一客户授信调查报告通用版 V2021', bank: '浙江银行总行', reportType: '授信调查', sectionsCount: 12, requiredMaterials: 10, status: '启用', isDefault: true, forbiddenWords: 8, recentUsage: 45 },
  { id: 'tpl-002', name: '浙江分行授信调查报告 V2024', bank: '浙江分行', reportType: '授信调查', sectionsCount: 16, requiredMaterials: 12, status: '草稿', isDefault: false, forbiddenWords: 8, recentUsage: 23 },
  { id: 'tpl-003', name: '企业全景报告模板 V2', bank: '公司金融部', reportType: '全景报告', sectionsCount: 10, requiredMaterials: 8, status: '启用', isDefault: false, forbiddenWords: 6, recentUsage: 12 },
  { id: 'tpl-004', name: '企业诊断报告模板 V1', bank: '风险管理部门', reportType: '诊断报告', sectionsCount: 8, requiredMaterials: 6, status: '启用', isDefault: false, forbiddenWords: 5, recentUsage: 31 },
  { id: 'tpl-005', name: '宁波银行单户授信调查报告 V2023', bank: '宁波银行', reportType: '授信调查', sectionsCount: 14, requiredMaterials: 11, status: '启用', isDefault: false, forbiddenWords: 7, recentUsage: 18 },
  { id: 'tpl-006', name: '工商银行浙江分行授信调查报告 V2024', bank: '工商银行浙江分行', reportType: '授信调查', sectionsCount: 15, requiredMaterials: 13, status: '草稿', isDefault: false, forbiddenWords: 9, recentUsage: 8 },
  { id: 'tpl-007', name: '建设银行浙江分行综合授信报告 V2023', bank: '建设银行浙江分行', reportType: '综合授信', sectionsCount: 18, requiredMaterials: 15, status: '启用', isDefault: false, forbiddenWords: 10, recentUsage: 15 },
  { id: 'tpl-008', name: '农业银行宁波分行农户授信报告 V2024', bank: '农业银行宁波分行', reportType: '农户授信', sectionsCount: 9, requiredMaterials: 7, status: '启用', isDefault: false, forbiddenWords: 4, recentUsage: 27 },
  { id: 'tpl-009', name: '江苏银行南京分行授信调查报告 V2022', bank: '江苏银行南京分行', reportType: '授信调查', sectionsCount: 13, requiredMaterials: 10, status: '启用', isDefault: false, forbiddenWords: 7, recentUsage: 9 },
  { id: 'tpl-010', name: '上海银行浦东支行授信调查报告 V2024', bank: '上海银行浦东支行', reportType: '授信调查', sectionsCount: 11, requiredMaterials: 9, status: '草稿', isDefault: false, forbiddenWords: 6, recentUsage: 3 },
]);

// === Template detail sections (local mock) ===
const tplDetailSectionData = [
  { name: '申请人基本信息', required: '是', materials: '工商资料、营业执照', genRule: '按工商登记信息生成，不做风险判断', ruleStatus: '已配置' },
  { name: '股权结构及历史沿革', required: '是', materials: '工商变更记录、股东名册', genRule: '需说明重要变更和实控人情况', ruleStatus: '待确认' },
  { name: '收入真实性核实', required: '是', materials: '税票、银行流水、合同、发票', genRule: '必须引用证据，结论需审慎表达', ruleStatus: '缺资料规则' },
  { name: '主要风险分析', required: '是', materials: '风险清单、诉讼信息、征信资料', genRule: '禁止无证据风险结论', ruleStatus: '已配置' },
  { name: '财务状况分析', required: '是', materials: '财务报表、审计报告、纳税证明', genRule: '对比近三年数据，标注异常波动', ruleStatus: '已配置' },
  { name: '授信方案建议', required: '是', materials: '授信申请、担保方案、还款来源', genRule: '综合风险评估后生成授信建议', ruleStatus: '待确认' },
  { name: '担保与抵押物评估', required: '否', materials: '抵押物评估报告、权属证明', genRule: '按评估价折算，说明担保充分性', ruleStatus: '已配置' },
  { name: '调查结论', required: '是', materials: '全部章节汇总', genRule: '综合前述分析给出最终结论', ruleStatus: '已配置' },
];

const tplForbiddenWordsData = [
  '保证盈利', '无风险', '确定收益', '绝对安全', '保本', '无诉讼风险', '资金链无隐患', '经营状况良好'
];

// === Upload template parse mock data ===
const tplUploadSectionData = [
  { name: '申请人基本信息', required: '是', materials: '工商资料、营业执照、法人身份证', genRule: '按工商登记信息生成，不做风险判断', ruleStatus: '已配置' },
  { name: '股权结构及历史沿革', required: '是', materials: '工商变更记录、股东名册', genRule: '需说明重要变更和实控人情况', ruleStatus: '待确认' },
  { name: '收入真实性核实', required: '是', materials: '税票、银行流水、合同、发票', genRule: '必须引用证据，结论需审慎表达', ruleStatus: '缺资料规则' },
  { name: '主要风险分析', required: '是', materials: '风险清单、诉讼信息、征信资料', genRule: '禁止无证据风险结论', ruleStatus: '已配置' },
  { name: '授信方案建议', required: '是', materials: '授信申请、担保方案、还款来源', genRule: '综合风险评估后生成授信建议', ruleStatus: '待确认' },
];

const tplUploadAiTips = [
  '已识别到 16 个章节，其中 4 个章节涉及授信审批关键判断。',
  '收入真实性核实章节缺少明确的银行流水要求，建议补充为必填资料。',
  '主要风险分析章节建议增加禁用规则：禁止无证据下结论。',
  '调查结论与授信方案章节建议设置为强制人工确认。',
];

// Template center

const showTplRules = ref(false)
const selectedTpl = ref(null)

// === Filter state for template center ===
const templateKeyword = ref("")
const templateBankFilter = ref("")
const templateTypeFilter = ref("")
const templateStatusFilter = ref("")
const tplDetailScrollTarget = ref("")

// === New template dialog ===
const showNewTplDialog = ref(false)
const newTplForm = ref({ name: "", bank: "", reportType: "���ŵ���", version: "", isDefault: false, createMode: "blank" })


// === Missing functions for template center ===
function viewTemplateRules(row) {
  selectedTpl.value = row
  showTplRules.value = true
}

function setAsDefault(id) {
  const row = templateCenterRows.value.find(t => t.id === id)
  if (!row) return
  templateCenterRows.value.forEach(t => { t.isDefault = false })
  row.isDefault = true
  ElMessage.success('已设置为默认模板')
}

function goToTemplateUpload(row = null) {
  if (row) {
    uploadFromTemplateId.value = row.id
    tplForm.value.name = row.name
    tplForm.value.bank = row.bank || ''
    tplForm.value.reportType = row.reportType || '授信调查报告'
    tplForm.value.version = ''
    tplForm.value.isDefault = row.isDefault || false
  } else {
    uploadFromTemplateId.value = null
    tplForm.value = { name: '', bank: '', reportType: '授信调查报告', version: '', isDefault: false }
  }
  resetTplUpload()
  view.value = 'templateUpload'
}

function simulateTplUpload() {
  if (tplUploadDone.value) return
  tplUploadDone.value = true
  tplFileName.value = '授信调查报告模板 V2025.docx'
  let step = 0
  const timer = setInterval(() => {
    step++
    tplParseStep.value = step
    if (step >= 6) {
      clearInterval(timer)
      tplParseResult.value = { sections: 16, requiredMaterials: 12, materialRules: 24, forbiddenRules: 8, pendingRules: 3 }
      tplParseSections.value = tplUploadSectionData.map(s => ({ ...s }))
      tplAiTips.value = tplUploadAiTips
    }
  }, 600)
}

function resetTplUpload() {
  tplUploadDone.value = false
  tplFileName.value = ''
  tplParseStep.value = 0
  tplParseResult.value = { sections: 0, requiredMaterials: 0, materialRules: 0, forbiddenRules: 0, pendingRules: 0 }
  tplAiTips.value = []
  tplParseSections.value = []
}

function saveTplAsDraft() {
  if (!tplForm.value.name) { ElMessage.warning('请填写模板名称'); return }
  const newRow = {
    id: 'tpl-' + Date.now(),
    name: tplForm.value.name,
    bank: tplForm.value.bank,
    reportType: tplForm.value.reportType,
    sectionsCount: tplParseResult.value.sections,
    requiredMaterials: tplParseResult.value.requiredMaterials,
    status: '草稿',
    isDefault: tplForm.value.isDefault,
    forbiddenWords: tplParseResult.value.forbiddenRules,
    recentUsage: 0,
  }
  templateCenterRows.value.push(newRow)
  ElMessage.success('模板已保存为草稿')
  view.value = 'templateCenter'
  selectedTpl.value = newRow
  if (tplForm.value.isDefault) {
    templateCenterRows.value.forEach(t => { t.isDefault = false })
    newRow.isDefault = true
  }
}

function saveTplAndEnable() {
  if (!tplForm.value.name) { ElMessage.warning('请填写模板名称'); return }
  const newRow = {
    id: 'tpl-' + Date.now(),
    name: tplForm.value.name,
    bank: tplForm.value.bank,
    reportType: tplForm.value.reportType,
    sectionsCount: tplParseResult.value.sections,
    requiredMaterials: tplParseResult.value.requiredMaterials,
    status: '启用',
    isDefault: tplForm.value.isDefault,
    forbiddenWords: tplParseResult.value.forbiddenRules,
    recentUsage: 0,
  }
  templateCenterRows.value.push(newRow)
  ElMessage.success('模板已保存并启用')
  view.value = 'templateCenter'
  selectedTpl.value = newRow
  if (tplForm.value.isDefault) {
    templateCenterRows.value.forEach(t => { t.isDefault = false })
    newRow.isDefault = true
  }
}

function selectTemplate(row) {
  selectedTpl.value = row
}

function openNewTplDialog() {
  newTplForm.value = { name: '', bank: '', reportType: '授信调查', version: '', isDefault: false, createMode: 'blank' }
  showNewTplDialog.value = true
}

function confirmNewTemplate() {
  if (!newTplForm.value.name) { ElMessage.warning('请填写模板名称'); return }
  const isCopy = newTplForm.value.createMode === 'copy' && selectedTpl.value
  const newRow = {
    id: 'tpl-' + Date.now(),
    name: newTplForm.value.name,
    bank: newTplForm.value.bank,
    reportType: newTplForm.value.reportType,
    sectionsCount: isCopy ? selectedTpl.value.sectionsCount : 0,
    requiredMaterials: isCopy ? selectedTpl.value.requiredMaterials : 0,
    status: '草稿',
    isDefault: newTplForm.value.isDefault,
    forbiddenWords: isCopy ? selectedTpl.value.forbiddenWords : 0,
    recentUsage: 0,
  }
  if (newTplForm.value.isDefault) {
    templateCenterRows.value.forEach(t => { t.isDefault = false })
  }
  templateCenterRows.value.push(newRow)
  ElMessage.success('模板已创建')
  showNewTplDialog.value = false
  selectedTpl.value = newRow
  if (newTplForm.value.createMode === 'upload') {
    goToTemplateUpload(newRow)
  }
}

function generateReportFromTpl(row) {
  ElMessage.info('正在用【' + row.name + '】生成报告...')
  view.value = 'taskDialog'
  startTaskDialog('使用【' + row.name + '】为明达精工有限公司生成授信调查报告，并检查缺失材料')
}

const allBanks = computed(() => [...new Set(templateCenterRows.value.map(t => t.bank))].sort())
const allReportTypes = computed(() => [...new Set(templateCenterRows.value.map(t => t.reportType))].sort())

const filteredTemplateRows = computed(() => {
  let rows = templateCenterRows.value
  if (templateKeyword.value) {
    const kw = templateKeyword.value.toLowerCase()
    rows = rows.filter(t => t.name.toLowerCase().includes(kw) || (t.bank || '').toLowerCase().includes(kw) || (t.reportType || '').toLowerCase().includes(kw))
  }
  if (templateBankFilter.value) {
    rows = rows.filter(t => t.bank === templateBankFilter.value)
  }
  if (templateTypeFilter.value) {
    rows = rows.filter(t => t.reportType === templateTypeFilter.value)
  }
  if (templateStatusFilter.value) {
    rows = rows.filter(t => t.status === templateStatusFilter.value)
  }
  return rows
})

const selectedTemplateEvidenceRows = computed(() => {
  return [
    { name: '工商资料', purpose: '申请人基本信息', source: '工商查询', status: '已映射', note: '用于生成企业基本信息章节' },
    { name: '营业执照', purpose: '申请人基本信息', source: '资料识别', status: '已映射', note: '用于核验企业名称、统一社会信用代码' },
    { name: '工商变更记录', purpose: '股权结构及历史沿革', source: '工商查询', status: '已映射', note: '用于说明重要变更和实控人情况' },
    { name: '税票数据', purpose: '收入真实性核实', source: '税票采集', status: '待确认', note: '需要确认近12个月范围' },
    { name: '银行流水', purpose: '收入真实性核实', source: '用户上传', status: '缺规则', note: '模板未明确流水期间要求' },
    { name: '征信授权', purpose: '信用状况', source: '用户上传', status: '已映射', note: '用于核验信用状况' },
    { name: '财务报表', purpose: '财务状况分析', source: '用户上传', status: '已映射', note: '对比近三年数据，标注异常波动' },
    { name: '授信申请', purpose: '授信方案建议', source: '用户上传', status: '待确认', note: '需确认授信额度和期限' },
  ]
})

// Upload template state
const tplUploadDone = ref(false)
const tplFileName = ref('')
const tplParseStep = ref(0)
const tplForm = ref({ name: '', bank: '', reportType: '授信调查报告', version: '', isDefault: false })
const tplParseResult = ref({ sections: 0, requiredMaterials: 0, materialRules: 0, forbiddenRules: 0, pendingRules: 0 })
const tplAiTips = ref([])
const tplParseSections = ref([])
const uploadFromTemplateId = ref(null)

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
  // 维护模板 -> templateCenter
  if (card.type === '维护报告模板') {
    view.value = 'templateCenter'
    return
  }
  // 按新模板生成 -> editor + showRegenDialog
  if (card.type === '按模板重新生成报告') {
    assistantCollapsed.value = false
    ElMessage.info('任务已创建，正在打开报告详情...')
    if (reportTasks.length) openReport(reportTasks[0], 'regen-template')
    return
  }
  // 继续修改报告 -> editor + position pending
  if (card.type === '继续修改报告') {
    assistantCollapsed.value = false
    ElMessage.info('任务已创建，正在打开报告详情...')
    if (reportTasks.length) openReport(reportTasks[0], 'continue-edit')
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

const genProgressPercent = computed(() => {
  if (!genSteps.value.length) return 0
  const done = genSteps.value.filter(s => s.status === 'done').length
  return Math.round((done / genSteps.value.length) * 100)
})

const genStepsActiveIndex = computed(() => {
  if (!genSteps.value.length) return 0
  const activeIdx = genSteps.value.findIndex(s => s.status === 'active')
  if (activeIdx >= 0) return activeIdx
  return genSteps.value.length
})

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

const openEvidenceKeys = ref([])

function selectSection(id) {
  activeSectionId.value = id
  openEvidenceKeys.value = ['evidence-' + id]
  updateAiFirstMessage()
  aiRewriteCard.value = null
}

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
  assistantCollapsed.value = false
  updateAiFirstMessage()
  view.value = 'editor'
}

function backToHome() { view.value = 'home'; activeReport.value = null }

// === Template center computed ===
const selectedTplDetailSections = computed(() => {
  return tplDetailSectionData;
});

const selectedTplForbiddenWords = computed(() => {
  return tplForbiddenWordsData;
});

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
const assistantCollapsed = ref(false)

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

// ════════════════════════════════════════
// 当前章节 AI 修改建议
// ════════════════════════════════════════
function getSectionAiSuggestion(section) {
  if (!section) return ''
  if (section.materialStatus === '资料不足' || section.materialStatus === '部分缺失') {
    return '本节资料不完整，建议先补充关键资料，再生成正式表述。'
  }
  if (section.status === '待确认') {
    return '本节存在待确认内容，建议重点核对事实依据、金额、时间和结论表述。'
  }
  return '本节结构基本完整，建议优化表述口径，补充资料来源和调查判断。'
}

function updateAiFirstMessage() {
  const sec = currentSection.value
  const matCount = currentSectionMaterials.value.length
  if (!sec) {
    aiMsgs.value = [{ role: 'ai', text: '已打开报告，请选择左侧章节查看内容。' }]
    return
  }
  const suggestion = getSectionAiSuggestion(sec)
  aiMsgs.value = [{ role: 'ai', text: `已打开《${activeReport.value?.enterpriseName || ''} - ${activeReport.value?.reportName || ''}》。当前章节为《${sec.title}》，本节已生成，关联证据 ${matCount} 条。AI 建议：${suggestion}` }]
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
.sr-page {
  height: 100vh;
  min-height: 0;
  padding: 20px 28px;
  max-width: 1440px;
  margin: 0 auto;
  overflow-y: auto;
  /* 设为 flex 容器，让 .sr-template-center / .sr-template-upload 的 flex: 1 生效 */
  display: flex;
  flex-direction: column;
}

/* ═══ 首页 ═══ */
.sr-home { max-width: var(--layout-page-default); margin: 0 auto; }
.sr-home__header { margin-bottom: var(--space-xl); }
.sr-home__title { font-size: var(--font-size-workbench-title); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin: 0 0 var(--space-2xs); }
.sr-home__subtitle { font-size: var(--font-size-sm); color: var(--text-tertiary); margin: 0; line-height: var(--line-height-relaxed); }

/* AI 输入卡片 */
.sr-home__ai-input-card { margin-bottom: var(--space-md); }
.sr-home__ai-label { font-size: var(--font-size-body); font-weight: var(--font-weight-medium); color: var(--text-primary); margin: 0 0 var(--space-sm); }
.sr-home__ai-input-row { margin-bottom: var(--space-2xs); }
.sr-home__ai-chips { display: flex; flex-wrap: wrap; gap: var(--space-2xs); }

/* 四项核心能力 */
.sr-home__capabilities { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-md); }
.sr-cap-card { cursor: pointer; transition: border-color var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out); padding: var(--space-md) !important; }
.sr-cap-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
.sr-cap-card__icon { font-size: 24px; margin-bottom: var(--space-2xs); display: flex; align-items: center; justify-content: center; color: var(--color-primary); }
.sr-cap-card__title { font-size: var(--font-size-body); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-2xs); }
.sr-cap-card__desc { font-size: var(--font-size-xs); color: var(--text-tertiary); line-height: var(--line-height-relaxed); }

/* 最近报告 */
.sr-home__recent-header { font-size: var(--font-size-body); font-weight: var(--font-weight-semibold); color: var(--text-primary); }

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

.sr-back { cursor: pointer; font-size: 18px; color: var(--text-tertiary); }
.sr-back:hover { color: var(--color-primary); }

/* ═══ 上传态 ═══ */
.sr-upload { max-width: 800px; margin: 0 auto; }
.sr-upload__bar { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
.sr-upload__title { font-size: var(--font-size-xl); font-weight: 600; color: var(--text-primary); }
.sr-upload__panel { background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-xl) 24px; display: flex; flex-direction: column; gap: var(--space-lg); }
.sr-upload__step { display: flex; flex-direction: column; gap: var(--space-sm); }
.sr-upload__label { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
.sr-upload__drop { border: 2px dashed var(--border-default); border-radius: var(--radius-md); padding: 32px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); color: var(--text-tertiary); transition: border-color .15s; }
.sr-upload__drop:hover { border-color: var(--color-primary); color: var(--color-primary); }
.sr-upload__hint { font-size: var(--font-size-xs); }
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
.sr-generating__card {
  max-width: 640px;
  width: 100%;
  padding: 32px;
  background: var(--el-bg-color, var(--surface-card, #fff));
  border: 1px solid var(--el-border-color-light, var(--border-default));
  border-radius: var(--el-border-radius-base, var(--radius-lg));
  text-align: center;
}
.sr-generating__progress { margin: 20px 0 24px; }
.sr-generating__steps { margin-top: 8px; }

/* ═══ 三栏编辑器 ═══ */
.sr-editor { display: flex; flex-direction: column; height: calc(100vh - 140px); }
.sr-editor__header { display: flex; align-items: center; gap: var(--space-md); background: var(--surface-card); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-md) 20px; margin-bottom: var(--space-md); flex-shrink: 0; flex-wrap: wrap; }
.sr-editor__top-info { flex: 1; display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; min-width: 0; }
.sr-editor__top-name { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); }
.sr-editor__top-report { font-size: var(--font-size-body); color: var(--text-secondary); }
.sr-editor__top-meta { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.sr-editor__top-pending { font-size: var(--font-size-xs); padding: 2px 6px; background: var(--color-warning-bg); color: var(--color-warning); border-radius: var(--radius-sm); }
.sr-editor__actions { margin-left: auto; display: flex; gap: var(--space-xs); flex-wrap: wrap; }

.sr-editor__body { display: grid; grid-template-columns: 240px minmax(0, 1fr) 360px; gap: var(--space-md); flex: 1; min-height: 0; overflow: hidden; }

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
.sr-ai-quick-inline { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-light); }

.ai-message__content {
  max-width: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-message--ai .ai-message__content {
  align-items: flex-start;
}

.ai-message--user .ai-message__content {
  align-items: flex-end;
}

.ai-message__bubble {
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* AI 第一条消息 - 章节信息 */
.sr-ai-first-msg__section-info { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 6px; }
.sr-ai-first-msg__name { font-weight: 600; color: var(--text-primary); font-size: 13px; }
.sr-ai-first-msg__status { margin-left: 4px; }
.sr-ai-first-msg__evidence { font-size: 12px; color: var(--text-tertiary); }
.sr-ai-first-msg__suggestion { font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 4px; }
.sr-ai-first-msg__suggestion-label { color: var(--color-primary); font-weight: 600; }

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
.sr-task-workspace { max-width: 1360px; margin: 0 auto; }
.sr-task-workspace__header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
.sr-task-workspace__header-title h2 { font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
.sr-task-workspace__header-title p { font-size: 13px; color: var(--text-tertiary); margin: 0; }
.sr-task-workspace__body { display: grid; grid-template-columns: minmax(560px, 1fr) minmax(380px, 420px); gap: 20px; height: calc(100vh - 160px); overflow: hidden; }
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
.sr-section-evidence-collapsed { margin-top: 24px; }
.sr-section-evidence-collapsed :deep(.el-collapse) { border: none; }
.sr-section-evidence-collapsed :deep(.el-collapse-item__header) {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.sr-section-evidence-collapsed :deep(.el-collapse-item__wrap) {
  border: 1px solid var(--border-default);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  background: var(--surface-card);
}
.sr-section-evidence-collapsed :deep(.el-collapse-item__content) { padding: 12px 16px; }
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
.ai-assistant-panel__header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.ai-assistant-panel__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); }

@media (max-width: 1200px) {
  .sr-task-workspace__body {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
}

/* ===== Template Center ===== */
.sr-template-center {
  max-width: 1200px;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.sr-tc__top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}
.sr-tc__top-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.sr-tc__title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}
.sr-tc__sub {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

/* 筛选区 */
.sr-tc__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #dbe7f5;
  border-radius: 8px;
  flex-wrap: wrap;
}
.sr-tc-filter__actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

/* 左右布局 */
.sr-tc__layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 左侧模板列表 */
.sr-tc__sidebar {
  background: #fff;
  border: 1px solid #dbe7f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}
.sr-tc__sidebar-title {
  padding: 12px 16px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  border-bottom: 1px solid #f1f5f9;
}
.sr-tc__sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.sr-tc-sidebar-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background .15s;
  margin-bottom: 4px;
}
.sr-tc-sidebar-item:hover {
  background: #f8fafc;
}
.sr-tc-sidebar-item.active {
  background: #eef2ff;
  border: 1px solid #dbe7f5;
}
.sr-tc-sidebar-item__name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sr-tc-sidebar-item__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}
.sr-tc-sidebar-empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

/* 右侧详情 */
.sr-tc__detail {
  background: #fff;
  border: 1px solid #dbe7f5;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  min-height: 0;
  max-height: calc(100vh - 280px);
}
.sr-tc-detail__info-card {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}
.sr-tc-detail__info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.sr-tc-detail__info-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
}
.sr-tc-detail__info-tags {
  display: flex;
  gap: 4px;
}
.sr-tc-detail__info-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 16px;
  margin-bottom: 12px;
}
.sr-tc-detail__info-row {
  font-size: 13px;
  color: #64748b;
}
.sr-tc-detail__info-label {
  color: #94a3b8;
  margin-right: 4px;
}
.sr-tc-detail__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 详情区块 */
.sr-tc-detail__section {
  margin-bottom: 16px;
}
.sr-tc-detail__section-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.sr-tc-detail__evidence {
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.sr-tc-detail__evidence-desc {
  margin: 0 0 10px;
  font-size: 12px;
  color: #94a3b8;
}
.sr-tc-detail__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 14px;
  color: #94a3b8;
}

/* Template rules drawer */
.sr-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sr-drawer-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
}
.sr-tc-rules {
  padding: 4px 0;
}
.sr-tc-rules-info {
  margin-bottom: 16px;
}
.sr-tc-rules-sections {
  margin-bottom: 16px;
}
.sr-tc-rules-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.sr-tc-rules-table {
  width: 100%;
}
.sr-rule-name {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a2e;
}
.sr-rule-mats {
  font-size: 12px;
  color: #64748b;
}
.sr-rule-gen {
  font-size: 12px;
  color: #64748b;
}
.sr-tc-rules-forbidden {
  margin-top: 16px;
}
.sr-tc-rules-forbidden-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sr-forbidden-tag {
  padding: 3px 10px;
  border-radius: 999px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
}

/* ===== Template Upload View ===== */
.sr-template-upload {
  max-width: 1200px;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.sr-tu__top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.sr-tu__top-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.sr-tu__title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}
.sr-tu__sub {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
.sr-tu__body {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: start;
  flex: 1;
  min-height: 0;
}
.sr-tu__upload-zone {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sr-tu__parse-zone {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sr-tu-card {
  border: 1px solid #dbe7f5;
  border-radius: 8px;
}
.sr-tu-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #dbe7f5;
}
.sr-tu-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.sr-tu-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  border: 2px dashed #dbe7f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 180px;
}
.sr-tu-upload-area:hover {
  border-color: #2563eb;
  background: #eef2ff;
}
.sr-tu-upload-area--done {
  border-color: #10b981;
  background: #ecfdf5;
}
.sr-tu-upload-text {
  margin: 12px 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.sr-tu-upload-hint {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}
.sr-tu-steps {
  margin: 8px 0;
}
.sr-tu-parse-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.sr-tu-parse-stat {
  text-align: center;
  padding: 12px 8px;
  background: #f7faff;
  border-radius: 8px;
  border: 1px solid #dbe7f5;
}
.sr-tu-parse-stat--warn {
  background: #fffbeb;
  border-color: #fef3c7;
}
.sr-tu-parse-stat__value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #2563eb;
}
.sr-tu-parse-stat--warn .sr-tu-parse-stat__value {
  color: #d97706;
}
.sr-tu-parse-stat__label {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}
.sr-tu-parse-table-wrap {
  margin-top: 12px;
}
.sr-tu-parse-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.sr-tu-ai-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sr-tu-ai-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: #eef2ff;
  border-radius: 6px;
  font-size: 13px;
  color: #1a1a2e;
  line-height: 1.5;
}
.sr-tu-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 0;
}

</style>