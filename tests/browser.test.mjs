import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const chrome=process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base='http://127.0.0.1:45115';
const shot=(name)=>path.resolve('screenshots',name);
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:'45115'}});
const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
let browser;
const results=[];
function pass(name){results.push(`PASS ${name}`);}
async function ready(page){await page.goto(base,{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__signalStoryReady===true);}
async function noPageOverflow(page,label){const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dims.scroll<=dims.client+1,`${label}: page overflow ${dims.scroll}>${dims.client}`);pass(`${label} has no page-level horizontal overflow`);}

try{
  await sleep(500);
  browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-gpu']});
  const page=await browser.newPage();
  const consoleErrors=[];
  page.on('console',(msg)=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
  page.on('pageerror',(err)=>consoleErrors.push(err.message));
  await page.setViewport({width:1280,height:900,deviceScaleFactor:1});
  await ready(page);
  await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle0'}); await page.waitForFunction(()=>window.__signalStoryReady===true);
  assert.equal(await page.$eval('#progressText',(e)=>e.textContent),'0 of 4 cases complete');
  pass('fresh lesson starts at 0/4');

  const graphStatsBefore=await page.$eval('#graphStats',(e)=>e.textContent);
  await page.$eval('#axisMin',(e)=>{e.value='70';e.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.$eval('#axisMinOutput',(e)=>e.textContent),'70 seconds');
  assert.equal(await page.$eval('#graphStats',(e)=>e.textContent),graphStatsBefore);
  assert.equal(await page.$$eval('#graphTable tbody tr',(rows)=>rows.length),6);
  pass('axis changes rendering while graph values/statistics stay fixed');
  await page.focus('input[name="graphAnswer"][value="appearance"]'); await page.keyboard.press('Space'); await page.focus('#graphCheck'); await page.keyboard.press('Enter');
  assert.match(await page.$eval('#graphFeedback',(e)=>e.textContent),/scale changes the visual emphasis/i);
  assert.equal(await page.$eval('#progressText',(e)=>e.textContent),'1 of 4 cases complete');
  await (await page.$('#graph-case')).screenshot({path:shot('01-graph-framing-desktop.png')});
  pass('graph case succeeds by keyboard with immediate feedback');

  await page.click('input[name="sampleMethod"][value="all-window-stratified"]');
  await page.$eval('#sampleSize',(e)=>{e.value='24';e.dispatchEvent(new Event('input',{bubbles:true}));});
  const sampleRows=await page.$$eval('#sampleTable tbody tr',(rows)=>rows.map((r)=>[...r.cells].map((c)=>c.textContent.trim())));
  assert.ok(sampleRows.every((row)=>row[2]==='6'),'stratified sample should contain 6 from each block at n=24');
  assert.equal(await page.$eval('#sampleN',(e)=>e.textContent),'24');
  await page.click('input[name="biasAnswer"][value="depends"]'); await page.click('#sampleCheck');
  assert.match(await page.$eval('#sampleFeedback',(e)=>e.textContent),/defensible nuance/i);
  assert.equal(await page.$eval('#progressText',(e)=>e.textContent),'2 of 4 cases complete');
  await (await page.$('#sample-case')).screenshot({path:shot('02-sampling-desktop.png')});
  pass('sampling procedure/composition and nuanced answer work');

  await page.focus('#stratifyToggle'); await page.keyboard.press('Space');
  const stats=await page.$$eval('#correlationStats .stat-chip',(els)=>els.map((e)=>e.textContent));
  assert.ok(stats.some((s)=>/Overall r = 0\.826/.test(s))); assert.ok(stats.some((s)=>/Easy r = -0\.881/.test(s)));
  await page.click('input[name="correlationAnswer"][value="nuanced"]'); await page.click('#correlationCheck');
  assert.match(await page.$eval('#correlationFeedback',(e)=>e.textContent),/association alone does not establish causation/i);
  assert.equal(await page.$eval('#progressText',(e)=>e.textContent),'3 of 4 cases complete');
  await (await page.$('#correlation-case')).screenshot({path:shot('03-correlation-desktop.png')});
  pass('third-variable stratification and causation feedback work');

  await page.type('#claimText','The available fictional data suggest a small association in the observed tournament-final group, not a tripling for all players.');
  await page.type('#observationText','The replay-interest score rises from 51 to 55 while the graph uses a narrow 50 to 56 vertical range.');
  await page.type('#limitationText','The survey frame excludes other player contexts, and session count could help explain both scoreboard use and replay interest.');
  await page.click('input[name="issue"][value="axis"]'); await page.click('input[name="issue"][value="sample"]'); await page.click('input[name="issue"][value="causation"]');
  await page.click('#caseForm button[type="submit"]');
  assert.match(await page.$eval('#caseFeedback',(e)=>e.textContent),/does not pretend to understand or grade your prose/i);
  assert.equal(await page.$eval('#progressText',(e)=>e.textContent),'4 of 4 cases complete');
  assert.equal(await page.$eval('#notebookCount',(e)=>e.textContent),'4');
  await (await page.$('#transfer-case')).screenshot({path:shot('04-transfer-case-desktop.png')});
  pass('final case requires claim, observation, limitation, and self-review without prose pretense');

  await page.reload({waitUntil:'networkidle0'}); await page.waitForFunction(()=>window.__signalStoryReady===true);
  assert.equal(await page.$eval('#progressText',(e)=>e.textContent),'4 of 4 cases complete');
  assert.equal(await page.$eval('#notebookCount',(e)=>e.textContent),'4');
  pass('local progress persists across refresh');

  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  const transition=await page.$eval('.button',(e)=>getComputedStyle(e).transitionDuration);
  assert.ok(transition.includes('1e-06') || transition.includes('0.001ms') || transition.includes('0s'),`unexpected reduced-motion transition ${transition}`);
  pass('reduced-motion media preference suppresses transitions');

  const axeSource=fs.readFileSync(path.resolve('node_modules/axe-core/axe.min.js'),'utf8');
  await page.addScriptTag({content:axeSource});
  const axe=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
  if(axe.violations.length){console.error(JSON.stringify(axe.violations.map((v)=>({id:v.id,impact:v.impact,nodes:v.nodes.map((n)=>n.target)})),null,2));}
  assert.equal(axe.violations.length,0,'axe found WCAG A/AA violations');
  pass('axe-core WCAG 2.x A/AA scan reports zero violations');

  for(const [width,height] of [[1280,900],[768,900],[360,800]]){await page.setViewport({width,height,deviceScaleFactor:1,isMobile:width===360,hasTouch:width===360});await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__signalStoryReady===true);await noPageOverflow(page,`${width}px viewport`);}
  await page.setViewport({width:360,height:800,deviceScaleFactor:1,isMobile:true,hasTouch:true}); await ready(page);
  await page.evaluate(()=>{scrollTo(0,0);document.querySelector('#startButton').scrollIntoView({block:'center'});});
  const beforeTouchScroll=await page.evaluate(()=>scrollY);
  const startBox=await page.$eval('#startButton',(e)=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  await page.touchscreen.tap(startBox.x,startBox.y); await sleep(150);
  assert.ok((await page.evaluate(()=>scrollY))>beforeTouchScroll,'touch tap should activate start navigation');
  await page.evaluate(()=>document.querySelector('#sample-case').scrollIntoView()); await sleep(100);
  await page.screenshot({path:shot('05-mobile-360.png'),fullPage:false});
  pass('360px simulated touch activates a core action and mobile screenshot captured');

  await page.setViewport({width:1280,height:900,deviceScaleFactor:1}); await ready(page);
  page.once('dialog',(dialog)=>dialog.accept()); await page.click('#resetAllButton'); await sleep(100);
  assert.equal(await page.$eval('#progressText',(e)=>e.textContent),'0 of 4 cases complete'); assert.equal(await page.$eval('#notebookCount',(e)=>e.textContent),'0');
  pass('reset clears local progress without page reload');
  assert.deepEqual(consoleErrors,[],`browser console/page errors: ${consoleErrors.join(' | ')}`); pass('no browser console/page errors');
  console.log(results.join('\n'));
} finally {
  if(browser) await browser.close();
  server.kill();
}


