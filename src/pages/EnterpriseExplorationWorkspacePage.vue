<template>
  <div class="edw-page">
    <header class="edw-topbar">
      <el-button class="edw-back-btn" circle @click="goBack" title="返回探查首页">
        <el-icon :size="14"><ArrowLeft /></el-icon>
      </el-button>
      <template v-if="creditCode">
        <div class="edw-topbar__info">
          <span class="edw-topbar__name">{{ enterprise.name }}</span>
          <span class="edw-topbar__tag">{{ enterprise.creditCode }}</span>
          <span class="edw-topbar__tag">{{ enterprise.industry }}</span>
          <span v-if="workspaceActive" class="edw-topbar__view">{{ currentViewTitle }}</span>
        </div>
      </template>
    </header>

    <!-- 阶段 A：对话优先 -->
    <div v-if="!workspaceActive" class="edw-chat-only" ref="chatRef">
      <div class="ai-message ai-message--ai" v-if="!chatMessages.length && explorationPhase === 'idle'">
        <div class="ai-message__avatar">AI</div>
        <div class="ai-message__bubble">你好！我是企业探查助手。你可以告诉我你想了解的企业，我会自动识别、检查数据覆盖、判断问题类型，然后给你探查结果。</div>
      </div>
      <div v-for="(msg, i) in chatMessages" :key="i" class="ai-message" :class="msg.role === 'ai' && msg.type !== 'engine' ? 'ai-message--ai' : (msg.role === 'user' ? 'ai-message--user' : 'ai-message--ai')">
        <template v-if="msg.role === 'ai' || msg.type === 'engine'">
          <div class="ai-message__avatar">AI</div>
        </template>
        <div class="ai-message__bubble" v-if="msg.type !== 'engine'" v-html="renderMd(msg.text)"></div>
        <div v-if="msg.type === 'engine'" class="edw-engine-card">
          <div class="edw-engine-card__header">
            <span v-if="!engineAllDone" class="edw-engine-spinner"></span>
            <div>
              <strong>AI 诊断引擎运行中</strong>
              <p>{{ enterprise.name }}</p>
            </div>
          </div>
          <div class="edw-engine-steps">
            <div v-for="step in engineSteps" :key="step.title" class="edw-engine-step" :class="'edw-engine-step--' + step.status">
              <span class="edw-engine-step__icon">
                <el-icon v-if="step.status === 'done'" :size="12" color="#22c55e"><Check /></el-icon>
                <span v-else-if="step.status === 'active'" class="edw-engine-step__dot--active"></span>
                <span v-else class="edw-engine-step__dot--pending"></span>
              </span>
              <div>
                <strong>{{ step.title }}</strong>
                <p>{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="msg.role === 'ai' && msg.actions" class="ai-message__actions">
          <el-button v-for="a in msg.actions" :key="a.label" size="small" text :type="a.type || 'primary'" @click="onMsgAction(a)">{{ a.label }}</el-button>
        </div>
        <template v-if="msg.role === 'user'">
          <div class="ai-message__avatar">我</div>
        </template>
      </div>
      <div class="edw-chat-only__input">
        <el-input
          v-model="chatInput"
          class="edw-chat-input-el"
          placeholder="输入企业名称或统一社会信用代码，或直接提问…"
          @keydown.enter.exact.prevent="sendChat"
          clearable
        />
        <el-button
          type="primary"
          :disabled="!chatInput.trim() || isExploring"
          @click="sendChat"
        >
          {{ isExploring ? '探查中' : '发送' }}
        </el-button>
      </div>
    </div>

    <!-- 阶段 B：结构化结果（左右布局） -->
    <div v-else class="edw-workspace-layout" :class="{ collapsed: chatPanelCollapsed }">
      <main class="edw-workspace-panel">
        <div class="edw-view-header">
          <h2 class="edw-view-title">{{ currentViewTitle }}</h2>
        </div>
        <div class="edw-view-content">
                    <template v-if="currentView === 'overview'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">探查结论</div>
                        <p class="edw-conclusion-text">该企业综合评分 <strong class="edw-danger">{{ mockData.score }}</strong>，评级 <strong class="edw-danger">{{ mockData.grade }}</strong>，存在 <strong>{{ mockData.riskItems?.length || 0 }}</strong> 项风险信号。建议进一步查看风险诊断详情。</p>
                      </div>
                      <div class="edw-card">
                        <h3>企业基本信息</h3>
                        <div class="edw-meta-grid">
                          <div class="edw-meta-row"><span>企业名称</span><strong>{{ enterprise.name }}</strong></div>
                          <div class="edw-meta-row"><span>信用代码</span><strong>{{ enterprise.creditCode }}</strong></div>
                          <div class="edw-meta-row"><span>行业</span><strong>{{ enterprise.industry }}</strong></div>
                          <div class="edw-meta-row"><span>法人</span><strong>{{ enterprise.legalRep }}</strong></div>
                          <div class="edw-meta-row"><span>成立年份</span><strong>{{ enterprise.establishedYear }}</strong></div>
                          <div class="edw-meta-row"><span>综合评分</span><strong :class="'edw-score--' + mockData.riskLevel">{{ mockData.score }}</strong></div>
                          <div class="edw-meta-row"><span>评级</span><strong class="edw-grade-tag" :class="'edw-grade--' + gradeColor(mockData.grade)">{{ mockData.grade }}</strong></div>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>数据覆盖情况</h3>
                        <div class="edw-coverage-summary">
                          <span class="edw-coverage-item" v-for="d in dataCoverage" :key="d.label" :class="'edw-coverage--' + d.status">{{ d.label }} {{ d.statusText }}</span>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>下一步建议</h3>
                        <ul class="edw-next-list">
                          <li>输入具体问题，如"经营情况如何"、"税负率是多少"</li>
                          <li>查看完整诊断报告，获取八大维度详细分析</li>
                          <li>查看高风险指标的证据链</li>
                        </ul>
                      </div>
                    </template>
                    <template v-if="currentView === 'ops'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">探查结论</div>
                        <p class="edw-conclusion-text">近12月营收增长 <strong class="edw-danger">188.3%</strong>，显著高于行业均值 <strong>12.5%</strong>。但购销两头在外、电费与收入不匹配，收入真实性需要核实。</p>
                      </div>
                      <div class="edw-card">
                        <h3>关键数据</h3>
                        <div class="edw-data-grid">
                          <div class="edw-data-cell"><span>收入增长</span><strong class="edw-danger">188.3%</strong></div>
                          <div class="edw-data-cell"><span>行业均值</span><strong>12.5%</strong></div>
                          <div class="edw-data-cell"><span>2025应税收入</span><strong>2275.98万</strong></div>
                          <div class="edw-data-cell"><span>申报差异</span><strong class="edw-warning">4.4%</strong></div>
                        </div>
                      </div>
                      <div class="edw-card edw-card--abnormal">
                        <h3>异常信号</h3>
                        <ul class="edw-signal-list edw-signal-list--warn">
                          <li><strong>收入增长过快</strong> — 188.3%为行业均值15倍</li>
                          <li><strong>购销两头在外</strong> — 供应商和客户均不在本地</li>
                          <li><strong>客户集中度高</strong> — 前5大客户贡献72%营收</li>
                        </ul>
                      </div>
                      <div class="edw-card-actions">
                        <el-button size="small" @click="viewEvidenceOf('R1')">查看证据链</el-button>
                        <el-button size="small" @click="aiAction('经营分析说明')">生成经营分析说明</el-button>
                        <el-button size="small" @click="aiAction('加入报告')">加入报告</el-button>
                      </div>
                    </template>
                    <template v-if="currentView === 'taxDeclarations'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">申报明细</div>
                        <p class="edw-conclusion-text">以下是 <strong>{{ enterprise.name }}</strong> 的增值税纳税申报明细（Demo数据，近12个月摘要）。</p>
                      </div>
                      <div class="edw-card">
                        <h3>申报明细表</h3>
                        <table class="edw-detail-table">
                          <thead><tr><th>申报期间</th><th>申报日期</th><th>征收项目</th><th>销售额</th><th>应纳税额</th></tr></thead>
                          <tbody>
                            <tr v-for="r in taxDeclarationRows" :key="r.periodStart"><td>{{ r.periodStart }} ~ {{ r.periodEnd }}</td><td>{{ r.submitDate }}</td><td>{{ r.project }}</td><td>{{ formatNum(r.salesAmount) }}</td><td>{{ formatNum(r.taxAmount) }}</td></tr>
                          </tbody>
                        </table>
                        <p class="edw-table-note">数据来源：增值税纳税申报系统</p>
                      </div>
                    </template>
                    <template v-if="currentView === 'shareholders'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">股东明细</div>
                        <p class="edw-conclusion-text">以下是 <strong>{{ enterprise.name }}</strong> 的股东出资信息。</p>
                      </div>
                      <div class="edw-card">
                        <h3>股东明细表</h3>
                        <table class="edw-detail-table">
                          <thead><tr><th>股东名称</th><th>证件类型</th><th>认缴金额（万元）</th><th>持股比例</th></tr></thead>
                          <tbody>
                            <tr v-for="r in shareholderRows" :key="r.name"><td>{{ r.name }}</td><td>{{ r.idType }}</td><td>{{ r.amount }}</td><td>{{ r.ratio }}%</td></tr>
                          </tbody>
                        </table>
                        <p class="edw-table-note">数据来源：工商登记信息（企业年度申报附表）</p>
                      </div>
                    </template>
                    <template v-if="currentView === 'socialSecurity'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">从业/社保概览</div>
                        <p class="edw-conclusion-text">以下是 <strong>{{ enterprise.name }}</strong> 的从业人数及社保概览信息。</p>
                      </div>
                      <div class="edw-card">
                        <h3>从业/社保概览</h3>
                        <div class="edw-meta-grid">
                          <div class="edw-meta-row"><span>从业人数</span><strong>{{ sourceData?.socialSecurity?.employeeCount || enterprise.employeeCount || '—' }}</strong></div>
                          <div class="edw-meta-row"><span>数据来源</span><strong>{{ sourceData?.socialSecurity?.note || '企业所得税申报附表' }}</strong></div>
                        </div>
                        <p v-if="sourceData?.socialSecurity?.isEstimated" class="edw-table-note" style="margin-top:8px;color:#b45309;">注：当前为从业人数概览，非完整社保费明细。</p>
                      </div>
                    </template>
                    <template v-if="currentView === 'tax'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">探查结论</div>
                        <p class="edw-conclusion-text">增值税税负率 <strong class="edw-danger">0.8%</strong>，仅为行业均值29%。纳税信用A级为正面亮点，但开票与申报差异4.4%需核实原因。</p>
                      </div>
                      <div class="edw-card">
                        <h3>税票关键数据</h3>
                        <div class="edw-data-grid">
                          <div class="edw-data-cell"><span>增值税税负率</span><strong class="edw-danger">0.8%</strong></div>
                          <div class="edw-data-cell"><span>行业均值</span><strong>2.8%</strong></div>
                          <div class="edw-data-cell"><span>开票收入</span><strong>2275.98万元</strong></div>
                          <div class="edw-data-cell"><span>申报收入</span><strong>2175.46万元（差异4.4%）</strong></div>
                          <div class="edw-data-cell"><span>进项税额</span><strong>156.8万元</strong></div>
                          <div class="edw-data-cell"><span>纳税信用等级</span><strong class="edw-success">A级</strong></div>
                        </div>
                      </div>
                      <div class="edw-card edw-card--abnormal">
                        <h3>异常信号</h3>
                        <ul class="edw-signal-list edw-signal-list--warn">
                          <li><strong>税负率显著偏低：</strong>0.8%处于行业底部5%分位</li>
                          <li><strong>开票申报差异：</strong>差异100.52万元（4.4%），需核实原因</li>
                        </ul>
                      </div>
                      <div class="edw-card-actions">
                        <el-button size="small" @click="viewEvidenceOf('R5')">查看证据链</el-button>
                        <el-button v-if="!hasTaxData" size="small" type="warning" @click="authMissing">授权税票</el-button>
                        <el-button size="small" @click="aiAction('税票分析说明')">生成专项说明</el-button>
                      </div>
                    </template>
                    <template v-if="currentView === 'risk'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">探查结论</div>
                        <p class="edw-conclusion-text">综合评分 <strong class="edw-danger">513</strong>，评级 <strong class="edw-danger">D</strong>。共 <strong>8项风险信号</strong>（高风险3项）、<strong>9项企业亮点</strong>。建议重点核实高风险事项后再推进授信。</p>
                      </div>
                      <div class="edw-card">
                        <h3>风险等级分布</h3>
                        <div class="edw-risk-summary">
                          <span class="edw-risk-badge edw-risk--high">高风险 {{ highRiskCount }}项</span>
                          <span class="edw-risk-badge edw-risk--medium">中风险 {{ mediumRiskCount }}项</span>
                          <span class="edw-risk-badge edw-risk--low">低风险 {{ lowRiskCount }}项</span>
                          <span class="edw-risk-badge edw-risk--good">企业亮点 {{ highlightCount }}项</span>
                        </div>
                      </div>
                      <div class="edw-card edw-card--abnormal">
                        <h3>高风险事项</h3>
                        <ul class="edw-signal-list edw-signal-list--danger">
                          <li v-for="ind in highRiskItems" :key="ind.id"><strong>{{ ind.name }}</strong> — {{ ind.fact }}</li>
                        </ul>
                      </div>
                      <div class="edw-card-actions">
                        <el-button size="small" v-for="ind in highRiskItems" :key="ind.id" @click="viewEvidenceOf(ind.id)">查看「{{ ind.name }}」证据链</el-button>
                        <el-button size="small" @click="pushToDD">推送尽调</el-button>
                        <el-button size="small" @click="aiAction('风险说明')">生成风险说明</el-button>
                      </div>
                    </template>
                    <template v-if="currentView === 'fraud'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">探查结论</div>
                        <p class="edw-conclusion-text">三项欺诈信号叠加：<strong>购销两头在外</strong>、<strong>票税差异</strong>、<strong>电费与收入不匹配</strong>。三者匹配度低，业务真实性需重点核实。</p>
                      </div>
                      <div class="edw-card edw-card--abnormal">
                        <h3>欺诈 / 真实性信号</h3>
                        <ul class="edw-signal-list edw-signal-list--danger">
                          <li><strong>购销两头在外：</strong>主要供应商和客户均在外地，物流与资金流匹配存疑</li>
                          <li><strong>票税差异：</strong>开票收入2275.98万 vs 申报收入2175.46万，差异4.4%</li>
                          <li><strong>电费与收入不匹配：</strong>相关性仅0.18，远低于正常值0.6+</li>
                          <li><strong>短期营收暴增：</strong>同比增长188.3%，为行业均值15倍</li>
                        </ul>
                      </div>
                      <div class="edw-card">
                        <h3>票税流分析</h3>
                        <div class="edw-data-grid">
                          <div class="edw-data-cell"><span>票（开票收入）</span><strong>2275.98万元</strong></div>
                          <div class="edw-data-cell"><span>税（增值税税负率）</span><strong class="edw-danger">0.8%</strong></div>
                          <div class="edw-data-cell"><span>流（电费相关性）</span><strong class="edw-danger">0.18</strong></div>
                        </div>
                        <p class="edw-fraud-note">三者匹配度低，建议发起真实性核验尽调。</p>
                      </div>
                      <div class="edw-card-actions">
                        <el-button size="small" @click="viewEvidenceOf('R2')">查看证据链</el-button>
                        <el-button size="small" @click="pushToDD">发起真实性核验尽调</el-button>
                        <el-button size="small" @click="aiAction('欺诈风险说明')">生成欺诈风险说明</el-button>
                      </div>
                    </template>
                    <template v-if="currentView === 'evidence'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">探查结论</div>
                        <p class="edw-conclusion-text">已展示 <strong>3项高风险指标</strong> 的证据链，共 <strong>{{ topEvidences.length }}条核心证据</strong>，置信度75%-96%。建议逐一核实关键证据后形成判断。</p>
                      </div>
                      <div class="edw-card">
                        <h3>核心证据列表</h3>
                        <div class="edw-evidence-list">
                          <div class="edw-evidence-item" v-for="e in topEvidences" :key="e.id">
                            <div class="edw-ev-header">
                              <strong>{{ e.title }}</strong>
                              <span class="edw-ev-source">{{ e.source }}</span>
                              <span class="edw-ev-confidence">{{ Math.round(e.confidence * 100) }}%</span>
                            </div>
                            <div class="edw-ev-body">
                              <div class="edw-ev-row"><span class="edw-ev-label">数值</span>{{ e.value }}</div>
                              <div class="edw-ev-row"><span class="edw-ev-label">对比</span>{{ e.comparison }}</div>
                              <div class="edw-ev-row"><span class="edw-ev-label">采集时间</span>{{ e.collectedAt }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="edw-card-actions">
                        <el-button size="small" @click="aiAction('加入报告')">加入报告</el-button>
                      </div>
                    </template>

                    <template v-if="currentView === 'evidenceDetail'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">证据链详情</div>
                        <p class="edw-conclusion-text">以下为 <strong>{{ activeEvidenceIndicator?.name || '风险指标' }}</strong> 的完整证据链，共 <strong>{{ activeEvidenceList.length }}</strong> 条证据。</p>
                      </div>
                      <div class="edw-card">
                        <h3>数据事实</h3>
                        <div class="edw-meta-grid">
                          <div class="edw-meta-row"><span>指标名称</span><strong>{{ activeEvidenceIndicator?.name || '—' }}</strong></div>
                          <div class="edw-meta-row"><span>指标数值</span><strong>{{ activeEvidenceIndicator?.value || '—' }}</strong></div>
                          <div class="edw-meta-row"><span>行业均值</span><strong>{{ activeEvidenceIndicator?.industryAvg || '—' }}</strong></div>
                          <div class="edw-meta-row"><span>偏离度</span><strong>{{ activeEvidenceIndicator?.deviation || '—' }}</strong></div>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>模型规则</h3>
                        <div class="edw-meta-grid">
                          <div class="edw-meta-row"><span>规则类型</span><strong>阈值偏离检测</strong></div>
                          <div class="edw-meta-row"><span>触发条件</span><strong>指标值低于行业均值50%</strong></div>
                          <div class="edw-meta-row"><span>数据来源</span><strong>{{ activeEvidenceIndicator?.dataSource || '工商/税票系统' }}</strong></div>
                        </div>
                      </div>
                      <div class="edw-card edw-card--abnormal">
                        <h3>推理结论</h3>
                        <p class="edw-conclusion-text">{{ activeEvidenceIndicator?.reasoning || '该指标显著低于行业均值，存在异常风险，建议进一步核实。' }}</p>
                      </div>
                      <div class="edw-card">
                        <h3>指标数据明细</h3>
                        <div class="edw-evidence-list">
                          <div class="edw-evidence-item" v-for="e in activeEvidenceList" :key="e.id">
                            <div class="edw-ev-header">
                              <strong>{{ e.title }}</strong>
                              <span class="edw-ev-source">{{ e.source }}</span>
                              <span class="edw-ev-confidence">{{ Math.round(e.confidence * 100) }}%</span>
                            </div>
                            <div class="edw-ev-body">
                              <div class="edw-ev-row"><span class="edw-ev-label">数值</span>{{ e.value }}</div>
                              <div class="edw-ev-row"><span class="edw-ev-label">对比</span>{{ e.comparison }}</div>
                              <div class="edw-ev-row"><span class="edw-ev-label">采集时间</span>{{ e.collectedAt }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>行动建议</h3>
                        <ul class="edw-next-list">
                          <li>核实该指标的实际经营数据</li>
                          <li>查看关联维度的交叉证据</li>
                        </ul>
                      </div>
                    </template>

                    <template v-if="currentView === 'taxPanoramaReport'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">纳税全景报告</div>
                        <p class="edw-conclusion-text">以下为 <strong>{{ enterprise.name }}</strong> 的纳税全景报告（Demo）。</p>
                      </div>
                      <div class="edw-card">
                        <h3>企业基本信息</h3>
                        <div class="edw-meta-grid">
                          <div class="edw-meta-row"><span>企业名称</span><strong>{{ enterprise.name }}</strong></div>
                          <div class="edw-meta-row"><span>信用代码</span><strong>{{ enterprise.creditCode }}</strong></div>
                          <div class="edw-meta-row"><span>行业</span><strong>{{ enterprise.industry }}</strong></div>
                          <div class="edw-meta-row"><span>纳税人类型</span><strong>{{ sourceData?.identity?.taxpayerType || '—' }}</strong></div>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>纳税概览</h3>
                        <div class="edw-data-grid">
                          <div class="edw-data-cell"><span>增值税税负率</span><strong class="edw-danger">0.8%</strong></div>
                          <div class="edw-data-cell"><span>行业均值</span><strong>2.8%</strong></div>
                          <div class="edw-data-cell"><span>开票收入</span><strong>2275.98万元</strong></div>
                          <div class="edw-data-cell"><span>申报收入</span><strong>2175.46万元</strong></div>
                          <div class="edw-data-cell"><span>进项税额</span><strong>156.8万元</strong></div>
                          <div class="edw-data-cell"><span>纳税信用</span><strong class="edw-success">A级</strong></div>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>申报明细</h3>
                        <table class="edw-detail-table">
                          <thead><tr><th>申报期间</th><th>征收项目</th><th>销售额</th><th>应纳税额</th></tr></thead>
                          <tbody>
                            <tr v-for="r in taxDeclarationRows.slice(0,6)" :key="r.periodStart"><td>{{ r.periodEnd.substring(0,7) }}</td><td>{{ r.project }}</td><td>{{ formatNum(r.salesAmount) }}</td><td>{{ formatNum(r.taxAmount) }}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="edw-card">
                        <h3>税负率分析</h3>
                        <p class="edw-conclusion-text">增值税税负率 <strong class="edw-danger">0.8%</strong>，仅为行业均值 <strong>2.8%</strong> 的29%。处于行业底部5%分位。</p>
                      </div>
                      <div class="edw-card edw-card--abnormal">
                        <h3>开票/申报差异</h3>
                        <p class="edw-conclusion-text">开票收入 <strong>2275.98万元</strong> vs 申报收入 <strong>2175.46万元</strong>，差异 <strong class="edw-warning">4.4%</strong>。</p>
                      </div>
                      <div class="edw-card edw-card--abnormal">
                        <h3>风险提示</h3>
                        <ul class="edw-signal-list edw-signal-list--warn">
                          <li><strong>税负率显著偏低</strong>：0.8%处于行业底部5%分位</li>
                          <li><strong>开票申报差异</strong>：差异4.4%，需核实</li>
                          <li><strong>纳税信用A级</strong>：正面信号</li>
                        </ul>
                      </div>
                      <div class="edw-card-actions">
                        <el-button size="small" @click="openEvidenceView('R5')">查看税负证据链</el-button>
                        <el-button size="small" @click="aiAction('生成税负专项说明')">生成专项说明</el-button>
                        <el-button size="small" @click="aiAction('加入报告')">加入报告</el-button>
                      </div>
                    </template>

                    <template v-if="currentView === 'businessReport'">
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">工商分析报告</div>
                        <p class="edw-conclusion-text">基于工商、司法和公开信息完成基础探查。补充税票或流水后，可增强税务异常和经营真实性判断。</p>
                      </div>
                      <div class="edw-card">
                        <h3>企业基本信息</h3>
                        <div class="edw-meta-grid">
                          <div class="edw-meta-row"><span>企业名称</span><strong>{{ businessDetail?.registry?.name || enterprise.name }}</strong></div>
                          <div class="edw-meta-row"><span>统一信用代码</span><strong>{{ businessDetail?.registry?.creditNo || enterprise.creditCode }}</strong></div>
                          <div class="edw-meta-row"><span>法定代表人</span><strong>{{ businessDetail?.registry?.operName || enterprise.legalRep }}</strong></div>
                          <div class="edw-meta-row"><span>成立日期</span><strong>{{ businessDetail?.registry?.startDate }}</strong></div>
                          <div class="edw-meta-row"><span>注册资本</span><strong>{{ businessDetail?.registry?.registCapi }}</strong></div>
                          <div class="edw-meta-row"><span>企业状态</span><strong class="edw-success">{{ businessDetail?.registry?.status }}</strong></div>
                          <div class="edw-meta-row"><span>行业</span><strong>{{ businessDetail?.registry?.industryName }}</strong></div>
                          <div class="edw-meta-row"><span>公司类型</span><strong>{{ businessDetail?.registry?.econKind }}</strong></div>
                          <div class="edw-meta-row"><span>注册地址</span><strong>{{ businessDetail?.registry?.address }}</strong></div>
                          <div class="edw-meta-row"><span>经营期限</span><strong>{{ businessDetail?.registry?.termStart }} 至 {{ businessDetail?.registry?.termEnd }}</strong></div>
                          <div class="edw-meta-row"><span>登记机关</span><strong>{{ businessDetail?.registry?.registeredOrg }}</strong></div>
                          <div class="edw-meta-row"><span>核准日期</span><strong>{{ businessDetail?.registry?.checkDate }}</strong></div>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>经营范围</h3>
                        <p class="edw-conclusion-text" style="line-height:1.8">{{ businessDetail?.registry?.scope || '暂无' }}</p>
                      </div>
                      <div class="edw-card">
                        <h3>税务登记信息</h3>
                        <div class="edw-meta-grid">
                          <div class="edw-meta-row"><span>行业门类</span><strong>{{ businessDetail?.taxRegistry?.mlmc }}</strong></div>
                          <div class="edw-meta-row"><span>行业小类</span><strong>{{ businessDetail?.taxRegistry?.hymc }}</strong></div>
                          <div class="edw-meta-row"><span>登记注册类型</span><strong>{{ businessDetail?.taxRegistry?.djzclx }}</strong></div>
                          <div class="edw-meta-row"><span>主管税务机关</span><strong>{{ businessDetail?.taxRegistry?.zgswjg }}</strong></div>
                          <div class="edw-meta-row"><span>从业人数</span><strong>{{ businessDetail?.taxRegistry?.cyrs }}</strong></div>
                          <div class="edw-meta-row"><span>纳税人资格</span><strong>{{ businessDetail?.taxRegistry?.nsrztdm }}</strong></div>
                        </div>
                      </div>
                      <div class="edw-card">
                        <h3>股东信息</h3>
                        <table class="edw-detail-table">
                          <thead><tr><th>股东名称</th><th>持股比例</th><th>认缴出资额</th><th>股东类型</th><th>认缴出资日期</th></tr></thead>
                          <tbody>
                            <tr v-for="s in businessDetail?.shareholders" :key="s.name"><td>{{ s.name }}</td><td>{{ s.stockRate }}</td><td>{{ s.totalShouldCapi }}</td><td>{{ s.stockType }}</td><td>{{ s.maxShouldCapiDate }}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="edw-card">
                        <h3>主要人员</h3>
                        <table class="edw-detail-table">
                          <thead><tr><th>姓名</th><th>职务</th></tr></thead>
                          <tbody>
                            <tr v-for="e in businessDetail?.employees" :key="e.name"><td>{{ e.name }}</td><td>{{ e.jobTitle }}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="edw-card">
                        <h3>变更记录（最近{{ (businessDetail?.changes || []).length }}条）</h3>
                        <table class="edw-detail-table">
                          <thead><tr><th>变更日期</th><th>变更事项</th><th>变更前</th><th>变更后</th></tr></thead>
                          <tbody>
                            <tr v-for="ch in (businessDetail?.changes || []).slice(0,5)" :key="ch.changeDate + ch.changeItem"><td>{{ ch.changeDate }}</td><td>{{ ch.changeItem }}</td><td>{{ ch.beforeContent || '—' }}</td><td>{{ ch.afterContent || '—' }}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="edw-card">
                        <h3>司法 / 经营异常</h3>
                        <template v-if="businessDetail?.abnormal?.length || businessDetail?.judicialRisks?.length">
                          <ul class="edw-signal-list edw-signal-list--warn">
                            <li v-for="r in (businessDetail?.abnormal || []).concat(businessDetail?.judicialRisks || [])" :key="r">{{ r }}</li>
                          </ul>
                        </template>
                        <template v-else>
                          <p class="edw-conclusion-text edw-success">未发现明显经营异常和司法负面记录。</p>
                        </template>
                      </div>
                      <div class="edw-card">
                        <h3>数据来源</h3>
                        <p class="edw-conclusion-text">工商登记信息来自国家企业信用信息公示系统，税务登记信息来自税务系统，公开信息截至 <strong>{{ businessDetail?.registry?.checkDate }}</strong>。</p>
                      </div>
                      <div class="edw-card-actions">
                        <el-button size="small" @click="openEvidenceView('R1')">查看证据链</el-button>
                        <el-button size="small" @click="aiAction('生成企业诊断报告')">生成企业诊断报告</el-button>
                        <el-button v-if="!hasTaxData" size="small" type="warning" @click="authMissing()">授权税票</el-button>
                        <el-button v-if="!hasFlowData" size="small" type="warning" @click="uploadFlow()">上传流水</el-button>
                      </div>
                    </template>

                    <template v-if="currentView === 'diagnosisReport'">
                      <!-- AI 综合诊断摘要 -->
                      <div class="edw-card edw-card--conclusion">
                        <div class="edw-card-label">AI 综合诊断</div>
                        <p class="edw-conclusion-text"><strong>{{ enterprise.name }}</strong> · 综合评分 <strong class="edw-danger">{{ mockData.score }}</strong> · 评级 <strong class="edw-grade-badge" :class="'edw-grade--' + gradeColor(mockData.grade)">{{ mockData.grade }}</strong> · 风险 {{ riskItems.length }} 项 · 高风险 {{ highRiskCount }} 项 · 亮点 {{ highlightCount }} 项</p>
                      </div>
                      <div class="edw-card" v-if="mockData.summary">
                        <h3>诊断摘要</h3>
                        <p class="edw-conclusion-text" style="line-height:1.8">{{ mockData.summary }}</p>
                      </div>
                      <div class="edw-card" v-if="mockData.suggestions?.length">
                        <h3>关键行动建议</h3>
                        <ul class="edw-next-list">
                          <li v-for="(s, i) in mockData.suggestions" :key="i"><strong v-if="s.level === 'critical'" class="edw-danger">【关键】</strong><strong v-else-if="s.level === 'important'" class="edw-warning">【重要】</strong>{{ s.text }}</li>
                        </ul>
                      </div>
                      <!-- 八大维度诊断结果 -->
                      <div class="edw-card">
                        <div class="edw-card-header">
                          <h3>八大维度诊断结果</h3>
                          <div class="edw-chart-tabs">
                            <button class="edw-chart-tab" :class="{ active: reportChartType === 'radar' }" @click="reportChartType = 'radar'">维度矩阵</button>
                            <button class="edw-chart-tab" :class="{ active: reportChartType === 'butterfly' }" @click="reportChartType = 'butterfly'">风险分布</button>
                            <button class="edw-chart-tab" :class="{ active: reportChartType === 'rose' }" @click="reportChartType = 'rose'">亮点分布</button>
                          </div>
                        </div>
                        <div class="edw-dim-wrap">
                          <div class="edw-dim-chart">
                            <div v-show="reportChartType === 'radar'" class="edw-radar-container">
                              <svg :viewBox="'0 0 ' + radarSize + ' ' + radarSize" class="edw-radar-svg" v-if="radarDims.length">
                                <polygon v-for="ring in [0.2, 0.4, 0.6, 0.8, 1]" :key="ring" :points="radarPoints(ring * radarRadius)" class="edw-radar-ring" />
                                <polygon :points="radarDataPoints" class="edw-radar-data" />
                                <line v-for="(pt, i) in radarLabelPositions" :key="'axis-' + i" :x1="radarCenter" :y1="radarCenter" :x2="pt.x" :y2="pt.y" class="edw-radar-axis" />
                                <circle v-for="(pt, i) in radarDataPointList" :key="'dot-' + i" :cx="pt.x" :cy="pt.y" r="4" class="edw-radar-dot" :style="{ fill: dimColor(radarDims[i].level) }" />
                                <text v-for="(lb, i) in radarLabelPositions" :key="'lbl-' + i" :x="lb.x" :y="lb.y" text-anchor="middle" dominant-baseline="middle" class="edw-radar-label">{{ radarDims[i].name.replace('维度','') }}</text>
                              </svg>
                            </div>
                            <div v-show="reportChartType === 'butterfly'" class="edw-butterfly">
                              <div class="edw-butterfly__legend">
                                <span class="edw-bf-legend"><span class="edw-bf-dot edw-bf-dot--high"></span>高</span>
                                <span class="edw-bf-legend"><span class="edw-bf-dot edw-bf-dot--medium"></span>中</span>
                                <span class="edw-bf-legend"><span class="edw-bf-dot edw-bf-dot--low"></span>低</span>
                              </div>
                              <div v-for="dim in radarDims" :key="'bf-' + dim.key" class="edw-bf-row">
                                <span class="edw-bf-label">{{ dim.name.replace('维度','') }}</span>
                                <div class="edw-bf-bars">
                                  <div class="edw-bf-bar edw-bf-bar--high" :style="{ width: (butterflyDim(dim, 'high') / maxRiskInDim * 100) + '%' }" v-if="butterflyDim(dim, 'high')"><span>{{ butterflyDim(dim, 'high') }}</span></div>
                                  <div class="edw-bf-bar edw-bf-bar--medium" :style="{ width: (butterflyDim(dim, 'medium') / maxRiskInDim * 100) + '%' }" v-if="butterflyDim(dim, 'medium')"><span>{{ butterflyDim(dim, 'medium') }}</span></div>
                                  <div class="edw-bf-bar edw-bf-bar--low" :style="{ width: (butterflyDim(dim, 'low') / maxRiskInDim * 100) + '%' }" v-if="butterflyDim(dim, 'low')"><span>{{ butterflyDim(dim, 'low') }}</span></div>
                                  <div v-if="butterflyTotal(dim) === 0" class="edw-bf-none">暂无</div>
                                </div>
                              </div>
                            </div>
                            <div v-show="reportChartType === 'rose'" class="edw-rose">
                              <div class="edw-rose__bars">
                                <div v-for="dim in radarDims" :key="'rose-' + dim.key" class="edw-rose-col" @click="toggleReportDim(dim.key)">
                                  <div class="edw-rose-val" :style="{ color: roseCount(dim) ? 'var(--color-success)' : 'var(--text-tertiary)' }">{{ roseCount(dim) }}</div>
                                  <div class="edw-rose-bar-wrap">
                                    <div class="edw-rose-bar" :style="{ height: (maxHighlightInDim > 0 ? (roseCount(dim) / maxHighlightInDim * 100) : 0) + '%' }" :class="{ 'edw-rose-bar--empty': roseCount(dim) === 0 }"></div>
                                  </div>
                                  <div class="edw-rose-label">{{ dim.name.replace('维度','') }}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="edw-dim-grid">
                            <div v-for="dim in radarDims" :key="dim.key" class="edw-dim-chip" :class="{ active: activeReportDimension === dim.key }" @click="toggleReportDim(dim.key)">
                              <div class="edw-dim-chip__top">
                                <span class="edw-dim-chip__name">{{ dim.name }}</span>
                                <span class="edw-level" :class="'edw-level--' + dim.level">{{ dimLevelText(dim.level) }}</span>
                              </div>
                              <div class="edw-dim-chip__count" v-if="reportChartType === 'butterfly'">{{ butterflyTotal(dim) }} 项风险</div>
                              <div class="edw-dim-chip__count" v-else-if="reportChartType === 'rose'">{{ roseCount(dim) }} 项亮点</div>
                              <div class="edw-dim-chip__count" v-else>评分 {{ dim.score }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- 核心风险和亮点 -->
                      <div class="edw-card" v-if="mockData.riskItems?.length || mockData.highlightItems?.length">
                        <h3>核心风险和亮点</h3>
                        <div class="edw-indicator-toolbar">
                          <div class="edw-tabs">
                            <button class="edw-tab" :class="{ active: reportIndicatorTab === 'risk' }" @click="setReportTab('risk')">风险事项 ({{ riskItems.length }})</button>
                            <button class="edw-tab" :class="{ active: reportIndicatorTab === 'highlight' }" @click="setReportTab('highlight')">企业亮点 ({{ highlightItems.length }})</button>
                            <button class="edw-tab" :class="{ active: reportIndicatorTab === 'all' }" @click="setReportTab('all')">全量指标 ({{ (mockData.allIndicators || []).length }})</button>
                          </div>
                        </div>
                        <div class="edw-filters">
                          <template v-if="reportIndicatorTab === 'risk'">
                            <button class="edw-filter-chip" :class="{ active: reportIndicatorLevelFilter === 'all' }" @click="reportIndicatorLevelFilter = 'all'">全部</button>
                            <button v-for="lv in riskLevels" :key="lv.key" class="edw-filter-chip" :class="{ active: reportIndicatorLevelFilter === lv.key }" @click="reportIndicatorLevelFilter = lv.key">{{ lv.label }}</button>
                          </template>
                          <template v-else-if="reportIndicatorTab === 'highlight'">
                            <button class="edw-filter-chip" :class="{ active: reportIndicatorLevelFilter === 'all' }" @click="reportIndicatorLevelFilter = 'all'">全部</button>
                            <button v-for="lv in highlightLevels" :key="lv.key" class="edw-filter-chip" :class="{ active: reportIndicatorLevelFilter === lv.key }" @click="reportIndicatorLevelFilter = lv.key">{{ lv.label }}</button>
                          </template>
                          <template v-else>
                            <button class="edw-filter-chip" :class="{ active: reportDimensionFilter === 'all' }" @click="reportDimensionFilter = 'all'">全部</button>
                            <button v-for="dim in radarDims" :key="dim.key" class="edw-filter-chip" :class="{ active: reportDimensionFilter === dim.key }" @click="toggleReportDim(dim.key)">{{ dim.name }}</button>
                          </template>
                        </div>
                        <div class="edw-indicator-list">
                          <div v-for="ind in filteredReportIndicators" :key="ind.id" class="edw-indicator-row" :class="{ selected: activeReportDimension === ind.dimensionKey }">
                            <strong class="edw-indicator-row__name">{{ ind.name }}</strong>
                            <span class="edw-level" :class="'edw-level--' + ind.level">{{ indicatorLevelText(ind) }}</span>
                            <span class="edw-indicator-row__dim">{{ ind.dimensionName }}</span>
                            <div class="edw-indicator-row__fact">{{ ind.fact }}</div>
                            <el-button size="small" text type="primary" @click="openEvidenceView(ind.id)">查看证据链</el-button>
                          </div>
                        </div>
                      </div>
                    </template>
                </div>
              </main>

              <!-- 右侧 AI 对话面板（支持收起/展开） -->
      <div v-if="chatPanelCollapsed" class="edw-chat-panel-collapsed" @click="toggleChatPanel">
        <span class="edw-chat-panel-collapsed__icon">AI</span>
        <span class="edw-chat-panel-collapsed__label">展开</span>
      </div>
      <aside v-else class="edw-chat-panel ai-assistant-panel">
        <div class="edw-chat-header ai-assistant-panel__header">
          <h3 class="ai-assistant-panel__title">AI 探查助手</h3>
          <el-button size="small" text @click="toggleChatPanel" title="收起面板">收起</el-button>
        </div>
        <div class="edw-chat-messages ai-assistant-panel__messages" ref="chatRef">
          <div v-for="(msg, i) in chatMessages" :key="i" class="ai-message" :class="messageClass(msg)">
            <div class="ai-message__avatar">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
            <div class="ai-message__content">
              <div v-if="msg.type !== 'engine'" class="ai-message__bubble" v-html="renderMd(msg.text)"></div>
              <div v-else class="ai-message__bubble ai-message__bubble--engine">
                <div class="edw-engine-card">
                  <div class="edw-engine-card__header">
                    <span v-if="!engineAllDone" class="edw-engine-spinner"></span>
                    <div>
                      <strong>AI 诊断引擎运行中</strong>
                      <p>{{ enterprise.name }}</p>
                    </div>
                  </div>
                  <div class="edw-engine-steps">
                    <div v-for="step in engineSteps" :key="step.title" class="edw-engine-step" :class="'edw-engine-step--' + step.status">
                      <span class="edw-engine-step__icon">
                        <el-icon v-if="step.status === 'done'" :size="12" color="#22c55e"><Check /></el-icon>
                        <span v-else-if="step.status === 'active'" class="edw-engine-step__dot--active"></span>
                        <span v-else class="edw-engine-step__dot--pending"></span>
                      </span>
                      <div>
                        <strong>{{ step.title }}</strong>
                        <p>{{ step.desc }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="msg.role === 'ai' && msg.actions" class="ai-message__actions">
                <el-button v-for="a in msg.actions" :key="a.label" size="small" text :type="a.type || 'primary'" @click="onMsgAction(a)">{{ a.label }}</el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="edw-chat-input ai-assistant-panel__footer">
          <el-input
            v-model="chatInput"
            class="edw-chat-input-el ai-assistant-panel__input"
            placeholder="输入问题…"
            @keydown.enter.exact.prevent="sendChat"
            clearable
          />
          <el-button
            type="primary"
            class="ai-assistant-panel__send-btn"
            :disabled="!chatInput.trim() || isExploring"
            @click="sendChat"
          >
            {{ isExploring ? '探查中' : '发送' }}
          </el-button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDiagnosisMock, enterpriseDB, evidenceChain, indicators } from '../data/mockEnterpriseDiagnosis.js'
import { enterpriseSourceData, findEnterpriseFromText, getEnterpriseSourceData, getDataCoverage, getTaxDeclarationRows, getShareholderRows, calculateVatBurden, getBusinessDetail } from '../data/mockEnterpriseSourceData.js'
import { useDueDiligenceStore } from '../stores/dueDiligence.js'

const dueStore = useDueDiligenceStore()

const route = useRoute()
const router = useRouter()

// ══ 企业识别：支持 _new 状态 ══
const isNewMode = route.params.creditCode === '_new'
let initialCreditCode = isNewMode ? null : (route.params.creditCode || null)
const questionParam = route.query.q || ''

const creditCode = ref(initialCreditCode)
const sourceData = ref(null)
const coverage = ref(null)
const isIdentityNeeded = ref(isNewMode && !questionParam)
const pendingQuestion = ref(isNewMode && questionParam ? questionParam : '')

function initDataFor(code) {
  creditCode.value = code
  sourceData.value = getEnterpriseSourceData(code)
  const cov = getDataCoverage(code)
  coverage.value = cov || { business: true, judicial: true, tax: false, flow: false, socialSecurity: false }
  const mock = getDiagnosisMock(code)
  if (mock) {
    mockData.value = mock
    enterprise.value = mock.enterprise || enterpriseDB[0] || null
  } else if (sourceData.value) {
    enterprise.value = { name: sourceData.value.identity.name, creditCode: code, industry: sourceData.value.identity.industry, legalRep: sourceData.value.identity.legalRep, establishedYear: sourceData.value.identity.establishedYear }
  }
  hasTaxData.value = coverage.value?.tax || false
  hasFlowData.value = coverage.value?.flow || false
}

function buildDataCoverageList(cov) {
  if (!cov) return []
  return [
    { label: '工商', status: cov.business ? 'ok' : 'missing', statusText: cov.business ? '已获取' : '缺失' },
    { label: '司法', status: cov.judicial ? 'ok' : 'missing', statusText: cov.judicial ? '已获取' : '缺失' },
    { label: '税票', status: cov.tax ? 'ok' : 'missing', statusText: cov.tax ? '已授权' : '未授权' },
    { label: '流水', status: cov.flow ? 'ok' : 'missing', statusText: cov.flow ? '已获取' : '缺失' },
  ]
}

const mockData = ref({})
const enterprise = ref({ name: '', creditCode: '', industry: '', legalRep: '', establishedYear: '' })
const currentQuestion = ref(questionParam)
const hasTaxData = ref(false)
const hasFlowData = ref(false)
const hasMissingData = computed(() => !hasTaxData.value || !hasFlowData.value)

if (initialCreditCode) initDataFor(initialCreditCode)
else if (questionParam && isNewMode) {
  // _new mode with a question: enter workspace, AI will ask for enterprise
  isIdentityNeeded.value = true
}

const dataCoverage = computed(() => coverage.value ? buildDataCoverageList(coverage.value) : [])

const explorationPhase = ref('idle') // idle → identifying → checking → judging → rendering → done

const phaseOrder = ['idle', 'identifying', 'checking', 'judging', 'rendering', 'done']
function phasePassed(name) { return phaseOrder.indexOf(explorationPhase.value) > phaseOrder.indexOf(name) }

const engineSteps = computed(() => [
  { title: '加载企业基础信息', desc: '工商登记、注册信息', status: explorationPhase.value === 'identifying' ? 'active' : (phasePassed('identifying') ? 'done' : 'pending') },
  { title: '查询税票数据', desc: '增值税开票、纳税申报', status: explorationPhase.value === 'checking' ? 'active' : (phasePassed('checking') ? 'done' : 'pending') },
  { title: '分析诊断维度', desc: '经营分析、风险检测', status: explorationPhase.value === 'judging' ? 'active' : (phasePassed('judging') ? 'done' : 'pending') },
  { title: '渲染结果视图', desc: '关键数据、异常信号', status: explorationPhase.value === 'rendering' ? 'active' : (phasePassed('rendering') ? 'done' : 'pending') },
])

const engineAllDone = computed(() => explorationPhase.value === 'done')

const currentView = ref('overview')
const currentViewTitle = computed(() => ({
  overview: '企业概览', ops: '经营分析', tax: '税票/纳税明细',
  risk: '风险诊断', fraud: '欺诈信号识别', evidence: '证据链',
  taxDeclarations: '申报明细', shareholders: '股东明细', socialSecurity: '从业/社保概览',
  businessReport: '工商分析报告',
  taxPanoramaReport: '纳税全景报告',
  diagnosisReport: '企业诊断报告',
  evidenceDetail: '证据链详情',
}[currentView.value] || '企业概览'))

const taxDeclarationRows = computed(() => creditCode.value ? getTaxDeclarationRows(creditCode.value) : [])
const businessDetail = computed(() => creditCode.value ? getBusinessDetail(creditCode.value) : null)
const shareholderRows = computed(() => creditCode.value ? getShareholderRows(creditCode.value) : [])

const highRiskCount = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'high').length)
const mediumRiskCount = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'medium').length)
const lowRiskCount = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'low').length)
const highlightCount = computed(() => (mockData.value?.highlightItems || []).length)
const highRiskItems = computed(() => (mockData.value?.riskItems || []).filter(i => i.level === 'high'))
const riskItems = computed(() => mockData.value?.riskItems || [])
const highlightItems = computed(() => mockData.value?.highlightItems || [])

