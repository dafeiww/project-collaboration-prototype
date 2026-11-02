/* 项目结果页：示例分析记录按项目保存，提交人使用原型的真实当前账号 ID。 */
window.AnalysisResult = (() => {
  'use strict';
  const methods = [
    { id:'cca', category:'约束排序分析', label:'CCA/RDA分析', prefix:'CCA-RDA', count:4, icon:'chart' },
    { id:'coia', category:'一致性分析', label:'CoIA分析', prefix:'CoIA', count:5, icon:'layers' },
    { id:'mfa', category:'一致性分析', label:'MFA分析', prefix:'MFA', count:3, icon:'layers' },
    { id:'o2pls', category:'一致性分析', label:'O2PLS-DA分析', prefix:'O2PLS-DA', count:2, icon:'layers' },
    { id:'kegg', category:'共有差异与通路分析', label:'KEGG共享富集分析', prefix:'KEGG', count:3, icon:'network' },
    { id:'diff', category:'共有差异与通路分析', label:'差异结果关联统计', prefix:'差异关联', count:2, icon:'network' },
    { id:'correlation', category:'相关性分析', label:'相关性分析', prefix:'相关性', count:1, icon:'chart' }
  ];
  const icons = {
    back:'<path d="m14 5-7 7 7 7M7 12h14"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    folder:'<path d="M3 7V5h6l3 3h9v12H3V7Z"/><path d="M3 12h18"/>', chart:'<path d="M4 3v17h17M8 15l4-5 4 3 5-7"/>',
    layers:'<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 17l10 5 10-5"/>',
    document:'<path d="M5 3h10l4 4v14H5V3ZM14 3v5h5M8 12h8M8 16h6"/>', chevron:'<path d="m7 10 5 5 5-5"/>', up:'<path d="m7 14 5-5 5 5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>', user:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>', success:'<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="m7.5 12 3 3 6-6" stroke="white"/>',
    failed:'<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="m8.5 8.5 7 7m-7 0 7-7" stroke="white"/>',
    running:'<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M12 6v6l4 2" stroke="white"/>',
    queued:'<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M12 7v5h4" stroke="white"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    edit:'<path d="m14 5 5 5M4 20l4-1L21 6l-4-4L4 15l0 5Z"/>', plus:'<path d="M12 5v14M5 12h14"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>', network:'<circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m10.5 7.5-4 9m7-9 4 9M8 19h8"/>',
    palette:'<path d="M21 12a9 9 0 1 0-9 9h2a2 2 0 0 0 1-4 2 2 0 0 1 1-4h3a2 2 0 0 0 2-1Z"/><circle cx="7" cy="10" r=".6"/><circle cx="10" cy="6" r=".6"/><circle cx="15" cy="7" r=".6"/>',
    report:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h4M8 16h7"/>', check:'<path d="m5 12 4 4L19 6"/>'
  };
  const svg = name => `<svg class="ar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.chart}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusLabels = {queued:'排队中',running:'运行中',success:'成功',failed:'失败'};
  const identityLabels = {owner:'项目管理者',support:'技术支持',admin:'技术支持',member:'协作成员',visitor:'访问者',historical:'历史成员'};
  const identityOrder = {owner:0,support:1,member:2,admin:1,visitor:4,historical:5};
  let root, context, records=[], counters={}, collaborationDemoVersion=0, query='', onlyMine=false, selectedSubmitter='', status='success', section='info', panelOpen=true, collapsed=new Set(['mfa','o2pls','kegg','diff','correlation']), toastTimer, lastFocus;
  const storageKey = () => `personalbio-analysis-records-v1:${context.project.id}`;
  const currentUser = () => context.viewer;
  const mine = record => record.submitterId === currentUser().id;
  const canDeleteAny = () => context.canSubmit&&(currentUser().projectRole==='owner'||submitterIdentity(currentUser())==='support');
  const canDeleteRecord = record => !!record&&context.canSubmit&&(mine(record)||canDeleteAny());
  const matchesSubmitter = record => (!onlyMine||mine(record))&&(!selectedSubmitter||record.submitterId===selectedSubmitter);
  const identityLabel = record => identityLabels[record.submitterIdentity]||identityLabels.historical;
  function submitterIdentity(user) {
    if(!user)return 'historical';
    if(user.isTechnicalSupport||user.id==='support-1'||user.projectRole==='admin')return 'support';
    return Object.hasOwn(identityLabels,user.projectRole)?user.projectRole:'historical';
  }
  function submitterSnapshot(user) {
    return {submitterId:user.id,submitterName:user.name,submitterAccount:user.account,submitterIdentity:submitterIdentity(user),submitterIdentitySource:'snapshot'};
  }
  const methodFor = id => methods.find(m => m.id === id) || methods[0];
  const dateParts = value => new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value));
  const shortDate = value => dateParts(value).replace(/^\d{4}\//,'').replace(/\//g,'-').replace(/:\d{2}$/,'');
  function save() { try { localStorage.setItem(storageKey(),JSON.stringify({records,counters,collaborationDemoVersion})); } catch { toast('当前浏览器未能保存记录，请保留页面后继续操作'); } }
  function nextSequence(methodId, group) {
    const key=`${methodId}:${group}`;
    counters[key]=Math.max(counters[key]||0,...records.filter(r=>r.methodId===methodId&&r.group===group).map(r=>Number(r.sequence)||0))+1;
    return counters[key];
  }
  function generatedName(methodId, group, sequence) { return `${methodFor(methodId).prefix}-${group}-${String(sequence).padStart(2,'0')}`; }
  function exampleAuthors() {
    return context.participants.filter(user=>['owner','admin','member'].includes(user.projectRole)).sort((a,b)=>identityOrder[submitterIdentity(a)]-identityOrder[submitterIdentity(b)]);
  }
  function upgradeCollaborationExamples() {
    const people=exampleAuthors().slice(0,4);
    if(collaborationDemoVersion>=1||!context.project.collab||people.length<2)return;
    // 仅补充旧版演示记录；保留已有名称和作者，也不向空记录集重新加回已删除的示例。
    if(records.some(r=>r.id.startsWith('seed-'))){
      people.forEach((author,index)=>{
        if(records.some(r=>r.methodId==='cca'&&r.status==='success'&&r.submitterId===author.id))return;
        const group='Treat1',sequence=nextSequence('cca',group);
        records.push({id:`collab-demo-cca-${author.id}`,methodId:'cca',group,sequence,name:generatedName('cca',group,sequence),...submitterSnapshot(author),createdAt:new Date(Date.UTC(2026,10,2,6,34)-index*17*60000).toISOString(),status:'success'});
      });
    }
    collaborationDemoVersion=1;
  }
  function seed() {
    records=[];counters={};collaborationDemoVersion=context.project.collab?1:0;
    const participants=exampleAuthors();
    const people=participants.length?participants:[currentUser()];
    let index=0;
    methods.forEach(m=>{
      for(let i=0;i<m.count;i++){
        const author=people[index%people.length],group=i===2?'Treat2':'Treat1',sequence=nextSequence(m.id,group);
        records.push({id:`seed-${m.id}-${i+1}`,methodId:m.id,group,sequence,name:generatedName(m.id,group,sequence),...submitterSnapshot(author),createdAt:new Date(Date.UTC(2026,10,2,6,35)-index*17*60000).toISOString(),status:'success'});
        index++;
      }
    });
    const author=people[Math.min(1,people.length-1)],sequence=nextSequence('cca','Treat2');
    records.push({id:'seed-failed-1',methodId:'cca',group:'Treat2',sequence,name:generatedName('cca','Treat2',sequence),...submitterSnapshot(author),createdAt:'2026-11-02T02:15:00.000Z',status:'failed'});
    save();
  }
  function load() {
    try {
      const saved=JSON.parse(localStorage.getItem(storageKey()));
      if(!saved||!Array.isArray(saved.records)||!saved.records.every(r=>r.id&&r.submitterId&&r.createdAt&&methodFor(r.methodId).id===r.methodId))throw new Error('no saved records');
      records=saved.records.map(r=>{
        const record=r.status==='running'?{...r,status:'success'}:{...r};
        if(!Object.hasOwn(identityLabels,record.submitterIdentity)){
          record.submitterIdentity=submitterIdentity(context.participants.find(user=>user.id===r.submitterId));
          record.submitterIdentitySource='current';
        }
        return record;
      });
      counters=saved.counters||{};collaborationDemoVersion=Number(saved.collaborationDemoVersion)||0;upgradeCollaborationExamples();save();
    }
    catch { seed(); }
  }
  function visibleRecords() {
    const q=query.trim().toLowerCase();
    return records.filter(r=>r.status===status&&matchesSubmitter(r)&&(!q||`${r.name} ${r.submitterName} ${r.submitterAccount} ${identityLabel(r)} ${methodFor(r.methodId).label}`.toLowerCase().includes(q))).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }
  function renderCounts() {
    root.querySelectorAll('[data-ar-status]').forEach(button=>{
      const s=button.dataset.arStatus,count=records.filter(r=>r.status===s).length;
      button.querySelector('b').textContent=count;button.classList.toggle('active',status===s&&panelOpen);button.setAttribute('aria-label',`${statusLabels[s]}分析记录 ${count} 条`);button.setAttribute('aria-expanded',String(status===s&&panelOpen));
    });
  }
  function recordRow(record) {
    const own=mine(record),editable=own&&context.canSubmit;
    return `<div class="ar-record-row ${own?'mine':''}" data-ar-record="${esc(record.id)}" data-ar-submitter="${esc(record.submitterId)}"><div class="ar-record-line"><button class="ar-record-name" data-ar-open="${esc(record.id)}" title="${esc(record.name)}">${esc(record.name)}</button>${own?'<span class="ar-mine-tag">我</span>':''}<div class="ar-record-actions">${editable?`<button class="ar-icon-button" data-ar-rename="${esc(record.id)}" aria-label="重命名 ${esc(record.name)}" title="重命名">${svg('edit')}</button>`:''}${canDeleteRecord(record)?`<button class="ar-icon-button" data-ar-delete="${esc(record.id)}" aria-label="删除 ${esc(record.name)}（提交人：${esc(record.submitterName)}）" title="删除${esc(record.submitterName)}提交的记录">${svg('trash')}</button>`:''}</div></div><div class="ar-record-meta"><span class="ar-submitter-person">${svg('user')}<span class="ar-record-author" title="${esc(record.submitterName)} · 用户名：${esc(record.submitterAccount)}">提交人：${esc(record.submitterName)}</span><span class="ar-submitter-role ${esc(record.submitterIdentity)}" title="${record.submitterIdentitySource==='current'?'当前项目身份；此前记录未保存提交时身份':'提交时的项目身份'}">${identityLabel(record)}</span></span><time datetime="${esc(record.createdAt)}" title="提交时间：${esc(dateParts(record.createdAt))}">${esc(shortDate(record.createdAt))}</time></div></div>`;
  }
  function renderSubmitterFilter() {
    const authors=[...new Map(records.map(r=>[r.submitterId,r])).values()].sort((a,b)=>(identityOrder[a.submitterIdentity]??5)-(identityOrder[b.submitterIdentity]??5)||a.submitterName.localeCompare(b.submitterName,'zh-CN'));
    const duplicateNames=new Set(authors.filter((a,i)=>authors.some((b,j)=>i!==j&&a.submitterName===b.submitterName)).map(a=>a.submitterName));
    const select=root.querySelector('#arSubmitterFilter');
    select.innerHTML='<option value="">全部提交人</option>'+authors.map(a=>{
      const count=records.filter(r=>r.status===status&&r.submitterId===a.submitterId).length;
      const name=duplicateNames.has(a.submitterName)?`${a.submitterName}（${a.submitterAccount}）`:a.submitterName;
      return `<option value="${esc(a.submitterId)}">${esc(name)} · ${identityLabel(a)}（${count}）</option>`;
    }).join('');
    select.value=selectedSubmitter;
  }
  function renderRecords() {
    renderCounts();const list=visibleRecords(),panel=root.querySelector('#arRecordPanel');panel.hidden=!panelOpen;
    root.querySelector('#arRecordTitle').textContent=`${context.project.collab?'协作分析记录':'分析记录'}（${statusLabels[status]}）`;
    root.querySelector('#arStatusCount').textContent=records.filter(r=>r.status===status).length;
    root.querySelector('#arRecordCount').textContent=`共 ${list.length} 条 · ${new Set(list.map(r=>r.submitterId)).size} 人提交`;
    root.querySelector('#arAllCount').textContent=records.filter(r=>r.status===status).length;
    root.querySelector('#arMineCount').textContent=records.filter(r=>r.status===status&&mine(r)).length;
    root.querySelector('#arDeletePermission').textContent=!context.canSubmit?'当前账号仅可查看记录':canDeleteAny()?'可删除本项目所有人的记录':'仅可删除自己提交的记录';
    root.querySelectorAll('[data-ar-scope]').forEach(button=>{
      const active=button.dataset.arScope==='mine'?onlyMine:!onlyMine&&!selectedSubmitter;
      button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
    });
    renderSubmitterFilter();
    const categories=[...new Set(methods.map(m=>m.category))];
    root.querySelector('#arRecordList').innerHTML=list.length?categories.map(category=>{
      const categoryMethods=methods.filter(m=>m.category===category&&list.some(r=>r.methodId===m.id));
      if(!categoryMethods.length)return '';
      return `<section class="ar-category"><div class="ar-category-title">${category}<span>${list.filter(r=>categoryMethods.some(m=>m.id===r.methodId)).length}</span></div>${categoryMethods.map(m=>{const items=list.filter(r=>r.methodId===m.id),closed=collapsed.has(m.id)&&!query;return `<div class="ar-method"><button class="ar-method-toggle" data-ar-method="${m.id}" aria-expanded="${!closed}">${m.label}<span class="ar-method-count">${items.length} 条 · ${new Set(items.map(r=>r.submitterId)).size} 人</span>${svg(closed?'chevron':'up')}</button>${closed?'':items.map(recordRow).join('')}</div>`;}).join('')}</section>`;
    }).join(''):`<div class="ar-empty">${svg('search')}<strong>${query?'没有找到匹配的记录':onlyMine?'暂无你提交的记录':selectedSubmitter?'该用户暂无此状态的记录':`暂无${statusLabels[status]}记录`}</strong><span>${query?'试试其他名称、姓名、身份或用户名':onlyMine||selectedSubmitter?'取消筛选可查看其他人的分析记录':'提交分析后，可在这里查看进度'}</span>${onlyMine||selectedSubmitter||query?'<br><button class="ar-button quiet" data-ar-clear>清除筛选</button>':''}</div>`;
  }
  function projectInfo() {
    const p=context.project;
    return `<div class="ar-content-tabs" role="tablist"><button class="ar-content-tab active" data-ar-tab="info" role="tab" aria-selected="true">项目信息</button><button class="ar-content-tab" data-ar-tab="samples" role="tab" aria-selected="false">样本信息</button><button class="ar-content-tab" data-ar-tab="workflow" role="tab" aria-selected="false">分析流程</button></div><div id="arOverviewBody">${infoTable()}</div>`;
  }
  function infoTable() {
    const p=context.project,rows=[['项目编号',p.code],['合同号',p.contract],['开题单号',p.ticket],['项目名称',p.name],['项目类别',p.category],['项目类型','标准分析'],['完成日期',p.created]];
    return `<table class="ar-info-table"><tbody>${rows.map(([label,value])=>`<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`).join('')}</tbody></table><div class="ar-project-context">${svg('info')}示例项目 · 当前账号：${esc(currentUser().name)}（${esc(currentUser().account)}）</div>`;
  }
  function renderSection() {
    root.querySelectorAll('[data-ar-nav]').forEach(button=>button.classList.toggle('active',button.dataset.arNav===section));
    const content=root.querySelector('#arContent');
    if(section==='info'){content.innerHTML=projectInfo();return;}
    const method=methodFor(section);
    content.innerHTML=`<section class="ar-analysis-view"><h2>${method.label}</h2><p>选择分组方案并提交分析，记录会显示提交人和提交时间。</p><form id="arAnalysisForm" class="ar-config-form"><label class="ar-field"><span class="ar-field-label">分析方法</span><select class="ar-input" id="arMethodInput" name="methodId">${methods.map(m=>`<option value="${m.id}" ${m.id===method.id?'selected':''}>${m.label}</option>`).join('')}</select></label><label class="ar-field"><span class="ar-field-label">分组方案</span><select class="ar-input" id="arGroupInput" name="group"><option value="Treat1">Treat1</option><option value="Treat2">Treat2</option><option value="Control">Control</option></select></label><label class="ar-field"><span class="ar-field-label">分析名称 <small>选填</small></span><input class="ar-input" id="arNameInput" name="name" maxlength="80" autocomplete="off" placeholder="${esc(generatedName(method.id,'Treat1',(counters[`${method.id}:Treat1`]||0)+1))}"><span class="ar-field-hint" id="arAutoName">留空自动命名：${esc(generatedName(method.id,'Treat1',(counters[`${method.id}:Treat1`]||0)+1))}</span></label><label class="ar-field"><span class="ar-field-label">提交人</span><input class="ar-input" value="${esc(currentUser().name)}（${esc(currentUser().account)}）" readonly></label><div class="ar-form-actions"><button type="submit" class="ar-button primary" ${context.canSubmit?'':'disabled'}>${svg('plus')}提交分析</button><button type="button" class="ar-button" data-ar-show-records>查看分析记录</button></div>${context.canSubmit?'':'<span class="ar-field-hint">当前账号可查看此项目的分析结果。</span>'}</form></section>`;
  }
  function toast(message) { const el=root.querySelector('#arToast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},2600); }
  function closeDialog() { const dialog=root.querySelector('#arDialog');if(dialog.open)dialog.close();if(lastFocus?.isConnected)lastFocus.focus(); }
  function dialog(title,body,footer) {
    const el=root.querySelector('#arDialog');lastFocus=document.activeElement;
    el.innerHTML=`<header class="ar-dialog-head"><h2>${title}</h2><button type="button" class="ar-icon-button" data-ar-dialog-close aria-label="关闭">${svg('close')}</button></header><div class="ar-dialog-body">${body}</div><footer class="ar-dialog-foot">${footer}</footer>`;
    if(!el.open)el.showModal();
  }
  function showRecord(id) {
    const r=records.find(r=>r.id===id);if(!r)return;
    dialog('分析记录详情',`<h3 class="ar-detail-name">${esc(r.name)} ${mine(r)?'<span class="ar-mine-tag">我</span>':''}</h3><dl class="ar-detail-info"><dt>分析方法</dt><dd>${methodFor(r.methodId).label}</dd><dt>分组方案</dt><dd>${esc(r.group)}</dd><dt>提交人</dt><dd>${esc(r.submitterName)}（${esc(r.submitterAccount)}）</dd><dt>${r.submitterIdentitySource==='current'?'当前项目身份':'提交时身份'}</dt><dd>${identityLabel(r)}</dd><dt>提交时间</dt><dd>${esc(dateParts(r.createdAt))}</dd><dt>运行状态</dt><dd><span class="ar-state-label ${r.status}">${svg(r.status)}${statusLabels[r.status]}</span></dd><dt>记录编号</dt><dd>${esc(r.id)}</dd></dl>`,`<button class="ar-button" data-ar-dialog-close>关闭</button>${mine(r)&&context.canSubmit?`<button class="ar-button primary" data-ar-rename="${esc(r.id)}">修改名称</button>`:''}`);
  }
  function renameRecord(id) {
    const r=records.find(r=>r.id===id);if(!r||!mine(r)||!context.canSubmit)return;
    dialog('修改分析名称',`<form id="arRenameForm" data-record-id="${esc(id)}"><label class="ar-field"><span class="ar-field-label">分析名称</span><input class="ar-input" name="name" id="arRenameInput" value="${esc(r.name)}" maxlength="80" required><span class="ar-field-hint">修改名称后，提交人和提交时间保持不变。</span></label></form>`,'<button class="ar-button" data-ar-dialog-close>取消</button><button type="submit" form="arRenameForm" class="ar-button primary">保存名称</button>');
    root.querySelector('#arRenameInput').focus();root.querySelector('#arRenameInput').select();
  }
  function deleteRecord(id) {
    const r=records.find(r=>r.id===id);if(!canDeleteRecord(r))return;
    dialog('删除分析记录',`<p>确认删除“${esc(r.name)}”？</p><p>提交人：${esc(r.submitterName)} <span class="ar-submitter-role ${esc(r.submitterIdentity)}">${identityLabel(r)}</span></p><p class="ar-field-hint">确认后，将从本项目的分析记录中删除这一条运行记录。</p>`,`<button class="ar-button" data-ar-dialog-close>取消</button><button class="ar-button danger" data-ar-confirm-delete="${esc(id)}">确认删除</button>`);
  }
  function updateAutoName() {
    const methodId=root.querySelector('#arMethodInput').value,group=root.querySelector('#arGroupInput').value;
    const name=generatedName(methodId,group,(counters[`${methodId}:${group}`]||0)+1);
    root.querySelector('#arNameInput').placeholder=name;root.querySelector('#arAutoName').textContent=`留空自动命名：${name}`;
  }
  function submitAnalysis(form) {
    if(!context.canSubmit)return;
    const data=new FormData(form),methodId=data.get('methodId'),group=data.get('group'),sequence=nextSequence(methodId,group),author=currentUser();
    const r={id:`AN-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,methodId,group,sequence,name:String(data.get('name')||'').trim()||generatedName(methodId,group,sequence),...submitterSnapshot(author),createdAt:new Date().toISOString(),status:'running'};
    records.push(r);save();status='running';panelOpen=true;query='';selectedSubmitter='';root.querySelector('#arRecordSearch').value='';collapsed.delete(methodId);renderRecords();form.reset();updateAutoName();toast('分析已提交，可在运行中查看');
    const projectId=context.project.id;
    setTimeout(()=>{if(context?.project.id!==projectId)return;const record=records.find(item=>item.id===r.id);if(!record)return;record.status='success';save();if(status==='running'){status='success';collapsed.delete(methodId);}renderRecords();toast('示例分析已完成');},1800);
  }
  function showReport() {
    const list=records.filter(r=>r.status==='success'&&matchesSubmitter(r));
    dialog('分析记录汇总',`<p>当前项目共有 ${list.length} 条${onlyMine?'由你提交的':''}成功记录。</p><p class="ar-field-hint">导出内容包含分析名称、提交人、提交时间及分组方案。</p>`,'<button class="ar-button" data-ar-dialog-close>关闭</button><button class="ar-button primary" data-ar-export>导出记录</button>');
  }
  function exportRecords() {
    const list=records.filter(r=>r.status==='success'&&matchesSubmitter(r)),cell=value=>'"'+String(value).replace(/"/g,'""')+'"';
    const csv='\ufeff'+[['分析名称','分析方法','分组方案','提交人','项目身份','用户名','提交时间'],...list.map(r=>[r.name,methodFor(r.methodId).label,r.group,r.submitterName,identityLabel(r),r.submitterAccount,dateParts(r.createdAt)])].map(row=>row.map(cell).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`${context.project.code}-分析记录.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);closeDialog();toast('分析记录已导出');
  }
  function bind() {
    root.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button||button.disabled)return;
      if(button.hasAttribute('data-ar-back'))return context.onBack();
      if(button.hasAttribute('data-ar-dialog-close'))return closeDialog();
      if(button.hasAttribute('data-ar-status')){const selected=button.dataset.arStatus;panelOpen=status!==selected||!panelOpen;status=selected;return renderRecords();}
      if(button.hasAttribute('data-ar-panel-close')){panelOpen=false;return renderRecords();}
      if(button.hasAttribute('data-ar-show-records')){panelOpen=true;return renderRecords();}
      if(button.dataset.arMethod){const id=button.dataset.arMethod;collapsed.has(id)?collapsed.delete(id):collapsed.add(id);return renderRecords();}
      if(button.hasAttribute('data-ar-clear')){query='';onlyMine=false;selectedSubmitter='';root.querySelector('#arRecordSearch').value='';return renderRecords();}
      if(button.dataset.arScope){onlyMine=button.dataset.arScope==='mine';selectedSubmitter='';collapsed.clear();return renderRecords();}
      if(button.dataset.arOpen)return showRecord(button.dataset.arOpen);
      if(button.dataset.arRename)return renameRecord(button.dataset.arRename);
      if(button.dataset.arDelete)return deleteRecord(button.dataset.arDelete);
      if(button.dataset.arConfirmDelete){const id=button.dataset.arConfirmDelete,r=records.find(r=>r.id===id);if(!canDeleteRecord(r))return;records=records.filter(r=>r.id!==id);save();closeDialog();renderRecords();return toast('分析记录已删除');}
      if(button.hasAttribute('data-ar-report'))return showReport();
      if(button.hasAttribute('data-ar-export'))return exportRecords();
      if(button.dataset.arNav){section=button.dataset.arNav;panelOpen=section==='info';renderSection();return renderRecords();}
      if(button.hasAttribute('data-ar-new')){section='cca';panelOpen=false;renderSection();renderRecords();return root.querySelector('#arNameInput').focus();}
      if(button.dataset.arTab){const value=button.dataset.arTab;root.querySelectorAll('[data-ar-tab]').forEach(tab=>{tab.classList.toggle('active',tab===button);tab.setAttribute('aria-selected',String(tab===button));});root.querySelector('#arOverviewBody').innerHTML=value==='info'?infoTable():value==='samples'?`<table class="ar-sample-table"><thead><tr><th>示例样本</th><th>分组</th><th>状态</th></tr></thead><tbody>${['Treat1','Treat2','Control'].flatMap(g=>[1,2,3].map(i=>`<tr><td>${g}_${i}</td><td>${g}</td><td>已完成</td></tr>`)).join('')}</tbody></table>`:`<div class="ar-workflow"><span class="ar-workflow-step">数据导入</span>${svg('chevron')}<span class="ar-workflow-step">数据质控</span>${svg('chevron')}<span class="ar-workflow-step">统计分析</span>${svg('chevron')}<span class="ar-workflow-step">结果与报告</span></div>`;}
    });
    root.addEventListener('input',event=>{if(event.target.id==='arRecordSearch'){query=event.target.value;renderRecords();}});
    root.addEventListener('change',event=>{if(event.target.id==='arPreviewViewer')return context.onViewerChange?.(event.target.value);if(event.target.id==='arSubmitterFilter'){selectedSubmitter=event.target.value;onlyMine=false;collapsed.clear();renderRecords();}if(['arMethodInput','arGroupInput'].includes(event.target.id))updateAutoName();});
    root.addEventListener('submit',event=>{
      event.preventDefault();if(event.target.id==='arAnalysisForm')return submitAnalysis(event.target);
      if(event.target.id==='arRenameForm'){const record=records.find(r=>r.id===event.target.dataset.recordId),name=new FormData(event.target).get('name').trim();if(!record||!mine(record)||!context.canSubmit||!name)return;record.name=name;save();closeDialog();renderRecords();toast('分析名称已更新');}
    });
    root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!root.querySelector('#arDialog').open){panelOpen=false;renderRecords();}});
  }
  function mount(options) {
    if(!root){root=document.createElement('div');root.id='analysisResultRoot';document.body.append(root);bind();}
    const changed=!context||context.project.id!==options.project.id||context.viewer.id!==options.viewer.id;
    context=options;root.hidden=false;document.body.classList.add('analysis-result-mode');
    if(!changed&&root.querySelector('.ar-page'))return;
    query='';onlyMine=false;selectedSubmitter='';status='success';section='info';panelOpen=true;collapsed=new Set(['mfa','o2pls','kegg','diff','correlation']);load();
    root.innerHTML=`<div class="ar-page" data-screen-label="项目分析结果"><header class="ar-top"><div class="ar-brand"><svg class="ar-brand-mark" viewBox="0 0 56 44" fill="none" aria-hidden="true"><path d="M12 36C-2 36 1 19 13 18 17-1 47 0 48 20 62 24 54 39 43 38H12Z" fill="white"/><path d="m13 28 20-17m-16 23 20-17m-15 21 20-17M12 20l27 10M13 27l23 9" stroke="#424d5b" stroke-width="3"/></svg><div><strong>派森诺基因云</strong><small>GENES CLOUD</small></div></div><nav class="ar-top-nav" aria-label="平台导航"><span>云分析</span><span>云图汇⌄</span><span>云学院</span></nav><div class="ar-top-actions"><button class="ar-top-back" data-ar-back>${svg('back')}返回项目详情</button><div class="ar-top-user"><span>${esc(currentUser().name)}</span><span class="ar-avatar">${esc(currentUser().name.slice(0,1))}</span></div></div></header><div class="ar-layout"><aside class="ar-sidebar" aria-label="分析功能导航"><button class="ar-nav active" data-ar-nav="info">${svg('grid')}<span class="ar-nav-label">项目概况</span></button><button class="ar-nav" disabled>${svg('folder')}<span class="ar-nav-label">数据系统管理</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" data-ar-nav="diff">${svg('folder')}<span class="ar-nav-label">差异数据</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" disabled>${svg('document')}<span class="ar-nav-label">一键分析</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" disabled>${svg('palette')}<span class="ar-nav-label">图形配色管理</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" data-ar-nav="kegg">${svg('network')}<span class="ar-nav-label">共有差异与通路分析</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" data-ar-nav="correlation">${svg('chart')}<span class="ar-nav-label">相关性分析</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" data-ar-nav="coia">${svg('layers')}<span class="ar-nav-label">一致性分析</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" data-ar-nav="cca">${svg('chart')}<span class="ar-nav-label">约束排序分析</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" disabled>${svg('chart')}<span class="ar-nav-label">机器学习分析</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" disabled>${svg('network')}<span class="ar-nav-label">WGCNA分析</span><span class="ar-chevron">${svg('chevron')}</span></button><button class="ar-nav" disabled>${svg('network')}<span class="ar-nav-label">MIMOSA2分析</span><span class="ar-chevron">${svg('chevron')}</span></button><span class="ar-side-foot">科研协作 · 结果共享</span></aside><main class="ar-main"><div class="ar-toolbar"><div class="ar-toolbar-left"><span class="ar-breadcrumb">项目概况</span><span class="ar-guide">${svg('document')}方法介绍和绘图指南${svg('chevron')}</span></div><div class="ar-toolbar-right"><div class="ar-statuses">${['queued','running','success','failed'].map(s=>`<button class="ar-status ${s}" data-ar-status="${s}" title="${statusLabels[s]}分析记录" aria-controls="arRecordPanel">${svg(s)}<b>0</b></button>`).join('')}</div><button class="ar-button" data-ar-new ${context.canSubmit?'':'disabled'}>${svg('plus')}新建分析</button><button class="ar-button primary" data-ar-report>生成报告</button></div></div><section class="ar-content" id="arContent"></section><aside class="ar-record-panel" id="arRecordPanel" aria-label="分析记录"><div class="ar-panel-heading"><div class="ar-panel-title"><span id="arRecordTitle">分析记录（成功）</span><span class="ar-panel-count" id="arStatusCount">20</span></div><button class="ar-icon-button" data-ar-panel-close aria-label="关闭分析记录">${svg('close')}</button></div><div class="ar-panel-tools"><label class="ar-search">${svg('search')}<input id="arRecordSearch" type="search" placeholder="搜索分析名称、提交人或用户名" aria-label="搜索分析记录"></label><div class="ar-record-scopes" role="group" aria-label="记录范围"><button type="button" class="ar-record-scope active" data-ar-scope="all" aria-pressed="true">全部记录 <b id="arAllCount">0</b></button><button type="button" class="ar-record-scope" data-ar-scope="mine" aria-pressed="false">我提交的 <b id="arMineCount">0</b></button></div><div class="ar-filter-row"><span>提交人</span><select class="ar-submitter-filter" id="arSubmitterFilter" aria-label="按提交人筛选"><option value="">全部提交人</option></select></div><div class="ar-record-permission">${svg('info')}<span id="arDeletePermission"></span></div><div class="ar-filter-summary"><span class="ar-list-count" id="arRecordCount">共20条</span><span>姓名 · 项目身份 · 时间</span></div></div><div class="ar-panel-list" id="arRecordList"></div><footer class="ar-panel-footer"><span>${svg('clock')}按提交时间倒序</span><label class="ar-viewer-preview"><span>体验账号</span><select id="arPreviewViewer" aria-label="切换体验账号">${[...new Map([...context.participants,currentUser()].map(user=>[user.id,user])).values()].map(user=>`<option value="${esc(user.id)}" ${user.id===currentUser().id?'selected':''}>${esc(user.name)}</option>`).join('')}</select></label></footer></aside></main></div><dialog class="ar-dialog" id="arDialog" aria-label="分析记录操作"></dialog><div class="ar-toast" id="arToast" role="status" aria-live="polite" hidden></div></div>`;
    renderSection();renderRecords();
  }
  function unmount() { if(!root)return;const dialog=root.querySelector('#arDialog');if(dialog?.open)dialog.close();root.hidden=true;document.body.classList.remove('analysis-result-mode');context=null;clearTimeout(toastTimer); }
  return {mount,unmount};
})();
