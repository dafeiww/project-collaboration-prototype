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
let projects, groups, collabRecords=[];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (!saved || !Array.isArray(saved.projects) || !Array.isArray(saved.groups)) throw new Error('invalid');
  projects = saved.projects; groups = saved.groups; collabRecords=Array.isArray(saved.collabRecords)?saved.collabRecords:[];
} catch {
  projects = structuredClone(initialProjects);
  groups = structuredClone(initialGroups);
}
for (const p of projects) for (const m of p.members || []) if (m.id === 'support-1') m.role = 'admin';
for (const g of groups) for (const m of g.members || []) if (m.id === 'support-1') m.role = 'admin';

let page = 'groups', activeProjectId = 'analysis', activeGroupId = groups[0]?.id || null, tab = 'members', listTab = 'mine', identity = 'owner', search = '', selectedProjectIds = [], modal = null, toastTimer, confirmationTimer;
const main = document.getElementById('main'), modalRoot = document.getElementById('modalRoot'), confirmRoot = document.getElementById('confirmRoot');

function saveAll() { try { localStorage.setItem(storageKey, JSON.stringify({ projects, groups, collabRecords })); } catch {} }
function project() { return projects.find(p => p.id === activeProjectId) || projects[0]; }
function group(id) { return groups.find(g => g.id === id) || groups[0]; }
function person(id) { return directory.find(d => d.id === id) || { name: '未知用户', phone: '', account: '' }; }
function safe(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function canManage() { return identity === 'owner' || identity === 'admin'; }
function notify(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800); }
function heroHeading(title, subtitle) { return `<div class="page-heading"><div><div class="eyebrow">PROJECT WORKSPACE</div><h1>${title}</h1><p>${subtitle}</p></div></div>`; }
function avatar(name, index = 0) { const palettes = ['','lavender','sand','blue','coral']; return `<span class="avatar ${palettes[index % palettes.length]}">${safe(name.slice(0, 1))}</span>`; }
function supportChip(m) { return m.id === 'support-1' ? '<span class="support-tag">默认管理员</span>' : ''; }
function memberRoster(members, max = 8) {
  if (!members.length) return '<span class="roster-empty">暂无成员</span>';
  return `<div class="roster">${members.slice(0, max).map((m,i)=>`<span class="roster-item">${avatar(person(m.id).name,i)}<span>${safe(person(m.id).name)}</span>${supportChip(m)}<i class="role-dot ${m.role}"></i></span>`).join('')}${members.length>max?`<span class="more-count">+${members.length-max}</span>`:''}</div>`;
}

function renderGroups() {
  const q=search.trim();
  const list = groups.filter(g=>`${g.name}${g.members.map(m=>person(m.id).name).join('')}`.toLowerCase().includes(q.toLowerCase()));
  return `<div class="page" data-screen-label="课题组列表">${heroHeading('课题组列表', '按课题组维护成员名单，再把成员批量协作到项目。')}
    <div class="intro-strip group-intro"><div class="intro-icon">${icon('people')}</div><div><h2>课题组是成员协作的组织单元</h2><p>创建课题组后可直接添加技术支持，技术支持默认为管理员角色。</p></div><button class="btn primary" data-create-group>${icon('plus')}添加课题组</button></div>
    <div class="toolbar"><label class="search-wrap">${icon('search')}<input id="groupSearch" type="search" placeholder="搜索课题组或成员姓名" aria-label="搜索课题组" value="${safe(search)}"></label><span class="small-count">共 ${list.length} 个课题组</span></div>
    <div class="table-shell group-table"><div class="table-scroll"><table><thead><tr><th>课题组名字</th><th>成员名单</th><th>操作</th></tr></thead><tbody>
      ${list.map(g=>`<tr><td><div class="group-cell"><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员</small></div></td><td>${memberRoster(g.members)}</td><td><div class="table-actions group-actions"><button class="btn primary small" data-open-collab="${g.id}">${icon('link')}协作项目</button><button class="btn small" data-group-add="${g.id}">添加成员</button></div></td></tr>`).join('') || '<tr><td colspan="3" class="empty-cell">暂无课题组，点击右上角“添加课题组”。</td></tr>'}
    </tbody></table></div></div>
    <p class="list-foot">技术支持加入课题组时固定为管理员；示例数据仅用于交互演示。</p></div>`;
}

