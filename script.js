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
// 身份切换用于体验发起方与不同接收成员，并非真实登录鉴权。
const identityUsers = { owner:'owner-1', support:'support-1', member:'li-1' };
const previewRoleNames={owner:'项目管理者',support:'技术支持',member:'被分享用户'};
// 暂不开放取消、重新协作；保留历史记录与实现，后续可单独恢复入口。
const collaborationFeatures=Object.freeze({cancel:false,restart:false});
const previewParams=new URLSearchParams(location.search);
const previewRoleAliases={owner:'owner',manager:'owner',support:'support',member:'member',recipient:'member'};
let recipientUserId='li-1';
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
const safetyMessage=isEnglishVersion?'Check that the email and username belong to the same person.':'请核对手机号或已绑定邮箱与用户名是否属于同一成员';
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
function accountSearchText(user) { return [user.name,...visibleAccountKeys.map(key=>usableAccountValue(user,key))].join(' ').toLowerCase(); }
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
  accountCatalog.set(u.id,{...previous,...u,phone:String(u.phone??previous.phone??'').trim(),account:String(u.account||'').trim(),email,emailBound:!!email&&emailBound});
}
platformAccounts=[...accountCatalog.values()];
const demoInstanceCatalog=new Map();
for(const u of [...demoMemberInstances,...directory.filter(isDemoMemberInstance)]){
  if(!isDemoMemberInstance(u))continue;
  demoInstanceCatalog.set(u.id,{...u,...accountCatalog.get(repeatableDemoAccountId),id:u.id,demoSourceId:repeatableDemoAccountId,defaultRole:defaultMemberRole(u),demoSequence:Number.isInteger(u.demoSequence)&&u.demoSequence>0?u.demoSequence:demoInstanceCatalog.size+1});
}
demoMemberInstances=[...demoInstanceCatalog.values()];
directory=directory.map(u=>({...u,...(isDemoMemberInstance(u)?demoInstanceCatalog.get(u.id):accountCatalog.get(u.id))}));
for(const p of projects){if(p.name==='测试示例-定量蛋白组分析')p.name='测试示例-定量蛋白组云分析';if(p.name==='测试示例-农学 SmallRNA分析')p.name='测试示例-农学SmallRNA分析';}
for(const p of projects){p.shareUserIds=[...new Set(Array.isArray(p.shareUserIds)?p.shareUserIds:[])];p.shared=!!(p.shared||p.shareUserIds.length);}
for(const p of projects)if(!Array.isArray(p.files))p.files=[];
for (const container of [...projects, ...groups]) for (const m of container.members || []) if (m.id === 'support-1') m.role = 'admin';
// 历史记录没有发起人时，保留授权并按原项目所有者补充来源。
for(const r of collabRecords){if(!r.initiatedBy)r.initiatedBy=projects.find(p=>p.id===r.projectId)?.members.find(m=>m.role==='owner')?.id||'owner-1';}
// 历史项目的直接授权与课题组授权分开保存；取消或编辑一处授权不会留下过期权限。
for(const p of projects){
  if(!Array.isArray(p.directCollabMembers))p.directCollabMembers=(p.members||[]).filter(m=>m.role!=='owner'&&!collabRecords.some(r=>r.projectId===p.id&&(r.members||[]).some(x=>x.id===m.id))).map(m=>({...m}));
  p.hasCollaborated=!!(p.hasCollaborated||p.collab||p.directCollabMembers.length||collabRecords.some(r=>r.projectId===p.id));
  rebuildProjectMembers(p);
}
let projectMenuOpen=true;
let page = 'projects', teamTab='members', activeProjectId = 'analysis', tab = 'data', listTab = 'mine', identity = 'owner', search = '', categoryFilter = '', selectedProjectIds = [], modal = null, toastTimer, confirmationTimer, returnFocus = null;
identity=previewRoleAliases[previewParams.get('role')]||'owner';
if(previewAccounts().some(u=>u.id===previewParams.get('user')&&!['owner-1','support-1'].includes(u.id)))recipientUserId=previewParams.get('user');
let detailOrigin = { page: 'projects', listTab: 'mine' };
let filePath=[],selectedFileIds=[];
const main = document.getElementById('main'), modalRoot = document.getElementById('modalRoot'), confirmRoot = document.getElementById('confirmRoot');
function saveAll() { try { localStorage.setItem(storageKey, JSON.stringify({ projects, groups, collabRecords, directory, platformAccounts, demoMemberInstances })); } catch { notify('浏览器未允许保存，当前操作将在本次浏览期间生效'); } }
function project() { return projects.find(p => p.id === activeProjectId) || projects[0]; }
function group(id) { return groups.find(g => g.id === id); }
function person(id) { return directory.find(d => d.id === id) || demoMemberInstances.find(d=>d.id===id) || platformAccounts.find(d=>d.id===id) || { name: '未知成员', phone: '', account: '' }; }
function ensureDirectoryPerson(id) { const u=platformAccounts.find(u=>u.id===id)||demoMemberInstances.find(u=>u.id===id);if(u&&!directory.some(d=>d.id===id))directory.push({...u}); }
function previewAccounts() { return [...platformAccounts,...demoMemberInstances]; }
function memberAccountIsUnique(id) { const u=person(id);return resolvePlatformAccount(u.account,'account').user?.id===(isDemoMemberInstance(u)?u.demoSourceId:id); }
function defaultMemberRole(user) { return user?.id==='support-1'?'admin':['admin','member','visitor'].includes(user?.defaultRole)?user.defaultRole:'member'; }
function selectedMemberRole(user) {
  if(user.id==='support-1')return 'admin';
  const role=modalRoot.querySelector('input[name=role]:checked')?.value||modal.selectedRole;
  return ['admin','member','visitor'].includes(role)?role:defaultMemberRole(user);
}
function memberForAddition(user,defaultRole=defaultMemberRole(user)) {
  if(!isRepeatableDemoAccount(user))return {...user,defaultRole};
  const demoSequence=demoMemberInstances.reduce((max,u)=>Math.max(max,u.demoSequence),0)+1;
  const id='demo-member-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
  const instance={...user,id,demoSourceId:user.id,demoSequence,defaultRole};
  demoMemberInstances.push(instance);
  return instance;
}
function isDirectoryOwner(id) { return id==='owner-1'||projects.some(p=>p.members.some(m=>m.id===id&&m.role==='owner')); }
function safe(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function currentUserId() { return identity==='member'?recipientUserId:identityUsers[identity]||'owner-1'; }
function isManagementView() { return identity==='owner'||identity==='support'; }
function projectRecords(p) { return collabRecords.filter(r=>r.projectId===p.id); }
function mergeProjectMembers(members) {
  const out=new Map(),rank={visitor:1,member:2,admin:3,owner:4};
  for(const m of members){const item={...m,role:m.id==='support-1'&&m.role!=='owner'?'admin':m.role};if(!out.has(m.id)||(rank[item.role]||0)>(rank[out.get(m.id).role]||0))out.set(m.id,item);}
  return [...out.values()];
}
function rebuildProjectMembers(p) {
  p.members=mergeProjectMembers([...(p.members||[]).filter(m=>m.role==='owner'),...projectRecords(p).flatMap(r=>r.members||[]),...(p.directCollabMembers||[])]);
  p.collab=projectRecords(p).length>0||p.directCollabMembers.length>0;
}
function projectAccessRole(p) { return p?.members.find(m=>m.id===currentUserId())?.role||null; }
function projectListIdentity(p) { const role=projectAccessRole(p);return role==='owner'?'owner':role==='visitor'?'visitor':role?'collaborator':null; }
function collaborationState(p) { return p.collab?'active':p.hasCollaborated?'cancelled':'never'; }
function canManageProject(p) {
  if(!p||!isManagementView())return false;
  return ['owner','admin'].includes(projectAccessRole(p));
}
function canConfigureCollaboration(p) { return canManageProject(p)&&(collaborationState(p)!=='cancelled'||collaborationFeatures.restart); }
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
function canManage() { return isManagementView()&&(page!=='detail'||canManageProject(project())); }
function chooseRoleLanding() {
  if(identity==='support'){page='projects';listTab=personalProjects().length?'mine':sharedProjects().length?'shared':'mine';return;}
  const visible=visibleProjects();
  if(!['projects','visual'].includes(page))page='projects';
  if(!visible.some(p=>p.type===(page==='visual'?'云图汇':'云分析'))&&visible.length)page=visible[0].type==='云图汇'?'visual':'projects';
  const type=page==='visual'?'云图汇':'云分析';
  listTab=personalProjects().some(p=>p.type===type)?'mine':sharedProjects().some(p=>p.type===type)?'shared':'mine';
}
function switchPreviewRole(next,userId=null) {
  if(!Object.hasOwn(previewRoleNames,next))return;
  closeModal();identity=next;
  if(userId&&previewAccounts().some(u=>u.id===userId&&!['owner-1','support-1'].includes(u.id)))recipientUserId=userId;
  search='';categoryFilter='';selectedProjectIds=[];filePath=[];selectedFileIds=[];tab='data';
  chooseRoleLanding();
  try{const url=new URL(location.href);url.searchParams.set('role',identity);if(identity==='member')url.searchParams.set('user',recipientUserId);else url.searchParams.delete('user');history.replaceState(null,'',url);}catch{}
  render();notify(`已切换为${previewRoleNames[identity]}：${person(currentUserId()).name}`);
}
function renderRolePreview() {
  const viewer=person(currentUserId()),support=identity==='support';
  document.querySelector('.sidebar').classList.toggle('technical-support-navigation',support);
  document.getElementById('projectMenuLabel').textContent=support?'项目管理':'项目列表';
  document.getElementById('analysisNavLabel').textContent=support?'技术管理':'云分析';
  document.getElementById('teamNavLabel').textContent=support?'技术支持人员管理':'成员与课题组';
  document.getElementById('projectSubnav').setAttribute('aria-label',support?'项目管理子目录':'项目列表子目录');
  document.querySelector('[data-project-menu] .nav-icon').innerHTML=icon(support?'layers':'folder');
  document.getElementById('navProjectCount').hidden=support;
  document.querySelectorAll('.sidebar [data-nav=overview],.sidebar [data-nav=data],.sidebar [data-nav=visual]').forEach(button=>button.hidden=support);
  document.querySelectorAll('[data-preview-role]').forEach(button=>{const active=button.dataset.previewRole===identity;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('.sidebar [data-nav=team]').forEach(button=>button.hidden=!isManagementView());
  document.getElementById('rolePreviewCaption').textContent=identity==='support'?'展示受邀项目；按项目授权管理成员与协作':isManagementView()?'可管理拥有或受邀管理的项目':'仅查看收到的共享与协作项目';
  document.getElementById('currentRoleLabel').textContent=`${previewRoleNames[identity]} · ${viewer.name}`;
  document.getElementById('recipientAccountControl').hidden=identity!=='member';
  const select=document.getElementById('recipientSelect');
  select.innerHTML=previewAccounts().filter(u=>!['owner-1','support-1'].includes(u.id)).map(u=>`<option value="${safe(u.id)}" ${u.id===recipientUserId?'selected':''}>${safe(u.name)}${safe(demoMemberLabel(u))}</option>`).join('');
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
  if(identity==='support'&&['visual','overview','data'].includes(next))next='projects';
  if(!isManagementView()&&['team','groups','members'].includes(next))return notify('被分享用户仅可查看收到的项目');
  if(['groups','members'].includes(next)){teamTab=next;next='team';}else if(next==='team'&&page!=='team')teamTab='members';
  if(['projects','visual'].includes(next)&&next!==page){selectedProjectIds=[];const type=next==='visual'?'云图汇':'云分析';listTab=personalProjects().some(p=>identity==='support'||p.type===type)?'mine':sharedProjects().some(p=>identity==='support'||p.type===type)?'shared':'mine';}
  if(options.projectTab&&['projects','visual'].includes(next))listTab=options.projectTab==='shared'?'shared':'mine';
  if(['projects','visual','team'].includes(next))projectMenuOpen=true;
  page=next;search='';categoryFilter='';render();window.scrollTo({top:0,behavior:'instant'});
}
function isCollaborativeDetail() { return page==='detail'&&detailOrigin.listTab==='mine'&&isReceivedProject(project())&&project().collab; }
function isManageableCollabDetail() { return page==='detail'&&detailOrigin.listTab==='mine'&&canManageProject(project())&&project().collab; }
function canViewCollaborationList() { return identity!=='support'&&(isCollaborativeDetail()||isManageableCollabDetail()); }
function projectMemberList() {
  const p=project(),uid=currentUserId();
  if(canManageProject(p)||p.directCollabMembers.some(m=>m.id===uid))return p.members;
  return mergeProjectMembers([...p.members.filter(m=>m.role==='owner'),...projectRecords(p).filter(r=>r.members.some(m=>m.id===uid)).flatMap(r=>r.members)]);
}
function openProjectDetail(id, recordId = null) {
  const target = projects.find(p => p.id === id);
  if (!target||!visibleProjects().some(p=>p.id===id))return notify('当前身份没有该项目的查看权限');
  const sourceTab=['projects','visual'].includes(page)?listTab:projectAccessRole(target)?'mine':'shared';
  if(sourceTab==='mine'&&!projectAccessRole(target))return notify('当前账号未被邀请参与该项目');
  detailOrigin={page:identity!=='support'&&target.type==='云图汇'?'visual':'projects',listTab:sourceTab};
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
    ['全部项目',visibleProjects().length,'个','folder','全部科研项目，一处管理','项目总览'],
    ['共享项目',sharedProjects().length,'个','link','已共享的项目与分析成果','共享空间'],
    ['受邀项目',personalProjects().filter(isReceivedProject).length,'个','people','已合并到派森诺项目中','收到的邀请'],
    ['课题组',groups.length,'个','shield',`${directory.length} 位成员，一同探索`,'成员组织']
  ];
  return `<div class="stats-grid">${items.map(([label,num,unit,ico,desc,aria],i)=>`<article class="stat-card" aria-label="${aria}"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon(ico)}</span></div><div class="stat-number">${String(num).padStart(2,'0')}<small>${unit}</small></div><div class="stat-desc"><span class="accent">${i===0?'已就绪':i===2?'有序协作':'持续连接'}</span>${desc}</div><svg class="stat-spark" viewBox="0 0 64 24" aria-hidden="true"><path d="M1 21 10 15 18 18 26 8 35 12 44 5 53 9 63 2" fill="none" stroke="${['#9dc4f4','#adc0d3','#d1c29c','#c4b6d3'][i]}" stroke-width="1.5"/></svg></article>`).join('')}</div>`;
}
function filteredProjects() { const q=search.trim().toLowerCase(),source=listTab==='mine'?personalProjects():listTab==='shared'?sharedProjects():visibleProjects();return source.filter(p=>(identity==='support'||p.type===(page==='visual'?'云图汇':'云分析'))&&(!categoryFilter||p.category===categoryFilter)&&`${p.name} ${p.code} ${p.category} ${p.ticket} ${p.contract}`.toLowerCase().includes(q)); }

async function copyProjectTicket(id) {
  const value=projects.find(p=>p.id===id)?.ticket;if(!value)return;
  let copied=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true;}}catch{}
  if(!copied){const field=document.createElement('textarea');field.value=value;field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();}
  notify(copied?'开题单号已复制':'复制未成功，请手动选中开题单号复制');
}
function projectCell(p, i = 0) { return `<div class="project-title-cell"><span class="project-mark ${['','lavender','sand','blue'][i%4]}">${icon(p.id==='single-cell'?'grid':p.id==='visual'?'chart':'folder')}</span><div><button class="project-name" data-open-project="${safe(p.id)}">${safe(p.name.replace(/^测试示例-/,'').replace(/^测试示例—/,''))}</button><span class="project-code">${safe(p.code)}</span></div></div>`; }
function renderProjects() {
  const support=identity==='support',projectType=page==='visual'?'云图汇':'云分析',mine=listTab==='mine',inScope=p=>support||p.type===projectType;
  const scopedProjects=(mine?personalProjects():sharedProjects()).filter(inScope);
  const counts={mine:personalProjects().filter(inScope).length,shared:sharedProjects().filter(inScope).length};
  const tabs=[['mine',support?'协作项目':'派森诺项目'],['shared','共享项目']],list=filteredProjects();
  const showSelection=mine&&isManagementView(),selectedCount=selectedProjectIds.filter(id=>list.some(p=>p.id===id&&canConfigureCollaboration(p))).length;
  const identityNames={owner:'拥有者',collaborator:'协作者',visitor:'访问者'};
  const identityHints={owner:'拥有并管理项目，可发起和编辑协作。',collaborator:'受邀参与项目，具体操作按项目授权开放。',visitor:'受邀只读访问项目，不可分享或管理协作。'};
  const head=`<tr>${showSelection?'<th class="check-cell"><input type="checkbox" data-select-all-projects aria-label="全选当前可管理项目"></th>':''}<th class="ticket-column">开题单号</th>${mine?'<th class="project-identity-column">项目身份</th>':''}<th class="contract-column">合同编号</th><th class="code-column">云平台项目编号</th><th class="name-column">项目名称</th><th class="category-column">所属类别</th><th class="created-column">创建时间</th><th class="status-column">状态</th>${mine?'<th class="project-actions-column">操作</th>':''}</tr>`;
  const rows=list.map(p=>{
    const state=collaborationState(p),editable=canManageProject(p),relation=projectListIdentity(p);
    const actionLabel=state==='active'?'编辑协作':state==='cancelled'?'重新协作':'去协作';
    const stateLabel=state==='active'?'协作中':state==='cancelled'?'已取消协作':'未协作';
    const invite=projectRecords(p).find(r=>r.members.some(m=>m.id===currentUserId()));
    const inviter=person(invite?.initiatedBy||p.directCollabMembers.find(m=>m.id===currentUserId())?.invitedBy||p.members.find(m=>m.role==='owner')?.id||'owner-1').name;
    const actions=editable?`<div class="table-actions">${canConfigureCollaboration(p)?`<button class="btn primary small ${state==='active'?'project-action-done':''}" data-collab-one="${p.id}" title="${actionLabel}">${icon(state==='active'?'people':'link')}${actionLabel}</button>`:''}<button class="btn quiet small text-primary ${p.shared?'project-action-done':''}" data-share-project="${p.id}" title="${p.shared?'管理分享设置':'分享原始分析结果'}">${p.shared?'已分享':'分享'}</button>${state==='active'&&collaborationFeatures.cancel?`<button class="btn quiet small danger collab-cancel-button" data-cancel-collab="${p.id}">取消协作</button>`:''}</div>`:`<button class="btn quiet small" data-open-project="${p.id}">${icon('eye')}查看项目</button>`;
    return `<tr data-project-row="${p.id}" data-collaboration-state="${state}" class="${mine&&selectedProjectIds.includes(p.id)?'selected':''}">${showSelection?`<td class="check-cell"><input type="checkbox" data-select-project="${p.id}" ${selectedProjectIds.includes(p.id)?'checked':''} ${canConfigureCollaboration(p)?'':'disabled'} aria-label="选择 ${safe(p.name)}"></td>`:''}<td><div class="ticket-cell"><button class="ticket-link" data-open-project="${p.id}">${safe(p.ticket)}</button><button class="copy-ticket" data-copy-ticket="${p.id}" aria-label="复制开题单号 ${safe(p.ticket)}" title="复制开题单号">${icon('copy')}</button></div></td>${mine?`<td class="project-identity-column"><span class="project-identity-badge ${relation}" data-project-identity="${p.id}" title="${identityHints[relation]}">${icon(relation==='owner'?'shield':relation==='visitor'?'eye':'people')}${identityNames[relation]}</span></td>`:''}<td class="contract-value">${safe(p.contract)}</td><td><span class="platform-code">${safe(p.code)}</span><span class="project-demo-tag">DEMO</span></td><td><button class="reference-project-name" data-open-project="${p.id}">${safe(p.name)}</button>${mine&&isReceivedProject(p)?`<span class="collab-project-group">邀请方：${safe(inviter)}</span>`:!mine?`<span class="collab-project-group">分享人：${safe(person(p.shareInitiatedBy||p.members.find(m=>m.role==='owner')?.id||'owner-1').name)}</span>`:''}</td><td class="reference-category">${safe(p.category)}</td><td class="reference-created">${safe(p.created)}</td><td><span class="reference-status">${safe(p.status)}</span></td>${mine?`<td class="project-actions-column">${actions}<span class="collab-state-text ${state}" data-collab-state-label="${p.id}">${stateLabel}</span></td>`:''}</tr>`;
  }).join('');
  const cols=mine?(showSelection?10:9):7;
  const bulk=mine&&isManagementView()&&manageableProjects().some(p=>inScope(p)&&canConfigureCollaboration(p));
  const description=identity==='support'?'展示你受邀参与的项目，按项目授权管理协作。':'拥有与受邀项目统一展示，项目身份以当前账号在该项目中的授权为准。';
  return `<div class="page" data-screen-label="项目列表">${heading(support?'技术管理':projectType,description,isManagementView()?`<button class="btn ghost" data-nav="team">${icon('people')}${support?'技术支持人员管理':'成员与课题组'}</button>`:'')}
    <section class="surface"><div class="surface-top"><div class="list-tabs" role="tablist" aria-label="项目类型">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${listTab===key}" class="${listTab===key?'active':''}" data-list-tab="${key}">${label}<span class="tab-count">${counts[key]}</span></button>`).join('')}</div><span class="surface-caption">${mine?'拥有者 / 协作者 / 访问者':'仅分享原始分析结果'}</span></div>
    <div class="list-toolbar">${searchField('projectSearch','搜索开题单号、项目名称或编号')}<div class="toolbar-right"><label class="filter-label"><span>项目类别</span><select id="categoryFilter" class="filter-select" aria-label="筛选项目类别"><option value="">全部类别</option>${[...new Set(scopedProjects.map(p=>p.category))].map(c=>`<option ${categoryFilter===c?'selected':''} value="${safe(c)}">${safe(c)}</option>`).join('')}</select></label>${bulk?`<button class="btn primary toolbar-collab-action" data-collab-selected>${icon('link')}${selectedCount?`协作已选项目（${selectedCount}）`:'发起项目协作'}</button>`:`<span class="small-count">共 ${list.length} 个项目</span>`}</div></div>
    <div class="project-reference-note">${icon('info')}<span>${mine?'拥有者可管理项目；协作者按授权参与；访问者仅查看。点击开题单号或项目名称查看详情。':'此列表保留项目分享功能，仅查看原始分析结果，不显示协作角色。'}</span></div>
    ${mine&&selectedCount?`<div class="selection-note">已选择 ${selectedCount} 个项目<button data-clear-projects>清空选择</button></div>`:''}
    <div class="table-shell project-table reference-project-table ${mine?'':'readonly-project-table'}"><div class="table-scroll"><table><thead>${head}</thead><tbody>${rows||`<tr><td colspan="${cols}" class="empty-cell">${emptyState(mine?'暂无匹配的拥有或受邀项目':'暂无共享项目',mine?'只显示当前账号拥有或已受邀参与的项目，请尝试其他关键词。':'分享功能继续保留，可由项目管理者邀请用户查看原始结果。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length)}</section>${pageFoot(mine?'未协作可“去协作”，已协作可“编辑协作”；项目分享独立管理。':'共享项目只提供原始结果查看；项目协作与分享分别管理。')}</div>`;
}

