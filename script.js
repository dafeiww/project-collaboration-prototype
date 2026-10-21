/* 本文件只运行交互演示；身份核验、授权与数据存储接入真实系统时必须由服务端实现。 */
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M16 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  pulse: '<path d="M2 12h5l3-7 4 14 3-7h5"/>',
  chart: '<path d="M4 20V4m0 16h16M8 15l4-4 3 2 5-7"/>'
};
function icon(name, cls = 'icon') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`; }
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon, 'icon'); });
const roleNames = { owner: '项目所有者', admin: '管理员', member: '成员', visitor: '访问者' };
const roleDescriptions = {
  owner: '确认管理归属，指定管理员，负责项目交接。',
  admin: '管理成员与权限，在授权范围内管理项目。',
  member: '开展分析，使用授权数据，分享成果。',
  visitor: '查看授权内容；下载权限单独设置。'
};
const directory = [
  { id: 'owner-1', name: '王老师', phone: '13800000000' },
  { id: 'support-1', name: '技术支持', phone: '13800000004' },
  { id: 'chen-1', name: '陈老师', phone: '13800000001' },
  { id: 'li-1', name: '小李', phone: '13800000002' },
  { id: 'zhou-1', name: '小周', phone: '13800000003' },
  { id: 'xia-1', name: '夏老师', phone: '13800000005' }
];
const initialProjects = [
  { id: 'analysis', name: '测试示例-定量蛋白组分析', code: 'PT202610201731FS5D', type: '云分析', members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'member', initial: true },
    { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'visitor' }
  ], visitorDownload: true },
  { id: 'visual', name: '多组学数据可视化项目', code: 'YT20261021008', type: '云图汇', members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'member', initial: true }, { id: 'chen-1', role: 'admin' }
  ], visitorDownload: true }
];
const storageKey = 'personalbio-project-collaboration-preview-v1';
let projects;
try { const saved = JSON.parse(localStorage.getItem(storageKey)); projects = Array.isArray(saved) && saved.length === initialProjects.length ? saved : structuredClone(initialProjects); }
catch { projects = structuredClone(initialProjects); }
let page = 'reference', activeProjectId = 'analysis', tab = 'members', identity = 'owner', search = '', modal = null, toastTimer;
const main = document.getElementById('main'), modalRoot = document.getElementById('modalRoot');
function save() { try { localStorage.setItem(storageKey, JSON.stringify(projects)); } catch {} }
function project() { return projects.find(p => p.id === activeProjectId) || projects[0]; }
function person(id) { return directory.find(d => d.id === id) || { name: '未知用户', phone: '' }; }
function safe(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function canManage() { return identity === 'owner' || identity === 'admin'; }
function notify(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800); }
function heroHeading(title, subtitle) { return `<div class="page-heading"><div><div class="eyebrow">PROJECT WORKSPACE</div><h1>${title}</h1><p>${subtitle}</p></div></div>`; }
function avatar(name, index = 0) { const palettes = ['','lavender','sand','blue','coral']; return `<span class="avatar ${palettes[index % palettes.length]}">${safe(name.slice(0, 1))}</span>`; }
function renderProjects() {
  const list = projects.filter(p => `${p.name}${p.code}${p.type}`.toLowerCase().includes(search.toLowerCase()));
  return `<div class="page" data-screen-label="项目列表">${heroHeading('项目列表', '项目的数据、分析与协作，在同一个空间有序进行。')}
    <div class="intro-strip"><div class="intro-icon">${icon('people')}</div><div><h2>项目协作，和团队一起推进分析</h2><p>邀请已注册云平台的成员，按项目授予角色；查看共享数据与成果无需交换账号。</p></div></div>
    <div class="toolbar"><label class="search-wrap">${icon('search')}<input id="projectSearch" type="search" placeholder="搜索项目名称或编号" aria-label="搜索项目" value="${safe(search)}"></label><span class="small-count">共 ${list.length} 个项目</span></div>
    <div class="project-list">${list.map((p,i) => { const visible=p.members.filter(m=>m.role!=='owner'); return `<article class="project-row"><div class="project-emblem ${i%2?'teal':''}">${icon(p.type === '云分析'?'pulse':'chart')}</div><div><div class="project-title">${safe(p.name)}</div><div class="project-id">项目编号 · ${safe(p.code)}</div></div><div class="project-fact">项目类型<strong>${safe(p.type)}</strong></div><div class="project-fact">协作成员<div class="tiny-avatars">${visible.slice(0,3).map(m=>`<span>${safe(person(m.id).name.slice(0,1))}</span>`).join('')}<b>${visible.length} 人</b></div></div><button class="btn" data-open-project="${p.id}">${icon('people')}项目协作</button></article>`; }).join('') || '<div class="empty">没有找到匹配的项目，请更换搜索词。</div>'}</div>
    <p class="list-foot">示例项目与账号仅用于演示，不代表真实平台数据。</p></div>`;
}
function renderMemberRow(member, index) {
  const user = person(member.id);
  return `<tr><td><div class="member-cell">${avatar(user.name,index)}<div><div class="member-name">${safe(user.name)}</div>${member.initial ? '<div class="member-note">默认加入 · 可移除</div>' : ''}</div></div></td><td><span class="role-pill ${member.role}">${roleNames[member.role] || '成员'}</span></td><td>${canManage()?`<div class="table-actions"><button class="btn quiet small" data-edit-member="${safe(member.id)}">调整角色</button><button class="btn quiet small" data-remove-member="${safe(member.id)}">移除</button></div>`:'<span class="fixed">无管理权限</span>'}</td></tr>`;
}
function renderMembers(p) {
  const list = p.members.filter(m => m.role !== 'owner' && `${person(m.id).name}${roleNames[m.role]}`.includes(search));
  return `<section class="content-panel member-only" data-screen-label="项目成员管理"><div class="section-header"><h2>成员管理</h2><div class="section-actions">${canManage()?`<button class="btn primary" data-add>${icon('plus')}添加成员</button>`:''}</div></div>
    <div class="toolbar"><label class="search-wrap">${icon('search')}<input id="memberSearch" type="search" placeholder="搜索成员姓名" aria-label="搜索成员" value="${safe(search)}"></label><span class="small-count">共 ${list.length} 位成员</span></div>
    <div class="table-shell"><div class="table-scroll"><table><thead><tr><th>成员</th><th>角色</th><th>操作</th></tr></thead><tbody>${list.map(renderMemberRow).join('') || '<tr><td colspan="3" style="text-align:center;color:#8298a7;padding:40px">暂无成员</td></tr>'}</tbody></table></div></div></section>`;
}
function roleCards() { return `<div class="role-overview">${Object.keys(roleNames).map((key,i)=>`<div class="role-card"><span class="role-index">ROLE 0${i+1}</span><h3>${roleNames[key]}</h3><p>${roleDescriptions[key]}</p></div>`).join('')}</div>`; }
function renderPermissions(p) {
  const items = [
    ['查看共享结果与数据',1,1,1,1], ['下载已授权数据',1,1,1,p.visitorDownload?1:0],
    ['发起分析及项目操作',1,1,1,0], ['邀请、移除成员或访问者',1,1,0,0],
    ['设置其他用户为管理员',1,1,0,0], ['调整项目所有者',1,0,0,0],
    ['编辑原始分析记录',0,0,0,0]
  ];
  return `<div class="content-panel" data-screen-label="项目角色与权限"><div class="section-header"><div><h2>四种角色，各司其职</h2><p class="section-sub">角色绑定具体项目，同一用户在不同项目可以承担不同角色。</p></div></div>${roleCards()}
    <h2 class="card-title">权限一览</h2><div class="table-shell"><div class="table-scroll"><table class="permissions"><thead><tr><th>可执行的操作</th><th>项目所有者</th><th>管理员</th><th>成员</th><th>访问者</th></tr></thead><tbody>${items.map(row=>`<tr><td>${row[0]}</td>${row.slice(1).map(v=>`<td><span class="${v?'permission-yes':'permission-no'}">${v?'可以':'不可'}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
    <label class="download-toggle"><input id="visitorDownload" type="checkbox" ${p.visitorDownload?'checked':''} ${canManage()?'':'disabled'}>允许访问者下载已授权的数据与共享成果 ${canManage()?'':'（仅所有者或管理员可修改）'}</label>
    <div class="decision-note"><strong>待产品确认：</strong>项目所有者交接、分析过程和成果的共享范围，需确定审核及留痕规则后再接入真实系统；当前原型不执行交接，也不开放原始记录编辑。</div></div>`;
}
function renderOverview(p) { return `<div class="content-panel"><div class="section-header"><div><h2>项目概览</h2><p class="section-sub">聚焦项目进度、协作成员与交付成果。</p></div></div><div class="overview-grid"><div class="overview-card"><small>项目状态</small><strong>进行中</strong><p>项目数据持续更新</p></div><div class="overview-card"><small>协作人数</small><strong>${p.members.length}</strong><p>包含项目所有者和技术支持（如未移除）</p></div><div class="overview-card"><small>项目类型</small><strong style="font-size:22px">${safe(p.type)}</strong><p>按项目配置权限</p></div></div><div class="overview-cta"><div><h2>邀请成员，共同完成分析</h2><p>从项目协作页添加成员、调整角色，或查看四类角色的权限范围。</p></div><button class="btn primary" data-tab="members">管理项目成员</button></div></div>`; }
function renderDetail() { return `<div class="screenshot-stage" data-screen-label="分析详情 · 项目成员管理"><img src="分析详情-参考截图.png" alt="分析详情页面"><div class="screenshot-collaboration"><div class="reference-tabs"><button data-nav="reference">项目数据</button><button class="selected" aria-current="page">项目协作</button></div>${renderMembers(project())}</div></div>`; }
function renderReference() { return `<div class="screenshot-stage" data-screen-label="分析详情 · 原截图新增项目协作入口"><img src="分析详情-参考截图.png" alt="原始分析详情页面，项目数据区域上方新增项目协作入口"><button class="screenshot-entry" data-enter-collab>项目协作<span class="entry-line"></span></button></div>`; }
function render() { document.body.classList.toggle('reference-mode',page==='reference'||page==='detail');main.innerHTML = page === 'reference'?renderReference():page === 'detail'?renderDetail():renderProjects(); document.getElementById('crumb').innerHTML = page === 'detail' ? `项目管理 <span>/</span> ${safe(project().type)} <span>/</span> 项目协作` : '项目管理 <span>/</span> 项目列表'; document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.nav==='projects')); }
function modalFrame(title, subtitle, body, footer) { modalRoot.hidden=false; modalRoot.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="${safe(title)}"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-close aria-label="关闭">×</button></div><div class="modal-body">${body}</div><div class="modal-foot">${footer}</div></div>`; }
function closeModal() { modal=null; modalRoot.hidden=true; modalRoot.innerHTML=''; }
function rolesRadio(selected='member') { return `<div class="role-choices">${['admin','member','visitor'].map(r=>`<label class="role-option"><input type="radio" name="role" value="${r}" ${selected===r?'checked':''}><span><strong>${roleNames[r]}</strong><small>${roleDescriptions[r]}</small></span></label>`).join('')}</div>`; }
function openAdd() { if(!canManage()) return notify('当前角色不能添加成员'); modal={type:'add',step:'verify',error:''}; showModal(); }
function showModal() {
  if(!modal) return;
  if(modal.type==='add' && modal.step==='verify') {
    modalFrame('添加项目成员','请填写对方在云平台注册时使用的信息',
      `<form id="verifyForm" novalidate><label class="field" id="phoneField"><span class="field-label">注册手机号</span><input id="phone" type="tel" inputmode="numeric" autocomplete="off" maxlength="11" placeholder="请输入 11 位手机号" value="${safe(modal.phone||'')}"><span class="field-error">请输入有效的 11 位中国大陆手机号</span></label><div id="phoneLookup" aria-live="polite"></div><label class="field" id="nameField"><span class="field-label">云平台用户名 <span class="autofill-tag">自动匹配</span></span><input id="username" type="text" autocomplete="off" maxlength="30" placeholder="输入手机号后自动匹配用户名" value="${safe(modal.name||'')}"><span class="field-error">请输入用户名</span></label>${modal.error?`<div class="inline-error">${safe(modal.error)}</div>`:''}<div class="verify-hint">演示可输入 13800000005 自动带出“夏老师”；其他未登记手机号会提示未注册。自动匹配只核对账号资料，不是短信验证码或真实身份认证。</div></form>`,
      '<button class="btn" data-close>取消</button><button class="btn primary" data-verify>核对云平台账号</button>');
    drawPhoneLookup(false);document.getElementById('phone').focus(); return;
  }
  if(modal.type==='add' && modal.step==='role') {
    const u=modal.user;
    modalFrame('确认成员与角色','账号核对通过，请为该用户选择项目角色',
      `<div class="verify-success">${avatar(u.name)}<div><strong>${safe(u.name)}</strong><span>手机号 ${safe(u.phone.slice(0,3))}****${safe(u.phone.slice(-4))} · 云平台用户</span></div><span class="checkmark">已核对</span></div><span class="field-label">项目角色</span>${rolesRadio('member')}`,
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
  const phone=document.getElementById('phone').value.trim(), name=document.getElementById('username').value.trim();
  modal.phone=phone; modal.name=name;
  document.getElementById('phoneField').classList.toggle('invalid',!/^1[3-9]\d{9}$/.test(phone));
  document.getElementById('nameField').classList.toggle('invalid',!name);
  if(!/^1[3-9]\d{9}$/.test(phone)||!name) return;
  const user=directory.find(u=>u.phone===phone);
  if(!user) modal.error='当前手机号对应的用户未注册云平台，请先完成云平台注册，再添加至项目。';
  else if(user.name!==name) modal.error='手机号与用户名不匹配，请核对该用户的云平台账号信息。';
  else if(project().members.some(m=>m.id===user.id)) modal.error='这位用户已在当前项目中，请在成员列表中调整角色。';
  else { modal.user=user; modal.step='role'; modal.error=''; }
  showModal();
}
function drawPhoneLookup(autoFill=true) {
  const input=document.getElementById('phone'), slot=document.getElementById('phoneLookup'), nameInput=document.getElementById('username');if(!input||!slot)return;
  const phone=input.value.trim();if(!/^1[3-9]\d{9}$/.test(phone)){slot.innerHTML='';if(nameInput&&nameInput.value===modal.autoName)nameInput.value='';modal.autoName='';return;}
  const user=directory.find(u=>u.phone===phone);
  if(nameInput&&autoFill){nameInput.value=user?user.name:'';modal.autoName=user?.name||'';}
  slot.innerHTML=user
    ? `<div class="account-preview">${avatar(user.name)}<div><strong>${safe(user.name)}</strong><small>已找到云平台账户 · 用户名已自动匹配</small></div><span>已注册</span></div>`
    : '<div class="inline-error">当前手机号对应的用户未注册云平台，请先完成注册后再添加。</div>';
}
main.addEventListener('click', e => {
  const action=e.target.closest('[data-enter-collab],[data-open-project],[data-tab],[data-add],[data-edit-member],[data-remove-member],[data-nav]'); if(!action) return;
  if(action.hasAttribute('data-enter-collab')){activeProjectId='analysis';page='detail';tab='members';search='';}
  else if(action.dataset.openProject){activeProjectId=action.dataset.openProject;page='detail';tab='members';search='';}
  else if(action.dataset.tab){tab=action.dataset.tab;search='';}
  else if(action.hasAttribute('data-add')) return openAdd();
  else if(action.dataset.editMember){if(!canManage())return;const member=project().members.find(m=>m.id===action.dataset.editMember);if(!member||member.role==='owner')return;modal={type:'edit',id:member.id,role:member.role};return showModal();}
  else if(action.dataset.removeMember){if(!canManage())return;const member=project().members.find(m=>m.id===action.dataset.removeMember);if(!member||member.role==='owner')return;modal={type:'remove',id:member.id};return showModal();}
  else if(action.dataset.nav){page=action.dataset.nav;search='';}
  render();
});
document.querySelector('.sidebar').addEventListener('click',e=>{const a=e.target.closest('[data-nav]');if(a){page='projects';search='';render();}});
document.querySelector('.global-header').addEventListener('click',e=>{if(e.target.closest('[data-global-analysis]')){page='reference';search='';render();}else if(e.target.closest('[data-global-projects]')){page='projects';search='';render();}});
main.addEventListener('input',e=>{if(e.target.id==='projectSearch'||e.target.id==='memberSearch'){const field=e.target.id;const position=e.target.selectionStart;search=e.target.value;render();const next=document.getElementById(field);next.focus();try{next.setSelectionRange(position,position)}catch{}}});
main.addEventListener('change',e=>{if(e.target.id==='visitorDownload'&&canManage()){project().visitorDownload=e.target.checked;save();render();notify('访问者下载权限已更新（仅演示）')}});
document.getElementById('identitySelect').addEventListener('change',e=>{identity=e.target.value;render();notify(`已切换至${roleNames[identity]}视角`)});
modalRoot.addEventListener('click',e=>{
  if(e.target===modalRoot||e.target.closest('[data-close]'))return closeModal();
  const a=e.target.closest('[data-verify],[data-back-verify],[data-confirm-add],[data-save-role],[data-confirm-remove]');if(!a||!modal)return;
  if(a.hasAttribute('data-verify'))return verify();
  if(a.hasAttribute('data-back-verify')){modal.step='verify';return showModal();}
  if(!canManage())return closeModal();
  if(a.hasAttribute('data-confirm-add')&&modal.type==='add'&&modal.step==='role'){
    if(project().members.some(m=>m.id===modal.user.id))return notify('该用户已在项目中');
    const role=modalRoot.querySelector('input[name=role]:checked')?.value||'member';project().members.push({id:modal.user.id,role});save();closeModal();render();return notify('成员添加成功（仅演示）');
  }
  if(a.hasAttribute('data-save-role')&&modal.type==='edit'){
    const member=project().members.find(m=>m.id===modal.id);if(!member||member.role==='owner')return closeModal();
    member.role=modalRoot.querySelector('input[name=role]:checked')?.value||member.role;save();closeModal();render();return notify('角色已更新（仅演示）');
  }
  if(a.hasAttribute('data-confirm-remove')&&modal.type==='remove'){
    const member=project().members.find(m=>m.id===modal.id);if(!member||member.role==='owner')return closeModal();
    project().members=project().members.filter(m=>m.id!==modal.id);save();closeModal();render();notify('成员已移除（仅演示）');
  }
});
modalRoot.addEventListener('submit',e=>{if(e.target.id==='verifyForm'){e.preventDefault();verify()}});
modalRoot.addEventListener('input',e=>{if(e.target.id==='phone'){drawPhoneLookup();const err=modalRoot.querySelector('.modal-body > .inline-error');if(err)err.remove()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modalRoot.hidden)closeModal()});
render();
