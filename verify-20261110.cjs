const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const errors=[],checks=[];
 const out=path.join(__dirname,'效果图/20261110');fs.mkdirSync(out,{recursive:true});
 const context=await browser.newContext({viewport:{width:1600,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  assert.equal(await page.locator('.avatar,.user-avatar,.ar-avatar,.demo-example-avatar').count(),0);
  assert.equal((await page.locator('body').innerText()).includes('空间'),false);checks.push('首页头像移除，课题组文案统一');
  await page.locator('.sidebar [data-nav="team"]').click();await page.locator('[data-add-directory]').click();
  assert.equal(await page.locator('#memberRemark').isVisible(),true);assert.equal(await page.locator('[data-verify],[data-back-verify]').count(),0);checks.push('备注第一页展示，已移除验证及二次确认');
  for(const [key,value] of [['account','zhao.researcher'],['phone','13800000007'],['email','zhao.researcher@example.com']]){
   await page.locator('#memberLookupType').selectOption(key);await page.locator('#memberAccount').fill(value);await page.locator('#memberRemark').fill('课题组成员');
   await page.locator('[form="memberAddForm"]').click();await page.locator('#modalRoot').waitFor({state:'hidden'});assert.match(await page.locator('main').innerText(),/课题组成员/);checks.push(key+'下拉方式可在第一页直接添加');await page.locator('[data-add-directory]').click();
  }
  await page.locator('#memberLookupType').selectOption('email');await page.locator('#memberAccount').fill('sun.researcher@example.com');await page.locator('#memberRemark').fill('测试成员');await page.locator('[form="memberAddForm"]').click();assert.match(await page.locator('#accountLookupError').innerText(),/未找到/);checks.push('不存在或未绑定账号提示后留在原页');
  await page.locator('#memberLookupType').selectOption('account');await page.locator('#memberAccount').fill('zhao.researcher');await page.locator('#memberRemark').fill('');await page.locator('[form="memberAddForm"]').click();assert.equal(await page.locator('#memberRemarkField.invalid').count(),1);checks.push('中文备注校验保留');
  for(const invalid of ['中文abc','中文123','中文 备注','中文！','中'.repeat(21)]){
   await page.locator('#memberRemark').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},invalid);await page.locator('[form="memberAddForm"]').click();assert.equal(await page.locator('#memberRemarkField.invalid').count(),1);
  }
  const remark='中'.repeat(20);await page.locator('#memberRemark').fill(remark);await page.screenshot({path:path.join(out,'01-添加成员-互查与中文备注.png')});
  await page.locator('[form="memberAddForm"]').click();assert.match(await page.locator('main').innerText(),new RegExp(remark));
  await page.reload();await page.locator('.sidebar [data-nav="team"]').click();assert.match(await page.locator('main').innerText(),new RegExp(remark));checks.push('20字中文备注可保存、列表展示且刷新保留');
  await page.screenshot({path:path.join(out,'02-成员管理-中文备注.png')});
  await page.locator('.sidebar [data-nav="spaces"]').click();assert.match(await page.locator('h1').innerText(),/课题组管理/);assert.equal((await page.locator('body').innerText()).includes('空间'),false);
  await page.locator('[data-space-tab="owned"]').click();await page.screenshot({path:path.join(out,'03-课题组管理.png')});checks.push('课题组管理受邀与自建页面名称已更新');
  await page.locator('.sidebar [data-nav="projects"]').click();await page.locator('[data-collab-one="pending-collab-01"]').click();
  assert.equal(await page.locator('[data-clear-collab-groups]').innerText(),'取消全选');assert.equal(await page.locator('[data-clear-collab-members]').innerText(),'取消全选');
  await page.locator('[data-select-all-collab-groups]').check();await page.locator('[data-clear-collab-groups]').click();assert.equal(await page.locator('[data-collab-group]:checked').count(),0);
  await page.locator('[data-select-all-collab-groups]').check();await page.locator('[data-clear-collab-members]').click();assert.equal(await page.locator('[data-collab-member]:checked:not(:disabled)').count(),0);
  await page.screenshot({path:path.join(out,'04-项目协作-取消全选.png')});checks.push('课题组和成员取消全选可正常使用');
  await page.keyboard.press('Escape');
  await page.locator('[data-collab-one="analysis"]').click();await page.locator('[data-collab-role="zhou-1"]').selectOption('visitor');await page.locator('[data-confirm-collab]').click();
  await page.locator('[data-collaboration-demo]').click();await page.locator('#arRecordList').waitFor();
  for(const uid of ['owner-1','li-1','zhou-1','support-1']){
   await page.locator('#arPreviewViewer').selectOption(uid);
   const other=page.locator('.ar-record-row:not(.mine)').first();assert.equal(await other.locator('[data-ar-rename]').count(),1);
   if(uid==='zhou-1')assert.equal(await page.locator('[data-ar-delete]').count(),0);
   const recordId=await other.getAttribute('data-ar-record');await other.locator('[data-ar-rename]').click();
   const newName='协作记录改名-'+uid;await page.locator('#arRenameInput').fill(newName);await page.locator('[form="arRenameForm"]').click();
   assert.equal(await page.locator(`[data-ar-record="${recordId}"] .ar-record-name`).innerText(),newName);
   await page.locator(`[data-ar-record="${recordId}"] [data-ar-open]`).click();assert.equal(await page.locator('#arDialog [data-ar-rename]').count(),1);await page.locator('#arDialog [data-ar-dialog-close]').first().click();
   assert.equal(await page.locator('.avatar,.user-avatar,.ar-avatar,.demo-example-avatar').count(),0);checks.push(uid+'可从列表和详情修改他人分析名称');
  }
  await page.screenshot({path:path.join(out,'05-分析记录-全员改名.png')});
  await page.reload();assert.match(await page.locator('#arRecordList').innerText(),/协作记录改名-support-1/);checks.push('分析记录改名刷新后保留');
  await context.close();
  for(const filename of ['项目协作.html','项目协作-可转发原型.html','项目协作-多人分析演示-桌面版.html']){
   const c=await browser.newContext({viewport:{width:1600,height:1000}}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(path.join(__dirname,filename)).href);
   assert.equal(await p.locator('.avatar,.user-avatar,.ar-avatar,.demo-example-avatar').count(),0);assert.equal((await p.locator('body').innerText()).includes('空间'),false);await c.close();checks.push(filename+'可独立打开且无头像');
  }
  const mobileContext=await browser.newContext({viewport:{width:390,height:844}}),mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(pathToFileURL(path.join(__dirname,'index.html')).href);await mobile.locator('.sidebar [data-nav="team"]').click();await mobile.locator('[data-add-directory]').click();
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.screenshot({path:path.join(out,'06-手机端-账号互查.png')});checks.push('手机端添加成员无页面横向溢出');await mobileContext.close();
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