// ══ diagnosisReport 图表 & 筛选状态 ══
const reportChartType = ref('radar')
const activeReportDimension = ref(null)
const reportIndicatorTab = ref('risk')
const reportIndicatorLevelFilter = ref('all')
const reportDimensionFilter = ref('all')

const riskLevels = [
  { key: 'high', label: '高风险' },
  { key: 'medium', label: '中风险' },
  { key: 'low', label: '低风险' },
]
const highlightLevels = [
  { key: 'strong', label: '强亮点' },
  { key: 'normal', label: '亮点' },
  { key: 'low', label: '低亮点' },
]

const radarDims = computed(() => mockData.value?.dimensions || [])
const radarSize = 320
const radarCenter = radarSize / 2
const radarRadius = 130

function _radarPt(angle, radius) {
  return { x: radarCenter + radius * Math.sin(angle), y: radarCenter - radius * Math.cos(angle) }
}

function radarPoints(radius) {
  const n = radarDims.value.length
  if (!n) return ''
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n
    const pt = _radarPt(angle, radius)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

const radarDataPoints = computed(() => {
  const n = radarDims.value.length
  if (!n) return ''
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n
    return _radarPt(angle, (radarDims.value[i].score / 100) * radarRadius)
  }).map(p => `${p.x},${p.y}`).join(' ')
})

