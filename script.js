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

const roleNames = { owner: '项目所有者', admin: '管理员', member: '成员' };
const memberRoles = ['admin','member'];
// 身份切换用于体验发起方与不同接收成员，并非真实登录鉴权。
const identityUsers = { owner:'owner-1', manager:'manager-1', support:'support-1', member:'li-1' };
const previewRoleNames={owner:'项目拥有者',manager:'管理者',support:'技术支持',member:'协作者'};
// 暂不开放取消、重新协作；保留历史记录与实现，后续可单独恢复入口。
const collaborationFeatures=Object.freeze({cancel:false,restart:false});
const previewParams=new URLSearchParams(location.search);
const previewRoleAliases={owner:'owner',manager:'manager',support:'support',member:'member',recipient:'member'};
let recipientUserId='li-1';
const roleIcons = { admin: 'shield', member: 'person' };
const roleDescriptions = {
  owner: '确认管理归属，指定管理员，负责项目交接。',
  admin: '管理成员与权限，在授权范围内管理项目。',
  member: '开展分析，使用授权数据，分享成果。'
};
// 服务人员只由具体项目的负责人员信息确定，不进入成员库或课题组。
const supportTypes = {technical:'技术支持',aftersales:'售后支持'};
const projectSupportPeople = [
  {id:'support-1',name:'张工',phone:'13800000004',account:'tech.support',supportType:'technical'},
  {id:'support-2',name:'李工',phone:'13800000014',account:'tech.li',supportType:'technical'},
  {id:'aftersales-1',name:'刘老师',phone:'13800000024',account:'service.liu',supportType:'aftersales'},
  {id:'aftersales-2',name:'周老师',phone:'13800000034',account:'service.zhou',supportType:'aftersales'}
];
const projectSupportAssignments = Object.fromEntries([
  ['support-1',['pending-collab-01','pending-collab-03','analysis','protein-mod-1','protein-mod-2','single-cell','small-rna','transcript-metab','diversity-metab','visual','meta-02','rna-02','protein-01','multi-01','lnc-01','chip-01','wes-01']],
  ['support-2',['pending-collab-04','rna-01','protein-02','small-rna-01','methy-01','gw-01']],
  ['aftersales-1',['pending-collab-02','pending-collab-05','meta-01','metab-01','multi-02','visual-01']],
  ['aftersales-2',['pending-collab-06','metab-02','small-rna-02','visual-02','qc-01']]
].flatMap(([personId,ids])=>ids.map(id=>[id,personId])));
function isSupportPerson(value) {
  const id=typeof value==='string'?value:value?.id;
  return projectSupportPeople.some(user=>user.id===id)||!!(value&&typeof value==='object'&&value.supportType);
}
let directory = [
  { id: 'owner-1', name: '王老师', phone: '13800000000', account: 'wang.laoshi' },
  { id: 'chen-1', name: '陈老师', phone: '13800000001', account: 'chen.laoshi' },
  { id: 'li-1', name: '小李', phone: '13800000002', account: 'xiao.li' },
  { id: 'zhou-1', name: '小周', phone: '13800000003', account: 'xiao.zhou' },
  { id: 'xia-1', name: '夏老师', phone: '13800000005', account: 'xia.laoshi' },
  { id: 'lin-1', name: '林老师', phone: '13800000006', account: 'lin.laoshi' }
];
const demoPlatformAccounts = [
  { id: 'manager-1', name: '陈管理者', phone: '13800000010', email: 'project.manager@example.com', emailBound: true, account: 'project.manager' },
  { id: 'demo-zhao', name: '赵研究员', phone: '13800000007', email: 'zhao.researcher@example.com', emailBound: true, account: 'zhao.researcher' },
  { id: 'demo-sun', name: '孙研究员', phone: '13800000008', email: 'sun.researcher@example.com', emailBound: false, account: 'sun.researcher' },
  { id: 'demo-wu', name: '吴研究员', phone: '13800000009', email: 'wu.researcher@example.com', emailBound: true, account: 'wu.researcher' }
];
const repeatableDemoAccountId='demo-zhao';
// 重复演示记录使用独立 ID；不加入平台账号索引，避免同一联系方式被误判为多账户。
let demoMemberInstances=[];
function isDemoMemberInstance(user) { return user?.demoSourceId===repeatableDemoAccountId&&user.id!==repeatableDemoAccountId; }
function isRepeatableDemoAccount(user) { return user?.id===repeatableDemoAccountId; }
function demoMemberLabel(user) { return isDemoMemberInstance(user)?` · ${isEnglishVersion?'Demo':'示例'} ${user.demoSequence}`:''; }
// 成员库与示例平台注册账号分开保存；移除成员不注销账号，之后仍可重新添加。
let platformAccounts = [...directory,...demoPlatformAccounts].map(u=>({...u}));
const accountKeys=['phone','email','account'];
const isEnglishVersion=document.documentElement.lang.toLowerCase().startsWith('en');
const visibleAccountKeys=isEnglishVersion?['email','account']:accountKeys;
const accountEntryLabel=isEnglishVersion?'email or username':'手机号、已绑定邮箱或用户名';
const accountPairLabel=isEnglishVersion?'email + username':'手机号／已绑定邮箱 + 用户名';
const memberContactLabel=isEnglishVersion?'Email':'手机号 / 邮箱';
const accountCopy={
  subtitle:'',
  mismatch:isEnglishVersion?'The email and username must belong to the same account.':'手机号或已绑定邮箱须与用户名属于同一账户。',
  contactHint:isEnglishVersion?'Use the account email and username.':'手机号为注册信息；邮箱为账号后续绑定的信息，绑定后可用于匹配。',
  unmatched:isEnglishVersion?'No account matched. Check the complete email or username.':'未匹配到账户，请核对完整手机号或已绑定邮箱。邮箱须先绑定到该账号。',
  ambiguous:isEnglishVersion?'These details match more than one account. Check them and try again.':'账号信息存在重复关联，无法唯一匹配，请核对后重试。'
};
const safetyMessage='请核对匹配的用户名、邮箱和手机号是否属于同一成员';
function accountValue(value) { return String(value||'').trim().toLowerCase(); }
function usableAccountValue(user,key) {
  if(key==='email'&&!isEnglishVersion&&!user.emailBound)return '';
  if(key==='phone'&&isEnglishVersion)return '';
  return accountValue(user[key]);
}
function contactKeyFor(value) { return isEnglishVersion||String(value||'').includes('@')?'email':'phone'; }
function accountContact(user,preferred='',masked=false) {
  const key=isEnglishVersion?'email':preferred==='email'&&usableAccountValue(user,'email')?'email':user.phone?'phone':'email';
  const value=key==='email'?usableAccountValue(user,'email'):String(user.phone||'');
  return {key,value:masked&&key==='phone'&&value?`${value.slice(0,3)} **** ${value.slice(-4)}`:value,label:isEnglishVersion?'Email':key==='email'?'邮箱（已绑定）':'手机号'};
}
function memberIdentifier(user) {
  const keys=isEnglishVersion?['email','account']:['account','phone','email'];
  if(!isEnglishVersion&&keys.includes(user.memberLookupKey))keys.unshift(user.memberLookupKey);
  return keys.map(key=>usableAccountValue(user,key)).find(Boolean)||(isEnglishVersion?'Not provided':'未登记');
}
const exampleMemberRemarks={'owner-1':'项目负责人','manager-1':'协作管理','chen-1':'课题负责人','li-1':'数据分析','zhou-1':'实验研究','xia-1':'临床研究','lin-1':'生信分析','demo-zhao':'科研协作','demo-sun':'数据整理','demo-wu':'结果审核'};
function savedMemberRemark(user) { return String(user?.remark||'').trim(); }
function memberRemark(user) { if(user?.memberAliasDefined===true)return savedMemberRemark(user);return savedMemberRemark(user)||exampleMemberRemarks[user?.id]||exampleMemberRemarks[user?.demoSourceId]||(isSupportPerson(user)?'项目支持':'协作成员'); }
function memberIdentity(user) { return `<strong class="member-account">${safe(memberIdentifier(user))}</strong><span class="member-remark">${safe(memberRemark(user))}</span>`; }
function accountSearchText(user) { return [user.name,user.remark||'',...visibleAccountKeys.map(key=>usableAccountValue(user,key))].join(' ').toLowerCase(); }
function resolvePlatformAccount(value,key=null) {
  const query=accountValue(value);
  if(!query)return {user:null,status:'empty'};
  const keys=key==='contact'?[contactKeyFor(value)]:key?[key]:visibleAccountKeys;
  const matches=platformAccounts.filter(u=>keys.some(k=>usableAccountValue(u,k)===query));
  if(matches.length!==1)return {user:null,status:matches.length?'ambiguous':'unmatched'};
  const user=matches[0];
  const conflict=platformAccounts.some(u=>u.id!==user.id&&visibleAccountKeys.some(k=>usableAccountValue(user,k)&&usableAccountValue(u,k)===usableAccountValue(user,k)));
  return conflict?{user:null,status:'ambiguous'}:{user,status:'matched'};
}
// 六条从未协作的示例置顶；旧浏览器只补充缺失项，不重置已完成的协作操作。
const pendingCollaborationExamples = [
  ['肠道菌群宏基因组测序分析','宏基因组分析'],
  ['植物根际微生物多样性分析','微生物多样性分析'],
  ['人外周血单细胞转录组分析','新版单细胞转录组分析'],
  ['肝组织定量蛋白组分析','定量蛋白组云分析'],
  ['血清非靶向代谢组分析','非靶向代谢组分析'],
  ['肿瘤组织转录组联合分析','转录组云分析']
].map(([name,category],index)=>{
  const number=String(index+1).padStart(2,'0');
  return {id:'pending-collab-'+number,ticket:'PT20261029NC0'+number,contract:'CT202610290'+number,code:'PAIS20261029NC0'+number,name:'待协作示例-'+name,category,created:'2026-10-29 09:'+String(30-index).padStart(2,'0')+':00',status:'完成',type:'云分析',collab:false,hasCollaborated:false,members:[{id:'owner-1',role:'owner'}],visitorDownload:false};
});
const initialProjects = [
  ...pendingCollaborationExamples,
  { id: 'analysis', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610201731FS5D', name: '测试示例-定量蛋白组云分析', category: '定量蛋白组云分析', created: '2026-10-20 17:31:42', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true },
    { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'member' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'protein-mod-1', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610100956LETO', name: '测试示例-修饰蛋白组云分析', category: '修饰蛋白组云分析', created: '2026-10-10 09:56:29', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'protein-mod-2', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'PT202610100956Y9BS', name: '测试示例-修饰蛋白组云分析', category: '修饰蛋白组云分析', created: '2026-10-10 09:56:28', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'zhou-1', role: 'member' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'single-cell', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'SC202609031329Z8DE', name: '测试示例-新版单细胞转录组分析', category: '新版单细胞转录组分析', created: '2026-09-03 13:29:41', status: '完成', type: '云分析', collab: true, shared: true, shareUserIds: ['xia-1'], members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'member' }, { id: 'xia-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'small-rna', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'TR202607290946X73M', name: '测试示例-农学SmallRNA分析', category: 'SmallRNA云分析', created: '2026-07-29 09:46:58', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'li-1', role: 'member' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'transcript-metab', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'TR2026070217342DUP', name: '测试示例-新版转录与代谢组联合分析', category: '新版转录与代谢组联合分析', created: '2026-07-02 17:34:06', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'chen-1', role: 'admin' }, { id: 'zhou-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'diversity-metab', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'MD202606151415PO0U', name: '测试示例-新版多样性与代谢组联合分析', category: '新版多样性与代谢组联合分析', created: '2026-06-15 14:15:33', status: '完成', type: '云分析', collab: true, members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true }, { id: 'li-1', role: 'member' }, { id: 'xia-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'visual', ticket: 'DemoProjectID', contract: 'DemoContractID', code: 'YT20261021008', name: '多组学数据可视化项目', category: '云图汇', created: '2026-10-21 10:08:00', status: '完成', type: '云图汇', collab: true, shared: true, shareUserIds: ['li-1'], members: [
    { id: 'owner-1', role: 'owner' }, { id: 'support-1', role: 'admin', initial: true },
    { id: 'chen-1', role: 'admin' }, { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'member' }, { id: 'lin-1', role: 'member' }
  ], visitorDownload: true },
  { id: 'meta-01', ticket: 'PT20261019001', contract: 'CT2026019001', code: 'MT20261019001A', name: '肠道微生物16S多样性分析', category: '微生物多样性分析', created: '2026-10-19 14:20:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'meta-02', ticket: 'PT20261018002', contract: 'CT2026018002', code: 'MT20261018002B', name: '土壤微生物宏基因组测序', category: '宏基因组分析', created: '2026-10-18 09:35:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'rna-01', ticket: 'PT20261017003', contract: 'CT2026017003', code: 'RNA20261017001', name: '人肝癌组织转录组测序', category: '转录组云分析', created: '2026-10-17 16:40:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'rna-02', ticket: 'PT20261016004', contract: 'CT2026016004', code: 'RNA20261016002', name: '小鼠脑组织单细胞测序', category: '新版单细胞转录组分析', created: '2026-10-16 11:22:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'protein-01', ticket: 'PT20261015005', contract: 'CT2026015005', code: 'PT20261015001C', name: '血清定量蛋白组分析', category: '定量蛋白组云分析', created: '2026-10-15 10:10:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'protein-02', ticket: 'PT20261014006', contract: 'CT2026014006', code: 'PT20261014002D', name: '组织磷酸化修饰蛋白组', category: '修饰蛋白组云分析', created: '2026-10-14 15:30:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'metab-01', ticket: 'PT20261013007', contract: 'CT2026013007', code: 'MB20261013001E', name: '血浆非靶向代谢组分析', category: '非靶向代谢组分析', created: '2026-10-13 08:45:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'metab-02', ticket: 'PT20261012008', contract: 'CT2026012008', code: 'MB20261012002F', name: '尿液靶向代谢组检测', category: '靶向代谢组分析', created: '2026-10-12 13:55:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'multi-01', ticket: 'PT20261011009', contract: 'CT2026011009', code: 'MO20261011001G', name: '转录组与代谢组联合分析', category: '新版转录与代谢组联合分析', created: '2026-10-11 09:00:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'multi-02', ticket: 'PT20261010010', contract: 'CT2026010010', code: 'MO20261010002H', name: '多样性与代谢组联合分析', category: '新版多样性与代谢组联合分析', created: '2026-10-10 14:15:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'small-rna-01', ticket: 'PT20261009011', contract: 'CT2026090011', code: 'TR20261009001I', name: '植物SmallRNA测序分析', category: 'SmallRNA云分析', created: '2026-10-09 10:30:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'small-rna-02', ticket: 'PT20261008012', contract: 'CT2026080012', code: 'TR20261008002J', name: '动物circRNA测序分析', category: 'circRNA云分析', created: '2026-10-08 16:00:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'lnc-01', ticket: 'PT20261007013', contract: 'CT2026070013', code: 'LN20261007001K', name: '人全转录组测序（lncRNA）', category: 'lncRNA云分析', created: '2026-10-07 11:45:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'methy-01', ticket: 'PT20261006014', contract: 'CT2026060014', code: 'ME20261006001L', name: '全基因组甲基化测序', category: '甲基化云分析', created: '2026-10-06 09:20:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'chip-01', ticket: 'PT20261005015', contract: 'CT2026050015', code: 'CP20261005001M', name: 'ChIP-seq转录因子结合', category: 'ChIP-seq云分析', created: '2026-10-05 15:50:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'gw-01', ticket: 'PT20261004016', contract: 'CT2026040016', code: 'GW20261004001N', name: '全基因组关联分析（GWAS）', category: 'GWAS云分析', created: '2026-10-04 12:05:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'wes-01', ticket: 'PT20261003017', contract: 'CT2026030017', code: 'WE20261003001O', name: '全外显子组测序分析', category: 'WES云分析', created: '2026-10-03 10:40:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'visual-01', ticket: 'YT20261002001', contract: 'CT2026020018', code: 'YT20261002001P', name: '蛋白组数据可视化看板', category: '云图汇', created: '2026-10-02 14:30:00', status: '完成', type: '云图汇', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'visual-02', ticket: 'YT20261001002', contract: 'CT2026010019', code: 'YT20261001002Q', name: '微生物丰度热图可视化', category: '云图汇', created: '2026-10-01 09:15:00', status: '完成', type: '云图汇', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false },
  { id: 'qc-01', ticket: 'PT20260930001', contract: 'CT2026090001', code: 'QC20260930001R', name: 'RNA-seq数据质控分析', category: '数据质控分析', created: '2026-09-30 11:00:00', status: '完成', type: '云分析', collab: false, members: [{ id: 'owner-1', role: 'owner' }], visitorDownload: false }
];
const initialGroups = [
  { id: 'group-onco', name: '肿瘤早筛课题组', members: [
    { id: 'chen-1', role: 'admin' },
    { id: 'li-1', role: 'member' }, { id: 'zhou-1', role: 'member' }
  ]},
  { id: 'group-micro', name: '微生物多样性课题组', members: [
    { id: 'lin-1', role: 'member' }, { id: 'xia-1', role: 'member' }
  ]}
];
const storageKey = 'personalbio-project-collaboration-preview-v6-collab-records';
let managerMemberIds=null;
let projects, groups, collabRecords = [], deletedGroupIds = [], managerInvitationsSeeded = false, managerOwnedGroupsSeeded = false;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (!saved || !Array.isArray(saved.projects) || !Array.isArray(saved.groups)) throw new Error('无本地记录');
  projects = saved.projects; groups = saved.groups;
  if(Array.isArray(saved.managerMemberIds))managerMemberIds=saved.managerMemberIds.filter(id=>typeof id==='string');
  managerInvitationsSeeded = saved.managerInvitationsSeeded === true;
  managerOwnedGroupsSeeded = saved.managerOwnedGroupsSeeded === true;
  deletedGroupIds = Array.isArray(saved.deletedGroupIds) ? saved.deletedGroupIds.filter(id=>typeof id==='string') : [];
  collabRecords = Array.isArray(saved.collabRecords) ? saved.collabRecords : [];
  if (Array.isArray(saved.directory)) directory = saved.directory;
  if (Array.isArray(saved.platformAccounts)) platformAccounts = saved.platformAccounts;
  if (Array.isArray(saved.demoMemberInstances)) demoMemberInstances = saved.demoMemberInstances;
} catch {
  projects=structuredClone(initialProjects);groups=structuredClone(initialGroups);
  // 仅首次打开提供示例协作，已有浏览器数据不新增授权、不重置。
  const analysisExample=projects.find(p=>p.id==='analysis');
  collabRecords=[{id:'demo-collab-analysis-onco',projectId:'analysis',projectName:analysisExample.name,code:analysisExample.code,initiatedBy:'owner-1',groupId:'group-onco',groupName:groups[0].name,members:structuredClone(groups[0].members),createdAt:'2026-10-27 10:00:00',status:'协作中'}];
}
const pendingExampleIds=new Set(pendingCollaborationExamples.map(p=>p.id));
projects=[...pendingCollaborationExamples.map(example=>projects.find(p=>p.id===example.id)||structuredClone(example)),...projects.filter(p=>!pendingExampleIds.has(p.id))];
const accountCatalog=new Map();
for(const u of [...demoPlatformAccounts,...platformAccounts,...directory]){
  if(isDemoMemberInstance(u))continue;
  const previous=accountCatalog.get(u.id)||{};
  // 缺失邮箱保持为空，旧版自动拼出的邮箱不能作为已绑定邮箱使用。
  const declared=demoPlatformAccounts.find(account=>account.id===u.id);
  const legacyEmail=`${String(u.account||u.id).replace(/[^a-zA-Z0-9._-]/g,'-')}@example.com`;
  let email=accountValue(u.email||previous.email||'');
  const emailBound=typeof u.emailBound==='boolean'?u.emailBound:previous.emailBound??(declared?.email===email?declared.emailBound:!!email&&email!==legacyEmail);
  if(email===legacyEmail&&!declared&&!emailBound)email='';
  accountCatalog.set(u.id,{...previous,...u,remark:savedMemberRemark(u)||savedMemberRemark(previous),phone:String(u.phone??previous.phone??'').trim(),account:String(u.account||'').trim(),email,emailBound:!!email&&emailBound});
}
platformAccounts=[...accountCatalog.values()];
const demoInstanceCatalog=new Map();
for(const u of [...demoMemberInstances,...directory.filter(isDemoMemberInstance)]){
  if(!isDemoMemberInstance(u))continue;
  demoInstanceCatalog.set(u.id,{...u,...accountCatalog.get(repeatableDemoAccountId),id:u.id,remark:u.remark||'',demoSourceId:repeatableDemoAccountId,defaultRole:defaultMemberRole(u),demoSequence:Number.isInteger(u.demoSequence)&&u.demoSequence>0?u.demoSequence:demoInstanceCatalog.size+1});
}
demoMemberInstances=[...demoInstanceCatalog.values()];
directory=directory.filter(u=>!isSupportPerson(u)).map(u=>({...u,...(isDemoMemberInstance(u)?demoInstanceCatalog.get(u.id):accountCatalog.get(u.id)),remark:u.remark||''}));
// 补齐历史成员别称；已有自定义备注优先，统一同步各页面使用的账号资料。
const persistedMemberRemarks=new Map();
for(const u of [...directory,...demoMemberInstances,...platformAccounts])if(savedMemberRemark(u)&&!persistedMemberRemarks.has(u.id))persistedMemberRemarks.set(u.id,savedMemberRemark(u));
const explicitMemberAliases=new Map();
for(const u of [...directory,...demoMemberInstances,...platformAccounts])if(u.memberAliasDefined===true&&!explicitMemberAliases.has(u.id))explicitMemberAliases.set(u.id,savedMemberRemark(u));
for(const u of [...directory,...demoMemberInstances,...platformAccounts,...projectSupportPeople]){
  if(explicitMemberAliases.has(u.id)){u.remark=explicitMemberAliases.get(u.id);u.memberAliasDefined=true;}
  else u.remark=persistedMemberRemarks.get(u.id)||memberRemark(u);
}
if(managerMemberIds===null)managerMemberIds=directory.map(u=>u.id);
platformAccounts=platformAccounts.filter(u=>!isSupportPerson(u));
// 将旧版经课题组或直接邀请加入的支持人员迁为项目专属关联，保留已有项目访问。
for(const p of projects){
  const legacy=[...(p.members||[]),...(p.directCollabMembers||[]),...collabRecords.filter(r=>r.projectId===p.id).flatMap(r=>r.members||[])].find(isSupportPerson);
  if(!projectSupportPeople.some(u=>u.id===p.supportAssignment?.personId))p.supportAssignment=legacy?{personId:legacy.id,source:'legacy',addedAt:null}:null;
  p.supportContactId=p.supportAssignment?.personId||projectSupportAssignments[p.id]||null;
  p.members=(p.members||[]).filter(m=>!isSupportPerson(m));
  if(Array.isArray(p.directCollabMembers))p.directCollabMembers=p.directCollabMembers.filter(m=>!isSupportPerson(m));
  if(Array.isArray(p.shareUserIds))p.shareUserIds=p.shareUserIds.filter(id=>!isSupportPerson(id));
}
for(const g of groups)g.members=(g.members||[]).filter(m=>!isSupportPerson(m));
// 课题组归属：旧数据默认归当前项目拥有者，另补一个由同事创建并邀请当前账号加入的课题组，便于演示受邀视角。
for(const g of groups){if(!g.ownerId)g.ownerId='owner-1';if(!g.invitedAt)g.invitedAt=null;if(!g.createdAt)g.createdAt={'肿瘤早筛课题组':'2026-10-29 09:30:00','微生物多样性课题组':'2026-10-30 14:00:00'}[g.name]||'2026-10-29 09:30:00';g.members=(g.members||[]).filter(m=>m.id!==g.ownerId&&!isSupportPerson(m));}
groups=groups.filter(g=>(g.members||[]).length);
if(!deletedGroupIds.includes('group-joint')&&!groups.some(g=>g.id==='group-joint'))groups.push({id:'group-joint',name:'代谢组学联合课题组',ownerId:'chen-1',invitedAt:'2026-11-02 10:20:00',members:[{id:'owner-1',role:'member'},{id:'lin-1',role:'member'},{id:'xia-1',role:'member'}]});
if(groups.some(g=>g.id==='group-joint')&&!collabRecords.some(r=>r.groupId==='group-joint'))collabRecords.push({id:'record-group-joint-meta-01',projectId:'meta-01',projectName:'肠道微生物16S多样性分析',code:'MT20261019001A',initiatedBy:'chen-1',groupId:'group-joint',groupName:'代谢组学联合课题组',members:[{id:'owner-1',role:'member'},{id:'lin-1',role:'member'}],createdAt:'2026-11-02 10:30:00',updatedAt:'2026-11-02 10:30:00',status:'协作中'});
// 管理者受邀课题组示例仅补充一次，保留后续角色调整、移除与删除结果。
if(!managerInvitationsSeeded){
  const examples=[
    {id:'manager-joined-01',name:'肿瘤多组学联合课题组',ownerId:'chen-1',createdAt:'2026-11-03 09:30:00',invitedAt:'2026-11-05 10:20:00',members:[{id:'manager-1',role:'admin'},{id:'li-1',role:'member'},{id:'zhou-1',role:'member'}]},
    {id:'manager-joined-02',name:'肠道菌群协作课题组',ownerId:'lin-1',createdAt:'2026-11-04 14:00:00',invitedAt:'2026-11-06 14:30:00',members:[{id:'manager-1',role:'admin'},{id:'chen-1',role:'member'},{id:'xia-1',role:'member'}]},
    {id:'manager-joined-03',name:'临床样本研究课题组',ownerId:'zhou-1',createdAt:'2026-11-05 10:00:00',invitedAt:'2026-11-09 09:15:00',members:[{id:'manager-1',role:'admin'},{id:'lin-1',role:'member'},{id:'li-1',role:'member'}]}
  ];
  examples.forEach(g=>{if(!deletedGroupIds.includes(g.id)&&!groups.some(item=>item.id===g.id))groups.push(g);});
  managerInvitationsSeeded=true;
}
if(!managerOwnedGroupsSeeded){
  const examples=[
    {id:'manager-owned-01',name:'肿瘤数据分析课题组',ownerId:'manager-1',createdAt:'2026-11-07 09:30:00',members:[{id:'chen-1',role:'admin'},{id:'li-1',role:'member'},{id:'zhou-1',role:'member'}]},
    {id:'manager-owned-02',name:'微生物研究课题组',ownerId:'manager-1',createdAt:'2026-11-08 14:00:00',members:[{id:'lin-1',role:'member'},{id:'xia-1',role:'member'}]}
  ];
  examples.forEach(g=>{if(!deletedGroupIds.includes(g.id)&&!groups.some(item=>item.id===g.id))groups.push(g);});
  managerOwnedGroupsSeeded=true;
}
// 访问者角色已停用，历史成员统一转为成员，避免角色下拉框默认选中管理员。
for(const collection of [...groups,...collabRecords,...projects]){
  for(const member of [...(collection.members||[]),...(collection.directCollabMembers||[])])if(member.role==='visitor')member.role='member';
}
for(const user of [...directory,...platformAccounts,...demoMemberInstances])if(user.defaultRole==='visitor')user.defaultRole='member';
for(const r of collabRecords)r.members=(r.members||[]).filter(m=>!isSupportPerson(m));
for(const p of projects){if(p.name==='测试示例-定量蛋白组分析')p.name='测试示例-定量蛋白组云分析';if(p.name==='测试示例-农学 SmallRNA分析')p.name='测试示例-农学SmallRNA分析';}
for(const p of projects){p.shareUserIds=[...new Set(Array.isArray(p.shareUserIds)?p.shareUserIds:[])];p.shared=!!(p.shared||p.shareUserIds.length);}
for(const p of projects)if(!Array.isArray(p.files))p.files=[];
// 历史记录没有发起人时，保留授权并按原项目所有者补充来源。
for(const r of collabRecords){if(!r.initiatedBy)r.initiatedBy=projects.find(p=>p.id===r.projectId)?.members.find(m=>m.role==='owner')?.id||'owner-1';}
// 历史项目的直接授权与课题组授权分开保存；取消或编辑一处授权不会留下过期权限。
for(const p of projects){
  if(!Array.isArray(p.managerUserIds))p.managerUserIds=(p.members||[]).some(m=>m.id==='owner-1'&&m.role==='owner')?['manager-1']:[];
  if(!Array.isArray(p.directCollabMembers))p.directCollabMembers=(p.members||[]).filter(m=>m.role!=='owner'&&!collabRecords.some(r=>r.projectId===p.id&&(r.members||[]).some(x=>x.id===m.id))).map(m=>({...m}));
  p.hasCollaborated=!!(p.hasCollaborated||p.collab||p.directCollabMembers.length||collabRecords.some(r=>r.projectId===p.id));
  rebuildProjectMembers(p);
}
for(const g of groups)g.name=g.name.replaceAll('空'+'间','课题组');
for(const r of collabRecords)if(r.groupName)r.groupName=r.groupName.replaceAll('空'+'间','课题组');
let projectMenuOpen=true;
let supportUserId=projectSupportPeople.some(u=>u.id===previewParams.get('supportUser'))?previewParams.get('supportUser'):'support-1';
let collaborationGroupPresetId=null, collabDraftProjectIds=[],spaceTab='joined';
let page = 'projects', activeProjectId = 'analysis', tab = 'data', listTab = 'mine', identity = 'owner', search = '', projectTicketSearch = '', projectCodeSearch = '', selectedProjectIds = [], modal = null, toastTimer, confirmationTimer, returnFocus = null;
identity=previewRoleAliases[previewParams.get('role')]||'owner';
if(previewAccounts().some(u=>u.id===previewParams.get('user')&&u.id!=='owner-1'))recipientUserId=previewParams.get('user');
let detailOrigin = { page: 'projects', listTab: 'mine' };
let filePath=[],selectedFileIds=[];
let openProjectSearch=null;
const main = document.getElementById('main'), modalRoot = document.getElementById('modalRoot'), confirmRoot = document.getElementById('confirmRoot');
function saveAll() { try { localStorage.setItem(storageKey, JSON.stringify({ projects, groups, collabRecords, directory, managerMemberIds, platformAccounts, demoMemberInstances, deletedGroupIds, managerInvitationsSeeded, managerOwnedGroupsSeeded })); } catch { notify('浏览器未允许保存，当前操作将在本次浏览期间生效'); } }
function project() { return projects.find(p => p.id === activeProjectId) || projects[0]; }
function group(id) { return groups.find(g => g.id === id); }
function person(id) { return projectSupportPeople.find(d=>d.id===id) || directory.find(d => d.id === id) || demoMemberInstances.find(d=>d.id===id) || platformAccounts.find(d=>d.id===id) || { name: '未知成员', phone: '', account: '' }; }
function ensureDirectoryPerson(id) { if(isSupportPerson(id))return;const u=platformAccounts.find(u=>u.id===id)||demoMemberInstances.find(u=>u.id===id);if(u&&!directory.some(d=>d.id===id))directory.push({...u}); }
function previewAccounts() { return [...platformAccounts,...demoMemberInstances]; }
function memberAccountIsUnique(id) { const u=person(id);return resolvePlatformAccount(u.account,'account').user?.id===(isDemoMemberInstance(u)?u.demoSourceId:id); }
function defaultMemberRole(user) { return memberRoles.includes(user?.defaultRole)?user.defaultRole:'member'; }
function selectedMemberRole() { return 'member'; }
function memberForAddition(user,defaultRole=defaultMemberRole(user)) {
  if(!isRepeatableDemoAccount(user))return {...user,defaultRole};
  const demoSequence=demoMemberInstances.reduce((max,u)=>Math.max(max,u.demoSequence),0)+1;
  const id='demo-member-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
  const instance={...user,id,demoSourceId:user.id,demoSequence,defaultRole,remark:modal?.remark||memberRemark(user)};
  demoMemberInstances.push(instance);
  return instance;
}
function isDirectoryOwner(id) { return id==='owner-1'||projects.some(p=>p.members.some(m=>m.id===id&&m.role==='owner')); }
function safe(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function currentUserId() { return identity==='support'?supportUserId:identity==='member'?recipientUserId:identityUsers[identity]||'owner-1'; }
function isProjectManagementView() { return identity==='owner'||identity==='manager'; }
function isManagementView() { return isProjectManagementView()||identity==='support'; }
function projectRecords(p) { return collabRecords.filter(r=>r.projectId===p.id); }
function mergeProjectMembers(members) {
  const out=new Map(),rank={visitor:1,member:2,admin:3,owner:4};
  for(const m of members){const item={...m,role:isSupportPerson(m)&&m.role!=='owner'?'admin':m.role};if(!out.has(m.id)||(rank[item.role]||0)>(rank[out.get(m.id).role]||0))out.set(m.id,item);}
  return [...out.values()];
}
function rebuildProjectMembers(p) {
  const staff=projectSupportPeople.find(u=>u.id===p.supportAssignment?.personId);
  const managers=(p.managerUserIds||[]).map(id=>({id,role:'admin',projectManager:true}));
  p.members=mergeProjectMembers([...(p.members||[]).filter(m=>m.role==='owner'),...managers,...projectRecords(p).flatMap(r=>r.members||[]).filter(m=>!isSupportPerson(m)),...(p.directCollabMembers||[]).filter(m=>!isSupportPerson(m)),...(staff?[{id:staff.id,role:'admin',projectSupport:true}]:[])]);
  p.collab=projectRecords(p).length>0||p.directCollabMembers.length>0;
}
function projectSupportPerson(p) { return projectSupportPeople.find(u=>u.id===(p.supportAssignment?.personId||p.supportContactId)); }
function canAddProjectSupport(p) { return !!p&&isProjectManagementView()&&canManageProject(p)&&p.type==='云分析'; }
function addProjectSupport(id) {
  const p=projects.find(p=>p.id===id);
  if(!canAddProjectSupport(p))return notify('仅项目拥有者或管理者可为本项目添加支持人员');
  if(p.supportAssignment)return notify('本项目已添加支持人员');
  const user=projectSupportPerson(p);if(!user)return notify('该项目暂未分配支持人员');
  p.supportAssignment={personId:user.id,source:'project',addedAt:new Date().toISOString(),addedBy:currentUserId()};
  rebuildProjectMembers(p);saveAll();render();notify(`${supportTypes[user.supportType]} ${user.name} 已添加至本项目`);
}
function projectSupportAction(p) {
  if(!canAddProjectSupport(p))return '';
  const user=projectSupportPerson(p),added=!!p.supportAssignment;
  const label=added?'已添加':user?`添加${supportTypes[user.supportType]}`:'暂未分配支持';
  const title=user?`${supportTypes[user.supportType]}：${user.name}（${user.account}）`:'此项目暂未分配支持人员';
  return `<button class="btn quiet small project-support-button ${added?'project-action-done':''}" data-add-project-support="${safe(p.id)}" ${added||!user?'disabled':''} title="${safe(title)}" aria-label="${safe(label+' · '+title)}">${icon(added?'check':'person')}${label}</button>`;
}
function renderProjectSupport(p) {
  const user=projectSupportPerson(p);if(!p.supportAssignment||!user)return '';
  return `<section class="project-support-detail" aria-label="项目支持人员" data-project-support="${safe(p.id)}"><span class="project-support-icon">${icon('person')}</span><div><span class="project-support-type">${supportTypes[user.supportType]}</span><strong>${safe(user.name)}</strong><small>${safe(user.account)} · ${safe(accountContact(user,'',true).value)}</small></div><span class="project-support-status">已添加</span></section>`;
}
function projectAccessRole(p) { return p?.members.find(m=>m.id===currentUserId())?.role||null; }
function projectListIdentity(p) { const role=projectAccessRole(p);return role==='owner'?'owner':role==='admin'&&!isProjectSupportViewer()?'manager':role==='visitor'?'visitor':role?'collaborator':null; }
function collaborationState(p) { return p.collab?'active':p.hasCollaborated?'cancelled':'never'; }
function canManageProject(p) {
  if(!p||!isManagementView())return false;
  return ['owner','admin'].includes(projectAccessRole(p));
}
// 支持人员只被指派到项目提供支持，不修改本项目的成员与角色；添加、发起协作同样属于成员变更。
function isProjectSupportViewer() { return isSupportPerson(person(currentUserId())); }
function canManageProjectMembers(p) { return canManageProject(p)&&!isProjectSupportViewer(); }
// 项目分享同样只由项目拥有者操作：支持人员可以查看项目，不能指定或取消共享用户。
function canManageProjectShare(p) { return canManageProject(p)&&!isProjectSupportViewer(); }
function canConfigureCollaboration(p) { return canManageProjectMembers(p)&&(collaborationState(p)!=='cancelled'||collaborationFeatures.restart); }
function receivedCollabRecords() {
  const uid=currentUserId();
  return collabRecords.filter(r=>{
    const p=projects.find(p=>p.id===r.projectId);
    return p&&projectAccessRole(p)!=='owner'&&r.initiatedBy!==uid&&(r.members||[]).some(m=>m.id===uid);
  });
}
function isReceivedProject(p) { return !!projectAccessRole(p)&&projectAccessRole(p)!=='owner'; }
function personalProjects() { return projects.filter(p=>!!projectAccessRole(p)); }
function manageableProjects() { return projects.filter(canManageProject); }
function sharedProjects() { return projects.filter(p=>p.shared&&(projectAccessRole(p)==='owner'||p.shareInitiatedBy===currentUserId()||p.shareUserIds.includes(currentUserId()))); }
function visibleProjects() { const shared=new Set(sharedProjects().map(p=>p.id));return projects.filter(p=>projectAccessRole(p)||shared.has(p.id)); }
function canManage() { return isManagementView()&&(page!=='team'||isProjectManagementView())&&(page!=='detail'||canManageProject(project())); }
// 课题组与成员库管理：项目拥有者与协作者都可维护，技术支持除外。
function canManageGroups() { return isProjectManagementView()||identity==='member'; }
function chooseRoleLanding() {
  page='projects';
  if(identity==='support'){page='projects';listTab=personalProjects().length?'mine':sharedProjects().length?'shared':'mine';return;}
  const type='云分析';
  listTab=personalProjects().some(p=>p.type===type)?'mine':sharedProjects().some(p=>p.type===type)?'shared':'mine';
}
function switchPreviewRole(next,userId=null) {
  if(!Object.hasOwn(previewRoleNames,next))return;
  closeModal();identity=next;resetProjectSearch();
  if(next==='support'&&projectSupportPeople.some(u=>u.id===userId))supportUserId=userId;
  if(next==='member'&&userId&&previewAccounts().some(u=>u.id===userId&&u.id!=='owner-1'))recipientUserId=userId;
  search='';selectedProjectIds=[];collaborationGroupPresetId=null;collabDraftProjectIds=[];spaceTab='joined';filePath=[];selectedFileIds=[];tab='data';
  chooseRoleLanding();
  try{const url=new URL(location.href);url.searchParams.set('role',identity);if(identity==='member')url.searchParams.set('user',recipientUserId);else url.searchParams.delete('user');if(identity==='support')url.searchParams.set('supportUser',supportUserId);else url.searchParams.delete('supportUser');history.replaceState(null,'',url);}catch{}
  render();notify(`已切换为${previewRoleNames[identity]}：${person(currentUserId()).name}`);
}
function renderRolePreview() {
  const viewer=person(currentUserId()),support=identity==='support';
  document.querySelector('.sidebar').classList.toggle('technical-support-navigation',support);
  document.getElementById('projectMenuLabel').textContent=support?'项目管理':'项目列表';
  const subnav=document.getElementById('projectSubnav');
  subnav.innerHTML=support?'<button class="nav-item nav-sub-item" data-nav="projects"><span class="nav-sub-dot"></span>项目协作</button>':`<button class="nav-item nav-sub-item" data-nav="visual" type="button" disabled aria-disabled="true" title="暂未开放"><span class="nav-sub-dot"></span>云图汇</button><button class="nav-item nav-sub-item" data-nav="projects"><span class="nav-sub-dot"></span>云分析</button><button class="nav-item nav-sub-item" data-nav="spaces"><span class="nav-sub-dot"></span>课题组管理</button>${identity!=='support'?'<button class="nav-item nav-sub-item" data-nav="team"><span class="nav-sub-dot"></span>成员管理</button>':''}`;
  subnav.setAttribute('aria-label',support?'项目管理子目录':'项目列表子目录');
  document.querySelector('[data-project-menu] .nav-icon').innerHTML=icon(support?'layers':'folder');
  document.getElementById('navProjectCount').hidden=support;
  document.querySelectorAll('.sidebar [data-nav=visual]').forEach(button=>button.hidden=support);
  document.querySelectorAll('[data-preview-role]').forEach(button=>{const active=button.dataset.previewRole===identity;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  document.getElementById('rolePreviewCaption').textContent=support?'仅展示已添加你的项目，可进入项目详情':identity==='member'?'可创建课题组、添加成员，并查看受邀课题组':'可管理拥有或受邀管理的项目';
  document.getElementById('currentRoleLabel').textContent=`${support?supportTypes[viewer.supportType]:previewRoleNames[identity]} · ${viewer.name}`;
  document.getElementById('recipientAccountControl').hidden=identity!=='member';
  const select=document.getElementById('recipientSelect');
  select.innerHTML=previewAccounts().filter(u=>u.id!=='owner-1').map(u=>`<option value="${safe(u.id)}" ${u.id===recipientUserId?'selected':''}>${safe(u.name)}${safe(demoMemberLabel(u))}</option>`).join('');
  document.getElementById('supportAccountControl').hidden=!support;
  document.getElementById('supportSelect').innerHTML=projectSupportPeople.map(u=>`<option value="${safe(u.id)}" ${u.id===supportUserId?'selected':''}>${safe(u.name)} · ${supportTypes[u.supportType]}</option>`).join('');
}

function notify(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3000); }
function syncRecords(pid) {
  const p=projects.find(x=>x.id===pid);if(!p)return;
  const selected=new Map(p.members.map(m=>[m.id,m]));
  projectRecords(p).forEach(r=>{r.members=(r.members||[]).filter(m=>selected.has(m.id)).map(m=>({...m,role:selected.get(m.id).role}));});
  p.directCollabMembers=p.directCollabMembers.filter(m=>selected.has(m.id)).map(m=>({...m,role:selected.get(m.id).role}));
  collabRecords=collabRecords.filter(r=>r.projectId!==pid||r.members.some(m=>m.role!=='owner'));
  rebuildProjectMembers(p);
}
function navigate(next, options = {}) {
  if(next==='visual')return notify('云图汇暂未开放');
  if(identity==='support'&&next==='spaces'){page='projects';render();return notify('技术支持账号不进入课题组管理');}
  if(identity==='support'&&['team','groups','members','spaces'].includes(next)){page='projects';search='';render();return notify('技术支持账号仅可查看项目列表与项目详情');}
  if(next==='members')next='team';
  // 旧成员入口沿用成员列表，课题组管理通过独立入口打开。
  if(!['projects','team','groups','spaces','detail','analysis-result'].includes(next))next='projects';
  if(next==='projects'&&next!==page){selectedProjectIds=collabDraftProjectIds.filter(id=>{const p=projects.find(x=>x.id===id);return p&&canConfigureCollaboration(p);});collabDraftProjectIds=[];listTab=personalProjects().some(p=>identity==='support'||p.type==='云分析')?'mine':sharedProjects().some(p=>identity==='support'||p.type==='云分析')?'shared':'mine';}
  if(options.projectTab&&next==='projects')listTab=options.projectTab==='shared'?'shared':'mine';
  if(['projects','team','groups'].includes(next))projectMenuOpen=true;
  page=next;search='';resetProjectSearch();render();window.scrollTo({top:0,behavior:'instant'});
}
// 项目详情的“协作列表”对所有能打开该项目详情的人可见：谁能进入项目，谁就看到同一份协作名单。
// 添加成员、调整角色、移除授权只对拥有项目管理权限的账号开放；支持人员不进协作名单，只在项目支持卡片中显示。
function canManageCollaborationMembers() { return page==='detail'&&canManageProjectMembers(project()); }
function projectMemberList() { return project().members; }
function openProjectDetail(id, recordId = null, origin = 'projects') {
  const target = projects.find(p => p.id === id);
  if (!target||!visibleProjects().some(p=>p.id===id))return notify('当前身份没有该项目的查看权限');
  const sourceTab=page==='projects'?listTab:projectAccessRole(target)?'mine':'shared';
  if(sourceTab==='mine'&&!projectAccessRole(target))return notify('当前账号未被邀请参与该项目');
  detailOrigin={page:origin==='spaces'?'spaces':'projects',listTab:sourceTab};
  activeProjectId = target.id;
  tab = 'data';filePath=[];selectedFileIds=[];
  navigate('detail');
}
function heading(title, subtitle, actions = '') { return `<div class="page-heading"><div><h1>${title}</h1>${subtitle?`<p>${subtitle}</p>`:''}</div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`; }
function emptyState(title, subtitle = '', action = '') { return `<div class="empty-icon">${icon('folder')}</div><strong>${title}</strong><p>${subtitle}</p>${action}`; }
function memberRoster(members, max = 5) { return members.length ? `<div class="roster">${members.slice(0,max).map(m=>`<span class="roster-item">${memberIdentity(person(m.id))}</span>`).join('')}${members.length>max?`<span class="more-count">+${members.length-max}</span>`:''}</div>` : '<span class="roster-empty">暂无成员</span>'; }
function searchField(id, label) { return `<label class="search-wrap">${icon('search')}<input id="${id}" type="search" placeholder="${label}" aria-label="${label}" value="${safe(search)}"></label>`; }
function tableFooter(count, noun='个项目') { return `<div class="table-footer"><span>共 ${count} ${noun}${count ? `，显示全部 ${count} 条` : ''}</span><div class="page-info"><span>全部记录</span><button disabled aria-label="上一页">‹</button><span class="page-chip">1</span><button disabled aria-label="下一页">›</button></div></div>`; }
function pageFoot(text) { return `<p class="list-foot">${icon('info')}${text}</p>`; }
function projectColumnSearch(id,label,value) {
  const open=openProjectSearch===id;
  return `<div class="project-search-control"><button type="button" class="project-search-toggle ${value?'is-active':''} ${open?'is-open':''}" data-project-search="${id}" aria-label="搜索${label}" aria-expanded="${open}" aria-controls="${id}Panel" title="搜索${label}${value?'：'+safe(value):''}">${icon('search')}</button><div class="project-column-search-panel" id="${id}Panel" ${open?'':'hidden'}><label class="project-column-search">${icon('search')}<input id="${id}" type="search" placeholder="搜索${label}" aria-label="搜索${label}" value="${safe(value)}" autocomplete="off"></label><button type="button" class="project-column-search-reset" data-clear-project-search="${id}">重置</button></div></div>`;
}
function closeProjectSearch() { const id=openProjectSearch;openProjectSearch=null;const panel=document.getElementById(id+'Panel');if(panel)panel.hidden=true;const button=main.querySelector(`[data-project-search="${id}"]`);if(button){button.setAttribute('aria-expanded','false');button.classList.remove('is-open');} }
function positionProjectSearch() {
  if(!openProjectSearch)return;
  const button=main.querySelector(`[data-project-search="${openProjectSearch}"]`),panel=document.getElementById(openProjectSearch+'Panel');if(!button||!panel)return;
  const rect=button.getBoundingClientRect(),width=panel.offsetWidth,height=panel.offsetHeight;
  panel.style.left=Math.max(16,Math.min(rect.right-width,innerWidth-width-16))+'px';
  const top=rect.bottom+height+8<=innerHeight?rect.bottom+8:rect.top-height-8;
  panel.style.top=Math.max(12,Math.min(top,innerHeight-height-12))+'px';
}
function resetProjectSearch() { projectTicketSearch='';projectCodeSearch='';openProjectSearch=null; }
function filteredProjects() { const ticket=projectTicketSearch.trim().toLowerCase(),code=projectCodeSearch.trim().toLowerCase(),source=listTab==='mine'?personalProjects():listTab==='shared'?sharedProjects():visibleProjects();return source.filter(p=>(identity==='support'||p.type==='云分析')&&String(p.ticket||'').toLowerCase().includes(ticket)&&String(p.code||'').toLowerCase().includes(code)); }

async function copyProjectTicket(id) {
  const value=projects.find(p=>p.id===id)?.ticket;if(!value)return;
  let copied=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true;}}catch{}
  if(!copied){const field=document.createElement('textarea');field.value=value;field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();}
  notify(copied?'开题单号已复制':'复制未成功，请手动选中开题单号复制');
}
function projectCell(p, i = 0) { return `<div class="project-title-cell"><span class="project-mark ${['','lavender','sand','blue'][i%4]}">${icon(p.id==='single-cell'?'grid':p.id==='visual'?'chart':'folder')}</span><div><button class="project-name" data-open-project="${safe(p.id)}">${safe(p.name.replace(/^测试示例-/,'').replace(/^测试示例—/,''))}</button><span class="project-code">${safe(p.code)}</span></div></div>`; }
function renderProjects() {
  const support=identity==='support',projectType='云分析',mine=listTab==='mine',inScope=p=>support||p.type===projectType;
  const scopedProjects=(mine?personalProjects():sharedProjects()).filter(inScope);
  const collaborationDemo=mine&&(scopedProjects.find(p=>p.id==='analysis'&&p.collab)||scopedProjects.find(p=>p.collab));
  const counts={mine:personalProjects().filter(inScope).length,shared:sharedProjects().filter(inScope).length};
  const tabs=[['mine',support?'协作项目':'派森诺项目'],['shared','共享项目']],list=filteredProjects();
  const showSelection=mine&&isManagementView()&&!isProjectSupportViewer(),selectedCount=selectedProjectIds.filter(id=>list.some(p=>p.id===id&&canConfigureCollaboration(p))).length;
  const identityNames={owner:'拥有者',manager:'管理者',collaborator:'协作者',visitor:'访问者'};
  const identityHints={owner:'拥有并管理项目，可发起和编辑协作。',manager:'管理项目、协作成员与分享，操作与项目拥有者一致。',collaborator:'受邀参与项目，具体操作按项目授权开放。',visitor:'受邀只读访问项目，不可分享或管理协作。'};
  const head=`<tr>${showSelection?'<th class="check-cell"><input type="checkbox" data-select-all-projects aria-label="全选当前可管理项目"></th>':''}<th class="ticket-column"><div class="project-column-heading"><span>开题单号</span>${projectColumnSearch('projectTicketSearch','开题单号',projectTicketSearch)}</div></th>${mine?'<th class="project-identity-column">项目身份</th>':''}<th class="contract-column">合同编号</th><th class="code-column"><div class="project-column-heading"><span>云平台项目编号</span>${projectColumnSearch('projectCodeSearch','云平台项目编号',projectCodeSearch)}</div></th><th class="name-column">项目名称</th><th class="category-column">所属类别</th><th class="created-column">创建时间</th><th class="status-column">状态</th>${mine?'<th class="project-actions-column">操作</th>':''}</tr>`;
  const rows=list.map(p=>{
    const state=collaborationState(p),editable=canManageProject(p)&&!isProjectSupportViewer(),relation=projectListIdentity(p);
    const actionLabel=state==='active'?'编辑协作':state==='cancelled'?'重新协作':'去协作';
    const stateLabel=state==='active'?'协作中':state==='cancelled'?'已取消协作':'未协作';
    const invite=projectRecords(p).find(r=>r.members.some(m=>m.id===currentUserId()));
    const inviter=person(invite?.initiatedBy||p.directCollabMembers.find(m=>m.id===currentUserId())?.invitedBy||p.members.find(m=>m.role==='owner')?.id||'owner-1').name;
    const actions=editable?`<div class="table-actions">${canConfigureCollaboration(p)?`<button class="btn primary small ${state==='active'?'project-action-done':''}" data-collab-one="${p.id}" title="${actionLabel}">${icon(state==='active'?'people':'link')}${actionLabel}</button>`:''}${projectSupportAction(p)}<button class="btn quiet small text-primary ${p.shared?'project-action-done':''}" data-share-project="${p.id}" title="${p.shared?'管理分享设置':'分享原始分析结果'}">${p.shared?'已分享':'分享'}</button>${state==='active'&&collaborationFeatures.cancel?`<button class="btn quiet small danger collab-cancel-button" data-cancel-collab="${p.id}">取消协作</button>`:''}</div>`:`<button class="btn quiet small" data-open-project="${p.id}">${icon('eye')}查看项目</button>`;
    return `<tr data-project-row="${p.id}" data-collaboration-state="${state}" class="${mine&&selectedProjectIds.includes(p.id)?'selected':''}">${showSelection?`<td class="check-cell"><input type="checkbox" data-select-project="${p.id}" ${selectedProjectIds.includes(p.id)?'checked':''} ${canConfigureCollaboration(p)?'':'disabled'} aria-label="选择 ${safe(p.name)}"></td>`:''}<td><div class="ticket-cell"><button class="ticket-link" data-open-project="${p.id}">${safe(p.ticket)}</button><button class="copy-ticket" data-copy-ticket="${p.id}" aria-label="复制开题单号 ${safe(p.ticket)}" title="复制开题单号">${icon('copy')}</button></div></td>${mine?`<td class="project-identity-column"><span class="project-identity-badge ${relation}" data-project-identity="${p.id}" title="${identityHints[relation]}">${icon(['owner','manager'].includes(relation)?'shield':relation==='visitor'?'eye':'people')}${identityNames[relation]}</span></td>`:''}<td class="contract-value">${safe(p.contract)}</td><td><span class="platform-code">${safe(p.code)}</span><span class="project-demo-tag">DEMO</span></td><td><button class="reference-project-name" data-open-project="${p.id}">${safe(p.name)}</button>${mine&&isReceivedProject(p)?`<span class="collab-project-group">邀请方：${safe(inviter)}</span>`:!mine?`<span class="collab-project-group">分享人：${safe(person(p.shareInitiatedBy||p.members.find(m=>m.role==='owner')?.id||'owner-1').name)}</span>`:''}</td><td class="reference-category">${safe(p.category)}</td><td class="reference-created">${safe(p.created)}</td><td><span class="reference-status">${safe(p.status)}</span></td>${mine?`<td class="project-actions-column">${actions}<span class="collab-state-text ${state}" data-collab-state-label="${p.id}">${stateLabel}</span>${p.supportAssignment?`<span class="project-support-label" data-project-support-label="${safe(p.id)}">${supportTypes[projectSupportPerson(p)?.supportType]||'项目支持'}：${safe(projectSupportPerson(p)?.name||'')}</span>`:''}</td>`:''}</tr>`;
  }).join('');
  const cols=mine?(showSelection?10:9):7;
  const bulk=mine&&isManagementView()&&!isProjectSupportViewer()&&manageableProjects().some(p=>inScope(p)&&canConfigureCollaboration(p));
  const description=identity==='support'?'展示指派给你支持的项目，可查看项目详情与协作成员；成员与角色由项目拥有者维护。':'拥有与受邀项目统一展示，项目身份以当前账号在该项目中的授权为准。';
  return `<div class="page" data-screen-label="项目列表">${heading(support?'项目协作':projectType,description,isProjectManagementView()?`<button class="btn ghost" data-nav="team">${icon('people')}成员管理</button>`:'')}
    <section class="surface"><div class="surface-top"><div class="list-tabs" role="tablist" aria-label="项目类型">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${listTab===key}" class="${listTab===key?'active':''}" data-list-tab="${key}">${label}<span class="tab-count">${counts[key]}</span></button>`).join('')}</div><span class="surface-caption">${mine?'拥有者 / 管理者 / 协作者':'仅分享原始分析结果'}</span></div>
    ${bulk?`<div class="project-bulk-toolbar"><button class="btn primary toolbar-collab-action" data-collab-selected>${icon('link')}${selectedCount?`协作已选项目（${selectedCount}）`:'发起项目协作'}</button></div>`:''}
    <div class="project-reference-note">${icon('info')}<span>${mine?(support?'支持人员可查看项目数据与协作成员，发起协作、成员与角色调整、项目分享均由项目拥有者操作。':'拥有者可管理项目；协作者按授权参与。点击开题单号或项目名称查看详情。'):'此列表保留项目分享功能，仅查看原始分析结果，不显示协作角色。'}</span>${collaborationDemo?`<button class="btn quiet small text-primary" data-collaboration-demo="${safe(collaborationDemo.id)}">查看多人分析演示 →</button>`:''}</div>
    ${mine&&selectedCount?`<div class="selection-note">已选择 ${selectedCount} 个项目<button data-clear-projects>清空选择</button></div>`:''}
    <div class="table-shell project-table reference-project-table ${mine?'':'readonly-project-table'} ${support?'support-project-table':''}"><div class="table-scroll"><table><thead>${head}</thead><tbody>${rows||`<tr><td colspan="${cols}" class="empty-cell">${emptyState(mine?'暂无匹配的拥有或受邀项目':'暂无共享项目',mine?'只显示当前账号拥有或已受邀参与的项目，请尝试其他关键词。':'分享功能继续保留，可由项目拥有者邀请用户查看原始结果。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length)}</section>${pageFoot(support?'支持人员只查看项目：发起协作、添加成员、调整角色和项目分享由项目拥有者操作。':mine?'未协作可“去协作”，已协作可“编辑协作”；项目分享独立管理。':'共享项目只提供原始结果查看；项目协作与分享分别管理。')}</div>`;
}