function renderMemberDirectory() {
  const q=search.trim().toLowerCase();
  const list=directory.filter(d=>`${d.name}${d.account}${d.phone}`.toLowerCase().includes(q));
  return `<div class="page" data-screen-label="成员列表">${heroHeading('成员列表', '查看云平台账号与成员所在的课题组。')}
    <div class="toolbar"><label class="search-wrap">${icon('search')}<input id="memberSearch" type="search" placeholder="搜索姓名、账号或手机号" aria-label="搜索成员" value="${safe(search)}"></label><div class="toolbar-right"><span class="small-count">共 ${list.length} 位成员</span><button class="btn primary" data-add-directory>${icon('plus')}添加人员</button></div></div>
    <div class="table-shell"><div class="table-scroll"><table><thead><tr><th>成员</th><th>云平台账号</th><th>所在课题组</th></tr></thead><tbody>
      ${list.map((d,i)=>{ const gs=groups.filter(g=>g.members.some(m=>m.id===d.id));
        return `<tr><td><div class="member-cell">${avatar(d.name,i)}<div><div class="member-name">${safe(d.name)}${d.id==='support-1'?'<span class="support-tag">默认管理员</span>':''}</div><div class="member-note">${safe(d.phone.slice(0,3))}****${safe(d.phone.slice(-4))}</div></div></div></td><td>${safe(d.account)}</td><td>${gs.map(g=>`<span class="group-chip">${safe(g.name)}</span>`).join('')||'<span class="fixed">未加入课题组</span>'}</td></tr>`}).join('')}
    </tbody></table></div></div></div>`;
}