const radarDataPointList = computed(() => {
  return Array.from({ length: radarDims.value.length }, (_, i) => {
    const angle = (2 * Math.PI * i) / radarDims.value.length
    return _radarPt(angle, (radarDims.value[i].score / 100) * radarRadius)
  })
})

const radarLabelPositions = computed(() => {
  return Array.from({ length: radarDims.value.length }, (_, i) => {
    const angle = (2 * Math.PI * i) / radarDims.value.length
    return _radarPt(angle, radarRadius + 18)
  })
})

function butterflyDim(dim, level) {
  return (mockData.value?.riskItems || []).filter(i => i.dimensionKey === dim.key && i.level === level).length
}
function butterflyTotal(dim) {
  return ['high', 'medium', 'low'].reduce((s, l) => s + butterflyDim(dim, l), 0)
}
const maxRiskInDim = computed(() => {
  let max = 0
  ;(mockData.value?.dimensions || []).forEach(d => { const t = butterflyTotal(d); if (t > max) max = t })
  return max || 1
})

function roseCount(dim) {
  return (mockData.value?.highlightItems || []).filter(i => i.dimensionKey === dim.key).length
}
const maxHighlightInDim = computed(() => {
  let max = 0
  ;(mockData.value?.dimensions || []).forEach(d => { const c = roseCount(d); if (c > max) max = c })
  return max || 1
})