function mySpaces() { const me=currentUserId();return groups.filter(g=>(g.ownerId||'owner-1')===me||g.members.some(m=>m.id===me)); }
function renderSpaces() {
  const me=currentUserId(),all=mySpaces(),joined=all.filter(g=>(g.ownerId||'owner-1')!==me),owned=all.filter(g=>(g.ownerId||'owner-1')===me);
  const ownTab=spaceTab==='owned',list=ownTab?owned:joined,q=search.trim().toLowerCase();
  const rows=list.filter(g=>`${g.name} ${person(g.ownerId||me).account||''} ${person(g.ownerId||me).name}`.toLowerCase().includes(q));
  const row=g=>{
    const owner=person(g.ownerId||me),mine=(g.ownerId||'owner-1')===me,invitedManager=!mine&&canEditGroupRoles(g),ownerAccount=owner.account||memberIdentifier(owner);
    return `<tr data-group-row="${safe(g.id)}"><td><div class="group-cell"><span class="group-emblem">${icon('people')}</span><div><strong>${safe(g.name)}</strong><small>${mine?'我创建的课题组':`由 ${safe(ownerAccount)} 邀请加入`}</small></div></div></td>${ownTab?'':`<td><span class="collab-sharer">${safe(ownerAccount)}${mine?'（我）':''}</span></td><td><span class="role-pill ${mine?'owner':invitedManager?'admin':'member'}">${icon(mine||invitedManager?'shield':'person')}${mine?'课题组所有者':invitedManager?'管理者':'受邀成员'}</span></td>`}<td>${memberRoster(g.members)}</td><td class="date-cell">${safe(mine?(g.createdAt||'-'):(g.invitedAt||'-'))}</td><td>${mine?`<div class="table-actions group-actions"><button class="btn primary small" data-group-add-member="${safe(g.id)}">${icon('plus')}添加成员</button><button class="btn quiet small" data-group-members="${safe(g.id)}">编辑成员</button>${groupDeleteButton(g)}</div>`:invitedManager?`<button type="button" class="btn primary small" data-group-roles="${safe(g.id)}">修改角色</button>`:'<span class="fixed">—</span>'}</td></tr>`;
  };
  return `<div class="page" data-screen-label="课题组管理">${heading('课题组管理','这里汇总你参与过的课题组：别人邀请你加入的，以及你邀请别人加入的。')}
    <div class="team-management-tabs" role="tablist" aria-label="课题组管理分类"><button type="button" role="tab" data-space-tab="joined" class="${spaceTab==='joined'?'active':''}" aria-selected="${spaceTab==='joined'}">${icon('people')}受邀加入<span class="tab-count">${joined.length}</span></button><button type="button" role="tab" data-space-tab="owned" class="${spaceTab==='owned'?'active':''}" aria-selected="${spaceTab==='owned'}">${icon('shield')}我创建的<span class="tab-count">${owned.length}</span></button></div>
    <section class="surface"><div class="surface-top"><h2 class="surface-title">${spaceTab==='owned'?'我创建的课题组':'受邀加入的课题组'} <span class="tab-count">${rows.length}</span></h2><span class="surface-caption">成员增删由创建者维护，受邀管理者仅可修改角色</span></div><div class="toolbar">${searchField('spaceSearch','搜索课题组名称或所有者')}${identity!=='support'?`<button class="btn" data-create-group>${icon('plus')}创建课题组</button>`:''}</div><div class="table-shell space-table ${ownTab?'owned-space-table':'joined-space-table'}"><div class="table-scroll"><table><thead><tr><th>课题组</th>${ownTab?'':'<th>课题组所有者</th><th>我的身份</th>'}<th>成员名单</th><th>${spaceTab==='owned'?'创建时间':'加入时间'}</th><th>操作</th></tr></thead><tbody>${rows.map(row).join('')||`<tr><td colspan="${ownTab?4:6}" class="empty-cell">${emptyState(spaceTab==='owned'?'你还没有创建课题组':'还没有课题组邀请你','在课题组管理里创建课题组，或等待同事把课题组的协作邀请发给你。')}</td></tr>`}</tbody></table></div></div>${tableFooter(rows.length,'个课题组')}</section>${pageFoot('我创建的课题组可添加成员、编辑成员和删除课题组；受邀课题组由课题组所有者维护，管理者仅可修改成员角色。技术支持账号不进入课题组管理。')}</div>`;
}
function renderGroups() {
  const q = search.trim().toLowerCase();
  const mine=groups.filter(g=>(g.ownerId||'owner-1')===currentUserId());
  const list = mine.filter(g=>`${g.name} ${g.members.map(m=>person(m.id).name).join(' ')}`.toLowerCase().includes(q));
  return `<div class="page group-management-page" data-screen-label="课题组列表">${heading('课题组管理','把志同道合的人聚在一起，让每一次协作更高效。',`<button class="btn" data-nav="team">${icon('back')}返回成员列表</button><button class="btn primary" data-create-group ${!canManageGroups()?'disabled':''}>${icon('plus')}添加课题组</button>`)}
    <section class="surface"><div class="surface-top"><h2 class="surface-title">我的课题组 <span class="tab-count">${mine.length}</span></h2><span class="surface-caption">一个课题组，一次专注的探索</span></div><div class="toolbar">${searchField('groupSearch','搜索课题组名称或成员')}<span class="small-count">共 ${list.length} 个课题组</span></div>
    <div class="table-shell group-table"><div class="table-scroll"><table><thead><tr><th>课题组</th><th>成员名单</th><th class="table-actions-column">操作</th></tr></thead><tbody>${list.map(g=>`<tr><td><div class="group-cell"><span class="group-emblem">${icon('people')}</span><div><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员 · 科研协作</small></div></div></td><td>${memberRoster(g.members)}</td><td><div class="table-actions group-actions"><button class="btn primary small" data-group-add-member="${g.id}" ${!canManageGroups()?'disabled':''}>${icon('plus')}添加成员</button><button class="btn quiet small" data-group-members="${g.id}" ${!canManageGroups()?'disabled':''}>编辑成员</button>${groupDeleteButton(g)}</div></td></tr>`).join('')||`<tr><td colspan="3" class="empty-cell">${emptyState('还没有课题组','点击“添加课题组”，邀请成员一起探索。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'个课题组')}</section></div>`;
}
function renderTeam() { return identity==='support'?renderProjects():renderMemberDirectory(); }
function renderMemberDirectory() {
  const q=search.trim().toLowerCase();
  const list=memberDirectoryForViewer().filter(d=>!isSupportPerson(d)&&!isDirectoryOwner(d.id)&&accountSearchText(d).includes(q));
  return `<div class="page member-directory-page" data-screen-label="成员列表">${heading('成员管理','',`<button class="btn" data-create-group>${icon('plus')}添加课题组</button><button class="btn primary" data-add-directory ${!canManageGroups()?'disabled':''}>${icon('plus')}添加成员</button>`)}
    <section class="surface"><div class="surface-top"><h2 class="surface-title">所有成员 <span class="tab-count">${list.length}</span></h2><span class="surface-caption">云平台账号信息</span></div><div class="toolbar">${searchField('memberSearch',isEnglishVersion?'Search username, email or remark':'搜索用户名、手机号、邮箱或成员别称')}<span class="small-count">共 ${list.length} 位成员</span></div>
    <div class="table-shell directory-table"><div class="table-scroll"><table><thead><tr><th>${isEnglishVersion?'Username / Email':'用户名 / 邮箱 / 手机号'}</th><th>成员别称</th><th class="directory-actions-column">操作</th></tr></thead><tbody>${list.map(d=>`<tr data-directory-member="${safe(d.id)}"><td class="member-account">${safe(memberIdentifier(d))}</td><td class="member-remark-cell">${safe(memberRemark(d))}</td><td class="directory-actions-column"><div class="directory-row-actions">${canEditMemberAlias(d.id)?`<button class="btn quiet small" data-edit-member-alias="${safe(d.id)}">修改别称</button>`:''}<button class="btn quiet small danger" data-remove-directory="${safe(d.id)}" ${!canRemoveDirectoryPerson(d.id)?'disabled':''} title="${isDirectoryOwner(d.id)?'项目所有者不可移除':'从成员库移除，并收回可管理的课题组与项目关联'}" aria-label="移除成员${safe(memberIdentifier(d))}">移除成员</button></div></td></tr>`).join('')||`<tr><td colspan="3" class="empty-cell">${emptyState('未找到匹配的成员','试试其他用户名、手机号、邮箱或成员别称。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'位成员')}</section>${pageFoot(identity==='manager'?'移除成员会收回你可管理的课题组与项目关联；受邀课题组中的成员关系和授权保留。':'移除成员会同步退出其所在课题组与协作项目；不删除对方的云平台账号。')}</div>`;
}
function renderDetail() {
  const p=project();
  return `<div class="page project-detail-page" data-screen-label="项目详情"><button class="back-link" data-back-project-list>${icon('back')}返回${detailOrigin.page==='spaces'?'课题组管理':{mine:identity==='support'?'协作项目':'派森诺项目',shared:'共享项目',collab:'协作项目'}[detailOrigin.listTab]+'列表'}</button>
    <section class="reference-detail-summary"><div class="reference-detail-title"><span class="detail-project-icon">${icon(p.type==='云图汇'?'chart':'folder')}</span><div><h1>${safe(p.name)}</h1><span class="reference-detail-status">状态：${safe(p.status)}</span></div></div>
    <dl><dt>开题单号</dt><dd><span class="ticket-cell"><span class="ticket-link">${safe(p.ticket)}</span><button class="copy-ticket" data-copy-ticket="${p.id}" aria-label="复制开题单号 ${safe(p.ticket)}">${icon('copy')}</button></span></dd></dl><dl><dt>合同号</dt><dd>${safe(p.contract)}</dd></dl><dl><dt>云平台项目编号</dt><dd>${safe(p.code)}</dd></dl><button class="btn primary detail-result-button" data-show-result>查看结果</button></section>
    ${renderProjectSupport(p)}
    <div class="detail-download-banner"><span>下载派森诺云盘，一键下载全部项目数据。</span><button class="btn" data-cloud-download>${icon('download')}下载派森诺云盘</button></div>
    ${detailOrigin.listTab==='shared'?`<div class="shared-detail-context">分享人：${safe(person(p.shareInitiatedBy||p.members.find(m=>m.role==='owner')?.id||'owner-1').name)}<span>仅查看原始分析结果</span></div>`:''}
    <section class="surface project-detail-content">${renderProjectFiles(p)}</section></div>`;
}
function currentProjectFiles() { return project().files.filter(f=>(f.parentId||null)===(filePath.at(-1)||null)); }
function renderProjectFiles(p) {
  const files=currentProjectFiles();
  return `<div class="project-file-manager"><div class="data-toolbar"><button class="btn" data-delete-selected-files ${!canManage()||!selectedFileIds.length?'disabled':''}>${icon('trash')}删除${selectedFileIds.length?`（${selectedFileIds.length}）`:''}</button><button class="btn text-primary" data-create-folder ${!canManage()?'disabled':''}>${icon('folder')}新建文件夹</button><span class="file-demo-note">示例文件操作，保存在当前浏览器</span></div>
    <nav class="file-breadcrumb" aria-label="文件目录"><button data-file-path="-1">根目录</button>${filePath.map((id,i)=>`<span>›</span><button data-file-path="${i}">${safe(p.files.find(f=>f.id===id)?.name||'文件夹')}</button>`).join('')}</nav>
    <div class="table-shell project-file-table"><div class="table-scroll"><table><thead><tr><th class="check-cell"><input type="checkbox" data-select-all-files aria-label="全选当前目录文件" ${files.length&&files.every(f=>selectedFileIds.includes(f.id))?'checked':''}></th><th>文件名称</th><th>大小</th><th>项目分析时间</th><th>创建者</th><th>操作</th></tr></thead><tbody>${files.map(f=>`<tr><td class="check-cell"><input type="checkbox" data-select-file="${safe(f.id)}" ${selectedFileIds.includes(f.id)?'checked':''} aria-label="选择文件夹 ${safe(f.name)}"></td><td><button class="file-folder-name" data-open-folder="${safe(f.id)}">${icon('folder')}${safe(f.name)}</button></td><td>—</td><td class="date-cell">${safe(f.createdAt)}</td><td>${safe(f.creator)}</td><td><button class="btn quiet small danger" data-delete-file="${safe(f.id)}" ${!canManage()?'disabled':''}>删除</button></td></tr>`).join('')||`<tr><td colspan="6" class="empty-cell">${emptyState('暂无数据','可新建文件夹，整理项目分析数据。')}</td></tr>`}</tbody></table></div></div>${tableFooter(files.length,'项')}</div>`;
}
function render() {
  if(identity==='support'&&['team','groups'].includes(page))page='projects';
  if(!['projects','team','groups','spaces','detail','analysis-result'].includes(page))page='projects';
  if(!['projects','spaces'].includes(detailOrigin.page))detailOrigin.page='projects';
  if(page==='analysis-result'){
    const p=project();
    if(!visibleProjects().some(item=>item.id===p.id)){page='projects';}
    else {
      AnalysisResult.mount({project:p,viewer:{...person(currentUserId()),id:currentUserId(),projectRole:projectAccessRole(p)},participants:p.members.map(member=>({...person(member.id),id:member.id,projectRole:member.role})),getMemberRemark:id=>memberRemark(person(id)),canRenameRecords:p.collab===true,canSubmit:detailOrigin.listTab!=='shared'&&['owner','admin','member'].includes(projectAccessRole(p)),canManageRecords:canManageProject(p),onViewerChange:switchAnalysisViewer,onBack:backFromAnalysis});
      return;
    }
  }
  AnalysisResult.unmount();
  renderRolePreview();
  if(listTab==='collab')listTab='mine';
  if(page==='detail'&&((detailOrigin.listTab==='mine'&&!projectAccessRole(project()))||(detailOrigin.listTab==='shared'&&!sharedProjects().some(p=>p.id===activeProjectId)))){page=detailOrigin.page;listTab='mine';tab='data';search='';}
  const viewer=person(currentUserId());
  document.querySelector('.side-user strong').textContent=viewer.name;
  document.body.classList.remove('reference-mode');
  const renderers={projects:renderProjects,team:renderTeam,groups:renderGroups,spaces:renderSpaces,detail:renderDetail};
  const projectScroll=main.querySelector('[data-screen-label="项目列表"] .table-scroll')?.scrollLeft||0;
  main.innerHTML=(renderers[page]||renderProjects)();
  if(page==='projects'){main.querySelector('.table-scroll').scrollLeft=projectScroll;positionProjectSearch();}
  const labels={projects:identity==='support'?'项目协作':'云分析',team:'成员管理',groups:'课题组管理',spaces:'课题组管理',detail:'项目详情'};
  const navPage=page==='detail'?'projects':page;
  const nested=['projects','team','groups','spaces'].includes(navPage);
  document.getElementById('crumb').innerHTML=`工作课题组 <span>/</span> ${nested?(identity==='support'?'项目管理 <span>/</span> ':'项目列表 <span>/</span> '):''}<strong>${labels[navPage]||'项目列表'}</strong>${page==='detail'?`<span>/</span>${{mine:identity==='support'?'协作项目':'派森诺项目',shared:'共享项目',collab:'协作项目'}[detailOrigin.listTab]}<span>/</span>${safe(project().name.replace(/^测试示例-/,''))}`:''}`;
  document.querySelectorAll('[data-nav]').forEach(n=>{const active=n.dataset.nav===(navPage==='groups'?'team':navPage);n.classList.toggle('active',active);if(n.closest('.side-nav')){if(active)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');}});
  const menu=document.getElementById('projectSubnav'),menuButton=document.querySelector('[data-project-menu]');
  menu.hidden=!projectMenuOpen;menuButton.setAttribute('aria-expanded',String(projectMenuOpen));menuButton.classList.toggle('directory-active',nested);
  document.getElementById('navProjectCount').textContent=visibleProjects().length;
  const selectAll=main.querySelector('[data-select-all-projects]');
  if(selectAll){const list=filteredProjects().filter(canConfigureCollaboration);const count=list.filter(p=>selectedProjectIds.includes(p.id)).length;selectAll.checked=!!list.length&&count===list.length;selectAll.indeterminate=count>0&&count<list.length;selectAll.disabled=!list.length;}
}
function modalFrame(title, subtitle, body, footer, wide=false) {
  if(modalRoot.hidden) returnFocus=document.activeElement;
  document.querySelector('.app-shell').inert=true;
  document.body.style.overflow='hidden';
  modalRoot.hidden=false;
  const modalClass=modal?.type==='collab'?'collaboration-modal':modal?.type==='group-create'?'group-create-modal':['add','directory-add','member-alias-edit'].includes(modal?.type)?'member-account-modal':modal?.type==='group-members'||modal?.type==='group-roles'||modal?.type==='group-add-members'?'group-members-modal':'';
  modalRoot.innerHTML=`<div class="modal ${wide?'modal-wide':''} ${modalClass}" role="dialog" aria-modal="true" aria-label="${safe(title)}"><div class="modal-head"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="modal-close" data-close aria-label="关闭">×</button></div><div class="modal-body">${body}</div><div class="modal-foot">${footer}</div></div>`;
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

function rolesRadio(selected='member') {
  const names=isEnglishVersion?{admin:'Administrator',member:'Member'}:roleNames;
  const descriptions=isEnglishVersion?{admin:'Manage members and permissions within the project.',member:'Run analyses and use authorized project data.'}:roleDescriptions;
  return `<div class="role-choices">${memberRoles.map(r=>`<label class="role-option ${r}"><input type="radio" name="role" value="${r}" ${selected===r?'checked':''}><span class="role-icon">${icon(roleIcons[r])}</span><span><strong>${names[r]}</strong><small>${descriptions[r]}</small></span></label>`).join('')}</div>`;
}
function openAdd(target='project',groupId=null) { if(target==='project'?!canManageCollaborationMembers():!canEditGroupMembers(group(groupId)))return notify('当前角色不能添加成员');modal={type:'add',target,groupId,lookupKey:'account',lookupValue:'',remark:'',error:''};showModal(); }
function openGroupCreate(parent=null) { if(!canManageGroups()) return notify('当前角色不能添加课题组'); modal={type:'group-create',name:'',members:[],memberQuery:'',pickerOpen:false,error:'',memberError:'',parent,parentFocus:'[data-new-collab-group]'}; showModal(); }
function groupCollabRecords(g) { return collabRecords.filter(r=>r.groupId===g.id||r.groupName===g.name); }
function canEditGroupMembers(g) { return !!g&&canManageGroups()&&(g.ownerId||'owner-1')===currentUserId(); }
function canEditGroupRoles(g) { return canEditGroupMembers(g)||!!g&&identity==='manager'&&(g.ownerId||'owner-1')!==currentUserId()&&g.members.some(m=>m.id===currentUserId()&&m.role==='admin'); }
function canDeleteGroup(g) { return canEditGroupMembers(g); }
function canRemoveDirectoryPerson(id) { return canManage()&&!isDirectoryOwner(id); }
function groupDeleteButton(g) { return canDeleteGroup(g)?`<button type="button" class="btn quiet small danger" data-delete-group="${safe(g.id)}" aria-label="删除课题组${safe(g.name)}">删除课题组</button>`:''; }
function groupDeletionRecords(g) { return collabRecords.filter(r=>r.groupId===g.id||(!r.groupId&&r.groupName===g.name)); }
function openGroupDelete(id) {
  const g=group(id);if(!canDeleteGroup(g))return notify('只有课题组创建者可以删除该课题组');
  modal={type:'group-delete',groupId:g.id};showModal();
}
function showGroupDeleteModal() {
  const g=group(modal.groupId);if(!canDeleteGroup(g))return closeModal();
  const affected=[...new Set(groupDeletionRecords(g).map(r=>r.projectId))].map(id=>projects.find(p=>p.id===id)).filter(Boolean);
  const body=`<p class="group-delete-target">确定删除课题组「<strong>${safe(g.name)}</strong>」吗？</p><p class="group-delete-members">课题组共有 ${g.members.length} 位成员。</p>${affected.length?`<div class="confirm-warning"><strong>将收回通过本课题组授予的 ${affected.length} 个项目的协作权限：</strong><ul class="group-delete-projects">${affected.map(p=>`<li>${safe(p.name)}</li>`).join('')}</ul></div>`:'<div class="confirm-warning">本课题组尚未关联协作项目。</div>'}<p class="member-library-note">删除后，课题组及其项目授权关联将被移除；成员库、项目数据、分析记录，以及直接邀请或其他课题组授予的权限均保留。此操作无法撤销。</p>`;
  modalFrame('删除课题组','仅课题组创建者可以执行此操作。',body,'<button class="btn" data-close>取消</button><button class="btn danger" data-confirm-delete-group>确认删除</button>');
}
function confirmGroupDelete() {
  if(modal?.type!=='group-delete')return;
  const g=group(modal.groupId);if(!canDeleteGroup(g)){closeModal();return notify('只有课题组创建者可以删除该课题组');}
  const records=new Set(groupDeletionRecords(g)),projectIds=new Set([...records].map(r=>r.projectId));
  collabRecords=collabRecords.filter(r=>!records.has(r));
  groups=groups.filter(item=>item.id!==g.id);
  deletedGroupIds=[...new Set([...deletedGroupIds,g.id])];
  projectIds.forEach(id=>{const p=projects.find(item=>item.id===id);if(p)rebuildProjectMembers(p);});
  if(collaborationGroupPresetId===g.id)collaborationGroupPresetId=null;
  saveAll();closeModal();render();notify(`课题组「${g.name}」已删除`);
}
function groupMemberProjects(g,id) { return [...new Set(groupCollabRecords(g).filter(r=>(r.members||[]).some(m=>m.id===id)).map(r=>r.projectId))]; }
function openGroupMembers(id) {
  if(!canManageGroups())return notify('当前角色不能管理课题组成员');
  const g=group(id);if(!g)return notify('未找到该课题组');
  if(!canEditGroupMembers(g)){if(canEditGroupRoles(g))return openGroupRoles(id);return notify('仅课题组创建者可增删成员');}
  modal={type:'group-members',groupId:g.id,pendingRemovals:[]};showModal();
}
function showGroupMembersModal() {
  const g=group(modal.groupId);if(!canEditGroupMembers(g))return closeModal();
  const projectIds=[...new Set(groupCollabRecords(g).map(r=>r.projectId))];
  const pending=modal.pendingRemovals||[];
  const rows=g.members.map((m,i)=>{const u=person(m.id),affected=groupMemberProjects(g,m.id),stage=pending.find(x=>x.memberId===m.id);
    const note=stage?`待移除 · 保存后同时退出 ${stage.affected.length} 个协作项目`:(affected.length?`已协作 ${affected.length} 个项目`:'未参与项目协作');
    const action=stage?`<button type="button" class="btn quiet small" data-undo-group-member="${safe(m.id)}" aria-label="撤销移除${safe(u.name)}">撤销</button>`:`<button type="button" class="btn quiet small danger" data-remove-group-member="${safe(m.id)}" aria-label="从课题组移除${safe(u.name)}">移除</button>`;
    const role=`<select class="group-role-select" data-group-member-role="${safe(m.id)}" ${stage?'disabled':''} aria-label="设置${safe(u.name)}的课题组角色">${memberRoles.map(role=>`<option value="${role}" ${m.role===role?'selected':''}>${roleNames[role]}</option>`).join('')}</select>`;
    return `<div class="share-user-row ${stage?'pending-removal':''}" data-group-member-row="${safe(m.id)}"><div class="share-user-meta">${memberIdentity(u)}<span class="group-member-projects">${note}</span></div>${role}${action}</div>`;}).join('');
  modalFrame('编辑课题组成员',`「${safe(g.name)}」共 ${g.members.length} 位成员${pending.length?` · 待移除 ${pending.length} 位`:''}`,
    `<section class="share-recipients" aria-label="课题组成员名单"><div class="share-list-heading"><h3>成员名单</h3><span>${projectIds.length?`本课题组已协作 ${projectIds.length} 个项目`:'本课题组暂未协作项目'}</span></div><div class="share-user-list group-member-list">${rows||`<div class="share-empty">${icon('people')}<span>课题组暂无成员</span><small>课题组成员在添加课题组时确定</small></div>`}</div></section><p class="member-library-note">可在此调整成员角色并移除成员；移除后，TA 通过本课题组获得的项目协作权限会同时收回。点击“保存”后一起生效，点击“取消”则全部保持不变。</p>`,
    `<button class="btn" data-close>取消</button><button class="btn primary" data-save-group-members>保存</button>`);
}
function openGroupMemberRemove(groupId,memberId) {
  const g=group(groupId);if(!canEditGroupMembers(g)||modal?.type!=='group-members')return;
  if(!g.members.some(m=>m.id===memberId))return notify('该成员已不在课题组名单中');
  modal={type:'group-member-remove',groupId,memberId,parent:modal,parentFocus:`[data-remove-group-member="${memberId}"]`};showModal();
}
function showGroupMemberRemoveModal() {
  const g=group(modal.groupId);if(!canEditGroupMembers(g))return closeModal();
  const u=person(modal.memberId);
  const affected=groupMemberProjects(g,modal.memberId).map(id=>projects.find(p=>p.id===id)).filter(Boolean);
  const left=g.members.length-(modal.parent?.pendingRemovals||[]).length-1;
  const body=`<div class="directory-remove-person"><div>${memberIdentity(u)}</div></div><p class="group-member-remove-target">将从课题组「${safe(g.name)}」移除${left===0?'，移除后该课题组暂无成员':''}</p>${affected.length?`<div class="group-member-impact">${icon('folder')}<div><strong>TA 通过本课题组已获得 ${affected.length} 个项目的协作权限</strong><p>${affected.map(p=>safe(p.name.replace(/^测试示例-/,''))).join('、')}</p><p class="group-member-remove-effect">移除后，TA 同时退出这 ${affected.length} 个项目的协作；直接邀请与其他课题组授予的权限不受影响。</p></div></div>`:'<div class="confirm-warning">TA 没有通过本课题组获得项目协作权限，移除只影响课题组名单。</div>'}`;
  modalFrame('移除课题组成员','确认后标记移除，点击“保存”才生效',body,'<button class="btn" data-close>返回</button><button class="btn danger" data-confirm-group-member-remove>确认移除</button>');
}
function confirmGroupMemberRemove() {
  if(!canManageGroups()||modal?.type!=='group-member-remove')return closeModal();
  const g=group(modal.groupId),id=modal.memberId,parent=modal.parent;if(!canEditGroupMembers(g)||!parent)return closeModal();
  const affected=groupMemberProjects(g,id);
  parent.pendingRemovals=(parent.pendingRemovals||[]).filter(x=>x.memberId!==id);
  parent.pendingRemovals.push({memberId:id,affected});
  modal=parent;showModal();
  notify(affected.length?`已标记移除 ${person(id).name}，保存后同时退出 ${affected.length} 个协作项目`:`已标记移除 ${person(id).name}`);
}
function undoGroupMemberRemoval(id) {
  if(!canManageGroups()||modal?.type!=='group-members'||!canEditGroupMembers(group(modal.groupId)))return;
  modal.pendingRemovals=(modal.pendingRemovals||[]).filter(x=>x.memberId!==id);
  showGroupMembersModal();notify(`${person(id).name} 已恢复，仍留在课题组名单中`);
}
function saveGroupMembers() {
  if(!canManageGroups()||modal?.type!=='group-members')return closeModal();
  const g=group(modal.groupId);if(!canEditGroupMembers(g))return closeModal();
  const pending=modal.pendingRemovals||[];
  const roleChanges=[];
  modalRoot.querySelectorAll('[data-group-member-role]').forEach(select=>{
    const id=select.dataset.groupMemberRole,m=g.members.find(x=>x.id===id);
    if(m&&!pending.some(x=>x.memberId===id)&&memberRoles.includes(select.value)&&select.value!==m.role)roleChanges.push({id,role:select.value});
  });
  if(!pending.length&&!roleChanges.length){closeModal();render();return notify('课题组没有变化');}
  const revoked=new Set();
  roleChanges.forEach(({id,role})=>{
    const m=g.members.find(x=>x.id===id);if(!m)return;
    m.role=role;
    groupCollabRecords(g).forEach(r=>{const rm=(r.members||[]).find(x=>x.id===id);if(rm)rm.role=role;});
    groupMemberProjects(g,id).forEach(pid=>{const p=projects.find(x=>x.id===pid);if(p){rebuildProjectMembers(p);revoked.add(pid);}});
  });
  pending.forEach(({memberId,affected})=>{
    g.members=g.members.filter(m=>m.id!==memberId);
    if(!affected.length)return;
    groupCollabRecords(g).forEach(r=>{r.members=(r.members||[]).filter(m=>m.id!==memberId);});
    collabRecords=collabRecords.filter(r=>!(r.groupId===g.id||r.groupName===g.name)||(r.members||[]).some(m=>m.role!=='owner'));
    affected.forEach(pid=>{const p=projects.find(x=>x.id===pid);if(p){rebuildProjectMembers(p);revoked.add(pid);}});
  });
  const groupDeleted=!g.members.length;
  if(groupDeleted){groups=groups.filter(x=>x.id!==g.id);deletedGroupIds=[...new Set([...deletedGroupIds,g.id])];}
  saveAll();modal=null;closeModal();render();
  notify(groupDeleted?`已保存：课题组「${g.name}」没有成员，已自动删除`:`已保存：${roleChanges.length?`${roleChanges.length} 位成员角色已更新`:''}${roleChanges.length&&pending.length?'；':''}${pending.length?`${pending.length} 位成员移出课题组${revoked.size?`，并退出 ${revoked.size} 个协作项目`:''}`:''}`);
}
function openGroupAddMember(id) {
  if(!canManageGroups())return notify('当前角色不能添加课题组成员');
  const g=group(id);if(!canEditGroupMembers(g))return notify('仅课题组创建者可添加成员');
  modal={type:'group-add-members',groupId:g.id,selectedIds:[],memberQuery:'',pickerOpen:true};showModal();
}
function directoryPickerOptions() {
  const q=accountValue(modal.memberQuery);
  // 只读取成员管理列表，项目所有者、支持人员与当前账号不进入课题组名单。
  const people=memberDirectoryForViewer().filter(d=>d.id!=='owner-1'&&d.id!==currentUserId()&&!isSupportPerson(d)&&accountSearchText(d).includes(q));
  const g=group(modal.groupId);
  return people.map(d=>{
    const joined=g?.members.some(m=>m.id===d.id),selected=modal.selectedIds.includes(d.id);
    return `<label class="group-member-option ${joined?'is-joined':''}"><input type="checkbox" data-pick-directory-member="${safe(d.id)}" ${selected?'checked':''} ${joined?'disabled':''}><span>${memberIdentity(d)}</span>${joined?'<span class="lookup-conflict">已在课题组</span>':''}</label>`;
  }).join('')||'<div class="picker-empty">成员管理列表暂无匹配成员，请先在成员管理中添加。</div>';
}
function showGroupAddMemberModal() {
  const g=group(modal.groupId);if(!canEditGroupMembers(g))return closeModal();
  const options=directoryPickerOptions();
  modalFrame('添加课题组成员','仅可从成员管理列表选择，默认以“成员”身份加入。',
    `<div class="group-search-picker"><div class="group-search-control">${icon('search')}<input id="groupAddMemberSearch" type="search" autocomplete="off" placeholder="搜索姓名、用户名、手机号或邮箱" value="${safe(modal.memberQuery)}"><button type="button" class="group-picker-toggle" data-toggle-directory-picker aria-label="展开或收起成员选项">⌄</button></div><div class="group-member-dropdown" id="directoryMemberDropdown" ${modal.pickerOpen?'':'hidden'}><div id="directoryMemberOptions" class="group-member-options">${options}</div></div></div><p class="member-library-note">已选 <b>${modal.selectedIds.length}</b> 位成员；已在课题组成员不可重复选择。</p>`,
    '<button class="btn" data-close>取消</button><button class="btn primary" data-save-group-add-members>添加</button>',true);
  document.getElementById('groupAddMemberSearch')?.focus({preventScroll:true});
}
function confirmGroupAddMembers() {
  if(!canManageGroups()||modal?.type!=='group-add-members')return closeModal();
  const g=group(modal.groupId);if(!canEditGroupMembers(g))return closeModal();
  const added=modal.selectedIds.filter(id=>memberDirectoryForViewer().some(u=>u.id===id)&&!g.members.some(m=>m.id===id));
  if(!added.length)return notify('请选择要添加的成员');
  added.forEach(id=>{ensureDirectoryPerson(id);g.members.push({id,role:'member'});});
  saveAll();modal=null;closeModal();render();notify(`已添加 ${added.length} 位成员`);
}
function openGroupRoles(id) {
  if(!canManageGroups())return notify('当前角色不能修改课题组成员角色');
  const g=group(id);if(!canEditGroupRoles(g))return notify('当前账号无权修改该课题组角色');
  modal={type:'group-roles',groupId:g.id};showModal();
}
function showGroupRolesModal() {
  const g=group(modal.groupId);if(!canEditGroupRoles(g))return closeModal();
  const rows=g.members.map((m,i)=>{const u=person(m.id);
    return `<div class="share-user-row group-role-row"><div class="share-user-meta">${memberIdentity(u)}</div><select class="group-role-select" data-group-role-edit="${safe(m.id)}" aria-label="设置${safe(u.name)}的课题组角色">${memberRoles.map(role=>`<option value="${role}" ${m.role===role?'selected':''}>${roleNames[role]}</option>`).join('')}</select></div>`;
  }).join('')||`<div class="share-empty">${icon('people')}<span>课题组暂无成员</span></div>`;
  modalFrame('修改课题组成员角色',`「${safe(g.name)}」共 ${g.members.length} 位成员`,`<section class="share-recipients" aria-label="课题组成员角色"><div class="share-list-heading"><h3>成员角色</h3><span>仅可调整成员角色</span></div><div class="share-user-list group-role-list">${rows}</div></section><p class="member-library-note">受邀管理者仅可调整成员角色，不能添加、移除成员或删除课题组。保存仅更新课题组默认角色，项目中已单独设置的角色保持不变。</p>`,'<button class="btn" data-close>取消</button><button class="btn primary" data-save-group-roles>保存</button>',true);
}
function saveGroupRoles() {
  if(!canManageGroups()||modal?.type!=='group-roles')return closeModal();
  const g=group(modal.groupId);if(!canEditGroupRoles(g))return closeModal();
  let changed=0;
  modalRoot.querySelectorAll('[data-group-role-edit]').forEach(select=>{
    const m=g.members.find(x=>x.id===select.dataset.groupRoleEdit);
    if(m&&memberRoles.includes(select.value)&&m.role!==select.value){m.role=select.value;changed++;}
  });
  if(!changed){closeModal();render();return notify('课题组角色没有变化');}
  saveAll();modal=null;closeModal();render();notify(`已更新 ${changed} 位成员的课题组角色`);
}
function openDirectoryAdd(parent=null) { if(!canManageGroups())return notify('当前角色不能添加成员');modal={type:'directory-add',lookupKey:'account',lookupValue:'',remark:'',error:'',parent,parentFocus:'#groupMemberSearch'};showModal(); }

const memberFieldIds={account:'memberAccount',phone:'memberPhone',email:'memberEmail'};
const memberFieldLabels={account:'用户名',phone:'手机号',email:'邮箱'};
function memberLookupValue(user,key) { return key==='email'&&!user.emailBound?'':accountValue(user[key]); }
function resolveMemberIdentifier(value,key) {
  const query=accountValue(value);
  if(!query)return {user:null,status:'empty'};
  const matches=platformAccounts.filter(user=>memberLookupValue(user,key)===query);
  return matches.length===1?{user:matches[0],status:'matched'}:{user:null,status:matches.length?'ambiguous':'unmatched'};
}
function showMemberAccountLookup(title) {
  modal.lookupKey=modal.lookupKey||'account';
  modal.memberFields=modal.memberFields||{account:'',phone:'',email:''};
  const example=demoPlatformAccounts.find(isRepeatableDemoAccount);
  const key=modal.lookupKey,id=memberFieldIds[key];
  const field=`<label class="field" id="${id}Field"><span class="field-label">${memberFieldLabels[key]}</span><input id="${id}" data-member-field="${key}" type="${key==='email'?'email':key==='phone'?'tel':'text'}" required aria-required="true" autocomplete="off" maxlength="100" value="${safe(modal.memberFields[key])}" placeholder="请输入${key==='email'?'已绑定邮箱':memberFieldLabels[key]}" aria-describedby="${id}Error"><span id="${id}Error" class="field-error">请填写${memberFieldLabels[key]}</span></label>`;
  modalFrame(title,'选择一种账号信息查找成员，账号信息必填，成员别称选填。',`<form id="memberAddForm" novalidate><label class="field" for="memberLookupType"><span class="field-label">查找方式</span><select id="memberLookupType" required aria-required="true" aria-label="选择用户名、手机号或邮箱">${Object.entries(memberFieldLabels).map(([key,label])=>`<option value="${key}" ${modal.lookupKey===key?'selected':''}>${label}</option>`).join('')}</select></label>${field}${memberRemarkField()}<div id="accountLookupError" class="inline-error" role="alert" ${modal.error?'':'hidden'}>${safe(modal.error||'')}</div><div class="demo-account-examples"><p class="demo-example-title">示例账号</p><button type="button" class="demo-example-chip" data-fill-member-example><span class="demo-example-meta"><strong>${safe(memberLookupValue(example,key))}</strong><small>点击填入${memberFieldLabels[key]}</small></span></button></div></form>`,'<button class="btn" data-close>取消</button><button type="submit" form="memberAddForm" class="btn primary">添加成员</button>');
  modalRoot.querySelector('[data-fill-member-example]').addEventListener('click',()=>{const input=document.getElementById(id);input.value=memberLookupValue(example,key);updateMemberLookup(input);document.getElementById('memberRemark')?.focus();});
  document.getElementById(memberFieldIds[modal.lookupKey])?.focus();
}
function clearMemberFieldError(input) { input?.closest('.field')?.classList.remove('invalid');input?.setAttribute('aria-invalid','false');modal.error='';const error=document.getElementById('accountLookupError');if(error)error.hidden=true; }
function memberFieldError(key,message) {
  const input=document.getElementById(memberFieldIds[key]);input?.closest('.field')?.classList.add('invalid');input?.setAttribute('aria-invalid','true');const error=document.getElementById(memberFieldIds[key]+'Error');if(error)error.textContent=message;
}
function lookupError(message,key=modal.lookupKey||'account') { modal.error=message;const el=document.getElementById('accountLookupError');if(el){el.textContent=message;el.hidden=false;}memberFieldError(key,message); }
function updateMemberLookup(input) {
  const key=input.dataset.memberField;modal.memberFields[key]=input.value;clearMemberFieldError(input);
  const result=resolveMemberIdentifier(input.value,key);if(!result.user)return;
  for(const other of Object.keys(memberFieldIds))if(other!==key)modal.memberFields[other]=memberLookupValue(result.user,other);
}
function validateMemberDetails() {
  const key=modal.lookupKey,value=document.getElementById(memberFieldIds[key])?.value.trim()||'';
  modal.memberFields[key]=value;
  let valid=true;
  if(!value){memberFieldError(key,'请填写'+memberFieldLabels[key]);valid=false;}
  if(key==='phone'&&value&&!/^\+?\d{6,15}$/.test(value)){memberFieldError(key,'请输入有效的手机号');valid=false;}
  if(key==='email'&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){memberFieldError(key,'请输入有效的邮箱');valid=false;}
  const remarkValid=validateMemberRemark();
  if(!valid||!remarkValid){modalRoot.querySelector('.field.invalid input')?.focus();return null;}
  const result=resolveMemberIdentifier(value,key);
  if(!result.user){lookupError(result.status==='ambiguous'?accountCopy.ambiguous:`未找到该${memberFieldLabels[key]}，请填写已有账号的完整信息。`,key);return null;}
  return result.user;
}


function memberRemarkField() {
  return `<label class="field member-remark-field" id="memberRemarkField"><span class="field-label">成员别称(选填)</span><input id="memberRemark" aria-required="false" value="${safe(modal.remark||'')}" maxlength="20" placeholder="请输入20个字符以内的成员别称" aria-describedby="memberRemarkHint"><span id="memberRemarkHint" class="member-contact-hint">最多20个字符</span><span class="field-error">成员别称不能超过20个字符。</span></label>`;
}
function validateMemberRemark() {
  const input=document.getElementById('memberRemark');
  modal.remark=(input?.value||'').trim();
  if(modal.remark.length>20){
    document.getElementById('memberRemarkField')?.classList.add('invalid');input?.setAttribute('aria-invalid','true');input?.focus();return false;
  }
  return true;
}
function memberDirectoryForViewer() { return identity==='manager'?directory.filter(u=>managerMemberIds.includes(u.id)):directory; }
function canEditMemberAlias(id) { return isProjectManagementView()&&memberDirectoryForViewer().some(u=>u.id===id&&!isSupportPerson(u)&&!isDirectoryOwner(u.id)); }
function updateMemberAlias(id,remark) {
  for(const collection of [directory,platformAccounts,demoMemberInstances])for(const u of collection)if(u.id===id){u.remark=remark;u.memberAliasDefined=true;}
}
function openMemberAliasEdit(id) {
  if(!canEditMemberAlias(id))return notify('仅项目拥有者和管理者可修改成员别称');
  modal={type:'member-alias-edit',id,remark:memberRemark(person(id))};showModal();
}
function showMemberAliasEditModal() {
  if(!canEditMemberAlias(modal.id))return closeModal();
  modalFrame('修改成员别称','保存后，各页面同步显示新的成员别称。',`<form id="memberAliasForm" novalidate><div class="member-alias-account"><span>账号</span><strong>${safe(memberIdentifier(person(modal.id)))}</strong></div>${memberRemarkField()}</form>`,'<button class="btn" data-close>取消</button><button class="btn primary" type="submit" form="memberAliasForm">保存</button>');
}
function saveMemberAlias() {
  if(modal?.type!=='member-alias-edit'||!canEditMemberAlias(modal.id))return closeModal();
  if(!validateMemberRemark())return;
  updateMemberAlias(modal.id,modal.remark);saveAll();closeModal();render();notify('成员别称已更新');
}
function managerAddCandidates() { return directory.filter(u=>!isSupportPerson(u)&&!isDirectoryOwner(u.id)&&u.id!==currentUserId()&&!managerMemberIds.includes(u.id)); }
function showManagerMemberAddModal() {
  const candidates=managerAddCandidates();
  modalFrame('添加成员','只能从项目拥有者成员列表中选择。',`<form id="managerMemberAddForm" novalidate><label class="field"><span class="field-label">选择成员</span><select id="managerMemberSelect" required aria-required="true"><option value="">请选择项目拥有者列表中的成员</option>${candidates.map(u=>`<option value="${safe(u.id)}">${safe(memberIdentifier(u))}${memberRemark(u)?' · '+safe(memberRemark(u)):''}</option>`).join('')}</select><span class="field-error">请选择项目拥有者列表中的成员</span></label>${candidates.length?'':'<p class="member-library-note">暂无可添加成员，请项目拥有者先在成员列表中添加。</p>'}</form>`,'<button class="btn" data-close>取消</button><button class="btn primary" type="submit" form="managerMemberAddForm">添加成员</button>');
}
function confirmManagerMemberAdd() {
  if(identity!=='manager'||modal?.type!=='directory-add')return;
  const id=document.getElementById('managerMemberSelect')?.value;
  const user=managerAddCandidates().find(u=>u.id===id);
  if(!user){document.getElementById('managerMemberSelect')?.closest('.field').classList.add('invalid');return;}
  managerMemberIds.push(id);const parent=modal.parent;saveAll();
  if(parent?.type==='group-create'){if(!parent.members.some(m=>m.id===id))parent.members.push({id,role:'member'});modal=parent;showGroupCreateModal();return notify('成员已添加并选入当前课题组');}
  search='';closeModal();render();notify('成员已添加');
}
function showDirectoryAddModal() { return identity==='manager'?showManagerMemberAddModal():showMemberAccountLookup('添加成员'); }
function confirmDirectoryAdd(){
  if(!canManageGroups()||modal?.type!=='directory-add'||!modal.user)return;
  if(identity==='manager')return notify('请选择项目拥有者成员列表中的成员');
  if(!validateMemberRemark())return;
  const parent=modal.parent;
  if(!isRepeatableDemoAccount(modal.user)&&directory.some(d=>visibleAccountKeys.some(k=>usableAccountValue(d,k)&&usableAccountValue(d,k)===usableAccountValue(modal.user,k)))){return lookupError('该成员已在成员库中');}
  const role=selectedMemberRole(modal.user),u={...memberForAddition(modal.user,role),remark:modal.remark,memberAliasDefined:true,memberLookupKey:modal.lookupKey};
  directory.push({...u});updateMemberAlias(u.id,u.remark);saveAll();
  if(parent?.type==='group-create'){
    if(!parent.members.some(m=>m.id===u.id))parent.members.push({id:u.id,role});
    parent.memberError='';modal=parent;showGroupCreateModal();return notify('成员已添加，并自动选入当前课题组');
  }
  search='';closeModal();render();notify('成员已添加，可在课题组中选用');
}
function directoryAssociations(id) {
  const relatedGroups=groups.filter(g=>g.members.some(m=>m.id===id));
  const relatedRecords=collabRecords.filter(r=>(r.members||[]).some(m=>m.id===id));
  const collaborationProjectIds=[...new Set([...relatedRecords.map(r=>r.projectId),...projects.filter(p=>p.directCollabMembers.some(m=>m.id===id)||(p.managerUserIds||[]).includes(id)).map(p=>p.id)])];
  const relatedProjects=projects.filter(p=>collaborationProjectIds.includes(p.id));
  const relatedShares=projects.filter(p=>p.shareUserIds.includes(id));
  // 成员库移除会级联解除课题组、协作授权与项目分享关系，这里只汇总受影响的范围。
  return {groups:relatedGroups,projects:relatedProjects,records:relatedRecords,shares:relatedShares};
}
function directoryRemovalScope(id) {
  const refs=directoryAssociations(id);
  if(identity!=='manager')return {...refs,preservedGroups:[]};
  const editableGroups=refs.groups.filter(canEditGroupMembers);
  const editableRecords=refs.records.filter(r=>{const g=groups.find(g=>r.groupId?g.id===r.groupId:g.name===r.groupName);return g?canEditGroupMembers(g):canManageProject(projects.find(p=>p.id===r.projectId));});
  const affectedIds=new Set(editableRecords.map(r=>r.projectId));
  projects.filter(canManageProject).forEach(p=>{if(p.directCollabMembers.some(m=>m.id===id)||(p.managerUserIds||[]).includes(id))affectedIds.add(p.id);});
  return {groups:editableGroups,projects:projects.filter(p=>affectedIds.has(p.id)),records:editableRecords,shares:refs.shares.filter(canManageProjectShare),preservedGroups:refs.groups.filter(g=>!canEditGroupMembers(g))};
}
function openDirectoryRemove(id) {
  if(!canManage())return notify('当前角色不能移除成员');
  if(!directory.some(u=>u.id===id))return;
  if(!canRemoveDirectoryPerson(id))return notify('该成员是项目所有者，不可从成员库移除');
  if(isDirectoryOwner(id))return notify('项目所有者不可从成员库移除');
  modal={type:'directory-remove',id};showDirectoryRemoveModal();
}
function showDirectoryRemoveModal() {
  const u=directory.find(u=>u.id===modal.id);if(!u)return closeModal();
  const refs=directoryRemovalScope(u.id),protectedOwner=isDirectoryOwner(u.id);
  const section=(title,items)=>items.length?`<section class="directory-association-section"><h3>${title}<span>${items.length}</span></h3><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul></section>`:'';
  const associations=section('所属课题组',refs.groups.map(g=>safe(g.name)))+section('协作授权',refs.records.map(r=>`<strong>${safe(projects.find(p=>p.id===r.projectId)?.name||r.projectName||'协作项目')}</strong><small>${safe(r.groupName)} · 协作成员</small>`))+section('项目分享',refs.shares.map(p=>`<strong>${safe(p.name)}</strong><small>共享用户 · ${safe(p.code)}</small>`));
  const links=[refs.groups.length?`${refs.groups.length} 个课题组`:'',refs.projects.length?`${refs.projects.length} 个协作项目`:'',refs.shares.length?`${refs.shares.length} 个项目分享`:''].filter(Boolean).join('、');
  const body=`<div class="directory-remove-person"><div>${memberIdentity(u)}</div></div>${refs.preservedGroups.length?'<p class="member-library-note">此成员在受邀课题组中的成员关系及相应授权保留，管理者仅可修改这些课题组的成员角色。</p>':''}${protectedOwner?`<div class="directory-remove-warning">${icon('info')}<p>该成员是项目所有者，不可从成员库移除。</p></div>`:links?`<div class="directory-remove-warning">${icon('info')}<p>确认后，TA 将从成员库移除，并同步退出 ${links}；课题组的其他成员、项目本身与分析结果均不受影响。</p></div><div class="directory-associations">${associations}</div>`:'<p class="directory-remove-description">该成员未加入课题组，也未参与协作项目或项目分享，确认后仅从成员列表移除。</p>'}<p class="member-library-note">仅移出你的成员库，不会删除对方的云平台账号；以后仍可通过${accountEntryLabel}重新添加。</p>`;
  modalFrame('移除成员','请确认移除范围与同步退出的协作关系。',body,`<button class="btn" data-close>取消</button><button class="btn danger" data-confirm-directory-remove ${protectedOwner?'disabled':''}>确认移除</button>`);
  modalRoot.querySelector('.modal').classList.add('directory-remove-modal');
}
function confirmDirectoryRemove() {
  if(!canManage()||modal?.type!=='directory-remove')return;
  const u=directory.find(u=>u.id===modal.id);if(!u)return closeModal();
  if(!canRemoveDirectoryPerson(u.id)){closeModal();return notify('当前账号不能移除此成员');}
  // 成员库移除后，TA 在各课题组、协作项目与项目分享中的关系一并解除。
  const refs=directoryRemovalScope(u.id),projectIds=new Set(refs.projects.map(p=>p.id)),recordSet=new Set(refs.records),shareIds=new Set(refs.shares.map(p=>p.id));
  refs.groups.forEach(g=>{g.members=g.members.filter(m=>m.id!==u.id);});
  collabRecords=collabRecords.filter(r=>{if(!recordSet.has(r))return true;r.members=(r.members||[]).filter(m=>m.id!==u.id);return (r.members||[]).some(m=>m.role!=='owner');});
  projects.forEach(p=>{if(projectIds.has(p.id)){p.managerUserIds=(p.managerUserIds||[]).filter(id=>id!==u.id);p.directCollabMembers=(p.directCollabMembers||[]).filter(m=>m.id!==u.id);}if(shareIds.has(p.id))p.shareUserIds=p.shareUserIds.filter(id=>id!==u.id);});
  projectIds.forEach(pid=>{const p=projects.find(x=>x.id===pid);if(p)rebuildProjectMembers(p);});
  const storedMember=(isDemoMemberInstance(u)?demoMemberInstances:platformAccounts).find(account=>account.id===u.id);if(storedMember)storedMember.remark=memberRemark(u);
  if(!isDemoMemberInstance(u)&&!platformAccounts.some(account=>account.id===u.id))platformAccounts.push({...u});
  managerMemberIds=managerMemberIds.filter(id=>id!==u.id);if(identity!=='manager')directory=directory.filter(d=>d.id!==u.id);saveAll();closeModal();render();
  notify(refs.groups.length||projectIds.size?`已移除 ${u.name}，同步退出 ${refs.groups.length} 个课题组与 ${projectIds.size} 个协作项目`:`已移除 ${u.name}，云平台账号仍保留`);
}
function openCollab(groupId=groups[0]?.id, projectIds=[], recordId=null, editProject=false) {
  if(isProjectSupportViewer())return notify('支持人员不能修改项目成员');
  if(!projectIds.length)return notify('请先在项目列表勾选需要协作的项目');
  if(!canManage()||projectIds.some(id=>!canManageProject(projects.find(p=>p.id===id))))return notify('当前账号无权修改该项目');
  if(projectIds.some(id=>!canConfigureCollaboration(projects.find(p=>p.id===id))))return notify('重新协作功能暂未开放');
  const selectedGroupIds=editProject?[...new Set(collabRecords.filter(r=>projectIds.includes(r.projectId)).map(r=>r.groupId||groups.find(g=>g.name===r.groupName)?.id).filter(Boolean))]:[groupId].filter(Boolean);
  modal={type:'collab',selectedGroupIds,selectedMemberIds:[],selectedProjectIds:[...new Set(projectIds)],recordId,editProject,removedMemberIds:[],selectionTouched:false,roleOverrides:{},extraMembers:[]};refreshCollabSelection();showModal();
}
function openCancelCollab(id) {
  if(!collaborationFeatures.cancel)return notify('取消协作功能暂未开放');
  const p=projects.find(p=>p.id===id);if(!canManageProject(p)||!p.collab)return notify('仅已协作且有管理权限的项目可取消协作');
  const records=projectRecords(p),members=p.members.filter(m=>m.role!=='owner');
  const groupCount=new Set(records.map(r=>r.groupId||r.groupName).filter(Boolean)).size;
  const roster=`<section class="cancel-collab-roster" aria-labelledby="cancelCollabRosterTitle"><div class="cancel-collab-roster-heading"><h3 id="cancelCollabRosterTitle">将取消协作的人员</h3><span>共 <b data-cancel-collab-count>${members.length}</b> 人 · 已去重</span></div><p class="cancel-collab-roster-hint">以下人员将失去本项目的协作权限，项目所有者不受影响。</p><div class="cancel-collab-table-scroll" tabindex="0" role="region" aria-label="将取消协作的人员名单"><table class="cancel-collab-table"><thead><tr><th scope="col">姓名</th><th scope="col">用户名</th><th scope="col">项目角色</th><th scope="col">协作来源</th></tr></thead><tbody>${members.map((member,index)=>{
    const u=person(member.id);
    const sources=[...new Set(records.filter(r=>(r.members||[]).some(m=>m.id===member.id)).map(r=>group(r.groupId)?.name||r.groupName||'未命名课题组'))];
    if(p.directCollabMembers.some(m=>m.id===member.id))sources.push('直接邀请');
    return `<tr data-cancel-collab-member="${safe(member.id)}"><td><div class="cancel-collab-person"><strong>${safe(u.name)}</strong></div></td><td class="cancel-collab-account">${safe(u.account||'—')}${safe(demoMemberLabel(u))}</td><td><span class="role-pill ${safe(member.role)}">${icon(roleIcons[member.role]||'person')}${safe(roleNames[member.role]||member.role)}</span></td><td><div class="cancel-collab-sources">${(sources.length?sources:['项目协作']).map(source=>`<span>${safe(source)}</span>`).join('')}</div></td></tr>`;
  }).join('')||'<tr><td colspan="4" class="cancel-collab-empty">当前没有需要解除权限的协作成员。</td></tr>'}</tbody></table></div></section>`;
  modal={type:'collab-cancel',projectId:id};
  modalFrame('取消项目协作','请核对受影响的人员名单，确认后解除本项目的全部协作授权。',`<div class="share-project-card"><span class="share-project-icon">${icon('folder')}</span><div><strong>${safe(p.name)}</strong><small>${safe(p.ticket)} · ${safe(p.code)}</small></div></div>${roster}<div class="share-cancel-warning">${icon('info')}<div><strong>将解除 ${groupCount} 个课题组的项目协作与 ${members.length} 位成员的协作权限。</strong><p>项目分享、其他项目、课题组和成员库均保留。仍被分享的用户可继续查看共享结果；取消后可重新发起协作。</p></div></div>`,'<button class="btn" data-close>暂不取消</button><button class="btn danger" data-confirm-collab-cancel>确认取消协作</button>');
  modalRoot.querySelector('.modal').classList.add('cancel-collab-modal');
}
function cancelCollab() {
  if(!collaborationFeatures.cancel)return;
  const p=projects.find(p=>p.id===modal?.projectId);if(modal?.type!=='collab-cancel'||!canManageProject(p)||!p.collab)return;
  collabRecords=collabRecords.filter(r=>r.projectId!==p.id);p.directCollabMembers=[];p.hasCollaborated=true;p.collabCancelledAt=new Date().toISOString();rebuildProjectMembers(p);saveAll();closeModal();render();notify('项目协作已取消，项目分享仍保留');
}

function openShare(projectId) {
  if(!canManage())return notify('当前角色不能管理项目分享');
  const p=projects.find(x=>x.id===projectId);if(!p||!canManageProjectShare(p))return notify('支持人员不能管理项目分享');
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
    <div class="share-account-control ${modal.error?'invalid':''}"><span>${icon('person')}</span><input id="shareAccount" type="text" maxlength="100" list="shareAccountOptions" autocomplete="off" placeholder="输入${accountEntryLabel}" value="${safe(modal.account)}" aria-describedby="shareAccountHint shareAccountError" aria-invalid="${!!modal.error}"><button type="submit" class="btn primary" data-add-share-user>${icon('plus')}添加</button></div>
    <datalist id="shareAccountOptions">${platformAccounts.filter(u=>u.id!==ownerId&&!modal.selectedUserIds.includes(u.id)).flatMap(u=>visibleAccountKeys.filter(key=>usableAccountValue(u,key)).map(key=>`<option value="${safe(u[key])}">${safe(u.name)} · ${key==='phone'?'手机号':key==='email'?'邮箱':'用户名'}</option>`)).join('')}</datalist>
    <div id="shareAccountLookup" aria-live="polite"></div><p id="shareAccountError" class="share-error" role="alert" ${modal.error?'':'hidden'}>${safe(modal.error)}</p><p id="shareAccountHint" class="share-input-hint">${accountEntryLabel}可匹配同一账户；最多分享给 5 位用户，保存后才生效。</p></form>
    ${p.shared&&!p.shareUserIds.length?'<div class="share-legacy-note">旧版分享记录未保存接收用户。可重新添加用户并保存，或取消全部分享。</div>':''}
    <section class="share-recipients" aria-label="共享用户名单"><div class="share-list-heading"><h3>共享用户名单</h3><span>仅查看原始结果</span></div><div class="share-user-list">${modal.selectedUserIds.map((id,i)=>`<div class="share-user-row" data-share-user-row="${safe(id)}"><div class="share-user-meta">${memberIdentity(person(id))}</div><span class="share-user-status ${p.shareUserIds.includes(id)?'':'pending'}">${p.shareUserIds.includes(id)?'已分享':'待分享'}</span><button type="button" class="btn quiet small danger" data-remove-share-user="${safe(id)}" aria-label="移除共享用户${safe(person(id).name)}">移除</button></div>`).join('')||`<div class="share-empty">${icon('people')}<span>还没有添加共享用户</span><small>输入对方${accountEntryLabel}，即可添加</small></div>`}</div></section>
    <div class="share-access-path"><span>对方查看路径</span><p>项目列表 <i>›</i> ${safe(p.type)} <i>›</i> 共享项目</p></div>`;
  modalFrame('项目分享','指定共享用户，让分析成果安全、清晰地传递。',body,`${p.shared?'<button class="btn quiet danger share-cancel-all" data-open-share-cancel>取消全部分享</button>':''}<button class="btn" data-close>取消</button><button class="btn primary" data-save-share>${p.shared?'保存分享设置':'确认分享'}</button>`);
  modalRoot.querySelector('.modal').classList.add('share-modal');drawShareAccountLookup();
}
function drawShareAccountLookup() {
  const slot=document.getElementById('shareAccountLookup');if(!slot)return;
  const result=resolvePlatformAccount(modal.account),u=result.user;
  slot.innerHTML=u?`<div class="share-account-match">${icon('check')}<span>已匹配：<b>${safe(u.name)}</b> · 用户名 ${safe(u.account)}${safe(demoMemberLabel(u))}<small>${safe(accountContact(u,contactKeyFor(modal.account)).label)} ${safe(accountContact(u,contactKeyFor(modal.account)).value)}</small></span></div>`:modal.account&&result.status==='ambiguous'?'<p class="share-error">账号信息存在重复关联，无法唯一匹配。</p>':'';
}
function shareError(message) {
  modal.error=message;showShareModal();document.getElementById('shareAccount')?.focus();return false;
}
function addShareUser() {
  if(!canManage()||!canManageProjectShare(projects.find(x=>x.id===modal?.projectId))||modal?.type!=='share')return false;
  modal.account=(document.getElementById('shareAccount')?.value||modal.account).trim();
  if(!modal.account)return shareError(`请输入要分享的${accountEntryLabel}`);
  const p=projects.find(x=>x.id===modal.projectId);
  const result=resolvePlatformAccount(modal.account),user=result.user;
  if(!user)return shareError(result.status==='ambiguous'?'账号信息存在重复关联，无法唯一匹配，请核对后重试。':`未找到该云平台账户，请核对完整${accountEntryLabel}`);
  if(p.members.some(m=>m.role==='owner'&&m.id===user.id))return shareError('无需将项目分享给项目所有者');
  if(modal.selectedUserIds.includes(user.id))return shareError('该用户已在共享名单中，请勿重复添加');
  if(modal.selectedUserIds.length>=5)return shareError('每个项目最多分享给 5 位用户，请先移除一位用户');
  modal.selectedUserIds.push(user.id);modal.account='';modal.error='';showShareModal();return true;
}
function saveShare() {
  if(!canManage()||!canManageProjectShare(projects.find(x=>x.id===modal?.projectId))||modal?.type!=='share')return;
  if(modal.account.trim()&&!addShareUser())return;
  const p=projects.find(x=>x.id===modal.projectId);if(!p)return;
  if(!modal.selectedUserIds.length){if(p.shared)return openCancelShare(p.id,modal);return shareError('请至少添加一位共享用户');}
  if(modal.selectedUserIds.length>5)return shareError('每个项目最多分享给 5 位用户');
  modal.selectedUserIds.forEach(id=>ensureDirectoryPerson(id));
  p.shareUserIds=[...modal.selectedUserIds];p.shared=true;p.shareInitiatedBy=currentUserId();saveAll();closeModal();render();notify('分享设置已保存，共享项目列表已更新');
}
function openCancelShare(projectId, previous=null) {
  if(!canManage()||!canManageProjectShare(projects.find(x=>x.id===projectId)))return;
  const p=projects.find(x=>x.id===projectId);if(!p?.shared)return;
  modal={type:'share-cancel',projectId,previous};showCancelShareModal();
}
function showCancelShareModal() {
  const p=projects.find(x=>x.id===modal.projectId);if(!p)return closeModal();
  modalFrame('取消项目分享','请确认是否收回本项目的全部分享权限。',`${shareProjectCard(p)}<div class="share-cancel-warning">${icon('info')}<div><strong>取消后，接收用户将无法再从“共享项目”查看该项目。</strong><p>仅取消分享，不删除项目，也不影响已有协作关系和课题组成员。</p></div></div>${p.shareUserIds.length?`<div class="share-cancel-users"><span>将取消以下 ${p.shareUserIds.length} 位用户的分享</span><div>${p.shareUserIds.map(id=>`<span class="group-chip">${safe(person(id).name)}</span>`).join('')}</div></div>`:''}`,'<button class="btn" data-keep-share>暂不取消</button><button class="btn danger" data-confirm-share-cancel>确认取消分享</button>');
  modalRoot.querySelector('.modal').classList.add('share-modal');
}
function cancelShare() {
  if(!canManage()||!canManageProjectShare(projects.find(x=>x.id===modal?.projectId))||modal?.type!=='share-cancel')return;
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
  p.files.push({id:'folder-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:modal.name,parentId:modal.parentId,createdAt:new Date().toLocaleString('zh-CN',{hour12:false}),creator:person(currentUserId()).name});
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
  if(!visibleProjects().some(p=>p.id===activeProjectId))return notify('当前身份没有该项目的查看权限');
  closeModal();
  history.pushState({analysisResult:true,projectId:activeProjectId,detailOrigin:{...detailOrigin}},'',location.href);
  navigate('analysis-result');
}
function switchAnalysisViewer(userId) {
  if(!project().members.some(member=>member.id===userId))return;
  identity=userId==='owner-1'?'owner':userId===identityUsers.manager?'manager':isSupportPerson(userId)?'support':'member';
  if(identity==='support')supportUserId=userId;
  if(identity==='member')recipientUserId=userId;
  detailOrigin={...detailOrigin,listTab:'mine'};
  const url=new URL(location.href);
  url.searchParams.set('role',identity);
  if(identity==='member')url.searchParams.set('user',userId);else url.searchParams.delete('user');
  if(identity==='support')url.searchParams.set('supportUser',supportUserId);else url.searchParams.delete('supportUser');
  history.replaceState({...history.state,detailOrigin:{...detailOrigin}},'',url);
  render();
}
function backFromAnalysis() {
  if(history.state?.analysisDemoEntry){history.replaceState(null,'');return navigate('detail');}
  if(history.state?.analysisResult)history.back();else navigate('detail');
}
function showCloudDownload() {
  modal={type:'cloud-download'};
  modalFrame('下载派森诺云盘','项目数据下载入口',`<div class="result-preview-panel">${icon('download')}<h3>使用云盘客户端下载项目数据</h3><p>本原型仅演示下载入口，不提供安装包。正式产品接入下载地址后，可在此获取客户端。</p></div>`,'<button class="btn primary" data-close>知道了</button>');
}

function groupCreateMembers() { return modal.members.filter(m=>!isSupportPerson(m)).map(m=>`<div class="picker-member"><div class="member-cell"><div>${memberIdentity(person(m.id))}</div></div><div class="picker-right"><span class="role-pill member">${icon('person')}成员</span><button type="button" class="chip-close" data-remove-group-member="${m.id}" aria-label="移除 ${safe(person(m.id).name)}">×</button></div></div>`).join('') || '<div class="picker-empty">还没有选择成员，可在上方成员管理列表中选择。</div>'; }
function groupMemberOptions() {
  const q=accountValue(modal.memberQuery);
  // 课题组成员只能从成员管理列表中选择，避免绕过成员库直接引入账号。
  const people=memberDirectoryForViewer().filter(d=>d.id!=='owner-1'&&d.id!==currentUserId()&&!isSupportPerson(d)&&accountSearchText(d).includes(q));
  return people.map(d=>`<label class="group-member-option"><input type="checkbox" data-pick-group-member="${safe(d.id)}" ${modal.members.some(m=>m.id===d.id)?'checked':''}><span>${memberIdentity(d)}</span></label>`).join('')||'<div class="picker-empty">成员管理列表暂无匹配成员，请先在成员管理中添加。</div>';
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
  modalFrame('创建课题组','填写名称，从成员管理列表选择成员。',
    `<form id="groupForm" novalidate><label class="field ${modal.error?'invalid':''}" id="groupNameField"><span class="field-label">课题组名称</span><input id="groupName" type="text" maxlength="40" placeholder="例如：肿瘤早筛课题组" value="${safe(modal.name)}"><span class="field-error">${safe(modal.error||'请输入课题组名称')}</span></label>
    <div class="group-picker-label"><label class="field-label" for="groupMemberSearch">选择成员 <span class="picker-note">可多选</span></label></div>
    <div class="group-search-picker"><div class="group-search-control">${icon('search')}<input id="groupMemberSearch" type="search" autocomplete="off" placeholder="${isEnglishVersion?'Search username, email or remark':'搜索用户名、手机号、邮箱或成员别称'}" value="${safe(modal.memberQuery)}" aria-expanded="${modal.pickerOpen}" aria-controls="groupMemberDropdown"><button type="button" class="group-picker-toggle" data-toggle-group-picker aria-label="展开或收起成员选项">⌄</button></div>
    <div class="group-member-dropdown" id="groupMemberDropdown" ${modal.pickerOpen?'':'hidden'}><div id="groupMemberOptions" class="group-member-options">${groupMemberOptions()}</div></div></div>
    <p class="group-account-hint">成员来自成员管理列表；项目权限将在确认项目协作后生效。</p><p class="group-member-error" id="groupMemberError" role="alert" ${modal.memberError?'':'hidden'}>${safe(modal.memberError)}</p>
    <div class="selected-picker"><div class="picker-title">已选成员 <b id="groupSelectedCount">${modal.members.length}</b><span>默认均为成员，可移除</span></div><div id="selectedGroupMembers">${groupCreateMembers()}</div></div><p class="member-library-note">创建课题组仅建立成员归属；项目权限将在确认项目协作后生效。</p></form>`,
    `<button class="btn" data-close>${modal.parent?'返回项目协作':'取消'}</button><button class="btn primary" data-create-group-confirm>${modal.parent?'创建并选用':'创建课题组'}</button>`, true);
}
function collabMembers(state) {
  const seen=new Set(),out=[];
  const add=m=>{if(!isSupportPerson(m)&&!seen.has(m.id)){seen.add(m.id);out.push({...m});}};
  state.selectedGroupIds.forEach(gid=>(group(gid)?.members||[]).forEach(add));
  collabTargetRecords(state).forEach(r=>(r.members||[]).forEach(add));
  if(state.editProject)projects.filter(p=>state.selectedProjectIds.includes(p.id)).forEach(p=>p.directCollabMembers.forEach(add));
  (state.extraMembers||[]).forEach(add);
  return out;
}
function setCollabGroups(ids) {
  if(modal?.type!=='collab'||modal.recordId)return;
  const previous=new Set(collabMembers(modal).map(m=>m.id)),selected=new Set(modal.selectedMemberIds);
  modal.selectedGroupIds=[...new Set(ids)].filter(id=>group(id));
  const members=collabMembers(modal),current=new Set(collabProjectMembers(modal).map(m=>m.id));
  // 新选课题组默认带入其成员；已手动取消的成员不因切换课题组再次获得权限。
  modal.selectedMemberIds=members.filter(m=>m.role!=='owner'&&(selected.has(m.id)||!previous.has(m.id))).map(m=>m.id);
  modal.removedMemberIds=members.filter(m=>current.has(m.id)&&!modal.selectedMemberIds.includes(m.id)).map(m=>m.id);
  modal.selectionTouched=true;showCollabModal();
}
function collabMemberSections(state) {
  const members=collabMembers(state),records=collabTargetRecords(state),seen=new Set();
  const sections=state.selectedGroupIds.map(gid=>{
    const g=group(gid);if(!g)return null;
    const ids=new Set([...g.members,...records.filter(r=>r.groupId===gid||(!r.groupId&&r.groupName===g.name)).flatMap(r=>r.members||[])].map(m=>m.id));
    const roster=members.filter(m=>ids.has(m.id));roster.forEach(m=>seen.add(m.id));
    return {id:gid,name:g.name,members:roster};
  }).filter(Boolean);
  const direct=members.filter(m=>!seen.has(m.id));
  if(direct.length)sections.push({id:'direct',name:'直接添加的成员',members:direct});
  return sections;
}
function collabRoleValue(state,member) {
  if(state.roleOverrides?.[member.id])return state.roleOverrides[member.id];
  const roles=[...new Set(collabTargetRecords(state).flatMap(r=>(r.members||[]).filter(m=>m.id===member.id).map(m=>m.role)))];
  return roles.length>1?'preserve':roles[0]||member.role;
}
function gotoGroupManagement() {
  if(!canManageGroups())return notify('当前角色不能添加课题组');
  collabDraftProjectIds=[...modal.selectedProjectIds];
  closeModal();
  navigate('groups');
  notify(`已跳到课题组管理，本次勾选的 ${collabDraftProjectIds.length} 个项目会保留，建好课题组后回到项目列表继续协作`);
}
function personProjectName(id) { const p=projects.find(x=>x.id===id);return p?p.name.replace(/^测试示例-/,''):''; }

function collabProjectMembers(state) {
  const seen=new Set(),out=[];
  const containers=[...collabTargetRecords(state),...(state.editProject?projects.filter(p=>state.selectedProjectIds.includes(p.id)).map(p=>({members:p.directCollabMembers})):[])];
  containers.forEach(p=>(p.members||[]).forEach(m=>{if(!isSupportPerson(m)&&!seen.has(m.id)){seen.add(m.id);out.push({...m});}}));
  return out;
}
function collabTargetRecords(state) {
  const gids=new Set(state.selectedGroupIds.filter(Boolean));
  return collabRecords.filter(r=>{
    if(!state.selectedProjectIds.includes(r.projectId))return false;
    if(state.recordId)return r.id===state.recordId;
    if(!gids.size)return false;
    return gids.has(r.groupId)||[...gids].some(gid=>group(gid)?.name===r.groupName);
  });
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
  if(!member||member.role==='owner'||isSupportPerson(id))return;
  modal.selectionTouched=true;
  const exists=collabProjectMembers(modal).some(m=>m.id===id);
  if(selected){modal.selectedMemberIds=[...new Set([...modal.selectedMemberIds,id])];modal.removedMemberIds=modal.removedMemberIds.filter(x=>x!==id);}
  else {modal.selectedMemberIds=modal.selectedMemberIds.filter(x=>x!==id);if(exists)modal.removedMemberIds=[...new Set([...modal.removedMemberIds,id])];}
}
function selectAllCollabMembers() {
  collabMembers(modal).forEach(m=>{if(m.role!=='owner')changeCollabMember(m.id,true);});
  return showCollabModal();
}
function clearCollabMembers() {
  collabMembers(modal).forEach(m=>{if(m.role!=='owner')changeCollabMember(m.id,false);});
  return showCollabModal();
}
function showCollabModal() {
  const members=collabMembers(modal),current=collabProjectMembers(modal);
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  const memberSections=collabMemberSections(modal),available=members.filter(m=>m.role!=='owner');
  const scrollTop=modalRoot.querySelector('.collaboration-modal .modal-body')?.scrollTop||0;
  const collapsed=[...modalRoot.querySelectorAll('[data-collab-member-section]:not([open])')].map(el=>el.dataset.collabMemberSection);
  const body=`<div class="picker-layout"><section class="picker-block group-picker-panel"><div class="picker-heading"><h3>选择课题组 <span class="picker-note">可多选</span></h3>${modal.recordId||!isProjectManagementView()?'':'<button class="btn quiet small text-primary" data-new-collab-group>＋ 添加课题组</button>'}</div><div class="collab-group-tools"><label><input type="checkbox" data-select-all-collab-groups ${modal.recordId||!groups.length?'disabled':''}>全选课题组</label><span>${modal.selectedGroupIds.length} / ${groups.length}</span><button type="button" data-clear-collab-groups ${modal.recordId||!modal.selectedGroupIds.length?'disabled':''}>取消全选</button></div><div class="check-list group-list-picker">${groups.map(g=>`<label class="check-item"><input type="checkbox" data-collab-group="${g.id}" ${modal.selectedGroupIds.includes(g.id)?'checked':''} ${modal.recordId?'disabled':''}><span class="check-main"><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员</small></span></label>`).join('')||'<div class="picker-empty">暂无课题组，点击上方“添加课题组”跳转创建</div>'}</div></section>
  <section class="picker-block collab-members-panel"><div class="collab-members-header"><div class="collab-members-title"><h3>协作成员</h3><span id="collabMemberCount">已选 <b>${modal.selectedMemberIds.length}</b> / ${available.length} 位成员（去重）</span></div><div class="collab-member-actions"><button type="button" class="btn collab-select-all" data-select-all-collab-members>${icon("check")}全选</button><button type="button" class="btn collab-clear-all" data-clear-collab-members>取消全选</button></div></div><p class="inline-member-hint">按课题组展示；同一账号在多组中同步勾选与角色，人数去重统计。勾选即新增授权，取消勾选即移除授权，保存后生效。</p><div class="check-list inline-collab-members">${memberSections.map(section=>`<details class="collab-member-section" data-collab-member-section="${safe(section.id)}" open><summary><strong>${safe(section.name)}</strong><span>已选 ${section.members.filter(m=>modal.selectedMemberIds.includes(m.id)).length} / ${section.members.filter(m=>m.role!=='owner').length} 人</span></summary><div class="collab-section-roster">${section.members.map((m,i)=>{
    const selected=modal.selectedMemberIds.includes(m.id),removed=modal.removedMemberIds.includes(m.id),existing=current.some(x=>x.id===m.id),owner=m.role==='owner';
    const value=collabRoleValue(modal,m);
    const alwaysIn=owner;
    const statusText=owner?'所有者':removed?'取消勾选，保存后移除':existing?'已加入':selected?'待添加':'未选';
    const statusClass=owner?'owner':removed?'removed':existing?'joined':selected?'added':'';
    const roleDisabled=!selected||owner;
    return `<div class="collab-member-item ${removed?'pending-removal':''} ${(alwaysIn||selected)?'is-selected':''}" data-collab-member-row="${m.id}"><label class="collab-member-left"><input type="checkbox" data-collab-member="${m.id}" ${(alwaysIn||selected)?'checked':''} ${alwaysIn?'disabled':''}><span class="collab-member-info">${memberIdentity(person(m.id))}</span></label><span class="collab-member-status ${statusClass}">${statusText}</span><select class="collab-member-role" id="collabRole-${safe(section.id)}-${safe(m.id)}" data-collab-role="${safe(m.id)}" ${roleDisabled?'disabled':''} aria-label="${safe(person(m.id).name)}的项目角色">${value==='preserve'?'<option value="preserve">保留原角色</option>':''}${memberRoles.map(role=>`<option value="${role}" ${role===value?'selected':''}>${roleNames[role]}</option>`).join('')}</select><span class="collab-member-action-placeholder"></span></div>`;
  }).join('')||'<div class="picker-empty">此课题组暂无成员</div>'}</div></details>`).join('')||'<div class="picker-empty">选择课题组后，此处按组显示对应成员</div>'}</div></section></div>
  <div class="inline-collab-summary"><span>已选 <b>${modal.selectedMemberIds.length}</b> 位协作成员${modal.removedMemberIds.length?` · <span class="pending-count">待移除 ${modal.removedMemberIds.length} 位</span>`:''}</span><span>仅调整项目协作授权，不删除课题组成员</span></div>`;
  modalFrame(modal.recordId?'管理协作成员':collabTargetRecords(modal).length?'管理项目协作':'发起项目协作',`本次协作 ${selectedProjects.length} 个项目；选择课题组并核对成员，保存后生效。`,body,'<button class="btn" data-close>取消</button><button class="btn primary" data-confirm-collab>保存变更</button>',true);
  const allGroups=modalRoot.querySelector('[data-select-all-collab-groups]');
  allGroups.checked=groups.length>0&&groups.every(g=>modal.selectedGroupIds.includes(g.id));
  allGroups.indeterminate=modal.selectedGroupIds.length>0&&!allGroups.checked;
  modalRoot.querySelectorAll('[data-collab-member-section]').forEach(el=>{if(collapsed.includes(el.dataset.collabMemberSection))el.open=false;});
  modalRoot.querySelector('.modal-body').scrollTop=scrollTop;
}
function showModal() {
  if(!modal) return;
  if(modal.type==='share')return showShareModal();
  if(modal.type==='share-cancel')return showCancelShareModal();
  if(modal.type==='folder-create')return showFolderModal();
  if(modal.type==='group-create') return showGroupCreateModal();
  if(modal.type==='group-delete') return showGroupDeleteModal();
  if(modal.type==='group-members') return showGroupMembersModal();
  if(modal.type==='group-add-members') return showGroupAddMemberModal();
  if(modal.type==='group-roles') return showGroupRolesModal();
  if(modal.type==='group-member-remove') return showGroupMemberRemoveModal();
  if(modal.type==='directory-add') return showDirectoryAddModal();
  if(modal.type==='member-alias-edit')return showMemberAliasEditModal();
  if(modal.type==='directory-remove') return showDirectoryRemoveModal();
  if(modal.type==='collab') return showCollabModal();
  if(modal.type==='add')return showMemberAccountLookup(modal.target==='group'?'添加课题组成员':'添加项目成员');
  if(modal.type==='edit') {
    modalFrame('调整项目角色',`为 ${safe(person(modal.id).name)} 设置新的协作权限`,
      `<span class="field-label">选择角色</span>${rolesRadio(modal.role)}<div class="verify-hint" style="margin-top:16px">项目所有者不可在这里调整；角色变化仅对当前项目生效。</div>`,
      '<button class="btn" data-close>取消</button><button class="btn primary" data-save-role>保存角色</button>'); return;
  }
  if(modal.type==='remove') {
    modalFrame('移除项目成员','确认后，此人将无法继续访问本项目的协作内容',
      `<p>确定从「${safe(project().name)}」移除 <strong>${safe(person(modal.id).name)}</strong> 吗？</p><div class="confirm-warning">这不会删除对方的云平台账号，也不会影响其在其他项目的角色。</div>`,
      '<button class="btn" data-close>取消</button><button class="btn danger" data-confirm-remove>确认移除</button>');
  }
}
function submitMemberAdd() {
  if(!modal||!['add','directory-add'].includes(modal.type))return;
  if(modal.type==='add'&&modal.target==='project'?!canManageCollaborationMembers():!canManageGroups())return;
  if(modal.type==='add'&&modal.target==='group'&&!canEditGroupMembers(group(modal.groupId)))return closeModal();
  const user=validateMemberDetails();if(!user)return;
  if(identity==='manager'&&!directory.some(u=>u.id===user.id||u.demoSourceId===user.id))return lookupError('只能添加项目拥有者成员列表中已有的成员');
  modal.user=user;
  if(modal.type==='directory-add')return confirmDirectoryAdd();
  const container=modal.target==='group'?group(modal.groupId)?.members:projectMemberList();if(!container)return;
  if(!isRepeatableDemoAccount(modal.user)&&container.some(m=>m.id===modal.user.id))return lookupError('该成员已在当前名单中');
  const role=selectedMemberRole(modal.user),u={...memberForAddition(modal.user,role),remark:modal.remark,memberAliasDefined:true,memberLookupKey:modal.lookupKey};
  const existing=directory.find(d=>d.id===u.id);if(existing){existing.remark=u.remark;existing.memberAliasDefined=true;existing.memberLookupKey=u.memberLookupKey;}else directory.push({...u});updateMemberAlias(u.id,u.remark);
  if(modal.target==='project'){project().directCollabMembers.push({id:u.id,role,invitedBy:currentUserId()});project().hasCollaborated=true;rebuildProjectMembers(project());}else container.push({id:u.id,role});
  saveAll();closeModal();render();notify('成员添加成功');
}
function confirmGroupCreate() {
  if(!canManageGroups()||modal?.type!=='group-create')return;
  modal.name=document.getElementById('groupName').value.trim();modal.error='';modal.memberError='';
  if(!modal.name)modal.error='请输入课题组名称';
  else if(groups.some(g=>g.name===modal.name))modal.error='课题组名称已存在';
  if(modal.members.some(isSupportPerson))return notify('支持人员仅能通过项目列表添加');
  const members=modal.members.filter(m=>m.id!==currentUserId());
  if(!members.length)modal.memberError='请至少选择一位成员';
  else if(members.some(m=>!memberDirectoryForViewer().some(d=>d.id===m.id)))modal.memberError='成员必须先加入成员管理列表';
  if(modal.error||modal.memberError){showGroupCreateModal();document.getElementById(modal.error?'groupName':'groupMemberSearch').focus();return;}
  const id='group-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),parent=modal.parent,now=new Date().toLocaleString('zh-CN',{hour12:false});
  members.forEach(m=>ensureDirectoryPerson(m.id));
  groups.push({id,name:modal.name,members:structuredClone(members),ownerId:currentUserId(),createdAt:now});saveAll();if(!parent&&['team','spaces'].includes(page)){page='spaces';spaceTab='owned';}
  if(parent?.type==='collab'){
    modal=parent;setCollabGroups([...parent.selectedGroupIds,id]);return notify('课题组已创建并选用，确认协作后才授予项目权限');
  }
  closeModal();render();notify('课题组已创建，可在项目协作中选用');
}
function confirmCollab() {
  if(!canManage()||modal?.type!=='collab')return;
  const state=modal,selectedProjects=projects.filter(p=>state.selectedProjectIds.includes(p.id));
  if(!selectedProjects.length)return notify('请至少选择一个项目');
  if(selectedProjects.some(p=>!canManageProject(p)))return notify('当前账号无权管理所选项目');
  if(selectedProjects.some(p=>!canConfigureCollaboration(p)))return notify('重新协作功能暂未开放');
  // 所选项目统一应用同一批成员与角色
  const drafts=selectedProjects.map(p=>{
    const draft={...state};
    return {p,draft,selectedGroups:draft.selectedGroupIds.map(group).filter(Boolean),members:collabMembers(draft).filter(m=>draft.selectedMemberIds.includes(m.id))};
  });
  // 先校验全部项目，再一次性应用，避免批量保存只成功一部分。
  for(const {p,draft,selectedGroups,members} of drafts){
    if(!selectedGroups.length&&!draft.editProject)return notify(`“${p.name}”请至少选择一个课题组`);
    if(!members.length)return notify(`“${p.name}”请至少选择一位协作成员`);
  }
  const now=new Date().toLocaleString('zh-CN',{hour12:false});
  drafts.forEach(({p,draft,selectedGroups,members})=>{
    const prior=projectRecords(p),oldDirect=p.directCollabMembers;
    const roleFor=(m,old)=>draft.roleOverrides[m.id]||old?.find(x=>x.id===m.id)?.role||m.role;
    members.forEach(m=>ensureDirectoryPerson(m.id));
    if(draft.editProject){
      collabRecords=collabRecords.filter(r=>r.projectId!==p.id||selectedGroups.some(g=>r.groupId===g.id||(!r.groupId&&r.groupName===g.name)));
      p.directCollabMembers=oldDirect.filter(m=>draft.selectedMemberIds.includes(m.id)).map(m=>({...m,role:roleFor(m,oldDirect)}));
      if(!selectedGroups.length)members.filter(m=>!p.directCollabMembers.some(x=>x.id===m.id)).forEach(m=>p.directCollabMembers.push({id:m.id,role:roleFor(m,oldDirect),invitedBy:currentUserId()}));
    }
    // 临时添加的人员作为直接授权，不混入每一个课题组的成员名单。
    members.filter(m=>(draft.extraMembers||[]).some(x=>x.id===m.id)).forEach(m=>{
      const direct=p.directCollabMembers.find(x=>x.id===m.id);
      if(direct)direct.role=roleFor(m,oldDirect);
      else p.directCollabMembers.push({id:m.id,role:roleFor(m,oldDirect),invitedBy:currentUserId()});
    });
    selectedGroups.forEach(g=>{
      const old=prior.find(r=>r.groupId===g.id||(!r.groupId&&r.groupName===g.name));
      const record=collabRecords.find(r=>r.projectId===p.id&&(r.groupId===g.id||(!r.groupId&&r.groupName===g.name)));
      const groupMemberIds=new Set([...g.members,...(old?.members||[])].map(m=>m.id));
      const roster=members.filter(m=>groupMemberIds.has(m.id)).map(m=>({id:m.id,role:roleFor(m,old?.members)}));
      if(record){record.members=roster;record.updatedAt=now;}
      else collabRecords.push({id:'record-'+Date.now()+'-'+p.id+'-'+g.id+'-'+Math.random().toString(36).slice(2,6),projectId:p.id,projectName:p.name,code:p.code,initiatedBy:currentUserId(),groupId:g.id,groupName:g.name,members:roster,createdAt:now,status:'协作中'});
    });
    p.hasCollaborated=true;if(typeof draft.downloadOverride==='boolean')p.visitorDownload=draft.downloadOverride;rebuildProjectMembers(p);
  });
  saveAll();closeModal();selectedProjectIds=[];collaborationGroupPresetId=null;render();notify('项目协作已保存');
}

main.addEventListener('click', e => {
  const a=e.target.closest('button'); if(!a||a.disabled) return;
  if(a.dataset.addProjectSupport)return addProjectSupport(a.dataset.addProjectSupport);
  if(a.dataset.copyTicket) return copyProjectTicket(a.dataset.copyTicket);
  if(a.hasAttribute('data-back-project-list')) return navigate(detailOrigin.page,{projectTab:detailOrigin.listTab});
  if(a.dataset.nav) return navigate(a.dataset.nav);
  if(a.dataset.projectSearch){const id=a.dataset.projectSearch;openProjectSearch=openProjectSearch===id?null:id;render();if(openProjectSearch)document.getElementById(id)?.focus({preventScroll:true});return;}
  if(a.dataset.clearProjectSearch){const id=a.dataset.clearProjectSearch;if(id==='projectTicketSearch')projectTicketSearch='';else projectCodeSearch='';render();document.getElementById(id)?.focus({preventScroll:true});return;}
  if(a.dataset.openProject) return openProjectDetail(a.dataset.openProject,a.dataset.collabRecord||null);
  if(a.dataset.groupAddMember) return openGroupAddMember(a.dataset.groupAddMember);
  if(a.dataset.groupRoles) return openGroupRoles(a.dataset.groupRoles);
  if(a.dataset.spaceTab){spaceTab=a.dataset.spaceTab;search='';return render();}
  if(a.dataset.collaborationDemo){activeProjectId=a.dataset.collaborationDemo;detailOrigin={page,listTab};return showResultPreview();}
  if(a.hasAttribute('data-show-result'))return showResultPreview();
  if(a.hasAttribute('data-cloud-download'))return showCloudDownload();
  if(a.hasAttribute('data-create-folder'))return openCreateFolder();
  if(a.hasAttribute('data-delete-selected-files'))return openFileRemoval(selectedFileIds);
  if(a.dataset.deleteFile)return openFileRemoval([a.dataset.deleteFile]);
  if(a.dataset.openFolder){const folder=currentProjectFiles().find(f=>f.id===a.dataset.openFolder);if(folder){filePath.push(folder.id);selectedFileIds=[];return render();}}
  if(a.hasAttribute('data-file-path')){filePath=filePath.slice(0,Number(a.dataset.filePath)+1);selectedFileIds=[];return render();}
  if(a.dataset.cancelCollab)return openCancelCollab(a.dataset.cancelCollab);
  if(a.dataset.listTab){listTab=a.dataset.listTab==='shared'?'shared':'mine';selectedProjectIds=[];search='';resetProjectSearch();return render();}
  if(a.hasAttribute('data-clear-projects')){selectedProjectIds=[];return render();}
  if(a.hasAttribute('data-add-directory')) return openDirectoryAdd();
  if(a.dataset.editMemberAlias)return openMemberAliasEdit(a.dataset.editMemberAlias);
  if(a.dataset.removeDirectory)return openDirectoryRemove(a.dataset.removeDirectory);
  if(a.hasAttribute('data-create-group')) return openGroupCreate();
  if(a.dataset.groupMembers) return openGroupMembers(a.dataset.groupMembers);
  if(a.dataset.deleteGroup) return openGroupDelete(a.dataset.deleteGroup);
  if(a.dataset.openCollab){if(!canManage())return;collaborationGroupPresetId=a.dataset.openCollab;navigate('projects');return notify('请先勾选项目，发起协作时将带入“'+group(collaborationGroupPresetId).name+'”');}
  if(a.hasAttribute('data-collab-selected')){const ids=filteredProjects().filter(p=>selectedProjectIds.includes(p.id)&&canConfigureCollaboration(p)).map(p=>p.id);return openCollab(collaborationGroupPresetId||groups[0]?.id,ids);}
  if(a.dataset.collabOne){const p=projects.find(p=>p.id===a.dataset.collabOne);return openCollab(groups[0]?.id,[p.id],null,p.collab);}
  if(a.dataset.manageRecord){const r=collabRecords.find(x=>x.id===a.dataset.manageRecord);if(!r) return;return openCollab(r.groupId||groups.find(g=>g.name===r.groupName)?.id,[r.projectId],r.id);}
  if(a.dataset.shareProject)return openShare(a.dataset.shareProject);
});
document.querySelector('.sidebar').addEventListener('click',e=>{const menu=e.target.closest('[data-project-menu]');if(menu){projectMenuOpen=!projectMenuOpen;document.getElementById('projectSubnav').hidden=!projectMenuOpen;menu.setAttribute('aria-expanded',String(projectMenuOpen));return;}const a=e.target.closest('[data-nav],.brand');if(a){e.preventDefault();if(a.disabled||a.getAttribute('aria-disabled')==='true')return;navigate(a.dataset.nav||'projects');}});
main.addEventListener('input',e=>{
  if(['projectTicketSearch','projectCodeSearch'].includes(e.target.id)){
    const id=e.target.id,pos=e.target.selectionStart,scroll=main.querySelector('.table-scroll')?.scrollLeft||0;
    if(id==='projectTicketSearch')projectTicketSearch=e.target.value;else projectCodeSearch=e.target.value;
    render();const next=document.getElementById(id);next.focus({preventScroll:true});try{next.setSelectionRange(pos,pos);}catch{}const table=main.querySelector('.table-scroll');if(table)table.scrollLeft=scroll;
    return;
  }
  if(['memberSearch','groupSearch','spaceSearch'].includes(e.target.id)){
    const id=e.target.id,pos=e.target.selectionStart;search=e.target.value;render();const next=document.getElementById(id);next.focus();try{next.setSelectionRange(pos,pos);}catch{}
  }
});
main.addEventListener('change',e=>{
  if(e.target.dataset.selectFile){const id=e.target.dataset.selectFile;selectedFileIds=e.target.checked?[...new Set([...selectedFileIds,id])]:selectedFileIds.filter(x=>x!==id);return render();}
  if(e.target.hasAttribute('data-select-all-files')){selectedFileIds=e.target.checked?currentProjectFiles().map(f=>f.id):[];return render();}
  if(e.target.dataset.selectProject){const id=e.target.dataset.selectProject;if(!canConfigureCollaboration(projects.find(p=>p.id===id)))return;selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,id])]:selectedProjectIds.filter(x=>x!==id);return render();}
  if(e.target.hasAttribute('data-select-all-projects')){const ids=filteredProjects().filter(canConfigureCollaboration).map(p=>p.id);selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,...ids])]:selectedProjectIds.filter(id=>!ids.includes(id));return render();}
  if(e.target.id==='visitorDownload'&&canManage()){project().visitorDownload=e.target.checked;saveAll();render();notify('访问者下载权限已更新');}
});
document.querySelectorAll('[data-preview-role]').forEach(button=>button.addEventListener('click',()=>switchPreviewRole(button.dataset.previewRole)));
document.getElementById('recipientSelect').addEventListener('change',e=>switchPreviewRole('member',e.target.value));
document.getElementById('supportSelect').addEventListener('change',e=>switchPreviewRole('support',e.target.value));
modalRoot.addEventListener('click',e=>{
  if(e.target===modalRoot||e.target.closest('[data-close]')) return dismissModal();
  const a=e.target.closest('button');if(!a||a.disabled||!modal) return;
  if(a.hasAttribute('data-result-to-data')){closeModal();tab='data';return render();}
  if(!canManage()&&!(canManageGroups()&&['group-create','group-delete','group-members','group-member-remove','group-roles','group-add-members','add','directory-add'].includes(modal.type)))return closeModal();
  if(a.dataset.removeGroupMember&&modal.type==='group-members')return openGroupMemberRemove(modal.groupId,a.dataset.removeGroupMember);
  if(a.hasAttribute('data-confirm-delete-group'))return confirmGroupDelete();
  if(a.hasAttribute('data-save-group-members'))return saveGroupMembers();
  if(a.hasAttribute('data-save-group-add-members'))return confirmGroupAddMembers();
  if(a.hasAttribute('data-toggle-directory-picker')){modal.pickerOpen=!modal.pickerOpen;return showGroupAddMemberModal();}
  if(a.hasAttribute('data-save-group-roles'))return saveGroupRoles();
  if(a.dataset.undoGroupMember)return undoGroupMemberRemoval(a.dataset.undoGroupMember);
  if(a.hasAttribute('data-confirm-group-member-remove'))return confirmGroupMemberRemove();
  if(a.hasAttribute('data-confirm-folder'))return confirmFolder();
  if(a.hasAttribute('data-confirm-file-remove'))return removeProjectFiles();
  if(a.hasAttribute('data-add-share-user')){e.preventDefault();return addShareUser();}
  if(a.dataset.removeShareUser&&modal.type==='share'){modal.selectedUserIds=modal.selectedUserIds.filter(id=>id!==a.dataset.removeShareUser);modal.error='';return showShareModal();}
  if(a.hasAttribute('data-save-share'))return saveShare();
  if(a.hasAttribute('data-open-share-cancel')&&modal.type==='share')return openCancelShare(modal.projectId,modal);
  if(a.hasAttribute('data-keep-share')&&modal.type==='share-cancel'){if(modal.previous){modal=modal.previous;return showShareModal();}return closeModal();}
  if(a.hasAttribute('data-confirm-collab-cancel'))return cancelCollab();
  if(a.hasAttribute('data-confirm-share-cancel'))return cancelShare();
  if(a.hasAttribute('data-directory-add-confirm'))return confirmDirectoryAdd();
  if(a.hasAttribute('data-confirm-directory-remove'))return confirmDirectoryRemove();
  if(a.hasAttribute('data-create-group-confirm'))return confirmGroupCreate();
  if(a.hasAttribute('data-new-collab-group')&&modal.type==='collab'&&!modal.recordId)return gotoGroupManagement();
  if(a.hasAttribute('data-clear-collab-groups'))return setCollabGroups([]);
  if(a.hasAttribute('data-toggle-group-picker')){modal.pickerOpen=!modal.pickerOpen;return drawGroupPicker();}
  if(a.dataset.removeGroupMember){modal.members=modal.members.filter(m=>m.id!==a.dataset.removeGroupMember);drawGroupPicker();return document.getElementById('groupMemberSearch').focus({preventScroll:true});}
  if(a.hasAttribute('data-select-all-collab-members'))return selectAllCollabMembers();
  if(a.hasAttribute('data-clear-collab-members'))return clearCollabMembers();
  if(a.hasAttribute('data-confirm-collab'))return confirmCollab();
  if(a.hasAttribute('data-save-role')&&modal.type==='edit'){
    if(!canManageCollaborationMembers())return closeModal();
    const m=projectMemberList().find(x=>x.id===modal.id);if(!m||m.role==='owner'||isSupportPerson(m))return closeModal();
    m.role=modalRoot.querySelector('input[name=role]:checked')?.value||m.role;syncRecords(project().id);saveAll();closeModal();render();return notify('成员角色已更新');
  }
  if(a.hasAttribute('data-confirm-remove')&&modal.type==='remove'){
    if(!canManageCollaborationMembers())return closeModal();
    const m=projectMemberList().find(x=>x.id===modal.id);if(!m||m.role==='owner'||isSupportPerson(m))return closeModal();
    project().members=project().members.filter(x=>x.id!==modal.id);syncRecords(project().id);saveAll();closeModal();render();return notify('成员已从项目中移除');
  }
});
modalRoot.addEventListener('submit',e=>{e.preventDefault();if(!canManage()&&!(canManageGroups()&&['memberAddForm','groupForm'].includes(e.target.id)))return;if(e.target.id==='folderForm')confirmFolder();else if(e.target.id==='shareForm')addShareUser();else if(e.target.id==='memberAliasForm')saveMemberAlias();else if(e.target.id==='managerMemberAddForm')confirmManagerMemberAdd();else if(e.target.id==='memberAddForm')submitMemberAdd();else if(e.target.id==='groupForm')confirmGroupCreate();});
modalRoot.addEventListener('input',e=>{
  if(!modal)return;
  e.target.closest('.field')?.classList.remove('invalid');
  if(e.target.id==='shareAccount'){modal.account=e.target.value;modal.error='';e.target.setAttribute('aria-invalid','false');e.target.closest('.share-account-control').classList.remove('invalid');document.getElementById('shareAccountError').hidden=true;drawShareAccountLookup();}
  if(e.target.id==='folderName')modal.name=e.target.value;
  if(e.target.id==='memberRemark'){modal.remark=e.target.value;e.target.setAttribute('aria-invalid','false');}
  if(e.target.dataset.memberField)return updateMemberLookup(e.target);
  if(e.target.id==='groupName'){modal.name=e.target.value;modal.error='';}
  if(e.target.id==='groupMemberSearch'){modal.memberQuery=e.target.value;modal.pickerOpen=true;drawGroupPicker();}
  if(e.target.id==='groupAddMemberSearch'){modal.memberQuery=e.target.value;modal.pickerOpen=true;document.getElementById('directoryMemberOptions').innerHTML=directoryPickerOptions();}
});
modalRoot.addEventListener('focusin',e=>{if(modal?.type==='group-create'&&e.target.id==='groupMemberSearch'){modal.pickerOpen=true;drawGroupPicker();}});
modalRoot.addEventListener('change',e=>{
  if(!modal||(!canManage()&&!canManageGroups()))return;
  if(e.target.id==='memberLookupType'){modal.remark=document.getElementById('memberRemark')?.value||'';modal.lookupKey=e.target.value;modal.error='';return showModal();}
  if(e.target.name==='role'&&memberRoles.includes(e.target.value)){modal.selectedRole=e.target.value;return;}
  if(e.target.dataset.collabRole){const id=e.target.dataset.collabRole;if(!isSupportPerson(id)&&memberRoles.includes(e.target.value)){modal.roleOverrides[id]=e.target.value;modalRoot.querySelectorAll('[data-collab-role]').forEach(el=>{if(el.dataset.collabRole===id)el.value=e.target.value;});}return;}
  if(e.target.hasAttribute('data-collab-download')){modal.downloadOverride=e.target.checked;return;}
  if(e.target.dataset.pickDirectoryMember){const id=e.target.dataset.pickDirectoryMember;if(isSupportPerson(id)||id==='owner-1'||id===currentUserId())return;modal.selectedIds=e.target.checked?[...new Set([...modal.selectedIds,id])]:modal.selectedIds.filter(x=>x!==id);document.getElementById('directoryMemberOptions').innerHTML=directoryPickerOptions();return;}
  if(e.target.dataset.pickGroupMember){const id=e.target.dataset.pickGroupMember;if(isSupportPerson(id))return;if(!memberAccountIsUnique(id))return notify('该账户无法唯一匹配，请重新核对');if(e.target.checked){if(!modal.members.some(m=>m.id===id))modal.members.push({id,role:defaultMemberRole(person(id))});}else modal.members=modal.members.filter(m=>m.id!==id);modal.memberError='';drawGroupPicker();modalRoot.querySelector(`[data-pick-group-member="${id}"]`)?.focus({preventScroll:true});return;}
  if(e.target.hasAttribute('data-select-all-collab-groups'))return setCollabGroups(e.target.checked?groups.map(g=>g.id):[]);
  if(e.target.dataset.collabGroup){const gid=e.target.dataset.collabGroup;return setCollabGroups(e.target.checked?[...modal.selectedGroupIds,gid]:modal.selectedGroupIds.filter(x=>x!==gid));}
  if(e.target.dataset.collabMember){const id=e.target.dataset.collabMember;changeCollabMember(id,e.target.checked);showCollabModal();modalRoot.querySelector(`[data-collab-member="${id}"]`)?.focus({preventScroll:true});return;}
  if(e.target.dataset.groupRole){const m=modal.members.find(x=>x.id===e.target.dataset.groupRole);if(m&&!isSupportPerson(m))m.role=e.target.value;}
});
document.addEventListener('click',e=>{if(openProjectSearch&&!e.target.closest('.project-search-control'))closeProjectSearch();});
window.addEventListener('resize',positionProjectSearch);
document.addEventListener('scroll',positionProjectSearch,true);
document.addEventListener('keydown',e=>{
  if(openProjectSearch&&['Escape','Enter'].includes(e.key)&&modalRoot.hidden){const id=openProjectSearch;closeProjectSearch();main.querySelector(`[data-project-search="${id}"]`)?.focus({preventScroll:true});if(e.key==='Escape')return;}
  if(e.key==='Escape'&&!modalRoot.hidden){if(!confirmRoot.hidden){closeConfirmation();document.getElementById('account')?.focus();}else dismissModal();}
  if(e.key==='Tab'&&!modalRoot.hidden){const els=[...modalRoot.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].filter(el=>el.offsetParent!==null);const first=els[0],last=els.at(-1);if(!first)return;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)&&e.target.getAttribute('role')==='tab'){
    e.preventDefault();const buttons=[...main.querySelectorAll('[role=tab]')],i=buttons.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();main.querySelectorAll('[role=tab]')[next].focus();
  }
});
saveAll();
chooseRoleLanding();
if(!history.state?.analysisResult&&document.body.hasAttribute('data-start-collaboration-analysis')){
  const demoProject=visibleProjects().find(p=>p.id==='analysis'&&p.collab)||visibleProjects().find(p=>p.collab);
  if(demoProject){
    activeProjectId=demoProject.id;
    detailOrigin={page:'projects',listTab:projectAccessRole(demoProject)?'mine':'shared'};
    history.replaceState({analysisResult:true,analysisDemoEntry:true,projectId:demoProject.id,detailOrigin:{...detailOrigin}},'');
  }
}
if(history.state?.analysisResult&&visibleProjects().some(p=>p.id===history.state.projectId)){
  activeProjectId=history.state.projectId;
  if(history.state.detailOrigin)detailOrigin={...history.state.detailOrigin};
  page='analysis-result';
}
render();
window.addEventListener('popstate',()=>{
  if(history.state?.analysisResult){
    const target=projects.find(p=>p.id===history.state.projectId);
    if(target&&visibleProjects().some(p=>p.id===target.id)){activeProjectId=target.id;if(history.state.detailOrigin)detailOrigin={...history.state.detailOrigin};page='analysis-result';render();}
  }else if(page==='analysis-result'){
    navigate('detail');
    main.querySelector('[data-show-result]')?.focus();
  }
});