function renderGroups() {
  const q = search.trim().toLowerCase();
  const list = groups.filter(g=>`${g.name} ${g.members.map(m=>person(m.id).name).join(' ')}`.toLowerCase().includes(q));
  return `<div class="page" data-screen-label="课题组列表">${heading('课题组管理','把志同道合的人聚在一起，让每一次协作更高效。',`<button class="btn primary" data-create-group ${!canManage()?'disabled':''}>${icon('plus')}添加课题组</button>`)}
    <div class="info-banner">${icon('shield')}<div><h2>技术支持，为课题组提供专业协助</h2><p>可在课题组中直接添加技术支持，加入后固定为管理员角色。</p></div></div>
    <section class="surface"><div class="surface-top"><h2 class="surface-title">我的课题组 <span class="tab-count">${groups.length}</span></h2><span class="surface-caption">一个课题组，一次专注的探索</span></div><div class="toolbar">${searchField('groupSearch','搜索课题组名称或成员')}<span class="small-count">共 ${list.length} 个课题组</span></div>
    <div class="table-shell group-table"><div class="table-scroll"><table><thead><tr><th>课题组</th><th>成员名单</th><th class="table-actions-column">操作</th></tr></thead><tbody>${list.map(g=>`<tr><td><div class="group-cell"><span class="group-emblem">${icon('people')}</span><div><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员 · 科研协作</small></div></div></td><td>${memberRoster(g.members)}</td><td><div class="table-actions group-actions"><button class="btn primary small" data-open-collab="${g.id}" ${!canManage()?'disabled':''}>${icon('link')}协作项目</button><button class="btn quiet small" data-group-add="${g.id}" ${!canManage()?'disabled':''}>添加成员</button>${g.members.some(m=>m.id==='support-1')?'<span class="support-state">技术支持已加入</span>':`<button class="btn quiet small text-primary" data-add-support-group="${g.id}" ${!canManage()?'disabled':''}>添加技术支持</button>`}</div></td></tr>`).join('')||`<tr><td colspan="3" class="empty-cell">${emptyState('还没有课题组','点击“添加课题组”，邀请成员一起探索。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'个课题组')}</section></div>`;
}
function renderTeam() {
  const tabs=`<div class="team-management-tabs" role="tablist" aria-label="成员与课题组"><button type="button" role="tab" data-team-tab="members" aria-selected="${teamTab==='members'}" class="${teamTab==='members'?'active':''}">${icon('person')}成员管理<span>${directory.length}</span></button><button type="button" role="tab" data-team-tab="groups" aria-selected="${teamTab==='groups'}" class="${teamTab==='groups'?'active':''}">${icon('people')}课题组管理<span>${groups.length}</span></button></div>`;
  let content=(teamTab==='members'?renderMemberDirectory():renderGroups()).replace(/(<div class="page"[^>]*>)/,`$1${tabs}`);
  if(identity==='support'&&teamTab==='members')content=content.replace('<h1>成员管理</h1>','<h1>技术支持人员管理</h1>');
  return content;
}
function renderMemberDirectory() {
  const q=search.trim().toLowerCase();
  const list=directory.filter(d=>accountSearchText(d).includes(q));
  return `<div class="page" data-screen-label="成员列表">${heading('成员管理','每一个伙伴，都是科研协作不可或缺的一部分。',`<button class="btn primary" data-add-directory ${!canManage()?'disabled':''}>${icon('plus')}添加成员</button>`)}
    <section class="surface"><div class="surface-top"><h2 class="surface-title">所有成员 <span class="tab-count">${directory.length}</span></h2><span class="surface-caption">云平台账号与课题组归属</span></div><div class="toolbar">${searchField('memberSearch',isEnglishVersion?'Search name, username or email':'搜索姓名、用户名、手机号或已绑定邮箱')}<span class="small-count">共 ${list.length} 位成员</span></div>
    <div class="table-shell directory-table"><div class="table-scroll"><table><thead><tr><th>成员</th><th>用户名</th><th>${memberContactLabel}</th><th class="directory-role-column">默认角色</th><th>所在课题组</th><th class="directory-actions-column">操作</th></tr></thead><tbody>${list.map((d,i)=>{const gs=groups.filter(g=>g.members.some(m=>m.id===d.id)),assignedRole=isDirectoryOwner(d.id)?'owner':defaultMemberRole(d); const contact=safe(accountContact(d,'',true).value||(isEnglishVersion?'Not provided':'未登记')); return `<tr><td><div class="member-cell">${avatar(d.name,i)}<div><div class="member-name">${safe(d.name)}${d.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><span class="member-note">${d.id==='owner-1'?'项目所有者':d.id==='support-1'?'平台技术支持':'云平台成员'}</span></div></div></td><td>${safe(d.account)}${safe(demoMemberLabel(d))}</td><td class="date-cell">${contact}</td><td class="directory-role-column"><span class="role-pill ${assignedRole}" data-directory-role="${safe(d.id)}">${icon(roleIcons[assignedRole]||'shield')}${roleNames[assignedRole]}</span></td><td>${gs.map(g=>`<span class="group-chip">${safe(g.name)}</span>`).join('')||'<span class="fixed">暂未加入课题组</span>'}</td><td class="directory-actions-column"><button class="btn quiet small danger" data-remove-directory="${safe(d.id)}" ${!canManage()||isDirectoryOwner(d.id)||directoryAssociations(d.id).blocked?'disabled':''} title="${isDirectoryOwner(d.id)?'项目所有者不可移除':directoryAssociations(d.id).blocked?'已参与协作项目或项目分享，暂不能直接移除':'未参与协作项目，可直接从成员库移除'}" aria-label="移除成员${safe(d.name)}">移除成员</button></td></tr>`;}).join('')||`<tr><td colspan="6" class="empty-cell">${emptyState('未找到匹配的成员','试试其他姓名、用户名、手机号或邮箱。')}</td></tr>`}</tbody></table></div></div>${tableFooter(list.length,'位成员')}</section>${pageFoot('未参与协作项目或项目分享的成员可直接移除；移除仅影响成员库，不删除云平台账号。')}</div>`;
}
function renderMemberRow(member,index) { const u=person(member.id); return `<tr><td><div class="member-cell">${avatar(u.name,index)}<div><div class="member-name">${safe(u.name)}${member.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><span class="member-note">${safe(u.account)}${safe(demoMemberLabel(u))}</span></div></div></td><td><span class="role-pill ${member.role}">${icon(roleIcons[member.role]||'person')}${roleNames[member.role]}</span></td><td class="date-cell">${safe(accountContact(u,'',true).value)}</td><td><div class="table-actions">${canManage()?`<button class="btn quiet small text-primary" data-edit-member="${member.id}" ${member.id==='support-1'?'disabled title="技术支持固定为管理员"':''}>调整角色</button><button class="btn quiet small danger" data-remove-member="${member.id}">移除成员</button>`:'<span class="fixed">暂无管理权限</span>'}</div></td></tr>`; }
function renderMembers(p) {
  if(!canViewCollaborationList())return '';
  const manageable=canManage();
  const list=projectMemberList().filter(m=>m.role!=='owner'&&`${person(m.id).name} ${person(m.id).account} ${roleNames[m.role]}`.toLowerCase().includes(search.toLowerCase()));
  const groupNames=[...new Set(projectRecords(p).filter(r=>manageable||p.directCollabMembers.some(m=>m.id===currentUserId())||r.members.some(m=>m.id===currentUserId())).map(r=>r.groupName).filter(Boolean))];
  const readonlyRow=(member,index)=>{const u=person(member.id);return `<tr><td><div class="member-cell">${avatar(u.name,index)}<div><div class="member-name">${safe(u.name)}${member.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><span class="member-note">${safe(u.account)}${safe(demoMemberLabel(u))}</span></div></div></td><td><span class="role-pill ${safe(member.role)}">${icon(roleIcons[member.role]||'person')}${roleNames[member.role]}</span></td><td class="date-cell">${safe(accountContact(u,'',true).value)}</td></tr>`;};
  return `<section class="surface"><div class="section-header"><div><h2>协作列表</h2><p>${manageable?'管理员可添加成员、调整角色或移除授权。':'查看当前协作成员与角色，成员变更由分享人管理'}</p>${groupNames.length?`<div class="collab-group-badges">${groupNames.map(g=>`<span class="collab-group-badge">${icon('people')}${safe(g)}</span>`).join('')}</div>`:''}</div>${manageable?`<button class="btn primary" data-add ${!canManage()?'disabled':''}>${icon('plus')}添加成员</button>`:`<span class="collab-readonly-badge">${icon('eye')}仅查看</span>`}</div><div class="toolbar">${searchField('memberSearch','搜索成员姓名或账号')}<span class="small-count">共 ${list.length} 位协作成员</span></div><div class="table-shell directory-table"><div class="table-scroll"><table><thead><tr><th>协作成员</th><th>项目角色</th><th>${memberContactLabel}</th>${manageable?'<th class="table-actions-column">操作</th>':''}</tr></thead><tbody>${list.map((member,index)=>manageable?renderMemberRow(member,index):readonlyRow(member,index)).join('')||`<tr><td colspan="${manageable?4:3}" class="empty-cell">${emptyState('暂无匹配的协作成员','试试其他成员姓名或账号。')}</td></tr>`}</tbody></table></div></div><div class="detail-permission"><span>项目所有者：${safe(person(p.members.find(m=>m.role==='owner')?.id||'owner-1').name)}</span>${groupNames.length?`<span>协作课题组：${safe(groupNames.join('、'))}</span>`:''}<span>访问者下载：${p.visitorDownload?'允许':'不允许'}</span></div></section>`;
}
function renderDetail() {
  const p=project(),collaborative=canViewCollaborationList(),readonly=collaborative&&!canManageProject(p);
  if(!collaborative)tab='data';
  return `<div class="page project-detail-page" data-screen-label="项目详情"><button class="back-link" data-back-project-list>${icon('back')}返回${{mine:identity==='support'?'协作项目':'派森诺项目',shared:'共享项目',collab:'协作项目'}[detailOrigin.listTab]}列表</button>
    <section class="reference-detail-summary"><div class="reference-detail-title"><span class="detail-project-icon">${icon(p.type==='云图汇'?'chart':'folder')}</span><div><h1>${safe(p.name)}</h1><span class="reference-detail-status">状态：${safe(p.status)}</span></div></div>
    <dl><dt>开题单号</dt><dd><span class="ticket-cell"><span class="ticket-link">${safe(p.ticket)}</span><button class="copy-ticket" data-copy-ticket="${p.id}" aria-label="复制开题单号 ${safe(p.ticket)}">${icon('copy')}</button></span></dd></dl><dl><dt>合同号</dt><dd>${safe(p.contract)}</dd></dl><dl><dt>云平台项目编号</dt><dd>${safe(p.code)}</dd></dl><button class="btn primary detail-result-button" data-show-result>查看结果</button></section>
    <div class="detail-download-banner"><span>下载派森诺云盘，一键下载全部项目数据。</span><button class="btn" data-cloud-download>${icon('download')}下载派森诺云盘</button></div>
    ${detailOrigin.listTab==='shared'?`<div class="shared-detail-context">分享人：${safe(person(p.shareInitiatedBy||p.members.find(m=>m.role==='owner')?.id||'owner-1').name)}<span>仅查看原始分析结果</span></div>`:''}
    <section class="surface project-detail-content"><div class="detail-tabs"><button data-tab="data" class="${tab==='data'?'active':''}">项目数据</button>${collaborative?`<button data-tab="members" class="${tab==='members'?'active':''}">协作列表</button>`:''}</div>${collaborative&&tab==='members'?`${readonly?'<div class="detail-collab-context">你是协作接收方，仅可查看已授权的成员信息。</div>':''}${renderMembers(p)}`:renderProjectFiles(p)}</section></div>`;
}
function currentProjectFiles() { return project().files.filter(f=>(f.parentId||null)===(filePath.at(-1)||null)); }
function renderProjectFiles(p) {
  const files=currentProjectFiles();
  return `<div class="project-file-manager"><div class="data-toolbar"><button class="btn" data-delete-selected-files ${!canManage()||!selectedFileIds.length?'disabled':''}>${icon('trash')}删除${selectedFileIds.length?`（${selectedFileIds.length}）`:''}</button><button class="btn text-primary" data-create-folder ${!canManage()?'disabled':''}>${icon('folder')}新建文件夹</button><span class="file-demo-note">示例文件操作，保存在当前浏览器</span></div>
    <nav class="file-breadcrumb" aria-label="文件目录"><button data-file-path="-1">根目录</button>${filePath.map((id,i)=>`<span>›</span><button data-file-path="${i}">${safe(p.files.find(f=>f.id===id)?.name||'文件夹')}</button>`).join('')}</nav>
    <div class="table-shell project-file-table"><div class="table-scroll"><table><thead><tr><th class="check-cell"><input type="checkbox" data-select-all-files aria-label="全选当前目录文件" ${files.length&&files.every(f=>selectedFileIds.includes(f.id))?'checked':''}></th><th>文件名称</th><th>大小</th><th>项目分析时间</th><th>创建者</th><th>操作</th></tr></thead><tbody>${files.map(f=>`<tr><td class="check-cell"><input type="checkbox" data-select-file="${safe(f.id)}" ${selectedFileIds.includes(f.id)?'checked':''} aria-label="选择文件夹 ${safe(f.name)}"></td><td><button class="file-folder-name" data-open-folder="${safe(f.id)}">${icon('folder')}${safe(f.name)}</button></td><td>—</td><td class="date-cell">${safe(f.createdAt)}</td><td>${safe(f.creator)}</td><td><button class="btn quiet small danger" data-delete-file="${safe(f.id)}" ${!canManage()?'disabled':''}>删除</button></td></tr>`).join('')||`<tr><td colspan="6" class="empty-cell">${emptyState('暂无数据','可新建文件夹，整理项目分析数据。')}</td></tr>`}</tbody></table></div></div>${tableFooter(files.length,'项')}</div>`;
}
function renderOverview() { return `<div class="page" data-screen-label="项目概况">${heading(`欢迎回来，${safe(person(currentUserId()).name)}`,'科研的每一步探索，都值得被妥善连接。',`<button class="btn primary" data-nav="projects">${icon('folder')}查看全部项目</button>`)}${stats()}<div class="summary-panels"><section class="surface summary-panel"><h2>项目类别分布</h2>${[...new Set(visibleProjects().map(p=>p.type))].map((t,i)=>{const count=visibleProjects().filter(p=>p.type===t).length;return `<div style="margin-bottom:23px"><div class="progress-row"><span>${safe(t)}</span><span>${count} 个项目</span></div><div class="progress-track ${i?'blue':''}"><i style="width:${count/visibleProjects().length*100}%"></i></div></div>`;}).join('')}<div class="overview-list"><div class="overview-item">${icon('shield')}所有示例项目分析已完成<small>可开始协作</small></div></div></section><section class="surface summary-panel"><h2>我的课题组</h2><div class="overview-list">${groups.map((g,i)=>`<button class="btn ghost" data-open-collab="${g.id}" style="justify-content:flex-start">${avatar(g.name,i)}${safe(g.name)}<span style="margin-left:auto" class="small-count">${g.members.length} 人</span></button>`).join('')}</div><button class="btn quiet text-primary" data-nav="groups" style="margin-top:18px">查看全部课题组 →</button></section></div></div>`; }
function renderData() { return `<div class="page" data-screen-label="项目数据">${heading('项目数据','从数据到洞察，所有分析项目都在这里。')}${stats()}<div class="data-grid">${visibleProjects().map((p,i)=>`<article class="surface data-card">${icon(p.type==='云图汇'?'chart':'folder')}<h3>${safe(p.name.replace(/^测试示例-/,''))}</h3><p>${safe(p.code)}<br>${safe(p.category)} · 分析已完成</p><button class="btn" data-open-data="${p.id}">查看项目概况 →</button></article>`).join('')}</div>${pageFoot('本原型用于演示项目与成员管理，不包含真实分析文件。')}</div>`; }
function render() {
  renderRolePreview();
  if(listTab==='collab')listTab='mine';
  if(page==='detail'&&((detailOrigin.listTab==='mine'&&!projectAccessRole(project()))||(detailOrigin.listTab==='shared'&&!sharedProjects().some(p=>p.id===activeProjectId)))){page=detailOrigin.page;listTab='mine';tab='data';search='';}
  const viewer=person(currentUserId());
  document.querySelector('.side-user strong').textContent=viewer.name;
  document.querySelectorAll('.side-user .user-avatar,.header-avatar').forEach(el=>{el.textContent=viewer.name.slice(0,1);el.setAttribute('aria-label',`当前用户：${viewer.name}`);});
  document.body.classList.remove('reference-mode');
  const renderers={projects:renderProjects,visual:renderProjects,team:renderTeam,detail:renderDetail,overview:renderOverview,data:renderData};
  main.innerHTML=(renderers[page]||renderProjects)();
  const labels={projects:identity==='support'?'技术管理':'云分析',visual:'云图汇',team:identity==='support'?'技术支持人员管理':'成员与课题组',detail:'项目详情',overview:'项目概况',data:'项目数据'};
  const navPage=page==='detail'?(identity!=='support'&&project().type==='云图汇'?'visual':'projects'):page;
  const nested=['projects','visual','team'].includes(navPage);
  document.getElementById('crumb').innerHTML=`工作空间 <span>/</span> ${nested?(identity==='support'?'项目管理 <span>/</span> ':'项目列表 <span>/</span> '):''}<strong>${labels[navPage]||'项目列表'}</strong>${page==='detail'?`<span>/</span>${{mine:identity==='support'?'协作项目':'派森诺项目',shared:'共享项目',collab:'协作项目'}[detailOrigin.listTab]}<span>/</span>${safe(project().name.replace(/^测试示例-/,''))}`:''}`;
  document.querySelectorAll('[data-nav]').forEach(n=>{const active=n.dataset.nav===navPage;n.classList.toggle('active',active);if(n.closest('.side-nav')){if(active)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');}});
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
  const modalClass=modal?.type==='collab'?'collaboration-modal':modal?.type==='group-create'?'group-create-modal':['add','directory-add'].includes(modal?.type)?'member-account-modal':'';
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
function showAccountConfirmation(user) {
  if(modal.roleAccountId!==user.id)modal.selectedRole=defaultMemberRole(person(user.id));
  modal.roleAccountId=user.id;
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
function rolesRadio(selected='member') {
  const names=isEnglishVersion?{admin:'Administrator',member:'Member',visitor:'Viewer'}:roleNames;
  const descriptions=isEnglishVersion?{admin:'Manage members and permissions within the project.',member:'Run analyses and use authorized project data.',visitor:'View authorized content; downloads are managed separately.'}:roleDescriptions;
  return `<div class="role-choices">${['admin','member','visitor'].map(r=>`<label class="role-option ${r}"><input type="radio" name="role" value="${r}" ${selected===r?'checked':''}><span class="role-icon">${icon(roleIcons[r])}</span><span><strong>${names[r]}</strong><small>${descriptions[r]}</small></span></label>`).join('')}</div>`;
}
function memberRoleSelection(user,label) {
  return `<fieldset class="member-role-fieldset"><legend class="field-label">${safe(label)}</legend>${user.id==='support-1'?`<div class="fixed-admin-role">${isEnglishVersion?'Technical support is always an administrator.':'技术支持固定为管理员，角色不可调整。'}</div>`:rolesRadio(modal.selectedRole||defaultMemberRole(person(user.id)))}</fieldset>`;
}
function openAdd(target='project', groupId=null) { if(!canManage()) return notify('当前角色不能添加成员'); modal={type:'add',target,groupId,step:'verify',contact:'',error:''}; showModal(); }
function openGroupCreate(parent=null) { if(!canManage()) return notify('当前角色不能添加课题组'); modal={type:'group-create',name:'',members:[],memberQuery:'',pickerOpen:false,error:'',memberError:'',parent,parentFocus:'[data-new-collab-group]'}; showModal(); }
function openDirectoryAdd(parent=null){ if(!canManage()) return notify('当前角色不能添加成员'); modal={type:'directory-add',step:'verify',account:'',contact:'',error:'',parent,parentFocus:'#groupMemberSearch'}; showModal(); }
function accountIdentityCard(u) {
  const contact=accountContact(u,contactKeyFor(modal.contact));
  return `<div class="verify-success account-identity-card">${avatar(u.name)}<div><strong>${safe(u.name)}</strong><span>${isEnglishVersion?'Username':'用户名'}：${safe(u.account)}${safe(demoMemberLabel(u))}</span><span>${contact.label}：${safe(contact.value)}</span></div><span class="checkmark">${isEnglishVersion?'Account matched':'演示核对通过'}</span></div>`;
}
function showMemberAccountLookup(title) {
  modal.contact=modal.contact||'';
  modal.account=modal.account||'';
  const fields=[['contact',memberContactLabel,isEnglishVersion?'email':'text',isEnglishVersion?'email':'text',100,isEnglishVersion?'Enter account email':'请输入注册手机号或后续绑定的邮箱',isEnglishVersion?'Enter a valid account email.':'请输入有效手机号或已绑定邮箱'],['account',isEnglishVersion?'Username':'用户名','text','text',80,isEnglishVersion?'Enter username':'请输入云平台用户名',isEnglishVersion?'Enter a valid username.':'请匹配有效的云平台用户名']];
  const examples=demoPlatformAccounts.filter(user=>isRepeatableDemoAccount(user)).map(user=>{
    const contact=accountContact(user,isEnglishVersion?'email':'phone');
    return {user,contact};
  }).filter(example=>example.contact.value);
  const exampleHtml=`<div class="demo-account-examples"><div class="demo-example-title">${icon('info')}${isEnglishVersion?'Example account (click to fill)':'示例账号（点击自动填入）'}</div><div class="demo-example-list">${examples.map(({user,contact})=>`<button type="button" class="demo-example-chip" data-example-contact="${safe(contact.value)}" data-example-account="${safe(user.account)}"><span class="demo-example-avatar">${safe(user.name.slice(0,1))}</span><span class="demo-example-meta"><strong>${safe(user.name)}</strong><small>${safe(contact.label)}：${safe(contact.value)} · ${safe(user.account)}</small></span></button>`).join('')}</div><p class="demo-example-hint">${isEnglishVersion?'Click to fill. This example can be added repeatedly without a limit; each confirmation creates a separate demo record.':'点击自动填入，示例可无限次重复添加；每次确认新增一条独立演示记录。'}</p></div>`;
  const formTitle=isEnglishVersion?'Add member':title;
  modalFrame(formTitle,isEnglishVersion?'Match the account, then choose a role.':'先匹配账户，再为成员指定角色。',`<form id="verifyForm" novalidate>${fields.map(([key,label,type,inputmode,max,placeholder,errorText])=>`<label class="field" id="${key}Field"><span class="field-label">${label}</span><input id="${key}" data-account-key="${key}" type="${type}" inputmode="${inputmode}" autocomplete="off" maxlength="${max}" placeholder="${placeholder}" value="${safe(modal[key])}" aria-describedby="${key==='contact'?'memberContactHint accountLookup':'accountLookup'}" aria-invalid="false"><span class="field-error">${errorText}</span></label>${key==='contact'?`<p class="member-contact-hint" id="memberContactHint">${accountCopy.contactHint}</p>`:''}`).join('')}<div id="accountLookup" aria-live="polite"></div><div id="accountLookupError" class="inline-error" role="alert" ${modal.error?'':'hidden'}>${safe(modal.error)}</div>${exampleHtml}</form>`,`<button class="btn" data-close>${isEnglishVersion?'Cancel':'取消'}</button><button class="btn primary" data-verify>${isEnglishVersion?'Next: Choose role':'下一步：指定角色'}</button>`);
  drawAccountLookup();document.getElementById(modal.lookupSource||'contact')?.focus();
  modalRoot.querySelectorAll('.demo-example-chip').forEach(button=>button.addEventListener('click',()=>{
    const input=document.getElementById('contact');
    input.value=button.dataset.exampleContact;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    document.getElementById('contact')?.focus();
  }));
}
function lookupError(message,keys=[]) {
  modal.error=message;
  const el=document.getElementById('accountLookupError');el.textContent=message;el.hidden=false;
  keys.forEach(key=>{document.getElementById(key+'Field')?.classList.add('invalid');document.getElementById(key)?.setAttribute('aria-invalid','true');});
}
function drawAccountLookup() {
  const slot=document.getElementById('accountLookup');if(!slot)return;
  const key=modal.lookupSource||'contact';
  const result=resolvePlatformAccount(modal[key],key),user=result.user;
  slot.innerHTML=user?`<div class="account-preview">${avatar(user.name)}<div><strong>${safe(user.name)}</strong><small>${isEnglishVersion?'Matched username':'已匹配用户名'}：${safe(user.account)}</small></div><span>${isEnglishVersion?'Matched':'已匹配'}</span></div>`:modal[key]?`<p class="lookup-status ${result.status==='ambiguous'?'lookup-conflict':''}">${result.status==='ambiguous'?accountCopy.ambiguous:accountCopy.unmatched}</p>`:'';
}
function updateAccountLookup(key,value) {
  modal.lookupSource=key;modal.error='';modal.user=null;modal[key]=value;
  const result=resolvePlatformAccount(value,key);
  const other=key==='contact'?'account':'contact';
  modal[other]=result.user?(other==='account'?result.user.account:accountContact(result.user,contactKeyFor(modal.contact)).value):'';
  for(const field of ['contact','account']){
    const input=document.getElementById(field);if(input){input.value=modal[field];input.setAttribute('aria-invalid','false');}
    document.getElementById(field+'Field')?.classList.remove('invalid');
  }
  const error=document.getElementById('accountLookupError');error.hidden=true;error.textContent='';drawAccountLookup();
}

function showDirectoryAddModal(){
  if(modal.step==='verify')return showMemberAccountLookup('添加成员',accountCopy.subtitle);
  const u=modal.user,inGroup=modal.parent?.type==='group-create';
  const label=isEnglishVersion?(inGroup?'Research group role':'Member role'):(inGroup?'课题组角色':'成员角色');
  const hint=isEnglishVersion?(inGroup?'This role is used in the research group. Project access starts only after collaboration is saved.':'This is the default role for future group and project invitations. It does not grant access to any project.'):(inGroup?'按所选角色加入当前课题组；确认项目协作后才授予项目权限。':'作为加入课题组、项目协作时的默认角色，可按项目单独调整；此处不会直接授予项目权限。');
  modalFrame(isEnglishVersion?'Confirm member and role':inGroup?'确认课题组成员与角色':'确认成员与角色',isEnglishVersion?'Review the account and choose a role before adding.':'账号核对通过，请指定角色后确认添加。',`${accountIdentityCard(u)}${memberRoleSelection(u,label)}<p class="member-role-hint">${hint}</p>`,`<button class="btn" data-back-verify>${isEnglishVersion?'Back':'返回修改'}</button><button class="btn primary" data-directory-add-confirm>${isEnglishVersion?'Add member':'确认添加'}</button>`);
}
function confirmDirectoryAdd(){
  if(!canManage()||modal?.type!=='directory-add'||modal.step!=='confirm'||!modal.user)return;
  const parent=modal.parent;
  if(!isRepeatableDemoAccount(modal.user)&&directory.some(d=>visibleAccountKeys.some(k=>usableAccountValue(d,k)&&usableAccountValue(d,k)===usableAccountValue(modal.user,k)))){modal.error='该成员已在成员库中';modal.step='verify';return showModal();}
  const role=selectedMemberRole(modal.user),u=memberForAddition(modal.user,role);
  directory.push({...u});saveAll();
  if(parent?.type==='group-create'){
    if(!parent.members.some(m=>m.id===u.id))parent.members.push({id:u.id,role});
    parent.memberError='';modal=parent;showGroupCreateModal();return notify('成员已添加，并自动选入当前课题组');
  }
  search='';closeModal();render();notify('成员已添加，可在课题组中选用');
}
function directoryAssociations(id) {
  const relatedGroups=groups.filter(g=>g.members.some(m=>m.id===id));
  const relatedRecords=collabRecords.filter(r=>(r.members||[]).some(m=>m.id===id));
  const collaborationProjectIds=[...new Set([...relatedRecords.map(r=>r.projectId),...projects.filter(p=>p.directCollabMembers.some(m=>m.id===id)).map(p=>p.id)])];
  const relatedProjects=projects.filter(p=>collaborationProjectIds.includes(p.id));
  const relatedShares=projects.filter(p=>p.shareUserIds.includes(id));
  // 课题组只是成员组织关系；只有已授权的协作项目或项目分享才阻止从成员库移除。
  return {groups:relatedGroups,projects:relatedProjects,records:relatedRecords,shares:relatedShares,blocked:!!(relatedProjects.length||relatedShares.length||relatedRecords.length)};
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
  const associations=section('所属课题组',refs.groups.map(g=>safe(g.name)))+section('协作授权',refs.records.map(r=>`<strong>${safe(projects.find(p=>p.id===r.projectId)?.name||r.projectName||'协作项目')}</strong><small>${safe(r.groupName)} · 协作成员</small>`))+section('项目分享',refs.shares.map(p=>`<strong>${safe(p.name)}</strong><small>共享用户 · ${safe(p.code)}</small>`));
  modalFrame(blocked?'暂不能移除成员':'移除成员',blocked?'请先解除协作授权或项目分享，再从成员库移除。':'请确认是否从你的成员库移除该成员。',`<div class="directory-remove-person">${avatar(u.name)}<div><strong>${safe(u.name)}</strong><span>${safe(u.account)}${safe(demoMemberLabel(u))} · ${safe(accountContact(u,'',true).value)}</span></div></div>${blocked?`<div class="directory-remove-warning">${icon('info')}<p>${protectedOwner?'该成员是项目所有者，不可从成员库移除。':'该成员已参与协作项目或项目分享，暂不能移除，避免影响现有协作。'}</p></div><div class="directory-associations">${associations}</div>`:`<p class="directory-remove-description">该成员未参与协作项目或项目分享，确认后将从成员列表中移除。${refs.groups.length?'其所属课题组信息会保留在原课题组内。':''}</p>${associations}`}<p class="member-library-note">仅移出你的成员库，不会删除对方的云平台账号；以后仍可通过${accountEntryLabel}重新添加。</p>`,`<button class="btn" data-close>${blocked?'知道了':'取消'}</button><button class="btn danger" data-confirm-directory-remove ${blocked?'disabled':''}>确认移除</button>`);
  modalRoot.querySelector('.modal').classList.add('directory-remove-modal');
}
function confirmDirectoryRemove() {
  if(!canManage()||modal?.type!=='directory-remove')return;
  const u=directory.find(u=>u.id===modal.id);if(!u)return closeModal();
  // 保存时再次检查，防止弹窗打开后关联发生变化导致误删。
  if(isDirectoryOwner(u.id)||directoryAssociations(u.id).blocked)return showDirectoryRemoveModal();
  if(!isDemoMemberInstance(u)&&!platformAccounts.some(account=>account.id===u.id))platformAccounts.push({...u});
  directory=directory.filter(d=>d.id!==u.id);saveAll();closeModal();render();notify('成员已从成员库移除，云平台账号仍保留');
}
function openCollab(groupId=groups[0]?.id, projectIds=[], chooseProjects=false, recordId=null, editProject=false) {
  if(!canManage()||projectIds.some(id=>!canManageProject(projects.find(p=>p.id===id))))return notify('当前账号无权修改该项目');
  if(projectIds.some(id=>!canConfigureCollaboration(projects.find(p=>p.id===id))))return notify('重新协作功能暂未开放');
  const selectedGroupIds=editProject?[...new Set(collabRecords.filter(r=>projectIds.includes(r.projectId)).map(r=>r.groupId||groups.find(g=>g.name===r.groupName)?.id).filter(Boolean))]:[groupId].filter(Boolean);
  modal={type:'collab',selectedGroupIds,selectedMemberIds:[],selectedProjectIds:[...new Set(projectIds)],chooseProjects,recordId,editProject,removedMemberIds:[],selectionTouched:false,roleOverrides:{},extraMembers:[]};refreshCollabSelection();showModal();
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
    return `<tr data-cancel-collab-member="${safe(member.id)}"><td><div class="cancel-collab-person">${avatar(u.name,index)}<strong>${safe(u.name)}</strong></div></td><td class="cancel-collab-account">${safe(u.account||'—')}${safe(demoMemberLabel(u))}</td><td><span class="role-pill ${safe(member.role)}">${icon(roleIcons[member.role]||'person')}${safe(roleNames[member.role]||member.role)}</span></td><td><div class="cancel-collab-sources">${(sources.length?sources:['项目协作']).map(source=>`<span>${safe(source)}</span>`).join('')}</div></td></tr>`;
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
  const p=projects.find(x=>x.id===projectId);if(!p||!canManageProject(p))return;
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
    <section class="share-recipients" aria-label="共享用户名单"><div class="share-list-heading"><h3>共享用户名单</h3><span>仅查看原始结果</span></div><div class="share-user-list">${modal.selectedUserIds.map((id,i)=>`<div class="share-user-row" data-share-user-row="${safe(id)}">${avatar(person(id).name,i)}<div class="share-user-meta"><strong>${safe(person(id).name)}</strong><span>${safe(person(id).account)}</span></div><span class="share-user-status ${p.shareUserIds.includes(id)?'':'pending'}">${p.shareUserIds.includes(id)?'已分享':'待分享'}</span><button type="button" class="btn quiet small danger" data-remove-share-user="${safe(id)}" aria-label="移除共享用户${safe(person(id).name)}">移除</button></div>`).join('')||`<div class="share-empty">${icon('people')}<span>还没有添加共享用户</span><small>输入对方${accountEntryLabel}，即可添加</small></div>`}</div></section>
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
  if(!canManage()||modal?.type!=='share')return false;
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
  if(!canManage()||modal?.type!=='share')return;
  if(modal.account.trim()&&!addShareUser())return;
  const p=projects.find(x=>x.id===modal.projectId);if(!p)return;
  if(!modal.selectedUserIds.length){if(p.shared)return openCancelShare(p.id,modal);return shareError('请至少添加一位共享用户');}
  if(modal.selectedUserIds.length>5)return shareError('每个项目最多分享给 5 位用户');
  modal.selectedUserIds.forEach(id=>ensureDirectoryPerson(id));
  p.shareUserIds=[...modal.selectedUserIds];p.shared=true;p.shareInitiatedBy=currentUserId();saveAll();closeModal();render();notify('分享设置已保存，共享项目列表已更新');
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
  modal={type:'result-preview'};
  modalFrame('分析结果预览','原始分析结果 · 交互演示',`${shareProjectCard(project())}<div class="result-preview-panel"><span class="reference-detail-status">分析已完成</span><h3>原始分析结果已就绪</h3><p>正式平台可在这里查看分析报告。本原型使用示例数据，不包含真实分析文件。</p></div>`,'<button class="btn" data-close>关闭</button><button class="btn primary" data-result-to-data>查看项目数据</button>');
}
function showCloudDownload() {
  modal={type:'cloud-download'};
  modalFrame('下载派森诺云盘','项目数据下载入口',`<div class="result-preview-panel">${icon('download')}<h3>使用云盘客户端下载项目数据</h3><p>本原型仅演示下载入口，不提供安装包。正式产品接入下载地址后，可在此获取客户端。</p></div>`,'<button class="btn primary" data-close>知道了</button>');
}

function groupCreateMembers() { return modal.members.map(m=>`<div class="picker-member"><div class="member-cell">${avatar(person(m.id).name)}<div><div class="member-name">${safe(person(m.id).name)}${m.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</div><small>${safe(person(m.id).account)}${safe(demoMemberLabel(person(m.id)))}</small></div></div><div class="picker-right"><select data-group-role="${m.id}" ${m.id==='support-1'?'disabled':''} aria-label="设置成员角色">${['admin','member','visitor'].map(r=>`<option value="${r}" ${m.role===r?'selected':''}>${roleNames[r]}</option>`).join('')}</select><button type="button" class="chip-close" data-remove-group-member="${m.id}" aria-label="移除 ${safe(person(m.id).name)}">×</button></div></div>`).join('') || '<div class="picker-empty">还没有成员，可从上方添加，或直接添加技术支持。</div>'; }
function groupMemberOptions() {
  const q=accountValue(modal.memberQuery);
  const people=[...platformAccounts,...demoMemberInstances.filter(d=>directory.some(u=>u.id===d.id)||modal.members.some(m=>m.id===d.id))].filter(d=>d.id!=='owner-1'&&accountSearchText(d).includes(q));
  return people.map(d=>{
    const unique=memberAccountIsUnique(d.id);
    return `<label class="group-member-option"><input type="checkbox" data-pick-group-member="${safe(d.id)}" ${modal.members.some(m=>m.id===d.id)?'checked':''} ${unique?'':'disabled'}><span><strong>${safe(d.name)}</strong><small>用户名 ${safe(d.account)}${safe(demoMemberLabel(d))} · ${safe(accountContact(d,'',true).label)} ${safe(accountContact(d,'',true).value)}</small></span>${!unique?'<span class="lookup-conflict">无法唯一匹配</span>':d.id==='support-1'?'<span class="support-tag">固定管理员</span>':''}</label>`;
  }).join('')||'<div class="picker-empty">未匹配到云平台账户，请核对完整手机号、已绑定邮箱或用户名。</div>';
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
    <div class="group-picker-label"><label class="field-label" for="groupMemberSearch">选择成员 <span class="picker-note">可多选</span></label><div class="group-picker-actions"><button type="button" class="btn quiet small text-primary" data-new-group-person>添加新成员</button><button type="button" class="btn quiet small text-primary" data-add-support>直接添加技术支持</button></div></div>
    <div class="group-search-picker"><div class="group-search-control">${icon('search')}<input id="groupMemberSearch" type="search" autocomplete="off" placeholder="${isEnglishVersion?'Search by email or username':'输入手机号、已绑定邮箱或用户名匹配账户'}" value="${safe(modal.memberQuery)}" aria-expanded="${modal.pickerOpen}" aria-controls="groupMemberDropdown"><button type="button" class="group-picker-toggle" data-toggle-group-picker aria-label="展开或收起成员选项">⌄</button></div>
    <div class="group-member-dropdown" id="groupMemberDropdown" ${modal.pickerOpen?'':'hidden'}><div id="groupMemberOptions" class="group-member-options">${groupMemberOptions()}</div></div></div>
    <p class="group-account-hint">${isEnglishVersion?'Email and username identify the same account.':accountCopy.contactHint} 创建课题组时自动加入成员库。</p><p class="group-member-error" id="groupMemberError" role="alert" ${modal.memberError?'':'hidden'}>${safe(modal.memberError)}</p>
    <div class="selected-picker"><div class="picker-title">已选成员 <b id="groupSelectedCount">${modal.members.length}</b><span>可调整角色或直接移除</span></div><div id="selectedGroupMembers">${groupCreateMembers()}</div></div><p class="member-library-note">创建课题组仅建立成员归属；项目权限将在确认项目协作后生效。</p></form>`,
    `<button class="btn" data-close>${modal.parent?'返回项目协作':'取消'}</button><button class="btn primary" data-create-group-confirm>${modal.parent?'创建并选用':'创建课题组'}</button>`, true);
}
function collabMembers(state) {
  const seen=new Set(),out=[];
  const add=m=>{if(!seen.has(m.id)){seen.add(m.id);out.push({...m});}};
  state.selectedGroupIds.forEach(gid=>(group(gid)?.members||[]).forEach(add));
  collabTargetRecords(state).forEach(r=>(r.members||[]).forEach(add));
  if(state.editProject)projects.filter(p=>state.selectedProjectIds.includes(p.id)).forEach(p=>p.directCollabMembers.forEach(add));
  (state.extraMembers||[]).forEach(add);
  return out;
}
function collabRoleValue(state,member) {
  if(member.id==='support-1')return 'admin';
  if(state.roleOverrides?.[member.id])return state.roleOverrides[member.id];
  const roles=[...new Set(collabTargetRecords(state).flatMap(r=>(r.members||[]).filter(m=>m.id===member.id).map(m=>m.role)))];
  return roles.length>1?'preserve':roles[0]||member.role;
}
function openCollabPerson() {
  if(!canManage()||modal?.type!=='collab')return;
  modal={type:'add',target:'collab-draft',parent:modal,step:'verify',error:'',parentFocus:'[data-add-collab-person]'};showModal();
}

function collabProjectMembers(state) {
  const seen=new Set(),out=[];
  const containers=[...collabTargetRecords(state),...(state.editProject?projects.filter(p=>state.selectedProjectIds.includes(p.id)).map(p=>({members:p.directCollabMembers})):[])];
  containers.forEach(p=>(p.members||[]).forEach(m=>{if(!seen.has(m.id)){seen.add(m.id);out.push({...m});}}));
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
  // 技术支持始终自动带入协作，不可取消。
  if(collabMembers(modal).some(m=>m.id==='support-1'))selected.add('support-1');
  modal.selectedMemberIds=collabMembers(modal).filter(m=>m.role!=='owner'&&selected.has(m.id)).map(m=>m.id);
  modal.removedMemberIds=collabMembers(modal).filter(m=>current.has(m.id)&&!selected.has(m.id)&&m.id!=='support-1').map(m=>m.id);
}
function changeCollabMember(id,selected) {
  const member=collabMembers(modal).find(m=>m.id===id);
  if(!member||member.role==='owner'||(id==='support-1'&&!selected))return notify('技术支持始终参与协作，不可移除');
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
  collabMembers(modal).forEach(m=>{if(m.role!=='owner'&&m.id!=='support-1')changeCollabMember(m.id,false);});
  return showCollabModal();
}
function showCollabModal() {
  const members=collabMembers(modal),current=collabProjectMembers(modal);
  const selectedProjects=projects.filter(p=>modal.selectedProjectIds.includes(p.id));
  const download=typeof modal.downloadOverride==='boolean'?modal.downloadOverride:selectedProjects.length>0&&selectedProjects.every(p=>p.visitorDownload);
  const body=`${modal.chooseProjects?`<section class="picker-block project-picker"><h3>选择协作项目 <span class="picker-note">可单选或多选</span></h3><div class="check-list project-list-picker">${manageableProjects().filter(canConfigureCollaboration).map(p=>`<label class="check-item"><input type="checkbox" data-collab-project="${p.id}" ${modal.selectedProjectIds.includes(p.id)?'checked':''}><span class="check-main"><strong>${safe(p.name.replace(/^测试示例-/,''))}</strong><small>${safe(p.code)}</small></span></label>`).join('')}</div></section>`:''}
  <section class="collab-context" aria-label="当前协作项目"><div class="collab-context-heading">${icon('folder')}<span>协作项目</span><b>${selectedProjects.length} 个</b></div><div class="collab-context-names">${selectedProjects.length?selectedProjects.map(p=>`<div class="collab-context-project"><strong>${safe(p.name)}</strong><small>${safe(p.code)}</small></div>`).join(''):'<span class="collab-context-empty">请先选择协作项目</span>'}</div></section>
  <div class="picker-layout"><section class="picker-block group-picker-panel"><div class="picker-heading"><h3>选择课题组 <span class="picker-note">可多选</span></h3>${modal.recordId?'':'<button class="btn quiet small text-primary" data-new-collab-group>＋ 新建课题组</button>'}</div><div class="check-list group-list-picker">${groups.map(g=>`<label class="check-item"><input type="checkbox" data-collab-group="${g.id}" ${modal.selectedGroupIds.includes(g.id)?'checked':''} ${modal.recordId?'disabled':''}><span class="check-main"><strong>${safe(g.name)}</strong><small>${g.members.length} 位成员</small></span></label>`).join('')||'<div class="picker-empty">暂无课题组，点击上方“新建课题组”即可创建</div>'}</div></section>
  <section class="picker-block collab-members-panel"><div class="collab-members-header"><div class="collab-members-title"><h3>协作成员</h3><span id="collabMemberCount">已选 <b>${modal.selectedMemberIds.length}</b> / ${members.length} 位成员</span></div><div class="collab-member-actions"><button type="button" class="btn collab-select-all" data-select-all-collab-members>${icon("check")}全选</button><button type="button" class="btn collab-clear-all" data-clear-collab-members>清空</button></div></div><p class="inline-member-hint">仅勾选成员获得项目权限，保存后生效。</p><div class="check-list inline-collab-members">${members.map((m,i)=>{
    const selected=modal.selectedMemberIds.includes(m.id),removed=modal.removedMemberIds.includes(m.id),existing=current.some(x=>x.id===m.id),owner=m.role==='owner';
    const value=collabRoleValue(modal,m);
    const isSupport=m.id==='support-1';
    const alwaysIn=isSupport||owner;
    const statusText=owner?'所有者':removed?'待移除':existing?'已加入':selected?'待添加':'未选';
    const statusClass=owner?'owner':removed?'removed':existing?'joined':selected?'added':'';
    const roleDisabled=!selected||owner||m.id==='support-1';
    return `<div class="collab-member-item ${removed?'pending-removal':''} ${(alwaysIn||selected)?'is-selected':''} ${isSupport?'is-support':''}" data-collab-member-row="${m.id}"><label class="collab-member-left"><input type="checkbox" data-collab-member="${m.id}" ${(alwaysIn||selected)?'checked':''} ${alwaysIn?'disabled':''} ${isSupport?'title="技术支持始终参与协作"':''}>${avatar(person(m.id).name,i)}<span class="collab-member-info"><strong>${safe(person(m.id).name)}${isSupport?'<span class="collab-support-tag">固定管理员</span>':''}</strong><small>${safe(person(m.id).account)}${safe(demoMemberLabel(person(m.id)))}</small></span></label><span class="collab-member-status ${statusClass}">${statusText}</span><select class="collab-member-role" id="collabRole-${safe(m.id)}" data-collab-role="${safe(m.id)}" ${roleDisabled?'disabled':''} aria-label="${safe(person(m.id).name)}的项目角色">${value==='preserve'?'<option value="preserve">保留原角色</option>':''}${['admin','member','visitor'].map(role=>`<option value="${role}" ${role===value?'selected':''}>${roleNames[role]}</option>`).join('')}</select>${owner||isSupport?'<span class="collab-member-action-placeholder"></span>':removed?`<button type="button" class="collab-member-action restore" data-restore-collab-member="${m.id}" aria-label="撤销移除${safe(person(m.id).name)}">撤销</button>`:(selected||existing)?`<button type="button" class="collab-member-action remove" data-remove-collab-member="${m.id}" aria-label="移除${safe(person(m.id).name)}">移除</button>`:'<span class="collab-member-action-placeholder"></span>'}</div>`;
  }).join('')||'<div class="picker-empty">该课题组还没有成员，请先添加成员</div>'}</div><button type="button" class="btn collab-add-person" data-add-collab-person>${icon('plus')}添加成员</button></section></div>
  <div class="inline-collab-summary"><span>已选 <b>${modal.selectedMemberIds.length}</b> 位协作成员${modal.removedMemberIds.length?` · <span class="pending-count">待移除 ${modal.removedMemberIds.length} 位</span>`:''}</span><span>仅调整项目协作，不删除课题组成员</span></div>`;
  modalFrame(modal.recordId?'管理协作成员':collabTargetRecords(modal).length?'管理项目协作':'发起项目协作','选择课题组（可多选），在右侧添加或移除协作成员。',body,'<button class="btn" data-close>取消</button><button class="btn primary" data-confirm-collab>保存变更</button>',true);
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
      `${accountIdentityCard(u)}${memberRoleSelection(u,isEnglishVersion?(modal.target==='group'?'Research group role':'Project role'):(modal.target==='group'?'课题组角色':'项目角色'))}`,
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
  for(const key of ['contact','account']){
    modal[key]=document.getElementById(key)?.value.trim()||'';
    document.getElementById(key+'Field')?.classList.remove('invalid');
    document.getElementById(key)?.setAttribute('aria-invalid','false');
  }
  const contactKey=contactKeyFor(modal.contact);
  const validContact=contactKey==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modal.contact):/^1[3-9]\d{9}$/.test(modal.contact);
  const invalid=[];
  if(!validContact)invalid.push('contact');
  if(!modal.account)invalid.push('account');
  if(invalid.length)return lookupError(isEnglishVersion?'Enter a valid email and username.':`请填写完整的${accountPairLabel}。`,invalid);
  const contactResult=resolvePlatformAccount(modal.contact,'contact');
  const accountResult=resolvePlatformAccount(modal.account,'account');
  if(contactResult.status==='ambiguous'||accountResult.status==='ambiguous')return lookupError(accountCopy.ambiguous,['contact','account']);
  const user=contactResult.user;
  if(!user||accountResult.user?.id!==user.id)return lookupError(!user?accountCopy.unmatched:accountCopy.mismatch,['contact','account']);

  if(modal.type==='directory-add'){
    if(!isRepeatableDemoAccount(user)&&directory.some(d=>d.id===user.id||visibleAccountKeys.some(k=>usableAccountValue(d,k)&&usableAccountValue(d,k)===usableAccountValue(user,k))))return lookupError('该成员已在成员库中，可在课题组中直接选用');
  }else{
    const container=modal.target==='group'?group(modal.groupId)?.members:modal.target==='collab-draft'?collabMembers(modal.parent):projectMemberList();if(!container)return;
    if(user.id==='owner-1')return lookupError('项目所有者无需重复添加');
    if(!isRepeatableDemoAccount(user)&&container.some(m=>m.id===user.id))return lookupError('该用户已在当前列表中');
  }
  modal.error='';showAccountConfirmation(user);
}

function confirmGroupCreate() {
  if(!canManage()||modal?.type!=='group-create')return;
  modal.name=document.getElementById('groupName').value.trim();modal.error='';modal.memberError='';
  if(!modal.name)modal.error='请输入课题组名称';
  else if(groups.some(g=>g.name===modal.name))modal.error='课题组名称已存在';
  if(!modal.members.length)modal.memberError='请至少选择一位成员';
  else if(modal.members.some(m=>!memberAccountIsUnique(m.id)))modal.memberError='存在无法唯一匹配的成员，请核对手机号/邮箱与用户名后重新选择';
  if(modal.error||modal.memberError){showGroupCreateModal();document.getElementById(modal.error?'groupName':'groupMemberSearch').focus();return;}
  const id='group-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),parent=modal.parent;
  modal.members.forEach(m=>ensureDirectoryPerson(m.id));
  groups.push({id,name:modal.name,members:structuredClone(modal.members)});saveAll();
  if(parent?.type==='collab'){
    parent.selectedGroupIds=[...new Set([...parent.selectedGroupIds,id])];parent.removedMemberIds=[];parent.selectionTouched=false;
    modal=parent;refreshCollabSelection();showCollabModal();return notify('课题组已创建并选用，确认协作后才授予项目权限');
  }
  closeModal();render();notify('课题组已创建，可在项目协作中选用');
}
function confirmCollab() {
  if(!canManage()||modal?.type!=='collab')return;
  const state=modal,selectedProjects=projects.filter(p=>state.selectedProjectIds.includes(p.id)),selectedGroups=state.selectedGroupIds.map(group).filter(Boolean),members=collabMembers(state).filter(m=>state.selectedMemberIds.includes(m.id));
  if(!selectedProjects.length)return notify('请至少选择一个项目');
  if(selectedProjects.some(p=>!canManageProject(p)))return notify('当前账号无权管理所选项目');
  if(selectedProjects.some(p=>!canConfigureCollaboration(p)))return notify('重新协作功能暂未开放');
  if(!selectedGroups.length&&!state.editProject)return notify('请至少选择一个课题组');
  if(!members.length)return notify('请至少选择一位协作成员');
  const now=new Date().toLocaleString('zh-CN',{hour12:false});
  selectedProjects.forEach(p=>{
    const prior=projectRecords(p),oldDirect=p.directCollabMembers;
    const roleFor=(m,old)=>m.id==='support-1'?'admin':state.roleOverrides[m.id]||old?.find(x=>x.id===m.id)?.role||m.role;
    members.forEach(m=>ensureDirectoryPerson(m.id));
    if(state.editProject){
      collabRecords=collabRecords.filter(r=>r.projectId!==p.id||selectedGroups.some(g=>r.groupId===g.id||(!r.groupId&&r.groupName===g.name)));
      p.directCollabMembers=oldDirect.filter(m=>state.selectedMemberIds.includes(m.id)).map(m=>({...m,role:roleFor(m,oldDirect)}));
      if(!selectedGroups.length)members.filter(m=>!p.directCollabMembers.some(x=>x.id===m.id)).forEach(m=>p.directCollabMembers.push({id:m.id,role:roleFor(m,oldDirect),invitedBy:currentUserId()}));
    }
    selectedGroups.forEach(g=>{
      const old=prior.find(r=>r.groupId===g.id||(!r.groupId&&r.groupName===g.name));
      const record=collabRecords.find(r=>r.projectId===p.id&&(r.groupId===g.id||(!r.groupId&&r.groupName===g.name)));
      const roster=members.map(m=>({id:m.id,role:roleFor(m,old?.members)}));
      if(record){record.members=roster;record.updatedAt=now;}
      else collabRecords.push({id:'record-'+Date.now()+'-'+p.id+'-'+g.id+'-'+Math.random().toString(36).slice(2,6),projectId:p.id,projectName:p.name,code:p.code,initiatedBy:currentUserId(),groupId:g.id,groupName:g.name,members:roster,createdAt:now,status:'协作中'});
    });
    p.hasCollaborated=true;if(typeof state.downloadOverride==='boolean')p.visitorDownload=state.downloadOverride;rebuildProjectMembers(p);
  });
  saveAll();closeModal();selectedProjectIds=[];render();notify('项目协作已保存');
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
  if(a.dataset.tab){if(a.dataset.tab==='members'&&!canViewCollaborationList())return;tab=a.dataset.tab;search='';return render();}
  if(a.dataset.teamTab){teamTab=a.dataset.teamTab;search='';return render();}
  if(a.dataset.cancelCollab)return openCancelCollab(a.dataset.cancelCollab);
  if(a.dataset.listTab){listTab=a.dataset.listTab==='shared'?'shared':'mine';selectedProjectIds=[];search='';categoryFilter='';return render();}
  if(a.hasAttribute('data-clear-projects')){selectedProjectIds=[];return render();}
  if(a.hasAttribute('data-add-directory')) return openDirectoryAdd();
  if(a.dataset.removeDirectory)return openDirectoryRemove(a.dataset.removeDirectory);
  if(a.hasAttribute('data-create-group')) return openGroupCreate();
  if(a.hasAttribute('data-add')) return openAdd('project');
  if(a.dataset.groupAdd) return openAdd('group',a.dataset.groupAdd);
  if(a.dataset.addSupportGroup){if(!canManage()) return;const g=group(a.dataset.addSupportGroup);if(!g||g.members.some(m=>m.id==='support-1')) return;ensureDirectoryPerson('support-1');g.members.push({id:'support-1',role:'admin'});saveAll();render();return notify('技术支持已加入课题组，角色为管理员');}
  if(a.dataset.openCollab) return openCollab(a.dataset.openCollab,[],true);
  if(a.hasAttribute('data-collab-selected')) return openCollab(groups[0]?.id,[...selectedProjectIds],!selectedProjectIds.length);
  if(a.dataset.collabOne){const p=projects.find(p=>p.id===a.dataset.collabOne);return openCollab(groups[0]?.id,[p.id],false,null,p.collab);}
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
  if(e.target.dataset.selectProject){const id=e.target.dataset.selectProject;if(!canConfigureCollaboration(projects.find(p=>p.id===id)))return;selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,id])]:selectedProjectIds.filter(x=>x!==id);return render();}
  if(e.target.hasAttribute('data-select-all-projects')){const ids=filteredProjects().filter(canConfigureCollaboration).map(p=>p.id);selectedProjectIds=e.target.checked?[...new Set([...selectedProjectIds,...ids])]:selectedProjectIds.filter(id=>!ids.includes(id));return render();}
  if(e.target.id==='categoryFilter'){categoryFilter=e.target.value;return render();}
  if(e.target.id==='visitorDownload'&&canManage()){project().visitorDownload=e.target.checked;saveAll();render();notify('访问者下载权限已更新');}
});
document.querySelectorAll('[data-preview-role]').forEach(button=>button.addEventListener('click',()=>switchPreviewRole(button.dataset.previewRole)));
document.getElementById('recipientSelect').addEventListener('change',e=>switchPreviewRole('member',e.target.value));
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
  if(a.hasAttribute('data-confirm-collab-cancel'))return cancelCollab();
  if(a.hasAttribute('data-confirm-share-cancel'))return cancelShare();
  if(a.hasAttribute('data-directory-add-confirm'))return confirmDirectoryAdd();
  if(a.hasAttribute('data-confirm-directory-remove'))return confirmDirectoryRemove();
  if(a.hasAttribute('data-create-group-confirm'))return confirmGroupCreate();
  if(a.hasAttribute('data-new-collab-group')&&modal.type==='collab'&&!modal.recordId)return openGroupCreate(modal);
  if(a.hasAttribute('data-new-group-person')&&modal.type==='group-create')return openDirectoryAdd(modal);
  if(a.hasAttribute('data-toggle-group-picker')){modal.pickerOpen=!modal.pickerOpen;return drawGroupPicker();}
  if(a.hasAttribute('data-add-support')){if(!modal.members.some(m=>m.id==='support-1'))modal.members.push({id:'support-1',role:'admin'});modal.memberError='';return drawGroupPicker();}
  if(a.dataset.removeGroupMember){modal.members=modal.members.filter(m=>m.id!==a.dataset.removeGroupMember);drawGroupPicker();return document.getElementById('groupMemberSearch').focus({preventScroll:true});}
  if(a.hasAttribute('data-select-all-collab-members'))return selectAllCollabMembers();
  if(a.hasAttribute('data-clear-collab-members'))return clearCollabMembers();
  if(a.dataset.removeCollabMember){changeCollabMember(a.dataset.removeCollabMember,false);return showCollabModal();}
  if(a.dataset.restoreCollabMember){changeCollabMember(a.dataset.restoreCollabMember,true);return showCollabModal();}
  if(a.hasAttribute('data-add-collab-person'))return openCollabPerson();
  if(a.hasAttribute('data-confirm-collab'))return confirmCollab();
  if(a.hasAttribute('data-verify'))return verify();
  if(a.hasAttribute('data-back-verify')){modal.step='verify';return showModal();}
  if(a.hasAttribute('data-confirm-add')&&modal.type==='add'&&modal.step==='role'){
    if(modal.target==='collab-draft'){
      const parent=modal.parent,role=selectedMemberRole(modal.user),u=memberForAddition(modal.user,role);
      if(!parent.extraMembers.some(m=>m.id===u.id))parent.extraMembers.push({id:u.id,role});
      parent.roleOverrides[u.id]=role;parent.selectedMemberIds=[...new Set([...parent.selectedMemberIds,u.id])];parent.selectionTouched=true;
      modal=parent;showCollabModal();return notify('成员已选入，保存变更后生效');
    }
    const container=modal.target==='group'?group(modal.groupId).members:projectMemberList();
    if(!isRepeatableDemoAccount(modal.user)&&container.some(m=>m.id===modal.user.id))return notify('该成员已在当前名单中');
    const role=selectedMemberRole(modal.user),u=memberForAddition(modal.user,role);
    if(!directory.some(d=>d.id===u.id))directory.push({...u});
    if(modal.target==='project'){project().directCollabMembers.push({id:u.id,role,invitedBy:currentUserId()});project().hasCollaborated=true;rebuildProjectMembers(project());}else container.push({id:u.id,role});
    saveAll();closeModal();render();return notify('成员添加成功');
  }
  if(a.hasAttribute('data-save-role')&&modal.type==='edit'){
    const m=projectMemberList().find(x=>x.id===modal.id);if(!m||m.role==='owner'||m.id==='support-1')return closeModal();
    m.role=modalRoot.querySelector('input[name=role]:checked')?.value||m.role;syncRecords(project().id);saveAll();closeModal();render();return notify('成员角色已更新');
  }
  if(a.hasAttribute('data-confirm-remove')&&modal.type==='remove'){
    const m=projectMemberList().find(x=>x.id===modal.id);if(!m||m.role==='owner')return closeModal();
    project().members=project().members.filter(x=>x.id!==modal.id);syncRecords(project().id);saveAll();closeModal();render();return notify('成员已从项目中移除');
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
  if(!modal||!canManage())return;
  if(e.target.name==='role'&&['admin','member','visitor'].includes(e.target.value)){modal.selectedRole=e.target.value;return;}
  if(e.target.dataset.collabRole){const id=e.target.dataset.collabRole;if(id!=='support-1'&&['admin','member','visitor'].includes(e.target.value))modal.roleOverrides[id]=e.target.value;return;}
  if(e.target.hasAttribute('data-collab-download')){modal.downloadOverride=e.target.checked;return;}
  if(e.target.dataset.pickGroupMember){const id=e.target.dataset.pickGroupMember;if(!memberAccountIsUnique(id))return notify('该账户无法唯一匹配，请重新核对');if(e.target.checked){if(!modal.members.some(m=>m.id===id))modal.members.push({id,role:defaultMemberRole(person(id))});}else modal.members=modal.members.filter(m=>m.id!==id);modal.memberError='';drawGroupPicker();modalRoot.querySelector(`[data-pick-group-member="${id}"]`)?.focus({preventScroll:true});return;}
  if(e.target.dataset.collabGroup){const gid=e.target.dataset.collabGroup;modal.selectedGroupIds=e.target.checked?[...new Set([...modal.selectedGroupIds,gid])]:modal.selectedGroupIds.filter(x=>x!==gid);modal.removedMemberIds=[];modal.selectionTouched=false;refreshCollabSelection();return showCollabModal();}
  if(e.target.dataset.collabMember){const id=e.target.dataset.collabMember;changeCollabMember(id,e.target.checked);showCollabModal();modalRoot.querySelector(`[data-collab-member="${id}"]`)?.focus({preventScroll:true});return;}
  if(e.target.dataset.collabProject){const id=e.target.dataset.collabProject;if(!canConfigureCollaboration(projects.find(p=>p.id===id)))return showCollabModal();modal.selectedProjectIds=e.target.checked?[...new Set([...modal.selectedProjectIds,id])]:modal.selectedProjectIds.filter(x=>x!==id);refreshCollabSelection(true);return showCollabModal();}
  if(e.target.dataset.groupRole){const m=modal.members.find(x=>x.id===e.target.dataset.groupRole);if(m&&m.id!=='support-1')m.role=e.target.value;}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!modalRoot.hidden){if(!confirmRoot.hidden){closeConfirmation();document.getElementById('account')?.focus();}else dismissModal();}
  if(e.key==='Tab'&&!modalRoot.hidden){const els=[...modalRoot.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].filter(el=>el.offsetParent!==null);const first=els[0],last=els.at(-1);if(!first)return;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)&&e.target.getAttribute('role')==='tab'){
    e.preventDefault();const buttons=[...main.querySelectorAll('[role=tab]')],i=buttons.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();main.querySelectorAll('[role=tab]')[next].focus();
  }
});
chooseRoleLanding();
render();