function toggleReportDim(key) {
  if (reportDimensionFilter.value === key) {
    reportDimensionFilter.value = 'all'
  } else {
    reportDimensionFilter.value = key
  }
  activeReportDimension.value = activeReportDimension.value === key ? null : key
}

function setReportTab(tab) {
  reportIndicatorTab.value = tab
  reportIndicatorLevelFilter.value = 'all'
  if (tab !== 'all') reportDimensionFilter.value = 'all'
}

const filteredReportIndicators = computed(() => {
  let list = []
  if (reportIndicatorTab.value === 'risk') list = riskItems.value
  else if (reportIndicatorTab.value === 'highlight') list = highlightItems.value
  else list = mockData.value?.allIndicators || []
  if (reportIndicatorTab.value === 'risk' || reportIndicatorTab.value === 'highlight') {
    if (reportIndicatorLevelFilter.value !== 'all') {
      list = list.filter(i => i.level === reportIndicatorLevelFilter.value)
    }
  } else {
    if (reportDimensionFilter.value !== 'all') {
      list = list.filter(i => i.dimensionKey === reportDimensionFilter.value)
    }
  }
  return list
})

function indicatorLevelText(ind) {
  if (ind.type === 'risk') return { high: '高风险', medium: '中风险', low: '低风险' }[ind.level] || ind.level
  if (ind.type === 'highlight') return { strong: '强亮点', normal: '亮点' }[ind.level] || ind.level
  return ind.level
}