function renderProjects() {
  const q=search.trim().toLowerCase();
  const tabs=[['mine','派森诺项目'],['shared','共享项目'],['collab','协作项目']];
  let list=[];
  let tableType=listTab;
  if(listTab==='mine'){
    list=projects.filter(p=>`${p.name}${p.code}${p.category}${p.ticket}${p.contract}`.toLowerCase().includes(q));
  } else if(listTab==='shared'){
    list=projects.filter(p=>p.shared && `${p.name}${p.code}${p.category}`.toLowerCase().includes(q));
  } else {
    list=collabRecords.filter(r=>`${r.projectName}${r.code}${r.groupName}${(r.members||[]).map(m=>person(m.id).name).join('')}`.toLowerCase().includes(q));
  }
  const selectedCount=projects.filter(p=>selectedProjectIds.includes(p.id)).length;
  const cols=tableType==='mine'?9:tableType==='shared'?8:5;
  const head=`<tr><th class="check-cell">${tableType==='mine'?'<input type="checkbox" data-select-all-projects aria-label="全选项目">':''}</th><th>${tableType==='collab'?'协作项目':'开题单号'}</th><th>${tableType==='collab'?'课题组':'合同编号'}</th><th>${tableType==='collab'?'协作成员':'云平台项目编号'}</th><th>${tableType==='collab'?'协作时间':'项目名称'}</th>${tableType!=='collab'?'<th>所属类别</th><th>创建时间</th><th>状态</th>':''}${tableType==='mine'?'<th>操作</th>':''}</tr>`;
  const rows=list.map(item=>{
    if(tableType==='collab'){
      const r=item;
      return `<tr><td class="check-cell"></td><td><strong>${safe(r.projectName)}</strong><small class="member-note">${safe(r.code)}</small></td><td>${safe(r.groupName)}</td><td>${memberRoster(r.members||[])}</td><td>${safe(r.createdAt)}</td></tr>`;
    }
    const p=item; const visible=p.members.filter(m=>m.role!=='owner');
    return `<tr><td class="check-cell">${tableType==='mine'?`<input type="checkbox" data-select-project="${p.id}" ${selectedProjectIds.includes(p.id)?'checked':''} aria-label="选择 ${safe(p.name)}">`:''}</td><td><span class="ticket">${safe(p.ticket)}</span></td><td>${safe(p.contract)}</td><td><span class="project-code">${safe(p.code)}</span><span class="demo-chip">DEMO</span></td><td><strong>${safe(p.name)}</strong>${visible.length?`<small class="member-note">协作成员 ${visible.length} 人</small>`:''}</td>${tableType!=='collab'?`<td>${safe(p.category)}</td><td>${safe(p.created)}</td><td><span class="status-chip">${safe(p.status)}</span></td>`:''}${tableType==='mine'?`<td><div class="table-actions"><button class="btn primary small" data-collab-one="${p.id}">${icon('link')}协作项目</button><button class="btn quiet small" data-open-project="${p.id}">详情</button></div></td>`:''}</tr>`;
  }).join('');
  return `<div class="page" data-screen-label="云分析项目列表">
    <div class="page-heading"><div><div class="eyebrow">PROJECT WORKSPACE</div><h1>云分析</h1><p>按项目查看云分析任务，支持单选或多选后批量协作。</p></div></div>
    <div class="list-tabs">${tabs.map(([key,label])=>`<button class="${listTab===key?'active':''}" data-list-tab="${key}">${label}</button>`).join('')}</div>
    <div class="list-toolbar">
      <label class="search-wrap">${icon('search')}<input id="projectSearch" type="search" placeholder="搜索项目名称或编号" aria-label="搜索项目" value="${safe(search)}"></label>
      ${tableType==='mine'?`<div class="toolbar-right"><span class="small-count">已选 ${selectedCount} 个项目</span><button class="btn primary" data-collab-selected>${icon('link')}协作项目</button></div>`:''}
    </div>
    <div class="table-shell project-table"><div class="table-scroll"><table><thead>${head}</thead><tbody>${rows || `<tr><td colspan="${cols}" class="empty-cell">${tableType==='collab'?'暂无协作记录。':'暂无项目。'}</td></tr>`}</tbody></table></div></div>
    <p class="list-foot">${tableType==='collab'?'协作记录由「派森诺项目」勾选后生成。':'示例项目与账号仅用于演示，不代表真实平台数据。'}</p></div>`;
}
function renderMemberRow(member, index) {
  const user = person(member.id);
  return `<tr><td><div class="member-cell">${avatar(user.name,index)}<div><div class="member-name">${safe(user.name)}</div>${member.id==='support-1'?'<div class="member-note">固定管理员 · 可移除</div>':member.initial?'<div class="member-note">默认加入 · 可移除</div>':''}</div></div></td><td><span class="role-pill ${member.role}">${icon(roleIcons[member.role] || roleIcons.member)}${roleNames[member.role] || '成员'}</span></td><td>${canManage()?`<div class="table-actions"><button class="btn quiet small" data-edit-member="${safe(member.id)}" ${member.id==='support-1'?'disabled aria-label="技术支持的角色不可调整" title="技术支持固定为管理员"':''}>调整角色</button><button class="btn quiet small" data-remove-member="${safe(member.id)}">移除</button></div>`:'<span class="fixed">无管理权限</span>'}</td></tr>`;
}
function renderMembers(p) {
  const list = p.members.filter(m => m.role !== 'owner' && `${person(m.id).name}${roleNames[m.role]}`.includes(search));
  return `<section class="content-panel member-only" data-screen-label="项目成员管理"><div class="section-header"><h2>成员管理</h2><div class="section-actions">${canManage()?`<button class="btn primary" data-add>${icon('plus')}添加成员</button>`:''}</div></div>
    <div class="toolbar"><label class="search-wrap">${icon('search')}<input id="memberSearch" type="search" placeholder="搜索成员姓名" aria-label="搜索成员" value="${safe(search)}"></label><span class="small-count">共 ${list.length} 位成员</span></div>
    <div class="table-shell"><div class="table-scroll"><table><thead><tr><th>成员</th><th>角色</th><th>操作</th></tr></thead><tbody>${list.map(renderMemberRow).join('') || '<tr><td colspan="3" style="text-align:center;color:#8298a7;padding:40px">暂无成员</td></tr>'}</tbody></table></div></div></section>`;
}
function renderDetail() { return `<div class="screenshot-stage" data-screen-label="分析详情 · 项目成员管理"><img src="分析详情-参考截图.png" alt="分析详情页面"><div class="screenshot-collaboration"><div class="reference-tabs"><button data-nav="reference">项目数据</button><button class="selected" aria-current="page">项目协作</button></div>${renderMembers(project())}</div></div>`; }
function renderReference() { return `<div class="screenshot-stage" data-screen-label="分析详情 · 原截图新增项目协作入口"><img src="分析详情-参考截图.png" alt="原始分析详情页面，项目数据区域上方新增项目协作入口"><button class="screenshot-entry" data-enter-collab>项目协作<span class="entry-line"></span></button></div>`; }

