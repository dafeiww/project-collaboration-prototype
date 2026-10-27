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
icons.copy = '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 4H5a2 2 0 0 0-2 2v11"/>';
icons.share = '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>';
icons.download = '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>';
icons.trash = '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>';
icons.check = '<path d="m5 12 4 4L19 6"/>';
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
const demoPlatformAccounts = [
  { id: 'demo-zhao', name: '赵研究员', phone: '13800000007', account: 'zhao.researcher' },
  { id: 'demo-sun', name: '孙研究员', phone: '13800000008', account: 'sun.researcher' },
  { id: 'demo-wu', name: '吴研究员', phone: '13800000009', account: 'wu.researcher' }
];
// 成员库与示例平台注册账号分开保存；移除成员不注销账号，之后仍可重新添加。
let platformAccounts = [...directory,...demoPlatformAccounts].map(u=>({...u}));
const accountKeys=['phone','email','account'];
function accountValue(value) { return String(value||'').trim().toLowerCase(); }
function resolvePlatformAccount(value,key=null) {
  const query=accountValue(value);
  if(!query)return {user:null,status:'empty'};
  const keys=key?[key]:accountKeys;
  const matches=platformAccounts.filter(u=>keys.some(k=>accountValue(u[k])===query));
  if(matches.length!==1)return {user:null,status:matches.length?'ambiguous':'unmatched'};
  const user=matches[0];
  // 手机号、邮箱和用户名必须指向同一唯一账号；有冲突时不猜测匹配结果。
  const conflict=platformAccounts.some(u=>u.id!==user.id&&accountKeys.some(k=>user[k]&&accountValue(u[k])===accountValue(user[k])));
  return conflict?{user:null,status:'ambiguous'}:{user,status:'matched'};
}
const accountCopy = {
  subtitle: '手机号、邮箱、用户名可互查：输入任意一项，自动匹配另外两项，请确认属于同一云平台账户。',
  mismatch: '手机号、邮箱与用户名不属于同一云平台账户，请重新匹配后确认。'
};
const safetyMessage = '为保证项目数据安全，请再次核对手机号、邮箱和用户名是否属于拟邀请的同一成员';
const initialProjects = [
  { id: 'analysis', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610201731FS5D', name: '测试示例-定量蛋白组云分析', category: '定量蛋白组云分析', created: '2026-10-20 17:31:42', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true },
    { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'visitor' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'protein-mod-1', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610100956LETO', name: '测试示例-修饰蛋白组云分析', category: '修饰蛋白组云分析', created: '2026-10-10 09:56:29', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'protein-mod-2', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610100956Y9BS', name: '测试示例-修饰蛋白组云分析', category: '修饰蛋白组云分析', created: '2026-10-10 09:56:28', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'zhou-1', role: 'member' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'single-cell', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'SC202609031329Z8DE', name: '测试示例-新版单细胞转录组分析', category: '新版单细胞转录组分析', created: '2026-09-03 13:29:41', status: '完成', type: '云分析', collab: true, shared: true, shareUserIds: ['xia-1'], members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'member' }, { id: 'xia-1', role: 'visitor' }
  ], visitorDownload: true },
  { id: 'small-rna', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'TR202607290946X73M', name: '测试示例-农学SmallRNA分析', category: 'SmallRNA云分析', created: '2026-07-29 09:46:58', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'li-1', role: 'member' }, { id: 'lin-1', role: 'visitor' }
  ], visitorDownload: true },
  { id: 'transcript-metab', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'TR2026070217342DUP', name: '测试示例-新版转录与代谢组联合分析', category: '新版转录与代谢组联合分析', created: '2026-07-02 17:34:06', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'admin' }, { id: 'zhou-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'diversity-metab', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'MD202606151415PO0U', name: '测试示例-新版多样性与代谢组联合分析', category: '新版多样性与代谢组联合分析', created: '2026-06-15 14:15:33', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'li-1', role: 'member' }, { id: 'xia-1', role: 'visitor' }
  ], visitorDownload: true },
  { id: 'visual', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'YT20261021008', name: '多组学数据可视化项目', category: '云图汇', created: '2026-10-21 10:08:00', status: '完成', type: '云图汇', collab: true, shared: true, shareUserIds: ['li-1'], members: [
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
  if (Array.isArray(saved.platformAccounts)) platformAccounts = saved.platformAccounts;
} catch { projects = structuredClone(initialProjects); groups = structuredClone(initialGroups); }
const accountCatalog=new Map();
for(const u of [...demoPlatformAccounts,...platformAccounts,...directory]){
  const previous=accountCatalog.get(u.id)||{};
  // 兼容旧版演示数据；缺失邮箱使用保留的示例域名，不推断真实邮箱。
  const demoEmail=`${String(u.account||u.id).replace(/[^a-zA-Z0-9._-]/g,'-')}@example.com`;
  accountCatalog.set(u.id,{...previous,...u,phone:String(u.phone||'').trim(),account:String(u.account||'').trim(),email:accountValue(u.email||previous.email||demoEmail)});
}
platformAccounts=[...accountCatalog.values()];
directory=directory.map(u=>({...u,...accountCatalog.get(u.id)}));
for(const p of projects){if(p.name==='测试示例-定量蛋白组分析')p.name='测试示例-定量蛋白组云分析';if(p.name==='测试示例-农学 SmallRNA分析')p.name='测试示例-农学SmallRNA分析';}
for(const p of projects){p.shareUserIds=[...new Set(Array.isArray(p.shareUserIds)?p.shareUserIds:[])];p.shared=!!(p.shared||p.shareUserIds.length);}
for(const p of projects)if(!Array.isArray(p.files))p.files=[];
for (const container of [...projects, ...groups]) for (const m of container.members || []) if (m.id === 'support-1') m.role = 'admin';
let projectMenuOpen=true;
let page = 'projects', activeProjectId = 'analysis', tab = 'data', listTab = 'mine', identity = 'owner', search = '', categoryFilter = '', selectedProjectIds = [], modal = null, toastTimer, confirmationTimer, returnFocus = null;
let detailOrigin = { page: 'projects', listTab: 'mine' };
let filePath=[],selectedFileIds=[];
const main = document.getElementById('main'), modalRoot = document.getElementById('modalRoot'), confirmRoot = document.getElementById('confirmRoot');
function saveAll() { try { localStorage.setItem(storageKey, JSON.stringify({ projects, groups, collabRecords, directory, platformAccounts })); } catch { notify('浏览器未允许保存，当前操作将在本次浏览期间生效'); } }
function project() { return projects.find(p => p.id === activeProjectId) || projects[0]; }
function group(id) { return groups.find(g => g.id === id); }
function person(id) { return directory.find(d => d.id === id) || platformAccounts.find(d=>d.id===id) || { name: '未知成员', phone: '', account: '' }; }
function ensureDirectoryPerson(id) { const u=platformAccounts.find(u=>u.id===id);if(u&&!directory.some(d=>d.id===id))directory.push({...u}); }
function isDirectoryOwner(id) { return id==='owner-1'||projects.some(p=>p.members.some(m=>m.id===id&&m.role==='owner')); }
function safe(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function canManage() { return identity === 'owner' || identity === 'admin'; }
function notify(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3000); }
function syncRecords(pid) { const p = projects.find(x => x.id === pid); if (!p) return; collabRecords.filter(r => r.projectId === pid).forEach(r => { r.members = (r.members || []).filter(m => p.members.some(pm => pm.id === m.id)).map(m => ({ ...m, role: p.members.find(pm => pm.id === m.id).role })); }); }
function navigate(next, options = {}) { if(['projects','visual'].includes(next)&&next!==page){selectedProjectIds=[];listTab='mine';} if(options.projectTab&&['projects','visual'].includes(next))listTab=options.projectTab; if(['projects','visual','groups','members'].includes(next))projectMenuOpen=true; page = next; search = ''; categoryFilter = ''; render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function isCollaborativeDetail() { return page === 'detail' && detailOrigin.listTab === 'collab'; }
function activeCollabRecord() { return isCollaborativeDetail()?collabRecords.find(r=>r.id===detailOrigin.recordId&&r.projectId===activeProjectId):null; }
function projectMemberList() { return activeCollabRecord()?.members||project().members; }
function openProjectDetail(id, recordId = null) {
  const target = projects.find(p => p.id === id);
  if (!target) return;
  const sourceTab=['projects','visual'].includes(page)?listTab:'mine';
  detailOrigin = { page: target.type === '云图汇' ? 'visual' : 'projects', listTab: sourceTab, recordId: sourceTab==='collab'?recordId:null };
  activeProjectId = target.id;
  tab = 'data';filePath=[];selectedFileIds=[];
  navigate('detail');
}
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
  return `<div class="stats-grid">${items.map(([label,num,unit,ico,desc,aria],i)=>`<article class="stat-card" aria-label="${aria}"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon(ico)}</span></div><div class="stat-number">${String(num).padStart(2,'0')}<small>${unit}</small></div><div class="stat-desc"><span class="accent">${i===0?'已就绪':i===2?'有序协作':'持续连接'}</span>${desc}</div><svg class="stat-spark" viewBox="0 0 64 24" aria-hidden="true"><path d="M1 21 10 15 18 18 26 8 35 12 44 5 53 9 63 2" fill="none" stroke="${['#9dc4f4','#adc0d3','#d1c29c','#c4b6d3'][i]}" stroke-width="1.5"/></svg></article>`).join('')}</div>`;
}
function filteredProjects() { const q = search.trim().toLowerCase(); return projects.filter(p=>p.type===(page==='visual'?'云图汇':'云分析')&&(!categoryFilter||p.category===categoryFilter)&&`${p.name} ${p.code} ${p.category} ${p.ticket} ${p.contract}`.toLowerCase().includes(q)); }
async function copyProjectTicket(id) {
  const value=projects.find(p=>p.id===id)?.ticket;if(!value)return;
  let copied=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true;}}catch{}
  if(!copied){const field=document.createElement('textarea');field.value=value;field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();}
  notify(copied?'开题单号已复制':'复制未成功，请手动选中开题单号复制');
}
function projectCell(p, i = 0) { return `<div class="project-title-cell"><span class="project-mark ${['','lavender','sand','blue'][i%4]}">${icon(p.id==='single-cell'?'grid':p.id==='visual'?'chart':'folder')}</span><div><button class="project-name" data-open-project="${safe(p.id)}">${safe(p.name.replace(/^测试示例-/,'').replace(/^测试示例—/,''))}</button><span class="project-code">${safe(p.code)}</span></div></div>`; }
function renderProjects() {
  const projectType=page==='visual'?'云图汇':'云分析';
  const scopedProjects=projects.filter(p=>p.type===projectType);
  const scopedRecords=collabRecords.filter(r=>scopedProjects.some(p=>p.id===r.projectId));
  const counts={mine:scopedProjects.length,shared:scopedProjects.filter(p=>p.shared).length,collab:scopedRecords.length};
  const tabs=[['mine','派森诺项目'],['shared','共享项目'],['collab','协作项目']];
  const mine=listTab==='mine',collab=listTab==='collab',q=search.trim().toLowerCase();
  const list=collab?scopedRecords.filter(r=>{
    const p=scopedProjects.find(p=>p.id===r.projectId);
    return (!categoryFilter||p.category===categoryFilter)&&`${p.name} ${p.code} ${p.ticket} ${p.contract} ${p.category} ${r.groupName} ${(r.members||[]).map(m=>person(m.id).name).join(' ')}`.toLowerCase().includes(q);
  }):filteredProjects().filter(p=>mine||p.shared);
  const selectedCount=selectedProjectIds.length;
  const head=`<tr>${mine?'<th class="check-cell"><input type="checkbox" data-select-all-projects aria-label="全选当前筛选项目"></th>':''}<th class="ticket-column">开题单号</th><th class="contract-column">合同编号</th><th class="code-column">云平台项目编号</th><th class="name-column">项目名称</th><th class="category-column">所属类别</th><th class="created-column">创建时间</th><th class="status-column">状态</th>${mine?'<th class="project-actions-column">操作</th>':''}</tr>`;
  const rows=list.map(item=>{
    const p=collab?scopedProjects.find(p=>p.id===item.projectId):item;
    const projectRecords=collabRecords.filter(r=>r.projectId===p.id),hasCollab=projectRecords.length>0;
    const recordAttr=collab?`data-collab-record="${safe(item.id)}"`:'';
    return `<tr class="${mine&&selectedProjectIds.includes(p.id)?'selected':''}">${mine?`<td class="check-cell"><input type="checkbox" data-select-project="${p.id}" ${selectedProjectIds.includes(p.id)?'checked':''} aria-label="选择 ${safe(p.name)}"></td>`:''}<td><div class="ticket-cell"><button class="ticket-link" data-open-project="${p.id}" ${recordAttr}>${safe(p.ticket)}</button><button class="copy-ticket" data-copy-ticket="${p.id}" aria-label="复制开题单号 ${safe(p.ticket)}" title="复制开题单号">${icon('copy')}</button></div></td><td class="contract-value">${safe(p.contract)}</td><td><span class="platform-code">${safe(p.code)}</span><span class="project-demo-tag">DEMO</span></td><td><button class="reference-project-name" data-open-project="${p.id}" ${recordAttr}>${safe(p.name)}</button>${collab?`<span class="collab-project-group">${safe(item.groupName)}</span>`:''}</td><td class="reference-category">${safe(p.category)}</td><td class="reference-created">${safe(p.created)}</td><td><span class="reference-status">${safe(p.status)}</span></td>${mine?`<td class="project-actions-column"><div class="table-actions"><button class="btn quiet small text-primary ${p.shared?'project-action-done':''}" data-share-project="${p.id}" title="${p.shared?'管理分享，取消分享请在弹窗中操作':'分享原始分析结果'}" ${!canManage()?'disabled':''}>${p.shared?icon('check'):''}${p.shared?'已分享':'分享'}</button><button class="btn primary small ${hasCollab?'project-action-done':''}" data-collab-one="${p.id}" title="${hasCollab?`已有 ${projectRecords.length} 条协作，点击管理或发起新的协作`:'选择课题组发起协作'}" ${!canManage()?'disabled':''}>${icon(hasCollab?'check':'link')}${hasCollab?'已协作':'协作项目'}</button></div></td>`:''}</tr>`;
  }).join('');
  const cols=mine?9:7;
  return `<div class="page" data-screen-label="项目列表">${heading(projectType,`管理${projectType}项目，按课题组组织协作，共享数据与分析成果。`,`<button class="btn ghost" data-nav="groups">${icon('people')}课题组管理</button>`)}
    <section class="surface"><div class="surface-top"><div class="list-tabs" role="tablist" aria-label="项目类型">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${listTab===key}" class="${listTab===key?'active':''}" data-list-tab="${key}">${label}<span class="tab-count">${counts[key]}</span></button>`).join('')}</div><span class="surface-caption">所有项目，有序协同</span></div>
    <div class="list-toolbar">${searchField('projectSearch',collab?'搜索项目名称、编号或成员':'搜索开题单号、项目名称或编号')}
    <div class="toolbar-right"><label class="filter-label"><span>项目类别</span><select id="categoryFilter" class="filter-select" aria-label="筛选项目类别"><option value="">全部类别</option>${[...new Set(scopedProjects.map(p=>p.category))].map(c=>`<option ${categoryFilter===c?'selected':''} value="${safe(c)}">${safe(c)}</option>`).join('')}</select></label>${mine?`<button class="btn primary toolbar-collab-action" data-collab-selected ${!canManage()?'disabled':''}>${icon('link')}${selectedCount?`协作已选项目（${selectedCount}）`:'发起项目协作'}</button>`:`<span class="small-count">${list.length} ${collab?'条协作':'个项目'}</span>`}</div></div>
    <div class="project-reference-note">${icon('info')}<span>开题单号用于项目查找和问题反馈，可点击右侧图标复制；点击开题单号或项目名称可进入${collab?'协作项目':'项目'}详情。</span></div>
    ${mine&&selectedCount?`<div class="selection-note">已选择 ${selectedCount} 个项目<button data-clear-projects>清空选择</button></div>`:''}
    <div class="table-shell project-table reference-project-table ${mine?'':'readonly-project-table'}"><div class="table-scroll"><table><thead>${head}</thead><tbody>${rows||`<tr><td colspan="${cols}" class="empty-cell">${emptyState(collab?'还没有协作项目':'未找到匹配的项目',collab?'在派森诺项目中勾选项目，选择一个课题组和成员，即可发起协作。':'试试其他关键词或项目类别。',collab?'<button class="btn" data-list-tab="mine">前往派森诺项目</button>':'')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,collab?'条协作记录':'个项目')}</section>${pageFoot(collab?'点击项目进入详情，在“项目协作”中新增或移除协作成员。':'支持单选或多选项目发起协作；课题组单选，组内成员可多选。')}</div>`;
}
function renderGroups() {
  const q = search.trim().toLowerCase();
  const list = groups.filter(g=>`${g.name} ${g.members.map(m=>person(m.id).name).join(' ')}`.toLowerCase().includes(q));
  return `<div class="page" data-screen-label="课题组列表">${heading('课题组管理','把志同道合的人聚在一起，让每一次协作更高效。',`<button class="btn primary" data-create-group ${!canManage()?'disabled':''}>${icon('plus')}添加课题组</button>`)}
    <div class="info-banner">${icon('shield')}<div><h2>技术支持，为课题组提供专业协助</h2><p>可在课题组中直接添加技术支持，加入后固定为管理员角色。</p></div></div>
    <section class="surface"><div class="surface-top"><h2 class="surface-title">我的课题组 <span class="tab-count">${groups.length}</span></h2><span class="surface-caption">一个课题组，一次专注的探索</span></div><div class="toolbar">${searchField('groupSearch','搜索课题组名称或成员')}<span class="small-count">共 ${list.length} 个课题组</span></div>
    <div class="table-shell group-table"><div class="table-scroll"><table><thead><tr><th>课题组</th><th>成员名单</th><th style="text-align:right">操作</th></tr></thead><tbody>${list.map(g=>`<tr><td><div class="group-cell"><span class="group-emblem">${icon('people')}</span><div><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员 · 科研协作</small></div></div></td><td>${memberRoster(g.members)}</td><td><div class="table-actions group-actions"><button class="btn primary small" data-open-collab="${g.id}" ${!canManage()?'disabled':''}>${icon('link')}协作项目</button><button class="btn quiet small" data-group-add="${g.id}" ${!canManage()?'disabled':''}>添加成员</button>${g.members.some(m=>m.id==='support-1')?'<span class="support-state">技术支持已加入</span>':`<button class="btn quiet small text-primary" data-add-support-group="${g.id}" ${!canManage()?'disabled':''}>添加技术支持</button>`}</div></td></tr>`).join('')||`<tr><td colspan="3" class="empty-cell">${emptyState('还没有课题组','点击“添加课题组”，邀请成员一起探索。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'个课题组')}</section></div>`;
}
function renderMemberDirectory() {
  const q=search.trim().toLowerCase();
  const list=directory.filter(d=>`${d.name} ${d.account} ${d.phone} ${d.email}`.toLowerCase().includes(q));
  return `<div class="page" data-screen-label="成员列表">${heading('成员管理','每一个伙伴，都是科研协作不可或缺的一部分。',`<button class="btn primary" data-add-directory ${!canManage()?'disabled':''}>${icon('plus')}添加成员</button>`)}
    <section class="surface"><div class="surface-top"><h2 class="surface-title">所有成员 <span class="tab-count">${directory.length}</span></h2><span class="surface-caption">云平台账号与课题组归属</span></div><div class="toolbar">${searchField('memberSearch','搜索姓名、手机号、邮箱或用户名')}<span class="small-count">共 ${list.length} 位成员</span></div>
    <div class="table-shell directory-table"><div class="table-scroll"><table><thead><tr><th>成员</th><th>云平台账号</th><th>手机号</th><th>所在课题组</th><th class="directory-actions-column">操作</th></tr></thead><tbody>${list.map((d,i)=>{const gs=groups.filter(g=>g.members.some(m=>m.id===d.id)); return `<tr><td><div class="member-cell">${avatar(d.name,i)}<div><div class="member-name">${safe(d.name)}${d.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><span class="member-note">${d.id==='owner-1'?'项目所有者':d.id==='support-1'?'平台技术支持':'云平台成员'}</span></div></div></td><td>${safe(d.account)}<small class="directory-user-email">${safe(d.email)}</small></td><td class="date-cell">${safe(d.phone.slice(0,3))} **** ${safe(d.phone.slice(-4))}</td><td>${gs.map(g=>`<span class="group-chip">${safe(g.name)}</span>`).join('')||'<span class="fixed">暂未加入课题组</span>'}</td><td class="directory-actions-column"><button class="btn quiet small danger" data-remove-directory="${safe(d.id)}" ${!canManage()||isDirectoryOwner(d.id)?'disabled':''} title="${isDirectoryOwner(d.id)?'项目所有者不可移除':'从成员库移除，不删除云平台账号'}" aria-label="移除成员${safe(d.name)}">移除成员</button></td></tr>`;}).join('')||`<tr><td colspan="5" class="empty-cell">${emptyState('未找到匹配的成员','试试其他姓名、账号或手机号。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'位成员')}</section>${pageFoot('移除仅影响成员库，不删除云平台账号；有关联的课题组、项目或分享权限时，需先解除关联。')}</div>`;
}
function renderMemberRow(member,index) { const u=person(member.id); return `<tr><td><div class="member-cell">${avatar(u.name,index)}<div><div class="member-name">${safe(u.name)}${member.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><span class="member-note">${safe(u.account)}</span></div></div></td><td><span class="role-pill ${member.role}">${icon(roleIcons[member.role]||'person')}${roleNames[member.role]}</span></td><td class="date-cell">${safe(u.phone.slice(0,3))} **** ${safe(u.phone.slice(-4))}</td><td><div class="table-actions">${canManage()?`<button class="btn quiet small text-primary" data-edit-member="${member.id}" ${member.id==='support-1'?'disabled title="技术支持固定为管理员"':''}>调整角色</button><button class="btn quiet small danger" data-remove-member="${member.id}">移除成员</button>`:'<span class="fixed">暂无管理权限</span>'}</div></td></tr>`; }
function renderMembers(p) {
  const list=projectMemberList().filter(m=>m.role!=='owner'&&`${person(m.id).name} ${person(m.id).account} ${roleNames[m.role]}`.toLowerCase().includes(search.toLowerCase()));
  return `<section class="surface"><div class="section-header"><div><h2>项目成员</h2><p>为每一位协作伙伴，分配合适的权限</p></div><div class="section-actions"><button class="btn primary" data-add ${!canManage()?'disabled':''}>${icon('plus')}添加成员</button></div></div><div class="toolbar">${searchField('memberSearch','搜索成员姓名或账号')}<span class="small-count">共 ${list.length} 位协作成员</span></div><div class="table-shell directory-table"><div class="table-scroll"><table><thead><tr><th>协作成员</th><th>项目角色</th><th>手机号</th><th style="text-align:right">操作</th></tr></thead><tbody>${list.map(renderMemberRow).join('')||`<tr><td colspan="4" class="empty-cell">${emptyState('暂无匹配的协作成员','可通过“添加成员”邀请伙伴参与项目。')}</td></tr>`}</tbody></table></div></div><div class="detail-permission"><span>项目所有者：${safe(person(p.members.find(m=>m.role==='owner')?.id||'owner-1').name)}</span><label class="download-toggle"><input id="visitorDownload" type="checkbox" ${p.visitorDownload?'checked':''} ${!canManage()?'disabled':''}>允许访问者下载数据</label></div></section>`;
}
function renderDetail() {
  const p=project(),collaborative=isCollaborativeDetail(),record=activeCollabRecord();
  if(!collaborative)tab='data';
  return `<div class="page project-detail-page" data-screen-label="项目详情"><button class="back-link" data-back-project-list>${icon('back')}返回${{mine:'派森诺项目',shared:'共享项目',collab:'协作项目'}[detailOrigin.listTab]}列表</button>
    <section class="reference-detail-summary"><div class="reference-detail-title"><span class="detail-project-icon">${icon(p.type==='云图汇'?'chart':'folder')}</span><div><h1>${safe(p.name)}</h1><span class="reference-detail-status">状态：${safe(p.status)}</span></div></div>
    <dl><dt>开题单号</dt><dd><span class="ticket-cell"><span class="ticket-link">${safe(p.ticket)}</span><button class="copy-ticket" data-copy-ticket="${p.id}" aria-label="复制开题单号 ${safe(p.ticket)}">${icon('copy')}</button></span></dd></dl><dl><dt>合同号</dt><dd>${safe(p.contract)}</dd></dl><dl><dt>云平台项目编号</dt><dd>${safe(p.code)}</dd></dl><button class="btn primary detail-result-button" data-show-result>查看结果</button></section>
    <div class="detail-download-banner"><span>下载派森诺云盘，一键下载全部项目数据。</span><button class="btn" data-cloud-download>${icon('download')}下载派森诺云盘</button></div>
    <section class="surface project-detail-content"><div class="detail-tabs"><button data-tab="data" class="${tab==='data'?'active':''}">项目数据</button>${collaborative?`<button data-tab="members" class="${tab==='members'?'active':''}">项目协作</button>`:''}</div>${collaborative&&tab==='members'?`${record?`<div class="detail-collab-context"><span class="group-chip">${safe(record.groupName)}</span><span>仅管理本条协作记录的成员，不影响其他课题组。</span></div>`:''}${renderMembers(p)}`:renderProjectFiles(p)}</section></div>`;
}
function currentProjectFiles() { return project().files.filter(f=>(f.parentId||null)===(filePath.at(-1)||null)); }
function renderProjectFiles(p) {
  const files=currentProjectFiles();
  return `<div class="project-file-manager"><div class="data-toolbar"><button class="btn" data-delete-selected-files ${!canManage()||!selectedFileIds.length?'disabled':''}>${icon('trash')}删除${selectedFileIds.length?`（${selectedFileIds.length}）`:''}</button><button class="btn text-primary" data-create-folder ${!canManage()?'disabled':''}>${icon('folder')}新建文件夹</button><span class="file-demo-note">示例文件操作，保存在当前浏览器</span></div>
    <nav class="file-breadcrumb" aria-label="文件目录"><button data-file-path="-1">根目录</button>${filePath.map((id,i)=>`<span>›</span><button data-file-path="${i}">${safe(p.files.find(f=>f.id===id)?.name||'文件夹')}</button>`).join('')}</nav>
    <div class="table-shell project-file-table"><div class="table-scroll"><table><thead><tr><th class="check-cell"><input type="checkbox" data-select-all-files aria-label="全选当前目录文件" ${files.length&&files.every(f=>selectedFileIds.includes(f.id))?'checked':''}></th><th>文件名称</th><th>大小</th><th>项目分析时间</th><th>创建者</th><th>操作</th></tr></thead><tbody>${files.map(f=>`<tr><td class="check-cell"><input type="checkbox" data-select-file="${safe(f.id)}" ${selectedFileIds.includes(f.id)?'checked':''} aria-label="选择文件夹 ${safe(f.name)}"></td><td><button class="file-folder-name" data-open-folder="${safe(f.id)}">${icon('folder')}${safe(f.name)}</button></td><td>—</td><td class="date-cell">${safe(f.createdAt)}</td><td>${safe(f.creator)}</td><td><button class="btn quiet small danger" data-delete-file="${safe(f.id)}" ${!canManage()?'disabled':''}>删除</button></td></tr>`).join('')||`<tr><td colspan="6" class="empty-cell">${emptyState('暂无数据','可新建文件夹，整理项目分析数据。')}</td></tr>`}</tbody></table></div></div>${tableFooter(files.length,'项')}</div>`;
}
function renderOverview() { return `<div class="page" data-screen-label="项目概况">${heading('欢迎回来，王老师','科研的每一步探索，都值得被妥善连接。',`<button class="btn primary" data-nav="projects">${icon('folder')}查看全部项目</button>`)}${stats()}<div class="summary-panels"><section class="surface summary-panel"><h2>项目类别分布</h2>${[...new Set(projects.map(p=>p.type))].map((t,i)=>{const count=projects.filter(p=>p.type===t).length;return `<div style="margin-bottom:23px"><div class="progress-row"><span>${safe(t)}</span><span>${count} 个项目</span></div><div class="progress-track ${i?'blue':''}"><i style="width:${count/projects.length*100}%"></i></div></div>`;}).join('')}<div class="overview-list"><div class="overview-item">${icon('shield')}所有示例项目分析已完成<small>可开始协作</small></div></div></section><section class="surface summary-panel"><h2>我的课题组</h2><div class="overview-list">${groups.map((g,i)=>`<button class="btn ghost" data-open-collab="${g.id}" style="justify-content:flex-start">${avatar(g.name,i)}${safe(g.name)}<span style="margin-left:auto" class="small-count">${g.members.length} 人</span></button>`).join('')}</div><button class="btn quiet text-primary" data-nav="groups" style="margin-top:18px">查看全部课题组 →</button></section></div></div>`; }
function renderData() { return `<div class="page" data-screen-label="项目数据">${heading('项目数据','从数据到洞察，所有分析项目都在这里。')}${stats()}<div class="data-grid">${projects.map((p,i)=>`<article class="surface data-card">${icon(p.type==='云图汇'?'chart':'folder')}<h3>${safe(p.name.replace(/^测试示例-/,''))}</h3><p>${safe(p.code)}<br>${safe(p.category)} · 分析已完成</p><button class="btn" data-open-data="${p.id}">查看项目概况 →</button></article>`).join('')}</div>${pageFoot('本原型用于演示项目与成员管理，不包含真实分析文件。')}</div>`; }
function render() {
  document.body.classList.remove('reference-mode');
  const renderers={projects:renderProjects,visual:renderProjects,groups:renderGroups,members:renderMemberDirectory,detail:renderDetail,overview:renderOverview,data:renderData};
  main.innerHTML=(renderers[page]||renderProjects)();
  const labels={projects:'云分析',visual:'云图汇',groups:'课题组管理',members:'成员管理',detail:'项目详情',overview:'项目概况',data:'项目数据'};
  const navPage=page==='detail'?(project().type==='云图汇'?'visual':'projects'):page;
  const nested=['projects','visual','groups','members'].includes(navPage);
  document.getElementById('crumb').innerHTML=`工作空间 <span>/</span> ${nested?'项目列表 <span>/</span> ':''}<strong>${labels[navPage]||'项目列表'}</strong>${page==='detail'?`<span>/</span>${{mine:'派森诺项目',shared:'共享项目',collab:'协作项目'}[detailOrigin.listTab]}<span>/</span>${safe(project().name.replace(/^测试示例-/,''))}`:''}`;
  document.querySelectorAll('[data-nav]').forEach(n=>{const active=n.dataset.nav===navPage;n.classList.toggle('active',active);if(n.closest('.side-nav')){if(active)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');}});
  const menu=document.getElementById('projectSubnav'),menuButton=document.querySelector('[data-project-menu]');
  menu.hidden=!projectMenuOpen;menuButton.setAttribute('aria-expanded',String(projectMenuOpen));menuButton.classList.toggle('directory-active',nested);
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
function dismissModal() {
  if(!modal?.parent)return closeModal();
  const parent=modal.parent,focus=modal.parentFocus;
  closeConfirmation();modal=parent;showModal();
  if(focus)modalRoot.querySelector(focus)?.focus({preventScroll:true});
}
function showAccountConfirmation(user) {
  modal.pendingUser=user; modalRoot.inert=true;
  confirmRoot.innerHTML=`<span class="account-tip-icon">${icon('info')}</span><span>${safe(safetyMessage)}</span>`;
  confirmRoot.hidden=false;
  const modalTop=modalRoot.querySelector('.modal').getBoundingClientRect().top;
  confirmRoot.style.top=`${Math.max(12,Math.round(modalTop-confirmRoot.getBoundingClientRect().height-16))}px`;
  confirmationTimer=setTimeout(()=>{
    if(!modal || !['add','directory-add'].includes(modal.type) || modal.step!=='verify' || modal.pendingUser!==user) return;
    closeConfirmation(); modal.user=user; modal.step=modal.type==='directory-add'?'confirm':'role'; showModal(); modalRoot.querySelector('input[name=role], [data-confirm-add], [data-directory-add-confirm]')?.focus();
  },1600);
}
function rolesRadio(selected='member') { return `<div class="role-choices">${['admin','member','visitor'].map(r=>`<label class="role-option ${r}"><input type="radio" name="role" value="${r}" ${selected===r?'checked':''}><span class="role-icon">${icon(roleIcons[r])}</span><span><strong>${roleNames[r]}</strong><small>${roleDescriptions[r]}</small></span></label>`).join('')}</div>`; }
function openAdd(target='project', groupId=null) { if(!canManage()) return notify('当前角色不能添加成员'); modal={type:'add',target,groupId,step:'verify',error:''}; showModal(); }
function openGroupCreate(parent=null) { if(!canManage()) return notify('当前角色不能添加课题组'); modal={type:'group-create',name:'',members:[],memberQuery:'',pickerOpen:false,error:'',memberError:'',parent,parentFocus:'[data-new-collab-group]'}; showModal(); }
function openDirectoryAdd(parent=null){ if(!canManage()) return notify('当前角色不能添加成员'); modal={type:'directory-add',step:'verify',account:'',phone:'',email:'',error:'',parent,parentFocus:'#groupMemberSearch'}; showModal(); }
function accountIdentityCard(u) {
  return `<div class="verify-success account-identity-card">${avatar(u.name)}<div><strong>${safe(u.name)}</strong><span>用户名：${safe(u.account)}</span><span>手机号：${safe(u.phone)}<br>邮箱：${safe(u.email)}</span></div><span class="checkmark">演示核对通过</span></div>`;
}
function showMemberAccountLookup(title,subtitle) {
  const fields=[['phone','注册手机号','tel','numeric','11','请输入注册手机号'],['email','注册邮箱','email','email','100','请输入注册邮箱'],['account','用户名','text','text','80','请输入云平台用户名']];
  modalFrame(title,subtitle,`<form id="verifyForm" novalidate><div class="lookup-instruction">${icon('link')}<span>任填一项即可匹配；三项信息一一对应，自动补全不会创建新账号。</span></div>${fields.map(([key,label,type,inputmode,max,placeholder])=>`<label class="field" id="${key}Field"><span class="field-label">${label}<span class="autofill-tag">可输入 · 可自动匹配</span></span><input id="${key}" data-account-key="${key}" type="${type}" inputmode="${inputmode}" autocomplete="off" maxlength="${max}" placeholder="${placeholder}" value="${safe(modal[key]||'')}" aria-describedby="phoneLookup" aria-invalid="false"><span class="field-error">${key==='phone'?'请输入有效的 11 位中国大陆手机号':key==='email'?'请输入有效的注册邮箱':'请匹配有效的云平台用户名'}</span></label>`).join('')}<div id="phoneLookup" aria-live="polite"></div><div id="accountLookupError" class="inline-error" role="alert" ${modal.error?'':'hidden'}>${safe(modal.error)}</div><p class="demo-example">演示同一账户：13800000007 / zhao.researcher@example.com / zhao.researcher。仅使用示例账号，不查询真实平台注册信息。</p></form>`,'<button class="btn" data-close>取消</button><button class="btn primary" data-verify>确认云平台账户</button>');
  drawAccountLookup();document.getElementById(modal.lookupSource||'phone').focus();
}
function lookupError(message,keys=[]) {
  modal.error=message;
  const el=document.getElementById('accountLookupError');el.textContent=message;el.hidden=false;
  keys.forEach(key=>{document.getElementById(key+'Field').classList.add('invalid');document.getElementById(key).setAttribute('aria-invalid','true');});
}
function drawAccountLookup() {
  const slot=document.getElementById('phoneLookup');if(!slot)return;
  const key=modal.lookupSource||accountKeys.find(k=>modal[k])||'phone';
  const result=resolvePlatformAccount(modal[key],key),u=result.user;
  slot.innerHTML=u?`<div class="account-preview">${avatar(u.name)}<div><strong>${safe(u.name)}</strong><small>已匹配唯一云平台账户：${safe(u.account)}</small></div><span>三项一致</span></div>`:modal[key]?`<p class="lookup-status ${result.status==='ambiguous'?'lookup-conflict':''}">${result.status==='ambiguous'?'账号信息存在重复关联，无法唯一匹配，请核对后重试。':'暂未匹配，请输入完整的手机号、邮箱或用户名。'}</p>`:'';
}
function updateAccountLookup(key,value) {
  modal.lookupSource=key;modal.error='';modal.user=null;
  const result=resolvePlatformAccount(value,key);
  accountKeys.forEach(k=>{
    const next=k===key?value:result.user?.[k]||'';
    modal[k]=next;const input=document.getElementById(k);input.value=next;input.setAttribute('aria-invalid','false');
    document.getElementById(k+'Field').classList.remove('invalid');
  });
  const error=document.getElementById('accountLookupError');error.hidden=true;error.textContent='';drawAccountLookup();
}

function showDirectoryAddModal(){
  if(modal.step==='verify')return showMemberAccountLookup('添加成员',accountCopy.subtitle);
  const u=modal.user;
  modalFrame('确认添加成员','账号核对通过，请确认成员信息。',`${accountIdentityCard(u)}<p class="member-library-note">${modal.parent?'添加后自动选入当前课题组，课题组创建后才加入该组。':'添加到统一成员库，不会自动加入课题组或获得项目权限。'}课题组角色在加入课题组时设置。</p>`,'<button class="btn" data-back-verify>返回修改</button><button class="btn primary" data-directory-add-confirm>确认添加</button>');
}
function confirmDirectoryAdd(){
  if(!canManage()||modal?.type!=='directory-add'||modal.step!=='confirm'||!modal.user)return;
  const u=modal.user,parent=modal.parent;
  if(directory.some(d=>accountKeys.some(k=>accountValue(d[k])&&accountValue(d[k])===accountValue(u[k])))){modal.error='该成员已在成员库中';modal.step='verify';return showModal();}
  directory.push({...u});saveAll();
  if(parent?.type==='group-create'){
    if(!parent.members.some(m=>m.id===u.id))parent.members.push({id:u.id,role:u.id==='support-1'?'admin':'member'});
    parent.memberError='';modal=parent;showGroupCreateModal();return notify('成员已添加，并自动选入当前课题组');
  }
  search='';closeModal();render();notify('成员已添加，可在课题组中选用');
}
function directoryAssociations(id) {
  const relatedGroups=groups.filter(g=>g.members.some(m=>m.id===id));
  const relatedRecords=collabRecords.filter(r=>(r.members||[]).some(m=>m.id===id));
  const relatedProjects=projects.filter(p=>p.members.some(m=>m.id===id)||relatedRecords.some(r=>r.projectId===p.id));
  const relatedShares=projects.filter(p=>p.shareUserIds.includes(id));
  return {groups:relatedGroups,projects:relatedProjects,records:relatedRecords,shares:relatedShares,blocked:!!(relatedGroups.length||relatedProjects.length||relatedShares.length||relatedRecords.length)};
}
function openDirectoryRemove(id) {
  if(!canManage())return notify('当前角色不能移除成员');
  if(!directory.some(u=>u.id===id))return;
  if(isDirectoryOwner(id))return notify('项目所有者不可从成员库移除');
  modal={type:'directory-remove',id};showDirectoryRemoveModal();
}
function showDirectoryRemoveModal() {
  const u=directory.find(u=>u.id===modal.id);if(!u)return closeModal();
  const refs=directoryAssociations(u.id),protectedOwner=isDirectoryOwner(u.id),blocked=refs.blocked||protectedOwner;
  const section=(title,items)=>items.length?`<section class="directory-association-section"><h3>${title}<span>${items.length}</span></h3><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul></section>`:'';
  const associations=section('关联课题组',refs.groups.map(g=>safe(g.name)))+section('关联项目',refs.projects.map(p=>`<strong>${safe(p.name)}</strong><small>${safe(p.code)}</small>`))+section('协作授权',refs.records.map(r=>`<strong>${safe(projects.find(p=>p.id===r.projectId)?.name||r.projectName||'协作项目')}</strong><small>${safe(r.groupName)} · 协作成员</small>`))+section('项目分享',refs.shares.map(p=>`<strong>${safe(p.name)}</strong><small>共享用户 · ${safe(p.code)}</small>`));
  modalFrame(blocked?'暂不能移除成员':'移除成员',blocked?'请先解除关联，再从成员库移除。':'请确认是否从你的成员库移除该成员。',`<div class="directory-remove-person">${avatar(u.name)}<div><strong>${safe(u.name)}</strong><span>${safe(u.account)} · ${safe(u.phone.slice(0,3))}****${safe(u.phone.slice(-4))}</span></div></div>${blocked?`<div class="directory-remove-warning">${icon('info')}<p>${protectedOwner?'该成员是项目所有者，不可从成员库移除。':'该成员仍有关联的课题组、项目或分享权限，暂不能移除，避免影响现有协作。'}</p></div><div class="directory-associations">${associations}</div>`:'<p class="directory-remove-description">该成员当前没有关联课题组、项目或分享权限，确认后将从成员列表中移除。</p>'}<p class="member-library-note">仅移出你的成员库，不会删除对方的云平台账号；以后仍可通过手机号、邮箱或用户名重新添加。</p>`,`<button class="btn" data-close>${blocked?'知道了':'取消'}</button><button class="btn danger" data-confirm-directory-remove ${blocked?'disabled':''}>确认移除</button>`);
  modalRoot.querySelector('.modal').classList.add('directory-remove-modal');
}
function confirmDirectoryRemove() {
  if(!canManage()||modal?.type!=='directory-remove')return;
  const u=directory.find(u=>u.id===modal.id);if(!u)return closeModal();
  // 保存时再次检查，防止弹窗打开后关联发生变化导致误删。
  if(isDirectoryOwner(u.id)||directoryAssociations(u.id).blocked)return showDirectoryRemoveModal();
  if(!platformAccounts.some(account=>account.id===u.id))platformAccounts.push({...u});
  directory=directory.filter(d=>d.id!==u.id);saveAll();closeModal();render();notify('成员已从成员库移除，云平台账号仍保留');
}
function openCollab(groupId=groups[0]?.id, projectIds=[], chooseProjects=false, recordId=null) { if(!canManage()) return notify('当前角色不能管理项目协作'); modal={type:'collab',selectedGroupIds:[groupId].filter(Boolean),selectedMemberIds:[],selectedProjectIds:[...new Set(projectIds)],chooseProjects,recordId,removedMemberIds:[],selectionTouched:false}; refreshCollabSelection(); showModal(); }
function openShare(projectId) {
  if(!canManage())return notify('当前角色不能管理项目分享');
  const p=projects.find(x=>x.id===projectId);if(!p)return;
  modal={type:'share',projectId,selectedUserIds:[...p.shareUserIds],account:'',error:''};showShareModal();
}
function shareProjectCard(p) {
  return `<div class="share-project-card"><span class="share-project-icon">${icon('folder')}</span><div><strong>${safe(p.name.replace(/^测试示例-/,''))}</strong><small>${safe(p.code)}</small></div><span class="share-scope">原始分析结果</span></div>`;
}
function showShareModal() {
  const p=projects.find(x=>x.id===modal.projectId);if(!p)return closeModal();
  const ownerId=p.members.find(m=>m.role==='owner')?.id;
  const body=`${shareProjectCard(p)}
    <div class="share-info">${icon('info')}<span>仅分享原始分析结果，不授予项目协作或成员管理权限。</span></div>
    <form id="shareForm" novalidate><div class="share-label-row"><label class="field-label" for="shareAccount"><span class="required-mark">*</span>共享用户</label><span class="share-limit">已选 <b>${modal.selectedUserIds.length}</b> / 5 人</span></div>
    <div class="share-account-control ${modal.error?'invalid':''}"><span>${icon('person')}</span><input id="shareAccount" type="text" maxlength="100" list="shareAccountOptions" autocomplete="off" placeholder="输入手机号、邮箱或用户名" value="${safe(modal.account)}" aria-describedby="shareAccountHint shareAccountError" aria-invalid="${!!modal.error}"><button type="submit" class="btn primary" data-add-share-user>${icon('plus')}添加</button></div>
    <datalist id="shareAccountOptions">${platformAccounts.filter(u=>u.id!==ownerId&&!modal.selectedUserIds.includes(u.id)).flatMap(u=>accountKeys.map(key=>`<option value="${safe(u[key])}">${safe(u.name)} · ${key==='phone'?'手机号':key==='email'?'邮箱':'用户名'}</option>`)).join('')}</datalist>
    <div id="shareAccountLookup" aria-live="polite"></div><p id="shareAccountError" class="share-error" role="alert" ${modal.error?'':'hidden'}>${safe(modal.error)}</p><p id="shareAccountHint" class="share-input-hint">手机号、邮箱、用户名均可匹配同一账户；最多分享给 5 位用户，保存后才生效。</p></form>
    ${p.shared&&!p.shareUserIds.length?'<div class="share-legacy-note">旧版分享记录未保存接收用户。可重新添加用户并保存，或取消全部分享。</div>':''}
    <section class="share-recipients" aria-label="共享用户名单"><div class="share-list-heading"><h3>共享用户名单</h3><span>仅查看原始结果</span></div><div class="share-user-list">${modal.selectedUserIds.map((id,i)=>`<div class="share-user-row" data-share-user-row="${safe(id)}">${avatar(person(id).name,i)}<div class="share-user-meta"><strong>${safe(person(id).name)}</strong><span>${safe(person(id).account)}</span></div><span class="share-user-status ${p.shareUserIds.includes(id)?'':'pending'}">${p.shareUserIds.includes(id)?'已分享':'待分享'}</span><button type="button" class="btn quiet small danger" data-remove-share-user="${safe(id)}" aria-label="移除共享用户${safe(person(id).name)}">移除</button></div>`).join('')||`<div class="share-empty">${icon('people')}<span>还没有添加共享用户</span><small>输入对方手机号、邮箱或用户名，即可添加</small></div>`}</div></section>
    <div class="share-access-path"><span>对方查看路径</span><p>项目列表 <i>›</i> ${safe(p.type)} <i>›</i> 共享项目</p></div>`;
  modalFrame('项目分享','指定共享用户，让分析成果安全、清晰地传递。',body,`${p.shared?'<button class="btn quiet danger share-cancel-all" data-open-share-cancel>取消全部分享</button>':''}<button class="btn" data-close>取消</button><button class="btn primary" data-save-share>${p.shared?'保存分享设置':'确认分享'}</button>`);
  modalRoot.querySelector('.modal').classList.add('share-modal');drawShareAccountLookup();
}
function drawShareAccountLookup() {
  const slot=document.getElementById('shareAccountLookup');if(!slot)return;
  const result=resolvePlatformAccount(modal.account),u=result.user;
  slot.innerHTML=u?`<div class="share-account-match">${icon('check')}<span>已匹配：<b>${safe(u.name)}</b> · 用户名 ${safe(u.account)}<small>手机号 ${safe(u.phone)} · 邮箱 ${safe(u.email)}</small></span></div>`:modal.account&&result.status==='ambiguous'?'<p class="share-error">账号信息存在重复关联，无法唯一匹配。</p>':'';
}
function shareError(message) {
  modal.error=message;showShareModal();document.getElementById('shareAccount')?.focus();return false;
}
function addShareUser() {
  if(!canManage()||modal?.type!=='share')return false;
  modal.account=(document.getElementById('shareAccount')?.value||modal.account).trim();
  if(!modal.account)return shareError('请输入要分享的手机号、邮箱或用户名');
  const p=projects.find(x=>x.id===modal.projectId);
  const result=resolvePlatformAccount(modal.account),user=result.user;
  if(!user)return shareError(result.status==='ambiguous'?'账号信息存在重复关联，无法唯一匹配，请核对后重试。':'未找到该云平台账户，请核对完整手机号、邮箱或用户名');
  if(p.members.some(m=>m.role==='owner'&&m.id===user.id))return shareError('无需将项目分享给项目所有者');
  if(modal.selectedUserIds.includes(user.id))return shareError('该用户已在共享名单中，请勿重复添加');
  if(modal.selectedUserIds.length>=5)return shareError('每个项目最多分享给 5 位用户，请先移除一位用户');
  modal.selectedUserIds.push(user.id);modal.account='';modal.error='';showShareModal();return true;
}
function saveShare() {
  if(!canManage()||modal?.type!=='share')return;
  if(modal.account.trim()&&!addShareUser())return;
  const p=projects.find(x=>x.id===modal.projectId);if(!p)return;
  if(!modal.selectedUserIds.length){if(p.shared)return openCancelShare(p.id,modal);return shareError('请至少添加一位共享用户');}
  if(modal.selectedUserIds.length>5)return shareError('每个项目最多分享给 5 位用户');
  modal.selectedUserIds.forEach(id=>ensureDirectoryPerson(id));
  p.shareUserIds=[...modal.selectedUserIds];p.shared=true;saveAll();closeModal();render();notify('分享设置已保存，共享项目列表已更新');
}
function openCancelShare(projectId, previous=null) {
  if(!canManage())return;
  const p=projects.find(x=>x.id===projectId);if(!p?.shared)return;
  modal={type:'share-cancel',projectId,previous};showCancelShareModal();
}
function showCancelShareModal() {
  const p=projects.find(x=>x.id===modal.projectId);if(!p)return closeModal();
  modalFrame('取消项目分享','请确认是否收回本项目的全部分享权限。',`${shareProjectCard(p)}<div class="share-cancel-warning">${icon('info')}<div><strong>取消后，接收用户将无法再从“共享项目”查看该项目。</strong><p>仅取消分享，不删除项目，也不影响已有协作关系和课题组成员。</p></div></div>${p.shareUserIds.length?`<div class="share-cancel-users"><span>将取消以下 ${p.shareUserIds.length} 位用户的分享</span><div>${p.shareUserIds.map(id=>`<span class="group-chip">${safe(person(id).name)}</span>`).join('')}</div></div>`:''}`,'<button class="btn" data-keep-share>暂不取消</button><button class="btn danger" data-confirm-share-cancel>确认取消分享</button>');
  modalRoot.querySelector('.modal').classList.add('share-modal');
}
function cancelShare() {
  if(!canManage()||modal?.type!=='share-cancel')return;
  const p=projects.find(x=>x.id===modal.projectId);if(!p)return;
  p.shareUserIds=[];p.shared=false;saveAll();closeModal();render();notify('已取消项目分享，不影响项目协作');
}
function openCreateFolder() {
  if(!canManage())return;
  modal={type:'folder-create',projectId:project().id,parentId:filePath.at(-1)||null,name:'',error:''};showFolderModal();
}
function showFolderModal() {
  modalFrame('新建文件夹','在当前项目目录中新建文件夹。',`<form id="folderForm" novalidate><label class="field ${modal.error?'invalid':''}"><span class="field-label">文件夹名称</span><input id="folderName" type="text" maxlength="50" placeholder="请输入文件夹名称" value="${safe(modal.name)}"><span class="field-error">${safe(modal.error)}</span></label></form>`,'<button class="btn" data-close>取消</button><button class="btn primary" data-confirm-folder>创建文件夹</button>');
}
function confirmFolder() {
  if(!canManage()||modal?.type!=='folder-create')return;
  const p=projects.find(p=>p.id===modal.projectId);if(!p)return;
  modal.name=document.getElementById('folderName').value.trim();
  if(!modal.name){modal.error='请输入文件夹名称';return showFolderModal();}
  if(/[\\/]/.test(modal.name)){modal.error='文件夹名称不能包含斜杠';return showFolderModal();}
  if(p.files.some(f=>f.parentId===modal.parentId&&f.name===modal.name)){modal.error='当前目录已存在同名文件夹';return showFolderModal();}
  p.files.push({id:'folder-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:modal.name,parentId:modal.parentId,createdAt:new Date().toLocaleString('zh-CN',{hour12:false}),creator:'王老师'});
  saveAll();closeModal();render();notify('文件夹已创建');
}
function openFileRemoval(ids) {
  if(!canManage())return;
  const files=currentProjectFiles().filter(f=>ids.includes(f.id));if(!files.length)return;
  modal={type:'file-remove',projectId:project().id,ids:files.map(f=>f.id)};
  modalFrame('删除文件夹','请确认要删除的示例内容。',`<div class="confirm-warning">将删除 ${files.length} 个文件夹及其子目录。此操作仅影响当前浏览器内的示例数据。</div><p class="file-removal-names">${files.map(f=>safe(f.name)).join('、')}</p>`,'<button class="btn" data-close>取消</button><button class="btn danger" data-confirm-file-remove>确认删除</button>');
}
function removeProjectFiles() {
  if(!canManage()||modal?.type!=='file-remove')return;
  const p=projects.find(p=>p.id===modal.projectId);if(!p)return;
  const removed=new Set(modal.ids);let changed=true;
  while(changed){changed=false;for(const f of p.files)if(removed.has(f.parentId)&&!removed.has(f.id)){removed.add(f.id);changed=true;}}
  p.files=p.files.filter(f=>!removed.has(f.id));selectedFileIds=[];saveAll();closeModal();render();notify('示例文件夹已删除');
}
function showResultPreview() {
  modal={type:'result-preview'};
  modalFrame('分析结果预览','原始分析结果 · 交互演示',`${shareProjectCard(project())}<div class="result-preview-panel"><span class="reference-detail-status">分析已完成</span><h3>原始分析结果已就绪</h3><p>正式平台可在这里查看分析报告。本原型使用示例数据，不包含真实分析文件。</p></div>`,'<button class="btn" data-close>关闭</button><button class="btn primary" data-result-to-data>查看项目数据</button>');
}
function showCloudDownload() {
  modal={type:'cloud-download'};
  modalFrame('下载派森诺云盘','项目数据下载入口',`<div class="result-preview-panel">${icon('download')}<h3>使用云盘客户端下载项目数据</h3><p>本原型仅演示下载入口，不提供安装包。正式产品接入下载地址后，可在此获取客户端。</p></div>`,'<button class="btn primary" data-close>知道了</button>');
}

function groupCreateMembers() { return modal.members.map(m=>`<div class="picker-member"><div class="member-cell">${avatar(person(m.id).name)}<div><div class="member-name">${safe(person(m.id).name)}${m.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><small>${safe(person(m.id).account)}</small></div></div><div class="picker-right"><select data-group-role="${m.id}" ${m.id==='support-1'?'disabled':''} aria-label="设置成员角色">${['admin','member','visitor'].map(r=>`<option value="${r}" ${m.role===r?'selected':''}>${roleNames[r]}</option>`).join('')}</select><button type="button" class="chip-close" data-remove-group-member="${m.id}" aria-label="移除 ${safe(person(m.id).name)}">×</button></div></div>`).join('') || '<div class="picker-empty">还没有成员，可从上方添加，或直接添加技术支持。</div>'; }
function groupMemberOptions() {
  const q=accountValue(modal.memberQuery);
  const people=platformAccounts.filter(d=>d.id!=='owner-1'&&`${d.name} ${d.account} ${d.phone} ${d.email}`.toLowerCase().includes(q));
  return people.map(d=>{
    const unique=resolvePlatformAccount(d.account,'account').user?.id===d.id;
    return `<label class="group-member-option"><input type="checkbox" data-pick-group-member="${safe(d.id)}" ${modal.members.some(m=>m.id===d.id)?'checked':''} ${unique?'':'disabled'}><span><strong>${safe(d.name)}</strong><small>用户名 ${safe(d.account)} · 手机号 ${safe(d.phone.slice(0,3))}****${safe(d.phone.slice(-4))}</small></span>${!unique?'<span class="lookup-conflict">无法唯一匹配</span>':d.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</label>`;
  }).join('')||'<div class="picker-empty">未匹配到云平台账户，请核对完整手机号或用户名。</div>';
}

function drawGroupPicker() {
  document.getElementById('groupMemberOptions').innerHTML=groupMemberOptions();
  document.getElementById('groupMemberDropdown').hidden=!modal.pickerOpen;
  document.getElementById('groupMemberSearch').setAttribute('aria-expanded',String(modal.pickerOpen));
  document.getElementById('selectedGroupMembers').innerHTML=groupCreateMembers();
  document.getElementById('groupSelectedCount').textContent=modal.members.length;
  const error=document.getElementById('groupMemberError');error.textContent=modal.memberError;error.hidden=!modal.memberError;
}
function showGroupCreateModal() {
  modalFrame('添加课题组','填写名称，选择已有成员；也可以当场添加新成员，无需离开当前页面。',
    `<form id="groupForm" novalidate><label class="field ${modal.error?'invalid':''}" id="groupNameField"><span class="field-label">课题组名称</span><input id="groupName" type="text" maxlength="40" placeholder="例如：肿瘤早筛课题组" value="${safe(modal.name)}"><span class="field-error">${safe(modal.error||'请输入课题组名称')}</span></label>
    <div class="group-picker-label"><label class="field-label" for="groupMemberSearch">选择成员 <span class="picker-note">可多选</span></label><button type="button" class="btn quiet small text-primary" data-add-support>直接添加技术支持</button></div>
    <div class="group-search-picker"><div class="group-search-control">${icon('search')}<input id="groupMemberSearch" type="search" autocomplete="off" placeholder="输入手机号或用户名匹配云平台账户" value="${safe(modal.memberQuery)}" aria-expanded="${modal.pickerOpen}" aria-controls="groupMemberDropdown"><button type="button" class="group-picker-toggle" data-toggle-group-picker aria-label="展开或收起成员选项">⌄</button></div>
    <div class="group-member-dropdown" id="groupMemberDropdown" ${modal.pickerOpen?'':'hidden'}><div id="groupMemberOptions" class="group-member-options">${groupMemberOptions()}</div></div></div>
    <p class="group-account-hint">手机号与用户名一一对应；选择平台账户后，创建课题组时自动加入成员库。</p><div class="group-add-row"><span>需要核对账户信息？</span><button type="button" class="btn quiet small text-primary" data-new-group-person>添加新成员</button></div><p class="group-member-error" id="groupMemberError" role="alert" ${modal.memberError?'':'hidden'}>${safe(modal.memberError)}</p>
    <div class="selected-picker"><div class="picker-title">已选成员 <b id="groupSelectedCount">${modal.members.length}</b><span>可调整角色或直接移除</span></div><div id="selectedGroupMembers">${groupCreateMembers()}</div></div><p class="member-library-note">创建课题组仅建立成员归属；项目权限将在确认项目协作后生效。</p></form>`,
    `<button class="btn" data-close>${modal.parent?'返回项目协作':'取消'}</button><button class="btn primary" data-create-group-confirm>${modal.parent?'创建并选用':'创建课题组'}</button>`, true);
}
function collabMembers(state) {
  const seen=new Set(), out=[];
  state.selectedGroupIds.forEach(gid=>{ const g=group(gid); (g?.members||[]).forEach(m=>{ if(!seen.has(m.id)){seen.add(m.id); out.push({...m});} }); });
  return out;
}
function collabProjectMembers(state) {
  const seen=new Set(),out=[];
  const containers=collabTargetRecords(state);
  containers.forEach(p=>(p.members||[]).forEach(m=>{if(!seen.has(m.id)){seen.add(m.id);out.push({...m});}}));
  return out;
}
function collabTargetRecords(state) {
  const g=group(state.selectedGroupIds[0]);
  return collabRecords.filter(r=>state.selectedProjectIds.includes(r.projectId)&&(state.recordId?r.id===state.recordId:g&&(r.groupId?r.groupId===g.id:r.groupName===g.name)));
}
function refreshCollabSelection(preserve=false) {
  const records=collabTargetRecords(modal);
  const current=new Set(collabProjectMembers(modal).map(m=>m.id));
  const isNew=!modal.selectedProjectIds.length||modal.selectedProjectIds.some(id=>!records.some(r=>r.projectId===id));
  const selected=new Set(preserve&&modal.selectionTouched?modal.selectedMemberIds:collabMembers(modal).filter(m=>isNew||current.has(m.id)).map(m=>m.id));
  modal.selectedMemberIds=collabMembers(modal).filter(m=>m.role!=='owner'&&selected.has(m.id)).map(m=>m.id);
  modal.removedMemberIds=collabMembers(modal).filter(m=>current.has(m.id)&&!selected.has(m.id)).map(m=>m.id);
}
function changeCollabMember(id,selected) {
  const member=collabMembers(modal).find(m=>m.id===id);
  if(!member||member.role==='owner')return;
  modal.selectionTouched=true;
  const exists=collabProjectMembers(modal).some(m=>m.id===id);
  if(selected){modal.selectedMemberIds=[...new Set([...modal.selectedMemberIds,id])];modal.removedMemberIds=modal.removedMemberIds.filter(x=>x!==id);}
  else {modal.selectedMemberIds=modal.selectedMemberIds.filter(x=>x!==id);if(exists)modal.removedMemberIds=[...new Set([...modal.removedMemberIds,id])];}
}
function showCollabModal() {
  const members=collabMembers(modal),current=collabProjectMembers(modal);
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  const body=`${modal.chooseProjects?`<section class="picker-block project-picker"><h3>选择协作项目 <span class="picker-note">可单选或多选</span></h3><div class="check-list project-list-picker">${projects.map(p=>`<label class="check-item"><input type="checkbox" data-collab-project="${p.id}" ${modal.selectedProjectIds.includes(p.id)?'checked':''}><span class="check-main"><strong>${safe(p.name.replace(/^测试示例-/,''))}</strong><small>${safe(p.code)}</small></span></label>`).join('')}</div></section>`:''}
  <div class="collab-context"><span>协作目标：<b>${selectedProjects.length} 个项目</b></span><span>${selectedProjects.length===1?safe(selectedProjects[0].name.replace(/^测试示例-/,'')):'统一选择课题组与协作成员'}</span></div>
  <div class="picker-layout"><section class="picker-block"><div class="picker-heading"><h3>选择课题组 <span class="picker-note">单选</span></h3>${modal.recordId?'':'<button class="btn quiet small text-primary" data-new-collab-group>＋ 新建课题组</button>'}</div><div class="check-list">${groups.map(g=>`<label class="check-item"><input type="radio" name="collabGroup" data-collab-group="${g.id}" ${modal.selectedGroupIds[0]===g.id?'checked':''} ${modal.recordId?'disabled':''}><span class="check-main"><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员</small></span></label>`).join('')||'<div class="picker-empty">暂无课题组，点击上方“新建课题组”即可创建</div>'}</div></section>
  <section class="picker-block"><h3>协作成员</h3><div class="picker-tools"><span id="collabMemberCount">${modal.selectedMemberIds.length}/${members.length} 位成员</span><button class="btn quiet small" data-select-all-collab-members>全选</button><button class="btn quiet small" data-clear-collab-members>清空</button></div><p class="inline-member-hint">新协作默认全选；已有协作保留原授权。可取消勾选，保存后生效。</p><div class="check-list inline-collab-members">${members.map((m,i)=>{
    const selected=modal.selectedMemberIds.includes(m.id),removed=modal.removedMemberIds.includes(m.id),existing=current.some(x=>x.id===m.id),owner=m.role==='owner';
    return `<div class="check-item inline-member-row ${removed?'pending-removal':''}" data-collab-member-row="${m.id}"><label class="inline-member-choice"><input type="checkbox" data-collab-member="${m.id}" ${selected?'checked':''} ${owner?'disabled':''}>${avatar(person(m.id).name,i)}<span class="check-main"><strong>${safe(person(m.id).name)}</strong><small>${safe(person(m.id).account)} · ${roleNames[m.role]}</small></span></label><div class="inline-member-actions"><span class="member-selection-state ${removed?'removed':''}">${owner?'项目所有者':removed?'待移除':existing?'已加入':selected?'待添加':''}</span>${owner?'':removed?`<button class="btn quiet small" data-restore-collab-member="${m.id}" aria-label="撤销移除${safe(person(m.id).name)}">撤销</button>`:(selected||existing)?`<button class="btn quiet small danger" data-remove-collab-member="${m.id}" aria-label="移除${safe(person(m.id).name)}">移除</button>`:''}</div></div>`;
  }).join('')||'<div class="picker-empty">该课题组还没有成员，请先添加成员</div>'}</div></section></div>
  <div class="inline-collab-summary"><span>已选 <b>${modal.selectedMemberIds.length}</b> 位协作成员${modal.removedMemberIds.length?` · <span class="pending-count">待移除 ${modal.removedMemberIds.length} 位</span>`:''}</span><span>仅调整项目协作，不删除课题组成员</span></div>`;
  modalFrame(modal.recordId?'管理协作成员':collabTargetRecords(modal).length?'管理项目协作':'发起项目协作','选择一个课题组，在右侧直接添加或移除成员。',body,'<button class="btn" data-close>取消</button><button class="btn primary" data-confirm-collab>保存变更</button>',true);
}
function showModal() {
  if(!modal) return;
  if(modal.type==='share')return showShareModal();
  if(modal.type==='share-cancel')return showCancelShareModal();
  if(modal.type==='folder-create')return showFolderModal();
  if(modal.type==='group-create') return showGroupCreateModal();
  if(modal.type==='directory-add') return showDirectoryAddModal();
  if(modal.type==='directory-remove') return showDirectoryRemoveModal();
  if(modal.type==='collab') return showCollabModal();
  if(modal.type==='add' && modal.step==='verify') {
    const title=modal.target==='group'?'添加课题组成员':'添加项目成员';
    return showMemberAccountLookup(title,accountCopy.subtitle);
  }
  if(modal.type==='add' && modal.step==='role') {
    const u=modal.user;
    const title=modal.target==='group'?'确认课题组成员与角色':'确认成员与项目角色';
    modalFrame(title,'账号核对通过，请为该用户选择角色',
      `${accountIdentityCard(u)}<span class="field-label">${modal.target==='group'?'课题组角色':'项目角色'}</span>${u.id==='support-1'?'<div class="fixed-admin-role">技术支持默认为管理员，角色不可调整。</div>':rolesRadio('member')}`,
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
  if(!canManage()||!modal||!['add','directory-add'].includes(modal.type)||modal.step!=='verify')return;
  accountKeys.forEach(k=>{modal[k]=document.getElementById(k).value.trim();document.getElementById(k+'Field').classList.remove('invalid');document.getElementById(k).setAttribute('aria-invalid','false');});
  if(!accountKeys.some(k=>modal[k]))return lookupError('请先输入手机号、邮箱或用户名中的任意一项');
  const invalid=[];
  if(!/^1[3-9]\d{9}$/.test(modal.phone))invalid.push('phone');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modal.email))invalid.push('email');
  if(!modal.account)invalid.push('account');
  if(invalid.length)return lookupError('暂未匹配到完整账户，请核对输入的手机号、邮箱或用户名。',invalid);
  const results=accountKeys.map(k=>resolvePlatformAccount(modal[k],k));
  if(results.some(r=>r.status==='ambiguous'))return lookupError('账号信息存在重复关联，无法唯一匹配，请核对后重试。',accountKeys);
  const user=results[0].user;
  if(!user||results.some(r=>r.user?.id!==user.id))return lookupError(accountCopy.mismatch,accountKeys);
  if(modal.type==='directory-add'){
    if(directory.some(d=>d.id===user.id||accountKeys.some(k=>accountValue(d[k])&&accountValue(d[k])===accountValue(user[k]))))return lookupError('该成员已在成员库中，可在课题组中直接选用');
  }else{
    const container=modal.target==='group'?group(modal.groupId)?.members:projectMemberList();if(!container)return;
    if(user.id==='owner-1')return lookupError('项目所有者无需重复添加');
    if(container.some(m=>m.id===user.id))return lookupError('该用户已在当前列表中');
  }
  modal.error='';showAccountConfirmation(user);
}

function confirmGroupCreate() {
  if(!canManage()||modal?.type!=='group-create')return;
  modal.name=document.getElementById('groupName').value.trim();modal.error='';modal.memberError='';
  if(!modal.name)modal.error='请输入课题组名称';
  else if(groups.some(g=>g.name===modal.name))modal.error='课题组名称已存在';
  if(!modal.members.length)modal.memberError='请至少选择一位成员';
  else if(modal.members.some(m=>resolvePlatformAccount(person(m.id).account,'account').user?.id!==m.id))modal.memberError='存在无法唯一匹配的成员，请核对手机号和用户名后重新选择';
  if(modal.error||modal.memberError){showGroupCreateModal();document.getElementById(modal.error?'groupName':'groupMemberSearch').focus();return;}
  const id='group-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),parent=modal.parent;
  modal.members.forEach(m=>ensureDirectoryPerson(m.id));
  groups.push({id,name:modal.name,members:structuredClone(modal.members)});saveAll();
  if(parent?.type==='collab'){
    parent.selectedGroupIds=[id];parent.removedMemberIds=[];parent.selectionTouched=false;
    modal=parent;refreshCollabSelection();showCollabModal();return notify('课题组已创建并选用，确认协作后才授予项目权限');
  }
  closeModal();render();notify('课题组已创建，可在项目协作中选用');
}
function confirmCollab() {
  if(!canManage()||modal?.type!=='collab')return;
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  const g=group(modal.selectedGroupIds[0]);
  const members=collabMembers(modal).filter(m=>modal.selectedMemberIds.includes(m.id));
  if(!selectedProjects.length)return notify('请至少选择一个项目');
  if(!g)return notify('请选择一个课题组');
  const targetRecords=collabTargetRecords(modal);
  if(!members.length&&selectedProjects.some(p=>!targetRecords.some(r=>r.projectId===p.id)))return notify('新发起协作请至少选择一位成员');
  const createdAt=new Date().toLocaleString('zh-CN',{hour12:false}),groupMemberIds=new Set(g.members.map(m=>m.id));
  let added=0;
  selectedProjects.forEach(p=>{
    members.forEach(m=>{if(!p.members.some(x=>x.id===m.id))p.members.push({id:m.id,role:m.id==='support-1'?'admin':m.role});});
    const record=targetRecords.find(r=>r.projectId===p.id);
    if(record){
      // 只调整当前记录的组内授权，保留从详情单独添加的其他成员及其角色。
      record.members=(record.members||[]).filter(m=>!groupMemberIds.has(m.id)||modal.selectedMemberIds.includes(m.id));
      members.forEach(m=>{if(!record.members.some(x=>x.id===m.id))record.members.push({id:m.id,role:m.id==='support-1'?'admin':m.role});});
      record.groupId=g.id;record.groupName=g.name;record.updatedAt=createdAt;
    }else{
      collabRecords.push({id:'record-'+Date.now()+'-'+p.id+'-'+Math.random().toString(36).slice(2,6),projectId:p.id,projectName:p.name,code:p.code,groupId:g.id,groupName:g.name,members:members.map(m=>({id:m.id,role:m.id==='support-1'?'admin':m.role})),createdAt,status:'协作中'});added++;
    }
  });
  saveAll();closeModal();page=selectedProjects[0]?.type==='云图汇'?'visual':'projects';projectMenuOpen=true;listTab='collab';search='';categoryFilter='';selectedProjectIds=[];render();notify(added?`已新增 ${added} 条协作记录`:'协作成员已更新');
}

main.addEventListener('click', e => {
  const a=e.target.closest('button'); if(!a||a.disabled) return;
  if(a.dataset.copyTicket) return copyProjectTicket(a.dataset.copyTicket);
  if(a.hasAttribute('data-back-project-list')) return navigate(detailOrigin.page,{projectTab:detailOrigin.listTab});
  if(a.dataset.nav) return navigate(a.dataset.nav);
  if(a.dataset.openProject||a.dataset.openData) return openProjectDetail(a.dataset.openProject||a.dataset.openData,a.dataset.collabRecord||null);
  if(a.hasAttribute('data-show-result'))return showResultPreview();
  if(a.hasAttribute('data-cloud-download'))return showCloudDownload();
  if(a.hasAttribute('data-create-folder'))return openCreateFolder();
  if(a.hasAttribute('data-delete-selected-files'))return openFileRemoval(selectedFileIds);
  if(a.dataset.deleteFile)return openFileRemoval([a.dataset.deleteFile]);
  if(a.dataset.openFolder){const folder=currentProjectFiles().find(f=>f.id===a.dataset.openFolder);if(folder){filePath.push(folder.id);selectedFileIds=[];return render();}}
  if(a.hasAttribute('data-file-path')){filePath=filePath.slice(0,Number(a.dataset.filePath)+1);selectedFileIds=[];return render();}
  if(a.dataset.tab){if(a.dataset.tab==='members'&&!isCollaborativeDetail())return;tab=a.dataset.tab;search='';return render();}
  if(a.dataset.listTab){listTab=a.dataset.listTab;search='';categoryFilter='';return render();}
  if(a.hasAttribute('data-clear-projects')){selectedProjectIds=[];return render();}
  if(a.hasAttribute('data-add-directory')) return openDirectoryAdd();
  if(a.dataset.removeDirectory)return openDirectoryRemove(a.dataset.removeDirectory);
  if(a.hasAttribute('data-create-group')) return openGroupCreate();
  if(a.hasAttribute('data-add')) return openAdd('project');
  if(a.dataset.groupAdd) return openAdd('group',a.dataset.groupAdd);
  if(a.dataset.addSupportGroup){if(!canManage()) return;const g=group(a.dataset.addSupportGroup);if(!g||g.members.some(m=>m.id==='support-1')) return;ensureDirectoryPerson('support-1');g.members.push({id:'support-1',role:'admin'});saveAll();render();return notify('技术支持已加入课题组，角色为管理员');}
  if(a.dataset.openCollab) return openCollab(a.dataset.openCollab,[],true);
  if(a.hasAttribute('data-collab-selected')) return openCollab(groups[0]?.id,[...selectedProjectIds],!selectedProjectIds.length);
  if(a.dataset.collabOne){const existing=collabRecords.find(r=>r.projectId===a.dataset.collabOne);return openCollab(existing?.groupId||groups.find(g=>g.name===existing?.groupName)?.id||groups[0]?.id,[a.dataset.collabOne]);}
  if(a.dataset.manageRecord){const r=collabRecords.find(x=>x.id===a.dataset.manageRecord);if(!r) return;return openCollab(r.groupId||groups.find(g=>g.name===r.groupName)?.id,[r.projectId],false,r.id);}
  if(a.dataset.shareProject)return openShare(a.dataset.shareProject);
  if(a.dataset.editMember){if(!canManage())return;const m=projectMemberList().find(x=>x.id===a.dataset.editMember);if(!m||m.role==='owner'||m.id==='support-1')return;modal={type:'edit',id:m.id,role:m.role};return showModal();}
  if(a.dataset.removeMember){if(!canManage())return;const m=projectMemberList().find(x=>x.id===a.dataset.removeMember);if(!m||m.role==='owner')return;modal={type:'remove',id:m.id};return showModal();}
});
document.querySelector('.sidebar').addEventListener('click',e=>{const menu=e.target.closest('[data-project-menu]');if(menu){projectMenuOpen=!projectMenuOpen;document.getElementById('projectSubnav').hidden=!projectMenuOpen;menu.setAttribute('aria-expanded',String(projectMenuOpen));return;}const a=e.target.closest('[data-nav],.brand');if(a){e.preventDefault();navigate(a.dataset.nav||'projects');}});
main.addEventListener('input',e=>{
  if(['projectSearch','memberSearch','groupSearch'].includes(e.target.id)){
    const id=e.target.id,pos=e.target.selectionStart;search=e.target.value;render();const next=document.getElementById(id);next.focus();try{next.setSelectionRange(pos,pos);}catch{}
  }
});
main.addEventListener('change',e=>{
  if(e.target.dataset.selectFile){const id=e.target.dataset.selectFile;selectedFileIds=e.target.checked?[...new Set([...selectedFileIds,id])]:selectedFileIds.filter(x=>x!==id);return render();}
  if(e.target.hasAttribute('data-select-all-files')){selectedFileIds=e.target.checked?currentProjectFiles().map(f=>f.id):[];return render();}
  if(e.target.dataset.selectProject){const id=e.target.dataset.selectProject;selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,id])]:selectedProjectIds.filter(x=>x!==id);return render();}
  if(e.target.hasAttribute('data-select-all-projects')){const ids=filteredProjects().map(p=>p.id);selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,...ids])]:selectedProjectIds.filter(id=>!ids.includes(id));return render();}
  if(e.target.id==='categoryFilter'){categoryFilter=e.target.value;return render();}
  if(e.target.id==='visitorDownload'&&canManage()){project().visitorDownload=e.target.checked;saveAll();render();notify('访问者下载权限已更新');}
});
document.getElementById('identitySelect').addEventListener('change',e=>{identity=e.target.value;render();notify(`已切换至${roleNames[identity]}视角`);});
modalRoot.addEventListener('click',e=>{
  if(e.target===modalRoot||e.target.closest('[data-close]')) return dismissModal();
  const a=e.target.closest('button');if(!a||a.disabled||!modal) return;
  if(a.hasAttribute('data-result-to-data')){closeModal();tab='data';return render();}
  if(!canManage())return closeModal();
  if(a.hasAttribute('data-confirm-folder'))return confirmFolder();
  if(a.hasAttribute('data-confirm-file-remove'))return removeProjectFiles();
  if(a.hasAttribute('data-add-share-user')){e.preventDefault();return addShareUser();}
  if(a.dataset.removeShareUser&&modal.type==='share'){modal.selectedUserIds=modal.selectedUserIds.filter(id=>id!==a.dataset.removeShareUser);modal.error='';return showShareModal();}
  if(a.hasAttribute('data-save-share'))return saveShare();
  if(a.hasAttribute('data-open-share-cancel')&&modal.type==='share')return openCancelShare(modal.projectId,modal);
  if(a.hasAttribute('data-keep-share')&&modal.type==='share-cancel'){if(modal.previous){modal=modal.previous;return showShareModal();}return closeModal();}
  if(a.hasAttribute('data-confirm-share-cancel'))return cancelShare();
  if(a.hasAttribute('data-directory-add-confirm'))return confirmDirectoryAdd();
  if(a.hasAttribute('data-confirm-directory-remove'))return confirmDirectoryRemove();
  if(a.hasAttribute('data-create-group-confirm'))return confirmGroupCreate();
  if(a.hasAttribute('data-new-collab-group')&&modal.type==='collab'&&!modal.recordId)return openGroupCreate(modal);
  if(a.hasAttribute('data-new-group-person')&&modal.type==='group-create')return openDirectoryAdd(modal);
  if(a.hasAttribute('data-toggle-group-picker')){modal.pickerOpen=!modal.pickerOpen;return drawGroupPicker();}
  if(a.hasAttribute('data-add-support')){if(!modal.members.some(m=>m.id==='support-1'))modal.members.push({id:'support-1',role:'admin'});modal.memberError='';return drawGroupPicker();}
  if(a.dataset.removeGroupMember){modal.members=modal.members.filter(m=>m.id!==a.dataset.removeGroupMember);drawGroupPicker();return document.getElementById('groupMemberSearch').focus({preventScroll:true});}
  if(a.hasAttribute('data-select-all-collab-members')){collabMembers(modal).forEach(m=>changeCollabMember(m.id,true));return showCollabModal();}
  if(a.hasAttribute('data-clear-collab-members')){collabMembers(modal).forEach(m=>changeCollabMember(m.id,false));return showCollabModal();}
  if(a.dataset.removeCollabMember){changeCollabMember(a.dataset.removeCollabMember,false);return showCollabModal();}
  if(a.dataset.restoreCollabMember){changeCollabMember(a.dataset.restoreCollabMember,true);return showCollabModal();}
  if(a.hasAttribute('data-confirm-collab'))return confirmCollab();
  if(a.hasAttribute('data-verify'))return verify();
  if(a.hasAttribute('data-back-verify')){modal.step='verify';return showModal();}
  if(a.hasAttribute('data-confirm-add')&&modal.type==='add'&&modal.step==='role'){
    const container=modal.target==='group'?group(modal.groupId).members:projectMemberList();
    if(container.some(m=>m.id===modal.user.id))return notify('该成员已在当前名单中');
    const role=modal.user.id==='support-1'?'admin':modalRoot.querySelector('input[name=role]:checked')?.value||'member';
    if(!directory.some(d=>d.id===modal.user.id))directory.push({...modal.user});
    container.push({id:modal.user.id,role});
    if(modal.target==='project'&&activeCollabRecord()&&!project().members.some(m=>m.id===modal.user.id))project().members.push({id:modal.user.id,role});
    saveAll();closeModal();render();return notify('成员添加成功');
  }
  if(a.hasAttribute('data-save-role')&&modal.type==='edit'){
    const m=projectMemberList().find(x=>x.id===modal.id);if(!m||m.role==='owner'||m.id==='support-1')return closeModal();
    m.role=modalRoot.querySelector('input[name=role]:checked')?.value||m.role;if(!activeCollabRecord())syncRecords(project().id);saveAll();closeModal();render();return notify('成员角色已更新');
  }
  if(a.hasAttribute('data-confirm-remove')&&modal.type==='remove'){
    const m=projectMemberList().find(x=>x.id===modal.id);if(!m||m.role==='owner')return closeModal();
    const record=activeCollabRecord();if(record)record.members=record.members.filter(x=>x.id!==modal.id);else{project().members=project().members.filter(x=>x.id!==modal.id);syncRecords(project().id);}saveAll();closeModal();render();return notify(record?'成员已从本条协作记录中移除':'成员已从项目中移除');
  }
});
modalRoot.addEventListener('submit',e=>{e.preventDefault();if(!canManage())return;if(e.target.id==='folderForm')confirmFolder();else if(e.target.id==='shareForm')addShareUser();else if(e.target.id==='verifyForm')verify();else if(e.target.id==='groupForm')confirmGroupCreate();});
modalRoot.addEventListener('input',e=>{
  if(!modal)return;
  e.target.closest('.field')?.classList.remove('invalid');
  if(e.target.id==='shareAccount'){modal.account=e.target.value;modal.error='';e.target.setAttribute('aria-invalid','false');e.target.closest('.share-account-control').classList.remove('invalid');document.getElementById('shareAccountError').hidden=true;drawShareAccountLookup();}
  if(e.target.id==='folderName')modal.name=e.target.value;
  if(e.target.dataset.accountKey)return updateAccountLookup(e.target.dataset.accountKey,e.target.value);
  if(e.target.id==='groupName'){modal.name=e.target.value;modal.error='';}
  if(e.target.id==='groupMemberSearch'){modal.memberQuery=e.target.value;modal.pickerOpen=true;drawGroupPicker();}
});
modalRoot.addEventListener('focusin',e=>{if(modal?.type==='group-create'&&e.target.id==='groupMemberSearch'){modal.pickerOpen=true;drawGroupPicker();}});
modalRoot.addEventListener('change',e=>{
  if(!modal)return;
  if(e.target.dataset.pickGroupMember){const id=e.target.dataset.pickGroupMember;if(resolvePlatformAccount(person(id).account,'account').user?.id!==id)return notify('该账户无法唯一匹配，请重新核对');if(e.target.checked){if(!modal.members.some(m=>m.id===id))modal.members.push({id,role:id==='support-1'?'admin':'member'});}else modal.members=modal.members.filter(m=>m.id!==id);modal.memberError='';drawGroupPicker();modalRoot.querySelector(`[data-pick-group-member="${id}"]`)?.focus({preventScroll:true});return;}
  if(e.target.dataset.collabGroup){modal.selectedGroupIds=[e.target.dataset.collabGroup];modal.removedMemberIds=[];modal.selectionTouched=false;refreshCollabSelection();return showCollabModal();}
  if(e.target.dataset.collabMember){const id=e.target.dataset.collabMember;changeCollabMember(id,e.target.checked);showCollabModal();modalRoot.querySelector(`[data-collab-member="${id}"]`)?.focus({preventScroll:true});return;}
  if(e.target.dataset.collabProject){const id=e.target.dataset.collabProject;modal.selectedProjectIds=e.target.checked?[...new Set([...modal.selectedProjectIds,id])]:modal.selectedProjectIds.filter(x=>x!==id);refreshCollabSelection(true);return showCollabModal();}
  if(e.target.dataset.groupRole){const m=modal.members.find(x=>x.id===e.target.dataset.groupRole);if(m&&m.id!=='support-1')m.role=e.target.value;}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!modalRoot.hidden){if(!confirmRoot.hidden){closeConfirmation();document.getElementById('account')?.focus();}else dismissModal();}
  if(e.key==='Tab'&&!modalRoot.hidden){const els=[...modalRoot.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].filter(el=>el.offsetParent!==null);const first=els[0],last=els.at(-1);if(!first)return;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)&&e.target.getAttribute('role')==='tab'){
    e.preventDefault();const buttons=[...main.querySelectorAll('[role=tab]')],i=buttons.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();main.querySelectorAll('[role=tab]')[next].focus();
  }
});
render();