function dimLevelText(level) {
  return { high: '高', medium: '中', low: '低' }[level] || ''
}

function dimColor(level) {
  if (level === 'high') return 'var(--color-danger)'
  if (level === 'medium') return 'var(--color-warning)'
  return 'var(--color-success)'
}
const topEvidences = computed(() => indicators.filter(i => i.level === 'high').flatMap(i => i.evidenceIds).slice(0, 6).map(id => evidenceChain[id]).filter(Boolean))

const activeEvidenceIndicator = ref(null)
const activeEvidenceList = ref([])

const chatInput = ref('')
const chatMessages = ref([])
const chatPanelCollapsed = ref(false)
const chatRef = ref(null)
const isExploring = ref(false)
const hasResult = ref(false)
const workspaceActive = ref(false)
const lastDueTaskId = ref(null)

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function typeAiMessage(fullText, options = {}) {
  const msg = { role: 'ai', text: '' }
  chatMessages.value.push(msg)
  for (let i = 1; i <= fullText.length; i++) {
    msg.text = fullText.slice(0, i)
    await delay(18)
  }
  if (options.actions) msg.actions = options.actions
  scrollToBottom()
  return msg
}

// ══ 问题类型分类 ══
function classifyQuestion(text) {
  const q = text.toLowerCase()

  // 报告类
  if (/生成.*工商.*报告|生成工商分析报告/.test(q)) return { type: 'report_business', viewName: '工商分析报告', newView: 'businessReport' }
  if (/生成.*纳税.*报告|生成纳税全景报告/.test(q)) return { type: 'report_tax', viewName: '纳税全景报告', newView: 'taxPanoramaReport' }
  if (/生成.*诊断.*报告|生成企业诊断报告/.test(q)) return { type: 'report_diagnosis', viewName: '企业诊断报告', newView: 'diagnosisReport' }
  if (/生成.*报告/.test(q)) return { type: 'report_diagnosis', viewName: '企业诊断报告', newView: 'diagnosisReport' }

  // 明细类 — 左侧打开表格
  if (/股东|出资|持股/.test(q)) return { type: 'detail_shareholders', viewName: '股东明细', newView: 'shareholders' }
  if (/社保|缴保|从业人数/.test(q)) return { type: 'detail_social_security', viewName: '从业/社保概览', newView: 'socialSecurity' }
  if (/申报信息明细|申报记录|近12个月申报/.test(q)) return { type: 'detail_tax_declarations', viewName: '申报明细', newView: 'taxDeclarations' }

  // 指标计算类 — 对话中回答
  if (/税负率|计算税负|税负是多少/.test(q)) return { type: 'metric_tax_burden', viewName: '税负率' }
  if (/收入同比|收入增长/.test(q)) return { type: 'metric_revenue', viewName: '收入指标' }

  // 复杂分析类 — 左侧打开结构化视图
  if (/经营情况|经营分析|营收趋势|经营如何/.test(q)) return { type: 'analysis_ops', viewName: '经营分析', newView: 'ops' }
  if (/纳税全景|纳税分析/.test(q)) return { type: 'analysis_tax', viewName: '纳税全景', newView: 'tax' }
  if (/欺诈|虚假|真实性|票税流/.test(q)) return { type: 'analysis_fraud', viewName: '欺诈信号识别', newView: 'fraud' }
  if (/风险|诊断|高风险/.test(q)) return { type: 'analysis_risk', viewName: '风险诊断', newView: 'risk' }
  if (/证据|依据/.test(q)) return { type: 'evidence', viewName: '证据链', newView: 'evidence' }

  // 工商/司法分析
  if (/工商|法人|成立|股权|司法/.test(q)) return { type: 'analysis_ops', viewName: '工商分析', newView: 'overview' }

  // 法人/行业等基本信息（简单事实）
  if (/法人|成立时间|成立年份|行业|纳税人类型/.test(q)) return { type: 'fact_basic', viewName: '工商信息' }

  return { type: 'analysis_ops', viewName: '企业概览', newView: 'overview' }
}

// 只在对话中回答的类型（不打开左侧视图）
const chatOnlyTypes = ['fact_basic', 'metric_tax_burden', 'metric_revenue']
// 需要打开左侧明细视图的类型
const detailTypes = ['detail_shareholders', 'detail_social_security', 'detail_tax_declarations']
// 需要打开左侧分析视图的类型
const analysisTypes = ['analysis_ops', 'analysis_tax', 'analysis_fraud', 'analysis_risk', 'evidence', 'report_business', 'report_tax', 'report_diagnosis']

async function runExploreFlow(text) {
  if (isExploring.value) return
  isExploring.value = true
  const qa = classifyQuestion(text)
  const shouldRunFullEngine = !hasResult.value

  // ══ 只在对话中回答 ══
  if (chatOnlyTypes.includes(qa.type)) {
    const reply = buildChatReply(qa, text)
    await typeAiMessage(reply, { actions: buildChatActions(qa.type) })
    isExploring.value = false
    return
  }

  // ══ 明细类：左侧打开表格，右侧一句话说明 ══
  if (detailTypes.includes(qa.type)) {
    const viewName = qa.viewName
    const newView = qa.newView
    // 数据缺失检查
    if (qa.type === 'detail_tax_declarations' && !hasTaxData.value) {
      await typeAiMessage('当前**税票数据未授权**，无法查看申报明细。请先授权税票。', {
        actions: [{ label: '授权税票', action: 'auth', type: 'warning' }]
      })
      isExploring.value = false
      return
    }
    if (qa.type === 'detail_shareholders' && !sourceData.value) {
      await typeAiMessage('当前数据未加载，请刷新页面。')
      isExploring.value = false
      return
    }
    currentView.value = newView
    if (!hasResult.value) hasResult.value = true
    if (!workspaceActive.value) workspaceActive.value = true
    const detailLabels = { detail_shareholders: '股东明细', detail_tax_declarations: '近12个月申报明细', detail_social_security: '从业/社保概览' }
    await typeAiMessage('已为你打开**' + (detailLabels[qa.type] || viewName) + '**，数据来源见左侧。')
    isExploring.value = false
    return
  }

  // ══ 报告类 ══
  if (qa.type.startsWith('report_')) {
    await handleReportRequest(text)
    isExploring.value = false
    return
  }

  // ══ 复杂分析：走引擎流程，打开左侧视图 ══
  const newView = qa.newView || 'overview'
  const viewName = qa.viewName

  if (shouldRunFullEngine) {
    await typeAiMessage('我先识别企业，并检查可用数据范围。')
    await delay(300)

    chatMessages.value.push({ role: 'ai', type: 'engine' })
    explorationPhase.value = 'identifying'
    scrollToBottom()
    await delay(600)

    explorationPhase.value = 'checking'
    scrollToBottom()
    await delay(600)

    explorationPhase.value = 'judging'
    scrollToBottom()
    await delay(600)

    explorationPhase.value = 'rendering'
    scrollToBottom()
    await delay(400)

    explorationPhase.value = 'done'

    const summaryText = buildAnalysisSummary(qa)
    await typeAiMessage(summaryText, { actions: buildMsgActions(newView) })
    await delay(300)

    currentView.value = newView
    hasResult.value = true
    if (!workspaceActive.value) workspaceActive.value = true
  } else {
    await typeAiMessage('正在查看「' + viewName + '」。', { actions: buildMsgActions(newView) })
    currentView.value = newView
    if (!workspaceActive.value) workspaceActive.value = true
  }

  isExploring.value = false
}

