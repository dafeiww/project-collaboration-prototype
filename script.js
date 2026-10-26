/* 本文件只运行交互演示；真实账号核验、授权与数据存储必须由服务端实现。 */
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M16 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  shield: '<path d="M12 2 20 5v6c0 5-3.1 8.6-8 11-4.9-2.4-8-6-8-11V5l8-3z"/><path d="m9 12 2 2 4-4"/>',
  person: '<circle cx="12" cy="7" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/>',
  eye: '<path d="M2 12s3.7-6 10-6 10 6 10 6-3.7 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.8"/>',
  pulse: '<path d="M2 12h5l3-7 4 14 3-7h5"/>',
  chart: '<path d="M4 20V4m0 16h16M8 15l4-4 3 2 5-7"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>'
};
function icon(name, cls = 'icon') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`; }
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon, 'icon'); });

const roleNames = { owner: '项目所有者', admin: '管理员', member: '成员', visitor: '访问者' };
const roleIcons = { admin: 'shield', member: 'person', visitor: 'eye' };
const roleDescriptions = {
  owner: '确认管理归属，指定管理员，负责项目交接。',
  admin: '管理成员与权限，在授权范围内管理项目。',
  member: '开展分析，使用授权数据，分享成果。',
  visitor: '查看授权内容；下载权限单独设置。'
};
let directory = [
  { id: 'owner-1', name: '王老师', phone: '13800000000', account: 'wang.laoshi' },
  { id: 'support-1', name: '技术支持', phone: '13800000004', account: 'tech.support' },
  { id: 'chen-1', name: '陈老师', phone: '13800000001', account: 'chen.laoshi' },
  { id: 'li-1', name: '小李', phone: '13800000002', account: 'xiao.li' },
  { id: 'zhou-1', name: '小周', phone: '13800000003', account: 'xiao.zhou' },
  { id: 'xia-1', name: '夏老师', phone: '13800000005', account: 'xia.laoshi' },
  { id: 'lin-1', name: '林老师', phone: '13800000006', account: 'lin.laoshi' }
];
const accountCopy = {
  subtitle: '输入注册手机号后将自动显示匹配的云平台账号，请确认无误。',
  mismatch: '手机号或云平台账号不匹配，请核对后重试。'
};
const safetyMessage = '为保证项目数据安全，请再次核对手机号和云平台账号是否属于拟邀请的成员';
const initialProjects = [
  { id: 'analysis', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610201731FS5D', name: '测试示例-定量蛋白组分析', category: '定量蛋白组云分析', created: '2026-10-20 17:31:42', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true },
    { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'visitor' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'protein-mod-1', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610100956LETO', name: '测试示例-修饰蛋白组云分析', category: '修饰蛋白组云分析', created: '2026-10-10 09:56:29', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'protein-mod-2', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610100956Y9BS', name: '测试示例-修饰蛋白组云分析', category: '修饰蛋白组云分析', created: '2026-10-10 09:56:28', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'zhou-1', role: 'member' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'single-cell', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'SC202609031329Z8DE', name: '测试示例-新版单细胞转录组分析', category: '新版单细胞转录组分析', created: '2026-09-03 13:29:41', status: '完成', type: '云分析', collab: true, shared: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'member' }, { id: 'xia-1', role: 'visitor' }
  ], visitorDownload: true },
  { id: 'small-rna', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'TR202607290946X73M', name: '测试示例-农学 SmallRNA分析', category: 'SmallRNA云分析', created: '2026-07-29 09:46:58', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'li-1', role: 'member' }, { id: 'lin-1', role: 'visitor' }
  ], visitorDownload: true },
  { id: 'transcript-metab', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'TR2026070217342DUP', name: '测试示例-新版转录与代谢组联合分析', category: '新版转录与代谢组联合分析', created: '2026-07-02 17:34:06', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'admin' }, { id: 'zhou-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'diversity-metab', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'MD202606151415PO0U', name: '测试示例-新版多样性与代谢组联合分析', category: '新版多样性与代谢组联合分析', created: '2026-06-15 14:15:33', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'li-1', role: 'member' }, { id: 'xia-1', role: 'visitor' }
  ], visitorDownload: true },
  { id: 'visual', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'YT20261021008', name: '多组学数据可视化项目', category: '云图汇', created: '2026-10-21 10:08:00', status: '完成', type: '云图汇', collab: true, shared: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true },
    { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'visitor' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true }
];
const initialGroups = [
  { id: 'group-onco', name: '肿瘤早筛课题组', members: [
    { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'admin' },
    { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'member' }
  ]},
  { id: 'group-micro', name: '微生物多样性课题组', members: [
    { id: 'support-1', role: 'admin', initial: true }, { id: 'lin-1', role: 'member' }, { id: 'xia-1', role: 'visitor' }
  ]}
];
const storageKey = 'personalbio-project-collaboration-preview-v6-collab-records';
let projects, groups, collabRecords = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (!saved || !Array.isArray(saved.projects) || !Array.isArray(saved.groups)) throw new Error('无本地记录');
  projects = saved.projects; groups = saved.groups;
  collabRecords = Array.isArray(saved.collabRecords) ? saved.collabRecords : [];
  if (Array.isArray(saved.directory)) directory = saved.directory;
} catch { projects = structuredClone(initialProjects); groups = structuredClone(initialGroups); }
for (const container of [...projects, ...groups]) for (const m of container.members || []) if (m.id === 'support-1') m.role = 'admin';
let page = 'projects', activeProjectId = 'analysis', tab = 'members', listTab = 'mine', identity = 'owner', search = '', categoryFilter = '', selectedProjectIds = [], modal = null, toastTimer, confirmationTimer, returnFocus = null;
const main = document.getElementById('main'), modalRoot = document.getElementById('modalRoot'), confirmRoot = document.getElementById('confirmRoot');
function saveAll() { try { localStorage.setItem(storageKey, JSON.stringify({ projects, groups, collabRecords, directory })); } catch { notify('浏览器未允许保存，当前操作将在本次浏览期间生效'); } }
function project() { return projects.find(p => p.id === activeProjectId) || projects[0]; }
function group(id) { return groups.find(g => g.id === id); }
function person(id) { return directory.find(d => d.id === id) || { name: '未知成员', phone: '', account: '' }; }
function safe(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function canManage() { return identity === 'owner' || identity === 'admin'; }
function notify(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3000); }
function syncRecords(pid) { const p = projects.find(x => x.id === pid); if (!p) return; collabRecords.filter(r => r.projectId === pid).forEach(r => { r.members = (r.members || []).filter(m => p.members.some(pm => pm.id === m.id)).map(m => ({ ...m, role: p.members.find(pm => pm.id === m.id).role })); }); }
function navigate(next) { page = next; search = ''; categoryFilter = ''; render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function avatar(name, index = 0) { return `<span class="avatar ${['','lavender','sand','blue','coral'][index % 5]}">${safe(name.slice(0, 1))}</span>`; }
function heading(title, subtitle, actions = '') { return `<div class="page-heading"><div><div class="eyebrow">我的科研空间</div><h1>${title}</h1><p>${subtitle}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`; }
function emptyState(title, subtitle = '', action = '') { return `<div class="empty-icon">${icon('folder')}</div><strong>${title}</strong><p>${subtitle}</p>${action}`; }
function memberRoster(members, max = 5) { return members.length ? `<div class="roster">${members.slice(0,max).map((m,i)=>`<span class="roster-item">${avatar(person(m.id).name,i)}<span>${safe(person(m.id).name)}</span></span>`).join('')}${members.length>max?`<span class="more-count">+${members.length-max}</span>`:''}</div>` : '<span class="roster-empty">暂无成员</span>'; }
function searchField(id, label) { return `<label class="search-wrap">${icon('search')}<input id="${id}" type="search" placeholder="${label}" aria-label="${label}" value="${safe(search)}"></label>`; }
function tableFooter(count, noun='个项目') { return `<div class="table-footer"><span>共 ${count} ${noun}${count ? `，显示全部 ${count} 条` : ''}</span><div class="page-info"><span>全部记录</span><button disabled aria-label="上一页">‹</button><span class="page-chip">1</span><button disabled aria-label="下一页">›</button></div></div>`; }
function pageFoot(text) { return `<p class="list-foot">${icon('info')}${text}</p>`; }
function stats() {
  const items = [
    ['全部项目',projects.length,'个','folder','全部科研项目，一处管理','项目总览'],
    ['共享项目',projects.filter(p=>p.shared).length,'个','link','已共享的项目与分析成果','共享空间'],
    ['协作项目',collabRecords.length,'条','people','连接项目与课题组的协作','团队协作'],
    ['课题组',groups.length,'个','shield',`${directory.length} 位成员，一同探索`,'成员组织']
  ];
  return `<div class="stats-grid">${items.map(([label,num,unit,ico,desc,aria],i)=>`<article class="stat-card" aria-label="${aria}"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon(ico)}</span></div><div class="stat-number">${String(num).padStart(2,'0')}<small>${unit}</small></div><div class="stat-desc"><span class="accent">${i===0?'已就绪':i===2?'有序协作':'持续连接'}</span>${desc}</div><svg class="stat-spark" viewBox="0 0 64 24" aria-hidden="true"><path d="M1 21 10 15 18 18 26 8 35 12 44 5 53 9 63 2" fill="none" stroke="${['#a9c8af','#adc0d3','#d1c29c','#c4b6d3'][i]}" stroke-width="1.5"/></svg></article>`).join('')}</div>`;
}
function filteredProjects() { const q = search.trim().toLowerCase(); return projects.filter(p=>(!categoryFilter||p.category===categoryFilter)&&`${p.name} ${p.code} ${p.category} ${p.ticket} ${p.contract}`.toLowerCase().includes(q)); }
function projectCell(p, i = 0) { return `<div class="project-title-cell"><span class="project-mark ${['','lavender','sand','blue'][i%4]}">${icon(p.id==='single-cell'?'grid':p.id==='visual'?'chart':'folder')}</span><div><button class="project-name" data-open-project="${safe(p.id)}">${safe(p.name.replace(/^测试示例-/,'').replace(/^测试示例—/,''))}</button><span class="project-code">${safe(p.code)}</span></div></div>`; }
function renderProjects() {
  const counts = { mine: projects.length, shared: projects.filter(p=>p.shared).length, collab: collabRecords.length };
  const tabs = [['mine','派森诺项目'],['shared','共享项目'],['collab','协作项目']];
  const q = search.trim().toLowerCase();
  const list = listTab==='collab' ? collabRecords.filter(r=>`${r.projectName} ${r.code} ${r.groupName} ${(r.members||[]).map(m=>person(m.id).name).join(' ')}`.toLowerCase().includes(q)) : filteredProjects().filter(p=>listTab==='mine'||p.shared);
  const mine = listTab==='mine', collab = listTab==='collab';
  const selectedCount = selectedProjectIds.length;
  let head, rows;
  if (collab) {
    head='<tr><th>协作项目</th><th>所属课题组</th><th>协作成员</th><th>协作时间</th><th>操作</th></tr>';
    rows=list.map((r,i)=>`<tr><td>${projectCell({id:r.projectId,name:r.projectName,code:r.code},i)}</td><td><span class="group-chip">${safe(r.groupName)}</span></td><td>${memberRoster(r.members||[],3)}</td><td class="date-cell">${safe(r.createdAt)}</td><td><div class="table-actions"><button class="btn quiet small text-primary" data-manage-record="${safe(r.id)}">管理成员 ${icon('people')}</button></div></td></tr>`).join('');
  } else {
    head=`<tr>${mine?'<th class="check-cell"><input type="checkbox" data-select-all-projects aria-label="全选当前筛选项目"></th>':''}<th>项目名称 / 编号</th><th>开题 / 合同编号</th><th>所属类别</th><th>创建时间</th><th>状态</th><th>操作</th></tr>`;
    rows=list.map((p,i)=>`<tr class="${selectedProjectIds.includes(p.id)?'selected':''}">${mine?`<td class="check-cell"><input type="checkbox" data-select-project="${p.id}" ${selectedProjectIds.includes(p.id)?'checked':''} aria-label="选择 ${safe(p.name)}"></td>`:''}<td>${projectCell(p,i)}</td><td><span class="project-meta">演示开题单<small>演示合同编号</small></span></td><td><span class="category-tag">${safe(p.category)}</span></td><td class="date-cell">${safe(p.created.split(' ')[0])}</td><td><span class="status-chip">已完成</span></td><td><div class="table-actions">${mine?`<button class="btn primary small" data-collab-one="${p.id}" ${!canManage()?'disabled':''}>${icon('link')}项目协作</button><button class="btn quiet small" data-share-project="${p.id}" ${!canManage()?'disabled':''}>${p.shared?'取消共享':'共享'}</button>`:''}<button class="btn quiet small" data-open-project="${p.id}">详情</button></div></td></tr>`).join('');
  }
  const cols = collab?5:mine?7:6;
  return `<div class="page" data-screen-label="项目列表">${heading('项目列表','每一份数据，都是探索的起点。让项目与团队在这里连接。',`<button class="btn ghost" data-nav="groups">${icon('people')}课题组管理</button>${mine?`<button class="btn primary" data-collab-selected ${!canManage()?'disabled':''}>${icon('plus')}发起项目协作</button>`:''}`)}${stats()}
    <section class="surface"><div class="surface-top"><div class="list-tabs" role="tablist" aria-label="项目类型">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${listTab===key}" class="${listTab===key?'active':''}" data-list-tab="${key}">${label}<span class="tab-count">${counts[key]}</span></button>`).join('')}</div><span class="surface-caption">所有项目，有序协同</span></div>
    <div class="list-toolbar">${searchField('projectSearch','搜索项目名称、编号或成员')}
    <div class="toolbar-right">${!collab?`<label class="filter-label"><span>项目类别</span><select id="categoryFilter" class="filter-select" aria-label="筛选项目类别"><option value="">全部类别</option>${[...new Set(projects.map(p=>p.category))].map(c=>`<option ${categoryFilter===c?'selected':''} value="${safe(c)}">${safe(c)}</option>`).join('')}</select></label>`:''}${mine?`<button class="btn" data-collab-selected ${!canManage()?'disabled':''}>${icon('link')}批量协作${selectedCount?` · ${selectedCount}`:''}</button>`:`<span class="small-count">${list.length} ${collab?'条协作':'个项目'}</span>`}</div></div>
    ${mine&&selectedCount?`<div class="selection-note">已选择 ${selectedCount} 个项目<button data-clear-projects>清空选择</button></div>`:''}
    <div class="table-shell project-table"><div class="table-scroll"><table><thead>${head}</thead><tbody>${rows||`<tr><td colspan="${cols}" class="empty-cell">${emptyState(collab?'还没有协作项目':'未找到匹配的项目',collab?'在派森诺项目中勾选项目，选择一个课题组和成员，即可发起协作。':'试试其他关键词或项目类别。',collab?'<button class="btn" data-list-tab="mine">前往派森诺项目</button>':'')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,collab?'条协作记录':'个项目')}</section>${pageFoot('支持单选或多选项目发起协作；课题组单选，组内成员可多选。')}</div>`;
}
function renderGroups() {
  const q = search.trim().toLowerCase();
  const list = groups.filter(g=>`${g.name} ${g.members.map(m=>person(m.id).name).join(' ')}`.toLowerCase().includes(q));
  return `<div class="page" data-screen-label="课题组列表">${heading('课题组列表','把志同道合的人聚在一起，让每一次协作更高效。',`<button class="btn primary" data-create-group ${!canManage()?'disabled':''}>${icon('plus')}添加课题组</button>`)}${stats()}
    <div class="info-banner">${icon('shield')}<div><h2>技术支持，为课题组提供专业协助</h2><p>可在课题组中直接添加技术支持，加入后固定为管理员角色。</p></div></div>
    <section class="surface"><div class="surface-top"><h2 class="surface-title">我的课题组 <span class="tab-count">${groups.length}</span></h2><span class="surface-caption">一个课题组，一次专注的探索</span></div><div class="toolbar">${searchField('groupSearch','搜索课题组名称或成员')}<span class="small-count">共 ${list.length} 个课题组</span></div>
    <div class="table-shell group-table"><div class="table-scroll"><table><thead><tr><th>课题组</th><th>成员名单</th><th style="text-align:right">操作</th></tr></thead><tbody>${list.map(g=>`<tr><td><div class="group-cell"><span class="group-emblem">${icon('people')}</span><div><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员 · 科研协作</small></div></div></td><td>${memberRoster(g.members)}</td><td><div class="table-actions group-actions"><button class="btn primary small" data-open-collab="${g.id}" ${!canManage()?'disabled':''}>${icon('link')}协作项目</button><button class="btn quiet small" data-group-add="${g.id}" ${!canManage()?'disabled':''}>添加成员</button>${g.members.some(m=>m.id==='support-1')?'<span class="support-state">技术支持已加入</span>':`<button class="btn quiet small text-primary" data-add-support-group="${g.id}" ${!canManage()?'disabled':''}>添加技术支持</button>`}</div></td></tr>`).join('')||`<tr><td colspan="3" class="empty-cell">${emptyState('还没有课题组','点击“添加课题组”，邀请成员一起探索。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'个课题组')}</section></div>`;
}
function renderMemberDirectory() {
  const q=search.trim().toLowerCase();
  const list=directory.filter(d=>`${d.name} ${d.account} ${d.phone}`.toLowerCase().includes(q));
  return `<div class="page" data-screen-label="成员列表">${heading('成员列表','每一个伙伴，都是科研协作不可或缺的一部分。',`<button class="btn primary" data-add-directory ${!canManage()?'disabled':''}>${icon('plus')}添加人员</button>`)}${stats()}
    <section class="surface"><div class="surface-top"><h2 class="surface-title">所有成员 <span class="tab-count">${directory.length}</span></h2><span class="surface-caption">云平台账号与课题组归属</span></div><div class="toolbar">${searchField('memberSearch','搜索姓名、账号或手机号')}<span class="small-count">共 ${list.length} 位成员</span></div>
    <div class="table-shell directory-table"><div class="table-scroll"><table><thead><tr><th>成员</th><th>云平台账号</th><th>手机号</th><th>所在课题组</th></tr></thead><tbody>${list.map((d,i)=>{const gs=groups.filter(g=>g.members.some(m=>m.id===d.id)); return `<tr><td><div class="member-cell">${avatar(d.name,i)}<div><div class="member-name">${safe(d.name)}${d.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><span class="member-note">${d.id==='owner-1'?'项目所有者':d.id==='support-1'?'平台技术支持':'云平台成员'}</span></div></div></td><td>${safe(d.account)}</td><td class="date-cell">${safe(d.phone.slice(0,3))} **** ${safe(d.phone.slice(-4))}</td><td>${gs.map(g=>`<span class="group-chip">${safe(g.name)}</span>`).join('')||'<span class="fixed">暂未加入课题组</span>'}</td></tr>`;}).join('')||`<tr><td colspan="4" class="empty-cell">${emptyState('未找到匹配的成员','试试其他姓名、账号或手机号。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'位成员')}</section>${pageFoot('添加人员后，可在课题组中邀请该成员，再将其协作到项目。')}</div>`;
}
function renderMemberRow(member,index) { const u=person(member.id); return `<tr><td><div class="member-cell">${avatar(u.name,index)}<div><div class="member-name">${safe(u.name)}${member.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><span class="member-note">${safe(u.account)}</span></div></div></td><td><span class="role-pill ${member.role}">${icon(roleIcons[member.role]||'person')}${roleNames[member.role]}</span></td><td class="date-cell">${safe(u.phone.slice(0,3))} **** ${safe(u.phone.slice(-4))}</td><td><div class="table-actions">${canManage()?`<button class="btn quiet small text-primary" data-edit-member="${member.id}" ${member.id==='support-1'?'disabled title="技术支持固定为管理员"':''}>调整角色</button><button class="btn quiet small danger" data-remove-member="${member.id}">移除成员</button>`:'<span class="fixed">暂无管理权限</span>'}</div></td></tr>`; }
function renderMembers(p) {
  const list=p.members.filter(m=>m.role!=='owner'&&`${person(m.id).name} ${person(m.id).account} ${roleNames[m.role]}`.toLowerCase().includes(search.toLowerCase()));
  return `<section class="surface"><div class="section-header"><div><h2>项目成员</h2><p>为每一位协作伙伴，分配合适的权限</p></div><div class="section-actions"><button class="btn primary" data-add ${!canManage()?'disabled':''}>${icon('plus')}添加成员</button></div></div><div class="toolbar">${searchField('memberSearch','搜索成员姓名或账号')}<span class="small-count">共 ${list.length} 位协作成员</span></div><div class="table-shell directory-table"><div class="table-scroll"><table><thead><tr><th>协作成员</th><th>项目角色</th><th>手机号</th><th style="text-align:right">操作</th></tr></thead><tbody>${list.map(renderMemberRow).join('')||`<tr><td colspan="4" class="empty-cell">${emptyState('暂无匹配的协作成员','可通过“添加成员”邀请伙伴参与项目。')}</td></tr>`}</tbody></table></div></div><div class="detail-permission"><span>项目所有者：${safe(person(p.members.find(m=>m.role==='owner')?.id||'owner-1').name)}</span><label class="download-toggle"><input id="visitorDownload" type="checkbox" ${p.visitorDownload?'checked':''} ${!canManage()?'disabled':''}>允许访问者下载数据</label></div></section>`;
}
function renderDetail() {
  const p=project();
  return `<div class="page" data-screen-label="项目详情"><button class="back-link" data-nav="projects">${icon('back')}返回项目列表</button><section class="surface detail-header"><div class="detail-card"><div class="detail-title"><span class="project-mark">${icon('folder')}</span><div><h1>${safe(p.name.replace(/^测试示例-/,''))}</h1><p>${safe(p.code)} · ${safe(p.category)}</p></div></div><span class="status-chip">已完成</span></div><div class="detail-meta"><div><span>开题单号</span><strong>${safe(p.ticket)}</strong></div><div><span>合同编号</span><strong>${safe(p.contract)}</strong></div><div><span>创建时间</span><strong>${safe(p.created)}</strong></div><div><span>协作成员</span><strong>${p.members.filter(m=>m.role!=='owner').length} 位成员</strong></div></div><div class="detail-tabs"><button data-tab="data" class="${tab==='data'?'active':''}">项目概况</button><button data-tab="members" class="${tab==='members'?'active':''}">项目协作</button></div></section>${tab==='members'?renderMembers(p):renderProjectSummary(p)}</div>`;
}
function renderProjectSummary(p) { return `<section class="surface summary-panel"><h2>分析任务已完成</h2><div class="progress-row"><span>项目分析进度</span><span>100%</span></div><div class="progress-track"><i style="width:100%"></i></div><p class="member-note" style="margin:20px 0">${safe(p.name)}已完成分析，可切换到项目协作管理成员和访问权限。</p><button class="btn" data-tab="members">${icon('people')}管理协作成员</button></section>`; }
function renderOverview() { return `<div class="page" data-screen-label="项目概况">${heading('欢迎回来，王老师','科研的每一步探索，都值得被妥善连接。',`<button class="btn primary" data-nav="projects">${icon('folder')}查看全部项目</button>`)}${stats()}<div class="summary-panels"><section class="surface summary-panel"><h2>项目类别分布</h2>${[...new Set(projects.map(p=>p.type))].map((t,i)=>{const count=projects.filter(p=>p.type===t).length;return `<div style="margin-bottom:23px"><div class="progress-row"><span>${safe(t)}</span><span>${count} 个项目</span></div><div class="progress-track ${i?'blue':''}"><i style="width:${count/projects.length*100}%"></i></div></div>`;}).join('')}<div class="overview-list"><div class="overview-item">${icon('shield')}所有示例项目分析已完成<small>可开始协作</small></div></div></section><section class="surface summary-panel"><h2>我的课题组</h2><div class="overview-list">${groups.map((g,i)=>`<button class="btn ghost" data-open-collab="${g.id}" style="justify-content:flex-start">${avatar(g.name,i)}${safe(g.name)}<span style="margin-left:auto" class="small-count">${g.members.length} 人</span></button>`).join('')}</div><button class="btn quiet text-primary" data-nav="groups" style="margin-top:18px">查看全部课题组 →</button></section></div></div>`; }
function renderData() { return `<div class="page" data-screen-label="项目数据">${heading('项目数据','从数据到洞察，所有分析项目都在这里。')}${stats()}<div class="data-grid">${projects.map((p,i)=>`<article class="surface data-card">${icon(p.type==='云图汇'?'chart':'folder')}<h3>${safe(p.name.replace(/^测试示例-/,''))}</h3><p>${safe(p.code)}<br>${safe(p.category)} · 分析已完成</p><button class="btn" data-open-data="${p.id}">查看项目概况 →</button></article>`).join('')}</div>${pageFoot('本原型用于演示项目与成员管理，不包含真实分析文件。')}</div>`; }
function render() {
  document.body.classList.remove('reference-mode');
  const renderers={projects:renderProjects,groups:renderGroups,members:renderMemberDirectory,detail:renderDetail,overview:renderOverview,data:renderData};
  main.innerHTML=(renderers[page]||renderProjects)();
  const labels={projects:'项目列表',groups:'课题组列表',members:'成员列表',detail:'项目详情',overview:'项目概况',data:'项目数据'};
  document.getElementById('crumb').innerHTML=`工作空间 <span>/</span> <strong>${labels[page]||'项目列表'}</strong>${page==='detail'?`<span>/</span>${safe(project().name.replace(/^测试示例-/,''))}`:''}`;
  document.querySelectorAll('[data-nav]').forEach(n=>{n.classList.toggle('active',n.dataset.nav===(page==='detail'?'projects':page)); if(n.closest('.side-nav')){if(n.classList.contains('active')) n.setAttribute('aria-current','page'); else n.removeAttribute('aria-current');}});
  document.getElementById('navProjectCount').textContent=projects.length;
  const selectAll=main.querySelector('[data-select-all-projects]');
  if(selectAll){const list=filteredProjects();const count=list.filter(p=>selectedProjectIds.includes(p.id)).length;selectAll.checked=!!list.length&&count===list.length;selectAll.indeterminate=count>0&&count<list.length;}
}
function modalFrame(title, subtitle, body, footer, wide=false) {
  if(modalRoot.hidden) returnFocus=document.activeElement;
  document.querySelector('.app-shell').inert=true;
  document.body.style.overflow='hidden';
  modalRoot.hidden=false;
  modalRoot.innerHTML=`<div class="modal ${wide?'modal-wide':''}" role="dialog" aria-modal="true" aria-label="${safe(title)}"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-close aria-label="关闭">×</button></div><div class="modal-body">${body}</div><div class="modal-foot">${footer}</div></div>`;
  const initialField=modalRoot.querySelector('input:not(:disabled),select:not(:disabled)')||modalRoot.querySelector('[data-close]');
  initialField?.focus({preventScroll:true});
}
function closeConfirmation() {
  clearTimeout(confirmationTimer); confirmRoot.hidden=true; confirmRoot.textContent=''; modalRoot.inert=false; if(modal) modal.pendingUser=null;
}
function closeModal() { closeConfirmation(); modal=null; modalRoot.hidden=true; modalRoot.innerHTML=''; document.querySelector('.app-shell').inert=false; document.body.style.overflow=''; if(returnFocus?.isConnected) returnFocus.focus(); }
function showAccountConfirmation(user) {
  modal.pendingUser=user; modalRoot.inert=true;
  confirmRoot.innerHTML=`<span class="account-tip-icon">${icon('info')}</span><span>${safe(safetyMessage)}</span>`;
  confirmRoot.hidden=false;
  const modalTop=modalRoot.querySelector('.modal').getBoundingClientRect().top;
  confirmRoot.style.top=`${Math.max(12,Math.round(modalTop-confirmRoot.getBoundingClientRect().height-16))}px`;
  confirmationTimer=setTimeout(()=>{
    if(!modal || modal.type!=='add' || modal.step!=='verify' || modal.pendingUser!==user) return;
    closeConfirmation(); modal.user=user; modal.step='role'; showModal(); modalRoot.querySelector('input[name=role], [data-confirm-add]')?.focus();
  },1600);
}
function rolesRadio(selected='member') { return `<div class="role-choices">${['admin','member','visitor'].map(r=>`<label class="role-option ${r}"><input type="radio" name="role" value="${r}" ${selected===r?'checked':''}><span class="role-icon">${icon(roleIcons[r])}</span><span><strong>${roleNames[r]}</strong><small>${roleDescriptions[r]}</small></span></label>`).join('')}</div>`; }
function openAdd(target='project', groupId=null) { if(!canManage()) return notify('当前角色不能添加成员'); modal={type:'add',target,groupId,step:'verify',error:''}; showModal(); }
function openGroupCreate() { if(!canManage()) return notify('当前角色不能添加课题组'); modal={type:'group-create',name:'',members:[],error:''}; showModal(); }
function openDirectoryAdd(){ if(!canManage()) return notify('当前角色不能添加人员'); modal={type:'directory-add',name:'',account:'',phone:'',error:''}; showModal(); }
function showDirectoryAddModal(){
  modalFrame('添加人员','录入云平台成员的基础信息，用于后续课题组协作。',
    `<form id="directoryForm" novalidate>
      <label class="field" id="directoryNameField"><span class="field-label">姓名</span><input id="directoryName" type="text" maxlength="24" placeholder="请输入姓名" value="${safe(modal.name)}"><span class="field-error">请输入姓名</span></label>
      <label class="field" id="directoryAccountField"><span class="field-label">云平台账号</span><input id="directoryAccount" type="text" maxlength="40" placeholder="请输入云平台账号" value="${safe(modal.account)}"><span class="field-error">请输入云平台账号</span></label>
      <label class="field" id="directoryPhoneField"><span class="field-label">手机号</span><input id="directoryPhone" type="tel" inputmode="numeric" maxlength="11" placeholder="请输入 11 位手机号" value="${safe(modal.phone)}"><span class="field-error">请输入有效的 11 位手机号</span></label>
    </form>`,
    '<button class="btn" data-close>取消</button><button class="btn primary" data-directory-add-confirm>确认添加</button>');
}
function confirmDirectoryAdd(){
  const name=document.getElementById('directoryName').value.trim();
  const account=document.getElementById('directoryAccount').value.trim();
  const phone=document.getElementById('directoryPhone').value.trim();
  modal.name=name; modal.account=account; modal.phone=phone;
  const okPhone=/^1[3-9]\d{9}$/.test(phone);
  document.getElementById('directoryNameField').classList.toggle('invalid',!name);
  document.getElementById('directoryAccountField').classList.toggle('invalid',!account);
  document.getElementById('directoryPhoneField').classList.toggle('invalid',!okPhone);
  if(!name||!account||!okPhone) return;
  if(directory.some(d=>d.account.toLowerCase()===account.toLowerCase())){ const field=document.getElementById('directoryAccountField'); field.classList.add('invalid'); field.querySelector('.field-error').textContent='云平台账号已存在'; return; }
  if(directory.some(d=>d.phone===phone)){ const field=document.getElementById('directoryPhoneField'); field.classList.add('invalid'); field.querySelector('.field-error').textContent='手机号已存在'; return; }
  directory.push({id:'user-'+Date.now(),name,account,phone});
  saveAll(); search=''; closeModal(); render(); notify('人员已添加，可在课题组中邀请加入');
}
function openCollab(groupId=groups[0]?.id, projectIds=[], chooseProjects=false, recordId=null) { if(!canManage()) return notify('当前角色不能管理项目协作'); modal={type:'collab',selectedGroupIds:[groupId].filter(Boolean),selectedMemberIds:[],selectedProjectIds:[...new Set(projectIds)],chooseProjects,recordId,removedMemberIds:[]}; showModal(); }
function drawPhoneLookup(render=true) {
  if(!modalRoot.querySelector('#phone')) return;
  const phone=modalRoot.querySelector('#phone').value.trim();
  const user=directory.find(u=>u.phone===phone);
  if(render) document.getElementById('account').value=user?.account||'';
  const slot=modalRoot.querySelector('#phoneLookup');
  slot.innerHTML=user?`<div class="account-preview">${avatar(user.name)}<div><strong>${safe(user.name)}</strong><small>匹配的云平台账号：${safe(user.account)}</small></div><span>请确认</span></div>`:'';
}
function groupCreateMembers() { return modal.members.map(m=>`<div class="picker-member"><div class="member-cell">${avatar(person(m.id).name)}<div><div class="member-name">${safe(person(m.id).name)}${m.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><small>${safe(person(m.id).account)}</small></div></div><div class="picker-right"><select data-group-role="${m.id}" ${m.id==='support-1'?'disabled':''} aria-label="设置成员角色">${['admin','member','visitor'].map(r=>`<option value="${r}" ${m.role===r?'selected':''}>${roleNames[r]}</option>`).join('')}</select><button type="button" class="chip-close" data-remove-group-member="${m.id}" aria-label="移除 ${safe(person(m.id).name)}">×</button></div></div>`).join('') || '<div class="picker-empty">还没有成员，可从上方添加，或直接添加技术支持。</div>'; }
function showGroupCreateModal() {
  modalFrame('添加课题组','输入课题组名称，并添加组成员。默认可一键加入技术支持。',
    `<form id="groupForm" novalidate><label class="field ${modal.error?'invalid':''}" id="groupNameField"><span class="field-label">课题组名称</span><input id="groupName" type="text" maxlength="40" placeholder="例如：肿瘤早筛课题组" value="${safe(modal.name)}"><span class="field-error">${safe(modal.error||'请输入课题组名称')}</span></label>
    <div class="member-picker"><label class="field picker-select"><span class="field-label">添加成员</span><select id="groupMemberSelect"><option value="">选择云平台成员</option>${directory.filter(d=>d.id!=='owner-1').map(d=>`<option value="${d.id}">${safe(d.name)} · ${safe(d.account)}</option>`).join('')}</select></label><div class="picker-buttons"><button type="button" class="btn" data-add-group-member>添加</button><button type="button" class="btn primary" data-add-support>直接添加技术支持</button></div></div>
    <div class="selected-picker"><div class="picker-title">已选成员 <b>${modal.members.length}</b></div><div id="selectedGroupMembers">${groupCreateMembers()}</div></div></form>`,
    '<button class="btn" data-close>取消</button><button class="btn primary" data-create-group-confirm>创建课题组</button>', true);
}
function collabMembers(state) {
  const seen=new Set(), out=[];
  state.selectedGroupIds.forEach(gid=>{ const g=group(gid); (g?.members||[]).forEach(m=>{ if(!seen.has(m.id)){seen.add(m.id); out.push({...m});} }); });
  return out;
}
function collabProjectMembers(state) {
  const seen=new Set(),out=[];
  const record=collabRecords.find(r=>r.id===state.recordId);
  const containers=record?[record]:projects.filter(p=>state.selectedProjectIds.includes(p.id));
  containers.forEach(p=>(p.members||[]).forEach(m=>{if(!seen.has(m.id)&&!state.removedMemberIds.includes(m.id)){seen.add(m.id);out.push({...m});}}));
  return out;
}
function showCollabModal() {
  const members=collabMembers(modal),current=collabProjectMembers(modal);
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  const body=`${modal.chooseProjects?`<section class="picker-block project-picker"><h3>选择协作项目 <span class="picker-note">可单选或多选</span></h3><div class="check-list project-list-picker">${projects.map(p=>`<label class="check-item"><input type="checkbox" data-collab-project="${p.id}" ${modal.selectedProjectIds.includes(p.id)?'checked':''}><span class="check-main"><strong>${safe(p.name.replace(/^测试示例-/,''))}</strong><small>${safe(p.code)}</small></span></label>`).join('')}</div></section>`:''}
  <div class="collab-context"><span>协作目标：<b>${selectedProjects.length} 个项目</b></span><span>${selectedProjects.length===1?safe(selectedProjects[0].name.replace(/^测试示例-/,'')):'统一选择课题组与协作成员'}</span></div>
  <div class="picker-layout"><section class="picker-block"><h3>选择课题组 <span class="picker-note">单选</span></h3><div class="check-list">${groups.map(g=>`<label class="check-item"><input type="radio" name="collabGroup" data-collab-group="${g.id}" ${modal.selectedGroupIds[0]===g.id?'checked':''} ${modal.recordId?'disabled':''}><span class="check-main"><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员</small></span></label>`).join('')||'<div class="picker-empty">请先在课题组列表创建课题组</div>'}</div></section>
  <section class="picker-block"><h3>添加协作成员</h3><div class="picker-tools"><span id="collabMemberCount">${modal.selectedMemberIds.length}/${members.length} 位成员</span><button class="btn quiet small" data-select-all-collab-members>全选</button><button class="btn quiet small" data-clear-collab-members>清空</button></div><div class="check-list">${members.map((m,i)=>`<label class="check-item"><input type="checkbox" data-collab-member="${m.id}" ${modal.selectedMemberIds.includes(m.id)?'checked':''}>${avatar(person(m.id).name,i)}<span class="check-main"><strong>${safe(person(m.id).name)}</strong><small>${safe(person(m.id).account)} · ${roleNames[m.role]}</small></span>${m.id==='support-1'?'<span class="support-tag">管理员</span>':''}</label>`).join('')||'<div class="picker-empty">该课题组还没有成员，请先添加成员</div>'}</div></section></div>
  ${selectedProjects.length?`<section class="picker-block current-members"><h3>${modal.recordId?'本次协作成员':'当前项目成员'}</h3><div class="picker-tools"><span>${current.length} 位成员${modal.removedMemberIds.length?` · ${modal.removedMemberIds.length} 位待移除`:''}</span><span class="picker-note">移除操作在保存后生效</span></div><div class="check-list">${current.map(m=>`<div class="check-item"><span class="check-main"><strong>${safe(person(m.id).name)}</strong><small>${safe(person(m.id).account)} · ${roleNames[m.role]}</small></span>${m.role==='owner'?'<span class="owner-tag">项目所有者</span>':`<button class="btn quiet small danger" data-remove-collab-member="${m.id}">移除</button>`}</div>`).join('')||'<div class="picker-empty">暂无协作成员</div>'}</div></section>`:''}`;
  modalFrame(modal.recordId?'管理协作成员':'发起项目协作','选择一个课题组，勾选需要协作的成员。切换课题组会展示对应名单。',body,'<button class="btn" data-close>取消</button><button class="btn primary" data-confirm-collab>保存变更</button>',true);
}
function showModal() {
  if(!modal) return;
  if(modal.type==='group-create') return showGroupCreateModal();
  if(modal.type==='directory-add') return showDirectoryAddModal();
  if(modal.type==='collab') return showCollabModal();
  if(modal.type==='add' && modal.step==='verify') {
    const title=modal.target==='group'?'添加课题组成员':'添加项目成员';
    modalFrame(title,safe(accountCopy.subtitle),
      `<form id="verifyForm" novalidate><label class="field" id="phoneField"><span class="field-label">注册手机号</span><input id="phone" type="tel" inputmode="numeric" autocomplete="off" maxlength="11" placeholder="请输入 11 位手机号" value="${safe(modal.phone||'')}"><span class="field-error">请输入有效的 11 位中国大陆手机号</span></label><label class="field" id="accountField"><span class="field-label">云平台账号 <span class="autofill-tag">自动匹配</span></span><input id="account" type="text" autocomplete="off" maxlength="40" placeholder="输入手机号后自动显示" value="${safe(modal.account||'')}"><span class="field-error">请输入云平台账号</span></label><div id="phoneLookup" aria-live="polite"></div>${modal.error?`<div class="inline-error">${safe(modal.error)}</div>`:''}<p class="demo-example">演示手机号：13800000005（夏老师），输入后自动匹配账号</p></form>`,
      '<button class="btn" data-close>取消</button><button class="btn primary" data-verify>确认云平台账号</button>');
    drawPhoneLookup(false);document.getElementById('phone').focus(); return;
  }
  if(modal.type==='add' && modal.step==='role') {
    const u=modal.user;
    const title=modal.target==='group'?'确认课题组成员与角色':'确认成员与项目角色';
    modalFrame(title,'账号核对通过，请为该用户选择角色',
      `<div class="verify-success">${avatar(u.name)}<div><strong>${safe(u.name)}</strong><span>手机号 ${safe(u.phone.slice(0,3))}****${safe(u.phone.slice(-4))} · 账号 ${safe(u.account)}</span></div><span class="checkmark">演示核对通过</span></div><span class="field-label">${modal.target==='group'?'课题组角色':'项目角色'}</span>${u.id==='support-1'?'<div class="fixed-admin-role">技术支持默认为管理员，角色不可调整。</div>':rolesRadio('member')}`,
      '<button class="btn" data-back-verify>返回修改</button><button class="btn primary" data-confirm-add>添加成员</button>'); return;
  }
  if(modal.type==='edit') {
    modalFrame('调整项目角色',`为 ${safe(person(modal.id).name)} 设置新的协作权限`,
      `<span class="field-label">选择角色</span>${rolesRadio(modal.role)}<div class="verify-hint" style="margin-top:16px">项目所有者不可在这里调整；角色变化仅对当前项目生效。</div>`,
      '<button class="btn" data-close>取消</button><button class="btn primary" data-save-role>保存角色</button>'); return;
  }
  if(modal.type==='remove') {
    modalFrame('移除项目成员','确认后，此人将无法继续访问本项目的协作内容',
      `<p>确定从「${safe(project().name)}」移除 <strong>${safe(person(modal.id).name)}</strong> 吗？</p><div class="confirm-warning">${modal.id==='support-1'?'技术支持被移除后不会自动重新加入，需要管理员重新核对账号并手动添加。':'这不会删除对方的云平台账号，也不会影响其在其他项目的角色。'}</div>`,
      '<button class="btn" data-close>取消</button><button class="btn danger" data-confirm-remove>确认移除</button>');
  }
}
function verify() {
  const phone=document.getElementById('phone').value.trim(), account=document.getElementById('account').value.trim();
  modal.phone=phone; modal.account=account;
  document.getElementById('phoneField').classList.toggle('invalid',!/^1[3-9]\d{9}$/.test(phone));
  document.getElementById('accountField').classList.toggle('invalid',!account);
  if(!/^1[3-9]\d{9}$/.test(phone)||!account) return;
  const user=directory.find(u=>u.phone===phone && u.account.toLowerCase()===account.toLowerCase());
  if(!user){ modal.error=accountCopy.mismatch; document.getElementById('phoneField').classList.add('invalid'); document.getElementById('accountField').classList.add('invalid'); const old=document.querySelector('#verifyForm .inline-error'); if(old)old.remove(); document.getElementById('verifyForm').insertAdjacentHTML('beforeend','<div class="inline-error">手机号或云平台账号不匹配，请核对后重试。</div>'); return; }
  const container = modal.target==='group' ? group(modal.groupId).members : project().members;
  if(container.some(m=>m.id===user.id)) { modal.error='该用户已在当前列表中'; showModal(); return; }
  showAccountConfirmation(user);
}
function confirmGroupCreate() {
  const input=document.getElementById('groupName');
  modal.name=input.value.trim();
  if(!modal.name){ modal.error='请输入课题组名称'; showGroupCreateModal(); document.getElementById('groupName').focus(); return; }
  if(groups.some(g=>g.name===modal.name)){ modal.error='课题组名称已存在'; showGroupCreateModal(); return; }
  const id='group-'+Date.now();
  if(!modal.members.length){modal.error='请至少添加一位成员';showGroupCreateModal();return;}
  groups.push({id,name:modal.name,members:structuredClone(modal.members)});
  saveAll(); closeModal(); render(); notify('课题组已创建');
}
function confirmCollab() {
  if(!canManage()) return;
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  const g=group(modal.selectedGroupIds[0]);
  const members=collabMembers(modal).filter(m=>modal.selectedMemberIds.includes(m.id));
  if(!selectedProjects.length)return notify('请至少选择一个项目');
  if(!g)return notify('请选择一个课题组');
  if(!members.length&&!modal.removedMemberIds.length)return notify('请勾选要添加的成员，或移除已有成员');
  if(!modal.recordId&&!members.length&&modal.removedMemberIds.length){
    selectedProjects.forEach(p=>{p.members=p.members.filter(m=>m.role==='owner'||!modal.removedMemberIds.includes(m.id));syncRecords(p.id);});
    saveAll();closeModal();render();return notify('项目成员已更新');
  }
  const createdAt=new Date().toLocaleString('zh-CN',{hour12:false});
  let added=0;
  selectedProjects.forEach(p=>{
    p.members=p.members.filter(m=>m.role==='owner'||!modal.removedMemberIds.includes(m.id));
    syncRecords(p.id);
    members.forEach(m=>{const current=p.members.find(x=>x.id===m.id);if(!current)p.members.push({id:m.id,role:m.id==='support-1'?'admin':m.role});else if(m.id==='support-1')current.role='admin';});
    let record=modal.recordId?collabRecords.find(r=>r.id===modal.recordId):collabRecords.find(r=>r.projectId===p.id&&(r.groupId===g.id||r.groupName===g.name));
    if(record){members.forEach(m=>{if(!record.members.some(x=>x.id===m.id))record.members.push({id:m.id,role:p.members.find(x=>x.id===m.id).role});});record.groupId=g.id;record.updatedAt=createdAt;}
    else if(members.length){collabRecords.push({id:'record-'+Date.now()+'-'+p.id,projectId:p.id,projectName:p.name,code:p.code,groupId:g.id,groupName:g.name,members:members.map(m=>({id:m.id,role:p.members.find(x=>x.id===m.id).role})),createdAt,status:'协作中'});added++;}
  });
  saveAll();closeModal();page='projects';listTab='collab';search='';categoryFilter='';selectedProjectIds=[];render();notify(added?`已新增 ${added} 条协作记录`:'协作成员已更新');
}
main.addEventListener('click', e => {
  const a=e.target.closest('button'); if(!a||a.disabled) return;
  if(a.dataset.nav) return navigate(a.dataset.nav);
  if(a.dataset.openProject||a.dataset.openData){activeProjectId=a.dataset.openProject||a.dataset.openData;tab=a.dataset.openData?'data':'members';return navigate('detail');}
  if(a.dataset.tab){tab=a.dataset.tab;search='';return render();}
  if(a.dataset.listTab){listTab=a.dataset.listTab;search='';categoryFilter='';return render();}
  if(a.hasAttribute('data-clear-projects')){selectedProjectIds=[];return render();}
  if(a.hasAttribute('data-add-directory')) return openDirectoryAdd();
  if(a.hasAttribute('data-create-group')) return openGroupCreate();
  if(a.hasAttribute('data-add')) return openAdd('project');
  if(a.dataset.groupAdd) return openAdd('group',a.dataset.groupAdd);
  if(a.dataset.addSupportGroup){if(!canManage()) return;const g=group(a.dataset.addSupportGroup);if(!g||g.members.some(m=>m.id==='support-1')) return;g.members.push({id:'support-1',role:'admin'});saveAll();render();return notify('技术支持已加入课题组，角色为管理员');}
  if(a.dataset.openCollab) return openCollab(a.dataset.openCollab,[],true);
  if(a.hasAttribute('data-collab-selected')) return openCollab(groups[0]?.id,[...selectedProjectIds],!selectedProjectIds.length);
  if(a.dataset.collabOne) return openCollab(groups[0]?.id,[a.dataset.collabOne]);
  if(a.dataset.manageRecord){const r=collabRecords.find(x=>x.id===a.dataset.manageRecord);if(!r) return;return openCollab(r.groupId||groups.find(g=>g.name===r.groupName)?.id,[r.projectId],false,r.id);}
  if(a.dataset.shareProject){if(!canManage()) return;const p=projects.find(x=>x.id===a.dataset.shareProject);p.shared=!p.shared;saveAll();render();return notify(p.shared?'已加入共享项目列表':'已取消项目共享');}
  if(a.dataset.editMember){if(!canManage())return;const m=project().members.find(x=>x.id===a.dataset.editMember);if(!m||m.role==='owner'||m.id==='support-1')return;modal={type:'edit',id:m.id,role:m.role};return showModal();}
  if(a.dataset.removeMember){if(!canManage())return;const m=project().members.find(x=>x.id===a.dataset.removeMember);if(!m||m.role==='owner')return;modal={type:'remove',id:m.id};return showModal();}
});
document.querySelector('.sidebar').addEventListener('click',e=>{const a=e.target.closest('[data-nav],.brand');if(a){e.preventDefault();navigate(a.dataset.nav||'projects');}});
main.addEventListener('input',e=>{
  if(['projectSearch','memberSearch','groupSearch'].includes(e.target.id)){
    const id=e.target.id,pos=e.target.selectionStart;search=e.target.value;render();const next=document.getElementById(id);next.focus();try{next.setSelectionRange(pos,pos);}catch{}
  }
});
main.addEventListener('change',e=>{
  if(e.target.dataset.selectProject){const id=e.target.dataset.selectProject;selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,id])]:selectedProjectIds.filter(x=>x!==id);return render();}
  if(e.target.hasAttribute('data-select-all-projects')){const ids=filteredProjects().map(p=>p.id);selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,...ids])]:selectedProjectIds.filter(id=>!ids.includes(id));return render();}
  if(e.target.id==='categoryFilter'){categoryFilter=e.target.value;return render();}
  if(e.target.id==='visitorDownload'&&canManage()){project().visitorDownload=e.target.checked;saveAll();render();notify('访问者下载权限已更新');}
});
document.getElementById('identitySelect').addEventListener('change',e=>{identity=e.target.value;render();notify(`已切换至${roleNames[identity]}视角`);});
modalRoot.addEventListener('click',e=>{
  if(e.target===modalRoot||e.target.closest('[data-close]')) return closeModal();
  const a=e.target.closest('button');if(!a||a.disabled||!modal) return;
  if(!canManage())return closeModal();
  if(a.hasAttribute('data-directory-add-confirm'))return confirmDirectoryAdd();
  if(a.hasAttribute('data-create-group-confirm'))return confirmGroupCreate();
  if(a.hasAttribute('data-add-support')){if(!modal.members.some(m=>m.id==='support-1'))modal.members.push({id:'support-1',role:'admin'});modal.name=document.getElementById('groupName').value.trim();return showGroupCreateModal();}
  if(a.hasAttribute('data-add-group-member')){const id=document.getElementById('groupMemberSelect').value;if(!id)return notify('请先选择成员');if(modal.members.some(m=>m.id===id))return notify('该成员已在名单中');modal.members.push({id,role:id==='support-1'?'admin':'member'});modal.name=document.getElementById('groupName').value.trim();return showGroupCreateModal();}
  if(a.dataset.removeGroupMember){modal.members=modal.members.filter(m=>m.id!==a.dataset.removeGroupMember);return showGroupCreateModal();}
  if(a.hasAttribute('data-select-all-collab-members')){modal.selectedMemberIds=collabMembers(modal).map(m=>m.id);return showCollabModal();}
  if(a.hasAttribute('data-clear-collab-members')){modal.selectedMemberIds=[];return showCollabModal();}
  if(a.dataset.removeCollabMember){modal.removedMemberIds=[...new Set([...modal.removedMemberIds,a.dataset.removeCollabMember])];modal.selectedMemberIds=modal.selectedMemberIds.filter(id=>id!==a.dataset.removeCollabMember);showCollabModal();return notify('已标记移除，保存变更后生效');}
  if(a.hasAttribute('data-confirm-collab'))return confirmCollab();
  if(a.hasAttribute('data-verify'))return verify();
  if(a.hasAttribute('data-back-verify')){modal.step='verify';return showModal();}
  if(a.hasAttribute('data-confirm-add')&&modal.type==='add'&&modal.step==='role'){
    const container=modal.target==='group'?group(modal.groupId).members:project().members;
    if(container.some(m=>m.id===modal.user.id))return notify('该成员已在当前名单中');
    const role=modal.user.id==='support-1'?'admin':modalRoot.querySelector('input[name=role]:checked')?.value||'member';
    container.push({id:modal.user.id,role});saveAll();closeModal();render();return notify('成员添加成功');
  }
  if(a.hasAttribute('data-save-role')&&modal.type==='edit'){
    const m=project().members.find(x=>x.id===modal.id);if(!m||m.role==='owner'||m.id==='support-1')return closeModal();
    m.role=modalRoot.querySelector('input[name=role]:checked')?.value||m.role;syncRecords(project().id);saveAll();closeModal();render();return notify('成员角色已更新');
  }
  if(a.hasAttribute('data-confirm-remove')&&modal.type==='remove'){
    const m=project().members.find(x=>x.id===modal.id);if(!m||m.role==='owner')return closeModal();
    project().members=project().members.filter(x=>x.id!==modal.id);syncRecords(project().id);saveAll();closeModal();render();return notify('成员已从项目中移除');
  }
});
modalRoot.addEventListener('submit',e=>{e.preventDefault();if(!canManage())return;if(e.target.id==='verifyForm')verify();else if(e.target.id==='groupForm')confirmGroupCreate();else if(e.target.id==='directoryForm')confirmDirectoryAdd();});
modalRoot.addEventListener('input',e=>{
  if(!modal)return;
  e.target.closest('.field')?.classList.remove('invalid');
  if(e.target.id==='phone'||e.target.id==='account'){if(e.target.id==='phone')drawPhoneLookup();modal.phone=document.getElementById('phone').value;modal.account=document.getElementById('account').value;modal.error='';modalRoot.querySelector('.inline-error')?.remove();}
  if(e.target.id==='groupName')modal.name=e.target.value;
  if(e.target.id==='directoryName')modal.name=e.target.value;
  if(e.target.id==='directoryAccount')modal.account=e.target.value;
  if(e.target.id==='directoryPhone')modal.phone=e.target.value;
});
modalRoot.addEventListener('change',e=>{
  if(!modal)return;
  if(e.target.dataset.collabGroup){modal.selectedGroupIds=[e.target.dataset.collabGroup];modal.selectedMemberIds=[];return showCollabModal();}
  if(e.target.dataset.collabMember){const id=e.target.dataset.collabMember;modal.selectedMemberIds=e.target.checked?[...new Set([...modal.selectedMemberIds,id])]:modal.selectedMemberIds.filter(x=>x!==id);if(e.target.checked)modal.removedMemberIds=modal.removedMemberIds.filter(x=>x!==id);const count=modalRoot.querySelector('#collabMemberCount');if(count)count.textContent=`${modal.selectedMemberIds.length}/${collabMembers(modal).length} 位成员`;return;}
  if(e.target.dataset.collabProject){const id=e.target.dataset.collabProject;modal.selectedProjectIds=e.target.checked?[...new Set([...modal.selectedProjectIds,id])]:modal.selectedProjectIds.filter(x=>x!==id);return showCollabModal();}
  if(e.target.dataset.groupRole){const m=modal.members.find(x=>x.id===e.target.dataset.groupRole);if(m&&m.id!=='support-1')m.role=e.target.value;}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!modalRoot.hidden){if(!confirmRoot.hidden){closeConfirmation();document.getElementById('account')?.focus();}else closeModal();}
  if(e.key==='Tab'&&!modalRoot.hidden){const els=[...modalRoot.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].filter(el=>el.offsetParent!==null);const first=els[0],last=els.at(-1);if(!first)return;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)&&e.target.getAttribute('role')==='tab'){
    e.preventDefault();const buttons=[...main.querySelectorAll('[role=tab]')],i=buttons.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();main.querySelectorAll('[role=tab]')[next].focus();
  }
});
render();