function render() {
  document.body.classList.toggle('reference-mode', page==='reference'||page==='detail');
  main.innerHTML = page==='groups'?renderGroups():page==='members'?renderMemberDirectory():page==='reference'?renderReference():page==='detail'?renderDetail():renderProjects();
  document.getElementById('crumb').innerHTML = page==='groups' ? '项目管理 <span>/</span> 课题组列表' : page==='members' ? '项目管理 <span>/</span> 成员列表' : page==='detail' ? `项目管理 <span>/</span> ${safe(project().type)} <span>/</span> 项目协作` : '项目管理 <span>/</span> 云分析';
  document.querySelectorAll('[data-nav]').forEach(n=>n.classList.toggle('active',n.dataset.nav===page));
}
function modalFrame(title, subtitle, body, footer, wide=false) {
  modalRoot.hidden=false;
  modalRoot.innerHTML=`<div class="modal ${wide?'modal-wide':''}" role="dialog" aria-modal="true" aria-label="${safe(title)}"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-close aria-label="关闭">×</button></div><div class="modal-body">${body}</div><div class="modal-foot">${footer}</div></div>`;
}
function closeConfirmation() {
  clearTimeout(confirmationTimer); confirmRoot.hidden=true; confirmRoot.textContent=''; modalRoot.inert=false; if(modal) modal.pendingUser=null;
}
function closeModal() { closeConfirmation(); modal=null; modalRoot.hidden=true; modalRoot.innerHTML=''; }
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
function openGroupCreate() { modal={type:'group-create',name:'',members:[],error:''}; showModal(); }
function openDirectoryAdd(){ if(!canManage()) return notify('当前角色不能添加人员'); modal={type:'directory-add',name:'',account:'',phone:'',error:''}; showModal(); }
function showDirectoryAddModal(){
  modalFrame('添加人员','录入云平台成员的基础信息，用于后续课题组协作。',
    `<form id="directoryForm" novalidate>
      <label class="field ${modal.error?'invalid':''}" id="directoryNameField"><span class="field-label">姓名</span><input id="directoryName" type="text" maxlength="24" placeholder="请输入姓名" value="${safe(modal.name)}"><span class="field-error">${safe(modal.error||'请输入姓名')}</span></label>
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
  if(directory.some(d=>d.account.toLowerCase()===account.toLowerCase())){ modal.error='云平台账号已存在'; showDirectoryAddModal(); return; }
  if(directory.some(d=>d.phone===phone)){ modal.error='手机号已存在'; showDirectoryAddModal(); return; }
  directory.push({id:'user-'+Date.now(),name,account,phone});
  closeModal(); render(); notify('人员已添加');
}
function openCollab(groupId=groups[0]?.id, projectIds=[]) { const ids=(projectIds&&projectIds.length)?projectIds:[activeProjectId]; modal={type:'collab',selectedGroupIds:[groupId].filter(Boolean),selectedMemberIds:[],selectedProjectIds:[...new Set(ids)]}; showModal(); }
function drawPhoneLookup(render=true) {
  if(!modalRoot.querySelector('#phone')) return;
  const phone=modalRoot.querySelector('#phone').value.trim();
  const user=directory.find(u=>u.phone===phone);
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
  const seen=new Set(), out=[];
  state.selectedProjectIds.forEach(pid=>{
    const p=projects.find(x=>x.id===pid);
    (p?.members||[]).forEach(m=>{
      if(!seen.has(m.id)){seen.add(m.id); out.push({...m});}
    });
  });
  return out;
}
function showCollabModal() {
  const members=collabMembers(modal);
  const currentMembers=collabProjectMembers(modal);
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  const body=`${selectedProjects.length?`<div class="collab-context">本次协作目标：已选 <b>${selectedProjects.length}</b> 个项目</div>`:''}
    <div class="picker-layout"><section class="picker-block"><h3>1 · 选择课题组（单选）</h3><div class="check-list">${groups.map(g=>`<label class="check-item"><input type="radio" name="collabGroup" data-collab-group="${g.id}" ${modal.selectedGroupIds[0]===g.id?'checked':''}><span class="check-main"><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员</small></span></label>`).join('')}</div></section>
    <section class="picker-block"><h3>2 · 新增成员</h3><div class="picker-tools"><span>${modal.selectedMemberIds.length}/${members.length} 位成员</span><button type="button" class="btn quiet small" data-select-all-collab-members>全选</button><button type="button" class="btn quiet small" data-clear-collab-members>清空</button></div><div class="check-list member-list">${members.map(m=>`<label class="check-item"><input type="checkbox" data-collab-member="${m.id}" ${modal.selectedMemberIds.includes(m.id)?'checked':''}><span class="check-main"><strong>${safe(person(m.id).name)}</strong><small>${safe(person(m.id).account)} · ${roleNames[m.role]}</small></span>${m.id==='support-1'?'<span class="support-tag">管理员</span>':''}</label>`).join('')||'<div class="picker-empty">请先选择课题组</div>'}</div></section></div>
    <section class="picker-block current-members"><h3>3 · 当前项目成员</h3><div class="picker-tools"><span>${currentMembers.length} 位成员</span><span class="picker-note">项目所有者不可移除</span></div><div class="check-list member-list">${currentMembers.map(m=>`<div class="check-item"><span class="check-main"><strong>${safe(person(m.id).name)}</strong><small>${safe(person(m.id).account)} · ${roleNames[m.role]}</small></span>${m.id==='support-1'?'<span class="support-tag">管理员</span>':''}${m.role==='owner'?'<span class="owner-tag">项目所有者</span>':`<button type="button" class="btn quiet small danger" data-remove-collab-member="${m.id}">移除</button>`}</div>`).join('')||'<div class="picker-empty">暂无成员</div>'}</div></section>`;
  modalFrame('协作项目','可从课题组新增成员，也可移除当前项目成员。',body,`<button class="btn" data-close>取消</button><button class="btn primary" data-confirm-collab>保存变更</button>`,true);
}
function showModal() {
  if(!modal) return;
  if(modal.type==='group-create') return showGroupCreateModal();
  if(modal.type==='directory-add') return showDirectoryAddModal();
  if(modal.type==='collab') return showCollabModal();
  if(modal.type==='add' && modal.step==='verify') {
    const title=modal.target==='group'?'添加课题组成员':'添加项目成员';
    modalFrame(title,safe(accountCopy.subtitle),
      `<form id="verifyForm" novalidate><label class="field" id="phoneField"><span class="field-label">注册手机号</span><input id="phone" type="tel" inputmode="numeric" autocomplete="off" maxlength="11" placeholder="请输入 11 位手机号" value="${safe(modal.phone||'')}"><span class="field-error">请输入有效的 11 位中国大陆手机号</span></label><label class="field" id="accountField"><span class="field-label">云平台账号 <span class="autofill-tag">自动匹配</span></span><input id="account" type="text" autocomplete="off" maxlength="40" placeholder="输入手机号后自动显示" value="${safe(modal.account||'')}"><span class="field-error">请输入云平台账号</span></label><div id="phoneLookup" aria-live="polite"></div>${modal.error?`<div class="inline-error">${safe(modal.error)}</div>`:''}<p class="demo-example">演示手机号：13800000005，自动匹配账号 xia.laoshi</p></form>`,
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
  groups.push({id,name:modal.name,members:structuredClone(modal.members)});
  saveAll(); activeGroupId=id; closeModal(); render(); notify('课题组已创建');
}
function confirmCollab() {
  const members=collabMembers(modal).filter(m=>modal.selectedMemberIds.includes(m.id));
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  if(!members.length) return notify('请至少选择一位成员');
  if(!selectedProjects.length) return notify('请至少选择一个项目');
  const groupName=group(modal.selectedGroupIds[0])?.name||'';
  const createdAt=new Date().toLocaleString('zh-CN',{hour12:false});
  selectedProjects.forEach(p=>{
    members.forEach(m=>{
      const role=m.id==='support-1'?'admin':m.role;
      const existing=p.members.find(x=>x.id===m.id);
      if(!existing) p.members.push({id:m.id,role});
      else if(m.id==='support-1') existing.role='admin';
    });
    collabRecords.push({
      id:'record-'+Date.now()+'-'+p.id,
      projectId:p.id, projectName:p.name, code:p.code,
      groupName, members:structuredClone(members), createdAt, status:'协作中'
    });
  });
  saveAll(); closeModal(); listTab='collab'; selectedProjectIds=[]; render(); notify(`已新增 ${selectedProjects.length} 条协作记录`);
}

main.addEventListener('click', e => {
  const action=e.target.closest('[data-enter-collab],[data-open-project],[data-tab],[data-add],[data-edit-member],[data-remove-member],[data-nav],[data-create-group],[data-group-add],[data-open-collab],[data-list-tab],[data-collab-selected],[data-collab-one]');
  if(!action) return;
  if(action.hasAttribute('data-enter-collab')){activeProjectId='analysis';page='detail';tab='members';search='';}
  else if(action.dataset.openProject){activeProjectId=action.dataset.openProject;page='detail';tab='members';search='';}
  else if(action.dataset.tab){tab=action.dataset.tab;search='';}
  else if(action.dataset.nav){page=action.dataset.nav;search='';}
  else if(action.hasAttribute('data-add')) return openAdd('project');
  else if(action.hasAttribute('data-create-group')) return openGroupCreate();
  else if(action.dataset.groupAdd) return openAdd('group',action.dataset.groupAdd);
  else if(action.hasAttribute('data-add-directory')) return openDirectoryAdd();
  else if(action.dataset.addSupportGroup){
    const g=group(action.dataset.addSupportGroup);
    if(!g) return;
    if(g.members.some(m=>m.id==='support-1')){notify('该课题组已有技术支持');return;}
    g.members.push({id:'support-1',role:'admin',initial:true});
    saveAll(); render(); notify('技术支持已加入课题组'); return;
  }
  else if(action.dataset.openCollab) return openCollab(action.dataset.openCollab);
  else if(action.dataset.listTab){listTab=action.dataset.listTab;search='';}
  else if(action.hasAttribute('data-collab-selected')){ if(!selectedProjectIds.length) return notify('请先选择至少一个项目'); return openCollab(groups[0]?.id, selectedProjectIds); }
  else if(action.dataset.collabOne) return openCollab(groups[0]?.id,[action.dataset.collabOne]);
  else if(action.dataset.editMember){if(!canManage())return;const member=project().members.find(m=>m.id===action.dataset.editMember);if(!member||member.role==='owner'||member.id==='support-1')return;modal={type:'edit',id:member.id,role:member.role};return showModal();}
  else if(action.dataset.removeMember){if(!canManage())return;const member=project().members.find(m=>m.id===action.dataset.removeMember);if(!member||member.role==='owner')return;modal={type:'remove',id:member.id};return showModal();}
  render();
});
document.querySelector('.sidebar').addEventListener('click',e=>{const a=e.target.closest('[data-nav]');if(a){page=a.dataset.nav;search='';render();}});
document.querySelector('.global-header').addEventListener('click',e=>{if(e.target.closest('[data-global-analysis]')){page='reference';search='';render();}else if(e.target.closest('[data-global-projects]')){page='projects';search='';render();}});
main.addEventListener('input',e=>{if(e.target.id==='projectSearch'||e.target.id==='memberSearch'||e.target.id==='groupSearch'){const field=e.target.id;const position=e.target.selectionStart;search=e.target.value;render();const next=document.getElementById(field);next.focus();try{next.setSelectionRange(position,position)}catch{}}});
main.addEventListener('change',e=>{
  if(e.target.dataset.selectProject){
    const id=e.target.dataset.selectProject;
    selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,id])]:selectedProjectIds.filter(x=>x!==id);
    render(); return;
  }
  if(e.target.hasAttribute('data-select-all-projects')){
    selectedProjectIds=e.target.checked?projects.map(p=>p.id):[];
    render(); return;
  }
  if(e.target.id==='visitorDownload'&&canManage()){project().visitorDownload=e.target.checked;saveAll();render();notify('访问者下载权限已更新（仅演示）')}
});
document.getElementById('identitySelect').addEventListener('change',e=>{identity=e.target.value;render();notify(`已切换至${roleNames[identity]}视角`)});

modalRoot.addEventListener('click',e=>{
  if(e.target===modalRoot||e.target.closest('[data-close]')) return closeModal();
  const a=e.target.closest('[data-add-support],[data-add-group-member],[data-remove-group-member],[data-select-all-collab-members],[data-clear-collab-members],[data-create-group-confirm],[data-directory-add-confirm],[data-confirm-collab],[data-verify],[data-back-verify],[data-confirm-add],[data-save-role],[data-confirm-remove]');
  if(!a||!modal) return;
  if(a.hasAttribute('data-add-support')){
    if(!modal.members.some(m=>m.id==='support-1')) modal.members.push({id:'support-1',role:'admin',initial:true});
    modal.name=document.getElementById('groupName').value.trim(); showGroupCreateModal(); return;
  }
  if(a.hasAttribute('data-add-group-member')){
    const id=document.getElementById('groupMemberSelect').value;
    if(!id) return;
    if(modal.members.some(m=>m.id===id)) return notify('该成员已加入');
    modal.members.push({id,role:id==='support-1'?'admin':'member'});
    modal.name=document.getElementById('groupName').value.trim(); showGroupCreateModal(); return;
  }
  if(a.dataset.removeGroupMember){
    modal.members=modal.members.filter(m=>m.id!==a.dataset.removeGroupMember);
    modal.name=document.getElementById('groupName').value.trim(); showGroupCreateModal(); return;
  }
  if(a.hasAttribute('data-select-all-collab-members')){ modal.selectedMemberIds=collabMembers(modal).map(m=>m.id); showCollabModal(); return; }
  if(a.hasAttribute('data-clear-collab-members')){ modal.selectedMemberIds=[]; showCollabModal(); return; }
  if(a.hasAttribute('data-directory-add-confirm')) return confirmDirectoryAdd();
  if(a.hasAttribute('data-create-group-confirm')) return confirmGroupCreate();
  if(a.dataset.removeCollabMember){
    const id=a.dataset.removeCollabMember;
    const targets=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
    targets.forEach(p=>{p.members=p.members.filter(m=>!(m.id===id&&m.role!=='owner'));});
    saveAll(); showCollabModal(); notify('成员已移除（仅演示）'); return;
  }
  if(a.hasAttribute('data-confirm-collab')) return confirmCollab();
  if(a.hasAttribute('data-verify')) return verify();
  if(a.hasAttribute('data-back-verify')){modal.step='verify';return showModal();}
  if(!canManage()) return closeModal();
  if(a.hasAttribute('data-confirm-add')&&modal.type==='add'&&modal.step==='role'){
    const container = modal.target==='group' ? group(modal.groupId).members : project().members;
    if(container.some(m=>m.id===modal.user.id)) return notify('该用户已在当前列表中');
    const role=modal.user.id==='support-1'?'admin':modalRoot.querySelector('input[name=role]:checked')?.value||'member';
    container.push({id:modal.user.id,role}); saveAll(); closeModal(); render(); return notify('成员添加成功（仅演示）');
  }
  if(a.hasAttribute('data-save-role')&&modal.type==='edit'){
    const member=project().members.find(m=>m.id===modal.id);if(!member||member.role==='owner'||member.id==='support-1')return closeModal();
    member.role=modalRoot.querySelector('input[name=role]:checked')?.value||member.role;saveAll();closeModal();render();return notify('角色已更新（仅演示）');
  }
  if(a.hasAttribute('data-confirm-remove')&&modal.type==='remove'){
    const member=project().members.find(m=>m.id===modal.id);if(!member||member.role==='owner')return closeModal();
    project().members=project().members.filter(m=>m.id!==modal.id);saveAll();closeModal();render();notify('成员已移除（仅演示）');
  }
});
modalRoot.addEventListener('submit',e=>{
  if(e.target.id==='verifyForm'){e.preventDefault();verify()}
  if(e.target.id==='groupForm'){e.preventDefault();confirmGroupCreate()}
  if(e.target.id==='directoryForm'){e.preventDefault();confirmDirectoryAdd()}
});
modalRoot.addEventListener('input',e=>{
  if(e.target.id==='phone'||e.target.id==='account') {
    if(e.target.id==='phone') drawPhoneLookup();
    e.target.closest('.field')?.classList.remove('invalid');
    modal.error='';
    const err=modalRoot.querySelector('.modal-body > form > .inline-error');
    if(err)err.remove();
  }
  if(e.target.id==='groupName') modal.name=e.target.value.trim();
  if(e.target.id==='directoryName') modal.name=e.target.value.trim();
  if(e.target.id==='directoryAccount') modal.account=e.target.value.trim();
  if(e.target.id==='directoryPhone') modal.phone=e.target.value.trim();
});
modalRoot.addEventListener('change',e=>{
  if(e.target.dataset.collabGroup){
    const id=e.target.dataset.collabGroup;
    modal.selectedGroupIds=[id];
    modal.selectedMemberIds=[];
    showCollabModal(); return;
  }
  if(e.target.dataset.collabMember){
    const id=e.target.dataset.collabMember;
    modal.selectedMemberIds=e.target.checked?[...new Set([...modal.selectedMemberIds,id])]:modal.selectedMemberIds.filter(x=>x!==id);
    return;
  }
  if(e.target.dataset.collabProject){
    const id=e.target.dataset.collabProject;
    modal.selectedProjectIds=e.target.checked?[...new Set([...modal.selectedProjectIds,id])]:modal.selectedProjectIds.filter(x=>x!==id);
    return;
  }
  if(e.target.dataset.groupRole){
    const member=modal.members.find(m=>m.id===e.target.dataset.groupRole);
    if(member&&member.id!=='support-1') member.role=e.target.value;
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!confirmRoot.hidden){closeConfirmation();document.getElementById('account')?.focus();}else if(!modalRoot.hidden)closeModal();}});
render();