// ══ 事实查询 / 指标计算的对话回复（使用源数据） ══
function buildChatReply(qa, text) {
  const q = text.toLowerCase()
  const src = sourceData.value
  if (!src) return '当前数据未加载，请刷新页面。'
  const cov = coverage.value || {}

  // ══ 事实查询 ══
  if (/股东|出资|持股/.test(q)) {
    const rows = getShareholderRows(creditCode.value)
    if (!rows.length) return '未找到该企业的股东信息。'
    let reply = '已找到**' + enterprise.value.name + '**的股东信息：\n'
    rows.forEach(r => { reply += '\n• **' + r.name + '**，持股 ' + r.ratio + '%，认缴出资 ' + r.amount + ' 万元' })
    reply += '\n\n数据来源：工商登记信息（企业年度申报附表）。'
    return reply
  }

  if (/社保|缴保/.test(q)) {
    const ss = src.socialSecurity
    if (ss) {
      return '**' + enterprise.value.name + '**的社保/从业信息：\n\n• **从业人数**：' + ss.employeeCount + ' 人\n• **说明**：' + ss.note + '\n\n数据来源：企业所得税申报附表（104从业人数）。' +
        (ss.isEstimated ? '\n\n（注：此为从业人数概览，非完整社保费明细。）' : '')
    }
    return '当前暂未获取社保数据。'
  }

  if (/申报信息明细/.test(q)) {
    if (!cov.tax) {
      return '当前**税票数据未授权**，无法查看申报明细。\n\n请先授权税票数据。'
    }
    const rows = getTaxDeclarationRows(creditCode.value, 6)
    if (!rows.length) return '未找到申报记录。'
    let reply = '近12个月申报明细摘要（前' + rows.length + '条）：\n'
    rows.slice(0, 4).forEach(r => {
      reply += '\n• ' + r.periodEnd.substring(0, 7) + ' | ' + r.project + ' | 销售额 ' + formatNum(r.salesAmount) + ' | 应纳税额 ' + formatNum(r.taxAmount)
    })
    reply += '\n\n数据来源：增值税纳税申报系统。'
    return reply
  }

  if (/法人|成立时间|成立年份/.test(q)) {
    const id = src.identity
    return '**' + id.name + '**的基本信息：\n\n• **法人**：' + id.legalRep + '\n• **成立年份**：' + id.establishedYear + '年\n• **行业**：' + id.industry + '\n• **纳税人类型**：' + id.taxpayerType + '\n• **信用代码**：' + id.creditCode + '\n\n数据来源：国家企业信用信息公示系统。'
  }

  if (/客户|供应商/.test(q)) {
    return '当前仅能获取**' + enterprise.value.name + '**的基本工商信息。\n\n如需查看主要客户/供应商明细、购销关系和资金流分析，需要授权税票或上传流水数据。' +
      (!cov.flow ? '\n\n⚠️ 流水数据缺失，无法分析客户/供应商关系和资金流闭环。' : '')
  }

  // ══ 指标计算 ══
  if (/税负率|计算税负|税负是多少/.test(q)) {
    if (!cov.tax) {
      return '当前**税票数据未授权**，无法计算税负率。\n\n税负率 = 应纳增值税 ÷ 应税销售收入 × 100%\n\n请先授权税票数据。'
    }
    const vat = calculateVatBurden(creditCode.value)
    if (!vat) return '无法计算税负率，请检查数据。'
    return '税负率计算结果：\n\n**' + vat.formula + '**\n\n• 数据来源：增值税纳税申报系统（近12个月）\n• 行业均值：**' + vat.industryAvg + '%**（建材批发）\n• 判断：**' + vat.judgment + '**\n\n建议：查看税票和申报差异证据链，核实税负偏低原因。'
  }

  if (/收入同比|收入增长/.test(q)) {
    const m = src.metrics
    return '近12个月营收指标：\n\n• 2025应税收入：**' + m.invoiceIncome + '万元**\n• 同比增速：**' + m.revenueYoY + '%**（行业均值 12.5%）\n• 数据来源：增值税开票系统 + 纳税申报\n• 判断：**增长过快**，购销两头在外，收入真实性存疑\n\n建议：查看购销合同和资金流验证收入真实性。'
  }

  if (/差异/.test(q)) {
    if (!cov.tax) return '当前税票未授权，无法计算差异。请先授权税票数据。'
    const m = src.metrics
    return '开票与申报差异：\n\n• 开票收入：**' + m.invoiceIncome + '万元**\n• 申报收入：**' + m.declaredIncome + '万元**\n• 差异：**' + formatNum((m.invoiceIncome - m.declaredIncome) * 10000) + '元（' + m.declarationDiffRate + '%）**\n• 数据来源：增值税发票系统 + 纳税申报\n• 判断：**存在差异**，需核实原因'
  }

  return '已收到你的问题，当前正在分析中。你可以继续追问或查看具体维度。'
}

function formatNum(n) {
  if (n == null || n === 0) return '0'
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(2) + '万'
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function buildChatActions(type) {
  if (type === 'fact_basic' || type === 'detail_shareholders' || type === 'detail_tax_declarations' || type === 'detail_social_security') {
    const base = [{ label: '查看证据来源', action: 'evidence' }, { label: '加入报告', action: 'report' }]
    if (!hasTaxData.value) base.push({ label: '授权税票', action: 'auth', type: 'warning' })
    return base
  }
  if (type === 'metric_tax_burden' || type === 'metric_revenue') {
    const base = [{ label: '查看证据链', action: 'evidence' }, { label: '加入报告', action: 'report' }]
    if (!hasTaxData.value) base.push({ label: '授权税票', action: 'auth', type: 'warning' })
    return base
  }
  return []
}

// ══ 复杂分析结果摘要 ══
function buildAnalysisSummary(qa) {
  const viewName = qa.viewName
  const summaries = {
    analysis_ops: '已完成「' + viewName + '」。近12个月营收增长' + (sourceData.value?.metrics?.revenueYoY || '—') + '%，显著高于行业均值12.5%。但购销两头在外、流水缺失，收入真实性需要补充验证。',
    analysis_tax: '已完成「' + viewName + '」。增值税税负率' + (sourceData.value?.metrics?.vatBurdenRate || '—') + '%，仅为行业均值29%。纳税信用A级为亮点。开票与申报差异' + (sourceData.value?.metrics?.declarationDiffRate || '—') + '%需核实。',
    analysis_risk: '已完成「' + viewName + '」。综合评分' + (mockData.value?.score || '—') + '，评级' + (mockData.value?.grade || '—') + '。共' + (mockData.value?.riskItems?.length || 0) + '项风险信号（高风险' + highRiskCount.value + '项）、' + (mockData.value?.highlightItems?.length || 0) + '项企业亮点。建议重点核实高风险事项后再推进授信。',
    analysis_fraud: '已完成「' + viewName + '」。三项欺诈信号叠加：购销两头在外、票税差异、电费与收入不匹配。业务真实性需重点核实。',
    evidence: '已完成「' + viewName + '」。已展示' + highRiskCount.value + '项高风险指标的证据链，共' + topEvidences.value.length + '条核心证据，置信度75%-96%。',
  }
  let text = summaries[qa.type] || ('已完成「' + viewName + '」分析。')
  if (!hasFlowData.value && (qa.type === 'analysis_fraud' || qa.type === 'analysis_ops')) {
    text += '\n\n**流水缺失**，完整判断需要上传流水。'
  }
  if (!hasTaxData.value && qa.type === 'analysis_tax') {
    text = '当前**税票数据未授权**，无法展示纳税全景。请先授权税票数据。'
  }
  return text
}

// ══ 报告生成流程引擎 ══
async function runReportGenerationFlow(reportType) {
  const viewMap = {
    business: 'businessReport',
    tax: 'taxPanoramaReport',
    diagnosis: 'diagnosisReport',
  }
  const labelMap = {
    business: '工商分析报告',
    tax: '纳税全景报告',
    diagnosis: '企业诊断报告',
  }
  const targetView = viewMap[reportType]
  const label = labelMap[reportType]

  // 1. 打字机式开场说明
  const introMap = {
    business: '正在基于工商、司法、公开信息生成工商分析报告。',
    tax: '正在基于税票、纳税申报、发票数据生成纳税全景报告。',
    diagnosis: '正在基于已获取的工商、司法' + (hasTaxData.value ? '、税票' : '') + '等数据，生成企业诊断报告。',
  }
  await typeAiMessage(introMap[reportType] || '正在生成报告。')
  await delay(300)

  // 2. 推送 engine 流程卡
  chatMessages.value.push({ role: 'ai', type: 'engine' })
  scrollToBottom()

  const phases = ['identifying', 'checking', 'judging', 'rendering']
  for (const phase of phases) {
    explorationPhase.value = phase
    await delay(500)
    scrollToBottom()
  }
  explorationPhase.value = 'done'
  scrollToBottom()

  // 3. 完成后打字机式总结 + 打开报告
  const doneMap = {
    business: '已基于工商、司法和公开信息生成**工商分析报告**。补充税票或流水后，可增强税务异常和经营真实性判断。',
    tax: hasFlowData.value
      ? '已基于税票、纳税申报和发票数据生成**纳税全景报告**。'
      : '已基于税票、纳税申报和发票数据生成**纳税全景报告**。缺流水时，资金闭环和经营真实性判断会标记为待补充。',
    diagnosis: (() => {
      const covParts = []
      if (sourceData.value) covParts.push('工商、司法')
      if (hasTaxData.value) covParts.push('税票')
      else covParts.push('税票未授权')
      const missParts = []
      if (!hasFlowData.value) missParts.push('流水')
      let msg = '已基于当前已获取数据生成**企业诊断报告**。当前覆盖：' + covParts.join('、')
      if (missParts.length) msg += '；缺失：' + missParts.join('、')
      msg += '。报告中的经营真实性和欺诈识别会标记为待补充，上传流水后可生成更完整版本。'
      return msg
    })(),
  }

  const actionsMap = {
    business: [
      { label: '查看工商分析报告', action: 'report_business_detail' },
      { label: '查看证据链', action: 'evidence' },
      { label: '加入尽调任务', action: 'dd' },
    ],
    tax: [
      { label: '查看纳税全景报告', action: 'report_tax_detail' },
      { label: '查看税负率计算', action: 'explain' },
      { label: '查看证据链', action: 'evidence' },
    ],
    diagnosis: (() => {
      const actions = [
        { label: '查看企业诊断报告', action: 'report_diagnosis_detail' },
        { label: '查看证据链', action: 'evidence' },
      ]
      if (!hasTaxData.value) actions.push({ label: '授权税票', action: 'auth', type: 'warning' })
      if (!hasFlowData.value) actions.push({ label: '上传流水', action: 'upload', type: 'warning' })
      actions.push({ label: '加入尽调任务', action: 'dd' })
      return actions
    })(),
  }

  await typeAiMessage(doneMap[reportType], { actions: actionsMap[reportType] })
  await delay(200)

  // 4. 打开左侧报告
  workspaceActive.value = true
  hasResult.value = true
  currentView.value = targetView
}

// ══ 报告请求处理 ══
async function handleReportRequest(text) {
  try {
    isExploring.value = true
    hasResult.value = true

    // ══ 工商分析报告 ══
    if (/工商|工商分析/.test(text)) {
      await runReportGenerationFlow('business')
      return
    }

    // ══ 纳税全景报告 ══
    if (/纳税|税票/.test(text)) {
      if (!hasTaxData.value) {
        await typeAiMessage('当前**税票数据未授权**，无法生成纳税全景报告。\n\n请先授权税票数据后，系统将生成包含税负分析、申报明细、开票差异等内容的纳税全景报告。', {
          actions: [{ label: '授权税票', action: 'auth', type: 'warning' }]
        })
        return
      }
      await runReportGenerationFlow('tax')
      return
    }

    // ══ 企业诊断报告 ══
    // 只要识别到企业并有基础数据，就生成报告（不阻断缺流水/缺税票）
    if (mockData.value?.riskItems || sourceData.value) {
      await runReportGenerationFlow('diagnosis')
      return
    }

    // ══ 兜底：企业未识别 ══
    await typeAiMessage('当前无法生成报告，请先输入企业名称或统一社会信用代码完成识别。')
  } finally {
    isExploring.value = false
  }
}

onMounted(() => {
  if (isNewMode && !creditCode.value) {
    // _new 模式：根据 pendingQuestion 给出上下文感知的提示
    const pq = pendingQuestion.value
    let hintMsg = '我可以帮你探查企业经营、工商、税票、股东、申报和风险证据链。请先输入企业名称或统一社会信用代码。'
    if (pq) {
      const pqType = classifyQuestion(pq)
      if (pqType.type === 'detail_tax_declarations') {
        hintMsg = '我可以帮你查看申报明细。请先输入企业名称或统一社会信用代码。'
      } else if (pqType.type === 'metric_tax_burden') {
        hintMsg = '我可以帮你计算税负率。请先输入企业名称或统一社会信用代码。'
      } else if (pqType.type === 'detail_shareholders') {
        hintMsg = '我可以帮你查看股东信息。请先输入企业名称或统一社会信用代码。'
      } else if (pqType.type === 'detail_social_security') {
        hintMsg = '我可以帮你查看社保费明细。请先输入企业名称或统一社会信用代码。'
      }
    }
    chatMessages.value.push({ role: 'ai', text: hintMsg })
    return
  }
  if (currentQuestion.value) {
    chatMessages.value.push({ role: 'user', text: currentQuestion.value })
    runExploreFlow(currentQuestion.value)
  }
})

async function sendChat() {
  const text = chatInput.value.trim()
  if (!text || isExploring.value) return
  chatInput.value = ''
  chatMessages.value.push({ role: 'user', text })

  // 如果企业未识别，先尝试识别
  if (!creditCode.value) {
    const found = findEnterpriseFromText(text)
    if (found && enterpriseSourceData[found.creditCode]) {
      initDataFor(found.creditCode)
      isIdentityNeeded.value = false

      // 构建数据覆盖描述
      const covList = (coverage.value ? Object.entries(coverage.value).filter(([k,v]) => k !== 'name').map(([k,v]) => {
        const labels = { business: '工商', judicial: '司法', tax: '税票', flow: '流水', socialSecurity: '社保' }
        return labels[k] + (v ? '已获取' : '缺失')
      }).join('、') : '数据加载中')

      if (pendingQuestion.value) {
        // 有待处理问题：继续执行
        const origQ = pendingQuestion.value
        pendingQuestion.value = ''
        await typeAiMessage('已识别企业：**' + enterprise.value.name + '**。\n当前数据覆盖：' + covList + '。\n我将继续处理你的问题。')
        await delay(300)
        chatMessages.value.push({ role: 'user', text: origQ })
        runExploreFlow(origQ)
      } else {
        typeAiMessage('已识别企业：**' + enterprise.value.name + '**。\n当前数据覆盖：' + covList + '。\n你可以继续问：税负率是多少、查看申报明细、查看股东明细、是否存在欺诈风险。')
      }
    } else {
      typeAiMessage('当前 Demo 只内置了少量企业样例，请输入：唐山物桥商贸有限公司 或 91130203MA7EEQ2N0T。')
    }
    return
  }

  runExploreFlow(text)
}

function buildMsgActions(view) {
  const base = [
    { label: '查看证据链', action: 'evidence' },
    { label: '生成专项说明', action: 'explain' },
    { label: '加入报告', action: 'report' },
  ]
  if (view === 'risk') base.push({ label: '加入尽调任务', action: 'dd' })
  if (!hasTaxData.value) base.push({ label: '授权税票', action: 'auth', type: 'warning' })
  if (!hasFlowData.value) base.push({ label: '上传流水', action: 'upload', type: 'warning' })
  return base
}

function onMsgAction(a) {
  try {
    switch (a.action) {
      case 'evidence': openEvidenceView('R1'); break
      case 'explain': aiAction('专项说明'); break
      case 'report': aiAction('加入报告'); break
      case 'dd': pushToDD(); break
      case 'view_due_task': router.push('/due-diligence/' + (a.taskId || lastDueTaskId.value)); break
      case 'view_due_home': router.push('/due-diligence'); break
      case 'auth': authMissing(); break
      case 'upload': uploadFlow(); break
      case 'report_detail': openReportView('diagnosis'); break
      case 'report_business_detail': openReportView('business'); break
      case 'report_tax_detail': openReportView('tax'); break
      case 'report_diagnosis_detail': openReportView('diagnosis'); break
      case 'report_business':
        chatMessages.value.push({ role: 'ai', text: '正在生成**工商分析报告**（Demo）...\n\n包含企业基本信息、股权结构、司法风险等内容。' })
        scrollToBottom()
        break
    }
  } catch (error) {
    console.error('onMsgAction error:', error)
    isExploring.value = false
    ElMessage.error('操作失败，请重试')
  }
}

function aiAction(label) {
  if (label === '加入报告') { chatMessages.value.push({ role: 'ai', text: '已加入报告草稿。' }) }
  else if (label === '加入尽调任务') { pushToDD() }
  else { chatMessages.value.push({ role: 'ai', text: '**' + label + '**\n\n基于当前已获取的工商、司法' + (hasTaxData.value ? '、税票' : '') + '数据，已完成基础分析。如需更完整的判断，建议补充缺失数据后再次探查。' }) }
  scrollToBottom()
}

function openEvidenceView(indId) {
  const ind =
    mockData.value?.riskItems?.find(i => i.id === indId) ||
    mockData.value?.riskItems?.[0] ||
    null

  activeEvidenceIndicator.value = ind

  if (ind?.evidences?.length) {
    activeEvidenceList.value = ind.evidences
  } else if (ind?.evidenceIds?.length) {
    activeEvidenceList.value = ind.evidenceIds
      .map(id => evidenceChain[id])
      .filter(Boolean)
  } else {
    activeEvidenceList.value = []
  }

  workspaceActive.value = true
  currentView.value = 'evidenceDetail'
}
function openReportView(type) {
  workspaceActive.value = true
  if (type === 'business') currentView.value = 'businessReport'
  else if (type === 'tax') currentView.value = 'taxPanoramaReport'
  else if (type === 'diagnosis') currentView.value = 'diagnosisReport'
  else currentView.value = 'diagnosisReport'
}
function goEvidencePage() { openEvidenceView('R1') }
function pushToDD() {
  if (!enterprise.value?.name) {
    ElMessage.warning('企业信息未识别，无法创建尽调任务')
    return
  }
  const missingData = []
  if (!hasTaxData.value) missingData.push('税票')
  if (!hasFlowData.value) missingData.push('流水')

  const task = dueStore.createTaskFromEnterpriseExploration({
    name: enterprise.value.name,
    creditCode: creditCode.value || '',
    industry: enterprise.value.industry || '待确认',
    region: '待确认',
    amount: '待评估',
    score: mockData.value?.score,
    grade: mockData.value?.grade,
    riskCount: mockData.value?.riskItems?.length || 0,
    highRiskCount: highRiskCount.value,
    missingData,
  })
  lastDueTaskId.value = task.id
  ElMessage.success('已加入尽调任务')

  // 在对话中追加 AI 确认消息
  chatMessages.value.push({
    role: 'ai',
    text: '已加入尽调任务：**' + enterprise.value.name + '**。系统已将企业探查结果、风险指标和证据链作为尽调输入，当前任务进入【风险诊断/证据整合】阶段。',
    actions: [
      { label: '查看尽调任务', action: 'view_due_task', taskId: task.id },
      { label: '去尽调首页', action: 'view_due_home' },
    ],
  })
  scrollToBottom()
}
function authMissing() { ElMessage.info('Demo: 已发起数据授权请求') }
function uploadFlow() { ElMessage.info('Demo: 已发起流水上传入口') }
function renderMd(text) { return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') }
function scrollToBottom() { nextTick(() => { if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight }) }
function viewFullReport() { openReportView('diagnosis') }
function generateReport() { openReportView('diagnosis') }
function gradeColor(grade) { if (['D','E','F'].includes(grade)) return 'danger'; if (grade === 'C') return 'warning'; return 'success' }
function toggleChatPanel() { chatPanelCollapsed.value = !chatPanelCollapsed.value }

function goBack() { router.push('/enterprise-diagnosis') }
</script>

<style scoped>
/* ══ 阶段 A：轻量 AI 对话流 ══ */
.edw-chat-only {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  max-width: 960px;
  margin: 0 auto;
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;
  padding: 0 var(--space-xl);
  width: 100%;
  box-sizing: border-box;
}

.edw-chat-only .ai-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  max-width: 100%;
}

.edw-chat-only .ai-message--ai {
  flex-direction: row;
  align-self: flex-start;
}

.edw-chat-only .ai-message--user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.edw-chat-only .ai-message__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.edw-chat-only .ai-message--ai .ai-message__avatar {
  background: var(--color-primary);
  color: #fff;
}

.edw-chat-only .ai-message--user .ai-message__avatar {
  background: var(--surface-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

.edw-chat-only .ai-message__bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  word-break: break-word;
}

.edw-chat-only .ai-message--ai .ai-message__bubble {
  background: #f1f5f9;
  border: none;
  box-shadow: none;
  border-top-left-radius: 4px;
}

.edw-chat-only .ai-message--user .ai-message__bubble {
  background: var(--color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}

.edw-chat-only .ai-message__actions {
  margin-left: 42px;
  margin-top: -8px;
  margin-bottom: 8px;
}

/* 初始态页面背景 — handled by main .edw-page rule above */

.edw-chat-only__input {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 960px;
  margin: auto 0 0 0;
  padding: var(--space-md) 0;
}

.edw-chat-only__input .edw-chat-input-el { flex: 1; }

.edw-chat-only__input .edw-chat-input-el :deep(.el-input__wrapper) {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: none;
  padding: 8px 14px;
}

.edw-chat-only__input .edw-chat-input-el :deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

/* ══ 阶段 B：左右布局 ══ */
.edw-workspace-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
  height: calc(100vh - 80px);
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.edw-workspace-layout.collapsed {
  grid-template-columns: minmax(0, 1fr) 56px;
}

.edw-workspace-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  padding: 0 12px 0 0;
  min-width: 0;
  max-height: calc(100vh - 80px);
}
.edw-chat-panel { /* inherits .ai-assistant-panel from tokens */ }

/* ══ 顶部信息栏 ══ */
.edw-topbar { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-divider); margin-bottom: var(--space-md); }
.edw-topbar__info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; }
.edw-topbar__name { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.edw-topbar__tag { font-size: var(--font-size-xs); color: var(--text-secondary); background: var(--bg-subtle, #f1f5f9); padding: 2px 8px; border-radius: 999px; }
.edw-topbar__view { color: var(--color-primary); font-weight: 500; font-size: var(--font-size-xs); }

/* ══ 旧类名兼容（未使用，已注释） ══ */
/* .edw-chat-first, .edw-chat-first__header, .edw-chat-first__info, .edw-chat-first__name,
   .edw-chat-first__tag, .edw-chat-first__body, .edw-chat-first__input — removed */

.edw-result-topbar { display: flex; align-items: center; gap: 12px; padding: 8px 0; margin-bottom: var(--space-md); }
.edw-result-topbar__info { flex: 1; min-width: 0; }
.edw-result-topbar__name { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; }
.edw-result-topbar__meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: var(--font-size-xs); color: var(--text-secondary); }
.edw-result-topbar__view { color: var(--color-primary); font-weight: 500; }
.edw-page { background: var(--surface-page); }
.edw-page:not(:has(.edw-workspace-layout)) { padding: var(--space-xl) var(--space-3xl); }
.edw-page:has(.edw-workspace-layout) { padding: 0 var(--space-xl); max-width: 100%; }
.edw-back-btn { width: 32px; height: 32px; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
/* ══ 旧结果模式布局（未使用） ══ */
/* .edw-result-mode, .edw-result-layout — removed */

/* ══ AI 诊断引擎过程卡 ══ */
.edw-engine-card { width: 100%; max-width: 100%; background: transparent; border: none; border-radius: 0; padding: 0; box-sizing: border-box; }
.edw-engine-card__header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.edw-engine-card__header strong { font-size: 12px; color: var(--text-primary); }
.edw-engine-card__header p { font-size: 11px; color: var(--text-secondary); margin: 0; }
.edw-engine-spinner { width: 14px; height: 14px; border: 2px solid #e5e7eb; border-top-color: var(--color-primary, #3b82f6); border-radius: 50%; animation: edw-spin 0.8s linear infinite; flex-shrink: 0; }
@keyframes edw-spin { to { transform: rotate(360deg); } }
.edw-engine-steps { display: flex; flex-direction: column; gap: 3px; }
.edw-engine-step { display: flex; align-items: center; gap: 6px; padding: 3px 4px; border-radius: 4px; min-height: 26px; font-size: 12px; }
.edw-engine-step__icon { width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.edw-engine-step__dot--active { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary, #3b82f6); display: inline-block; animation: edw-pulse 1.5s ease-in-out infinite; }
.edw-engine-step__dot--pending { width: 6px; height: 6px; border-radius: 50%; background: #d1d5db; display: inline-block; }
.edw-engine-step--done { background: transparent; }
.edw-engine-step--done strong { color: var(--color-success); }
.edw-engine-step--done p { color: var(--color-success); }
.edw-engine-step--active { background: #eff6ff; border: 1px solid #bfdbfe; }
.edw-engine-step--active strong { color: var(--color-primary, #3b82f6); }
.edw-engine-step--active p { color: var(--text-secondary); }
.edw-engine-step:not(.edw-engine-step--done):not(.edw-engine-step--active) { background: transparent; }
.edw-engine-step:not(.edw-engine-step--done):not(.edw-engine-step--active) strong { color: var(--text-tertiary); }
.edw-engine-step:not(.edw-engine-step--done):not(.edw-engine-step--active) p { color: var(--text-tertiary); }
.edw-engine-step strong { font-size: 12px; margin: 0; line-height: 1.3; }
.edw-engine-step p { font-size: 11px; margin: 0; color: var(--text-tertiary); line-height: 1.3; }
.edw-workspace { display: flex; flex-direction: column; gap: 14px; width: 100%; }
.edw-view-header { display: flex; justify-content: space-between; align-items: center; }
.edw-view-title { font-size: var(--font-size-body-lg); font-weight: 600; color: var(--text-primary); margin: 0; }
.edw-view-actions { display: flex; gap: 6px; }
.edw-view-content { display: flex; flex-direction: column; gap: 16px; }
.edw-card { background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px 18px; }
.edw-card h3 { font-size: var(--font-size-sm); font-weight: 600; margin: 0 0 10px; }
.edw-card--conclusion { border-left: 3px solid var(--color-primary); }
.edw-card--abnormal { border-left: 3px solid var(--color-warning); }
.edw-card-label { font-size: var(--font-size-xs); font-weight: 600; color: var(--color-primary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.edw-conclusion-text { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; margin: 0; }
.edw-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: var(--font-size-sm); }
.edw-meta-row { display: flex; gap: 6px; }
.edw-meta-row span:first-child { color: var(--text-tertiary); min-width: 64px; }
.edw-meta-row strong { color: var(--text-primary); }
.edw-coverage-summary { display: flex; gap: 8px; flex-wrap: wrap; }
.edw-coverage-item { font-size: var(--font-size-xs); }
.edw-coverage--ok { color: var(--color-success); }
.edw-coverage--missing { color: var(--color-warning); }
.edw-coverage--pending { color: var(--text-tertiary); }
.edw-next-list { font-size: var(--font-size-sm); color: var(--text-secondary); padding-left: 18px; margin: 0; }
.edw-next-list li { margin-bottom: 4px; line-height: 1.5; }
.edw-data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: var(--font-size-sm); }
.edw-data-cell { display: flex; gap: 6px; padding: 4px 0; }
.edw-data-cell span:first-child { color: var(--text-tertiary); min-width: 90px; }
.edw-data-cell strong { color: var(--text-primary); }
.edw-signal-list { font-size: var(--font-size-sm); color: var(--text-secondary); padding-left: 18px; margin: 0; }
.edw-signal-list li { margin-bottom: 4px; line-height: 1.5; }
.edw-signal-list--warn li { color: #b45309; }
.edw-signal-list--danger li { color: #dc2626; }
.edw-risk-summary { display: flex; gap: 8px; flex-wrap: wrap; }
.edw-risk-badge { font-size: var(--font-size-xs); padding: 2px 8px; border-radius: 999px; }
.edw-risk--high { background: #fee2e2; color: #dc2626; }
.edw-risk--medium { background: #fef3c7; color: #b45309; }
.edw-risk--low { background: #dbeafe; color: #2563eb; }
.edw-risk--good { background: #dcfce7; color: #16a34a; }
.edw-card-actions { display: flex; gap: 6px; flex-wrap: wrap; padding: 14px; background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
.edw-fraud-note { font-size: var(--font-size-sm); color: #dc2626; margin: 8px 0 0; }
.edw-evidence-list { display: flex; flex-direction: column; gap: 12px; }
.edw-evidence-item { padding: 10px 12px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-subtle, #f8fafc); }
.edw-ev-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.edw-ev-source { font-size: var(--font-size-xs); color: var(--text-tertiary); }
.edw-ev-confidence { font-size: var(--font-size-xs); color: var(--color-success); font-weight: 500; margin-left: auto; }
.edw-ev-body { font-size: var(--font-size-xs); color: var(--text-secondary); }
.edw-ev-row { margin-bottom: 2px; }
.edw-ev-label { color: var(--text-tertiary); display: inline; }
/* ── Unified chat panel ── */
.edw-chat-panel.ai-assistant-panel {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 80px);
  position: sticky;
  top: 0;
}

.edw-chat-header.ai-assistant-panel__header {
  height: 48px;
  padding: 0 var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-divider);
  flex-shrink: 0;
}

.edw-chat-header h3.ai-assistant-panel__title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.edw-chat-messages.ai-assistant-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai {
  flex-direction: row;
  align-self: flex-start;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai .ai-message__avatar {
  background: var(--color-primary);
  color: #fff;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user .ai-message__avatar {
  background: var(--surface-page);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  line-height: 1.6;
  word-break: break-word;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--ai .ai-message__bubble {
  background: var(--surface-page);
  border: 1px solid var(--border-light);
  border-top-left-radius: 4px;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message--user .ai-message__bubble {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-top-right-radius: 4px;
}

.edw-chat-messages.ai-assistant-panel__messages .ai-message__actions {
  margin-left: 36px;
  margin-top: -6px;
  margin-bottom: 6px;
}

.edw-chat-messages.ai-assistant-panel__messages .edw-engine-card {
  width: 100%;
  max-width: 100%;
}

.edw-chat-input.ai-assistant-panel__footer {
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--border-divider);
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  background: var(--surface-card);
}

.edw-chat-input.ai-assistant-panel__footer .edw-chat-input-el { flex: 1; }

.edw-chat-input.ai-assistant-panel__footer .edw-chat-input-el :deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  box-shadow: none;
  padding: 6px 12px;
  font-size: var(--font-size-xs);
}

.edw-chat-input.ai-assistant-panel__footer .edw-chat-input-el :deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08);
}

.ai-assistant-panel__send-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

/* Legacy alias: old edw-msg classes — no longer used in template (now ai-message) */
.edw-chat-panel {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 100px);
  position: sticky;
  top: 0;
}

.edw-chat-header {
  height: 48px;
  padding: 0 var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-divider);
  flex-shrink: 0;
}

.edw-chat-header h3 {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.edw-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.edw-chat-input {
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--border-divider);
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.edw-chat-field {
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  outline: none;
  font-family: var(--font-family);
  box-sizing: border-box;
}
.edw-danger { color: #dc2626; }
.edw-warning { color: #b45309; }
.edw-success { color: #16a34a; }

/* ══ 报告视图样式 ══ */
.edw-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.edw-card-header h3 { margin: 0; font-size: var(--font-size-sm); font-weight: 600; }
.edw-chart-tabs { display: flex; gap: 8px; }
.edw-chart-tab { border: 1px solid var(--border-default); background: #fff; border-radius: 6px; padding: 7px 12px; cursor: pointer; color: var(--text-secondary); font-size: var(--font-size-xs); }
.edw-chart-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.edw-dim-wrap { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; }
.edw-dim-chart { position: relative; }
.edw-radar-container { display: flex; align-items: center; justify-content: center; height: 280px; }
.edw-radar-svg { max-width: 100%; max-height: 100%; }
.edw-radar-ring { fill: none; stroke: #e2e8f0; stroke-width: 1; }
.edw-radar-data { fill: rgba(37,99,235,0.12); stroke: rgba(37,99,235,0.6); stroke-width: 2; }
.edw-radar-axis { stroke: #e2e8f0; stroke-width: 0.8; }
.edw-radar-dot { stroke: #fff; stroke-width: 1.5; }
.edw-radar-label { font-size: 11px; fill: var(--text-secondary); font-weight: 500; }
.edw-dim-grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, 1fr); gap: 8px; }
.edw-dim-chip { border: 1px solid var(--border-default); border-radius: 8px; padding: 10px 12px; background: #fff; cursor: pointer; display: flex; flex-direction: column; justify-content: center; gap: 4px; transition: all .15s; min-height: 56px; }
.edw-dim-chip:hover { border-color: var(--color-primary); }
.edw-dim-chip.active { border-color: var(--color-primary); background: var(--color-primary-bg); }
.edw-dim-chip__top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.edw-dim-chip__name { font-weight: 600; font-size: 13px; color: var(--text-primary); }
.edw-dim-chip__count { font-size: 11px; color: var(--text-tertiary); }
.edw-level { font-size: 12px; padding: 1px 7px; border-radius: 999px; white-space: nowrap; font-weight: 500; }
.edw-level--high { color: var(--color-danger); background: var(--color-danger-bg); }
.edw-level--medium { color: var(--color-warning); background: var(--color-warning-bg); }
.edw-level--low { color: var(--color-success); background: var(--color-success-bg); }
.edw-level--strong { color: var(--color-success); background: var(--color-success-bg); }
.edw-level--normal { color: var(--color-success); background: var(--color-success-bg); }
.edw-butterfly__legend { display: flex; gap: 12px; margin-bottom: 10px; }
.edw-bf-legend { font-size: 11px; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px; }
.edw-bf-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.edw-bf-dot--high { background: var(--color-danger); }
.edw-bf-dot--medium { background: var(--color-warning); }
.edw-bf-dot--low { background: var(--color-success); }
.edw-bf-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.edw-bf-label { font-size: 12px; color: var(--text-secondary); width: 100px; flex-shrink: 0; }
.edw-bf-bars { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.edw-bf-bar { height: 18px; border-radius: 3px; display: flex; align-items: center; padding: 0 6px; font-size: 10px; color: #fff; font-weight: 600; min-width: 28px; }
.edw-bf-bar--high { background: var(--color-danger); }
.edw-bf-bar--medium { background: var(--color-warning); }
.edw-bf-bar--low { background: var(--color-success); }
.edw-bf-none { font-size: 11px; color: var(--text-tertiary); font-style: italic; }
.edw-rose__bars { display: flex; justify-content: space-around; align-items: flex-end; gap: 4px; height: 200px; padding: 0 8px; }
.edw-rose-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; cursor: pointer; }
.edw-rose-val { font-size: 18px; font-weight: 700; }
.edw-rose-bar-wrap { width: 100%; height: 140px; display: flex; align-items: flex-end; }
.edw-rose-bar { width: 100%; border-radius: 4px 4px 0 0; background: var(--color-success); transition: height .3s ease; min-height: 2px; }
.edw-rose-bar--empty { background: #e2e8f0; }
.edw-rose-label { font-size: 11px; color: var(--text-tertiary); text-align: center; }
.edw-indicator-toolbar { display: flex; gap: 12px; margin-bottom: 12px; }
.edw-tabs { display: flex; gap: 8px; }
.edw-tab { border: 1px solid var(--border-default); background: #fff; border-radius: 6px; padding: 7px 12px; cursor: pointer; color: var(--text-secondary); font-size: var(--font-size-xs); }
.edw-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.edw-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.edw-filter-chip { border: 1px solid var(--border-default); background: #fff; border-radius: var(--radius-full); padding: 4px 12px; cursor: pointer; color: var(--text-secondary); font-size: var(--font-size-xs); }
.edw-filter-chip.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }
.edw-indicator-list { display: grid; gap: 8px; }
.edw-indicator-row { display: grid; grid-template-columns: 160px 74px 104px 1fr auto; gap: 10px; align-items: center; border: 1px solid var(--border-default); border-radius: 6px; background: #fff; padding: 8px 10px; cursor: pointer; }
.edw-indicator-row:hover { border-color: var(--color-primary); }
.edw-indicator-row.selected { border-color: var(--color-primary); background: var(--color-primary-bg); }
.edw-indicator-row__name { font-size: 14px; }
.edw-indicator-row__dim { font-size: var(--font-size-xs); color: var(--text-tertiary); white-space: nowrap; }
.edw-indicator-row__fact { color: #344054; line-height: 1.5; font-size: var(--font-size-sm); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.edw-grade-badge { display: inline-block; padding: 1px 8px; border-radius: var(--radius-sm); font-weight: 600; font-size: var(--font-size-xs); }

@media (max-width: 900px) { .edw-workspace-layout { grid-template-columns: 1fr; } .edw-chat-panel { max-height: 400px; position: static; } .edw-result-layout { grid-template-columns: 1fr; } .edw-chat { max-height: 400px; position: static; } }
.edw-detail-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-xs); }
.edw-detail-table th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-weight: 500; }
.edw-detail-table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; }
.edw-table-note { font-size: var(--font-size-xs); color: #94a3b8; margin-top: 8px; }


/* 收起态 */
.edw-chat-panel-collapsed { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: calc(100vh - 80px); min-width: 44px; background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); cursor: pointer; transition: all .15s; }
.edw-chat-panel-collapsed:hover { border-color: var(--color-primary); background: var(--color-primary-bg); }
.edw-chat-panel-collapsed__icon { font-size: 14px; font-weight: 700; color: var(--color-primary); }
.edw-chat-panel-collapsed__label { font-size: 10px; color: var(--text-tertiary); writing-mode: vertical-rl; }
/* Global box-sizing fix */
.edw-page *,
.edw-page *::before,
.edw-page *::after {
  box-sizing: border-box;
}

</style>
