import { graphStats, createPopulation, drawSample, summarizeRatings, createCorrelationData, correlationSummary } from './model.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEY = 'signal-story-data-detective-v1';
const defaultState = () => ({ completed: { graph: false, sample: false, correlation: false, transfer: false }, notebook: [], sampleSeed: 2026, draft: { claim: '', observation: '', limitation: '', issues: [] } });
let state = loadState();
let data;
let population;
let correlationData;

function loadState() {
  try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return defaultState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(value) { return String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function selected(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value; }
function feedback(element, message, kind = 'try') { element.textContent = message; element.className = `feedback ${kind}`; }
function toggleHint(id) { const el = $(id); el.hidden = !el.hidden; }

function completeStep(step, note) {
  state.completed[step] = true;
  const existing = state.notebook.find((entry) => entry.step === step);
  if (existing) existing.text = note; else state.notebook.push({ step, text: note });
  saveState(); renderProgress(); renderNotebook();
}
function renderProgress() {
  const done = Object.values(state.completed).filter(Boolean).length;
  $('#progressText').textContent = `${done} of 4 cases complete`;
  $('.progress-track').setAttribute('aria-valuenow', String(done));
  $('#progressBar').style.width = `${done * 25}%`;
  $$('.case-nav a').forEach((link) => link.classList.toggle('complete', Boolean(state.completed[link.dataset.step])));
  $('#notebookCount').textContent = String(state.notebook.length);
  const final = $('#completionStatus');
  if (done === 4) { final.textContent = 'Investigation complete. Your evidence notebook holds the observations you recorded. Try the next-practice prompt below on a new claim.'; final.className = 'completion-status finished'; }
  else { final.textContent = `Complete ${4 - done} more case ${4 - done === 1 ? 'check' : 'checks'} to finish your investigation.`; final.className = 'completion-status'; }
}
function renderNotebook() {
  const list = $('#notebookEntries'); list.innerHTML = '';
  state.notebook.forEach((entry) => { const li = document.createElement('li'); li.textContent = entry.text; list.append(li); });
  $('#notebookEmpty').hidden = state.notebook.length > 0;
}
function openNotebook() { $('#notebook').inert=false; $('#notebook').classList.add('open'); $('#notebook').setAttribute('aria-hidden','false'); $('#notebookButton').setAttribute('aria-expanded','true'); $('#scrim').hidden = false; $('#closeNotebook').focus(); }
function closeNotebook() { $('#notebook').classList.remove('open'); $('#notebook').inert=true; $('#notebook').setAttribute('aria-hidden','true'); $('#notebookButton').setAttribute('aria-expanded','false'); $('#scrim').hidden = true; $('#notebookButton').focus(); }

function renderGraph(minY = Number($('#axisMin').value)) {
  const records = data.graphFraming.records; const W = 700, H = 360, L = 64, R = 24, T = 22, B = 58, maxY = 90;
  const x = (i) => L + i * ((W - L - R) / (records.length - 1));
  const y = (v) => T + (maxY - v) * ((H - T - B) / (maxY - minY));
  const ticks = 5; let grid = '', labels = '';
  for (let i = 0; i <= ticks; i++) { const val = minY + (maxY - minY) * (i / ticks); const yy = y(val); grid += `<line class="grid" x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}"/>`; labels += `<text x="${L-10}" y="${yy+4}" text-anchor="end">${Math.round(val)}</text>`; }
  const pts = records.map((r,i) => `${x(i)},${y(r.waitSeconds)}`).join(' ');
  const xLabels = records.map((r,i) => `<text x="${x(i)}" y="${H-B+24}" text-anchor="middle">${esc(r.night.replace('Night ', 'N'))}</text>`).join('');
  const circles = records.map((r,i) => `<circle class="point" cx="${x(i)}" cy="${y(r.waitSeconds)}" r="5"><title>${esc(r.night)}: ${r.waitSeconds} seconds</title></circle>`).join('');
  $('#graphChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><text x="${W/2}" y="${H-10}" text-anchor="middle">Event night</text><text transform="translate(16 ${H/2}) rotate(-90)" text-anchor="middle">Average match wait (seconds)</text>${grid}${labels}<line class="axis" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"/><line class="axis" x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}"/><polyline class="series" points="${pts}"/>${circles}${xLabels}</svg>`;
  const stats = graphStats(records); $('#graphStats').textContent = `Numeric summary stays fixed: mean ${stats.mean} s · first-to-last change ${stats.change} s · range ${stats.min}–${stats.max} s.`;
}
function populateGraphTable() { $('#graphTable tbody').innerHTML = data.graphFraming.records.map((r) => `<tr><th scope="row">${esc(r.night)}</th><td>${r.waitSeconds}</td></tr>`).join(''); }

function sampleMethod() { return selected('sampleMethod') || 'closing-only'; }
function runSample() {
  const size = Number($('#sampleSize').value); const method = sampleMethod(); const sample = drawSample(population, method, size, state.sampleSeed);
  const pop = summarizeRatings(population), sum = summarizeRatings(sample);
  $('#populationMean').textContent = pop.mean.toFixed(2); $('#sampleMean').textContent = sum.mean.toFixed(2); $('#sampleN').textContent = String(sum.size); $('#seedDisplay').textContent = `Seed: ${state.sampleSeed}`;
  renderSampleChart(pop, sum); renderSampleTable(pop, sum); saveState();
}
function renderSampleChart(pop, sample) {
  const blocks = data.sampling.blocks, W = 700, H = 280, L = 54, R = 18, T = 22, B = 68, max = 60;
  const groupW = (W-L-R)/blocks.length, barW = Math.min(42, groupW*.28); const y = (v) => T + (max-v)*((H-T-B)/max);
  let marks = '';
  blocks.forEach((block,i) => { const cx = L + groupW*(i+.5), pv = pop.composition[block]||0, sv = sample.composition[block]||0; marks += `<rect class="bar-pop" x="${cx-barW-3}" y="${y(pv)}" width="${barW}" height="${H-B-y(pv)}"><title>Population ${block}: ${pv}</title></rect><rect class="bar-sample" x="${cx+3}" y="${y(sv)}" width="${barW}" height="${H-B-y(sv)}"><title>Sample ${block}: ${sv}</title></rect><text x="${cx}" y="${H-B+22}" text-anchor="middle">${esc(block.replace(' session','').replace(' hour',''))}</text>`; });
  $('#sampleChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><text transform="translate(15 ${H/2}) rotate(-90)" text-anchor="middle">Record count</text><line class="axis" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"/><line class="axis" x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}"/>${marks}<rect class="bar-pop" x="${W-195}" y="15" width="12" height="12"/><text x="${W-178}" y="25">Population</text><rect class="bar-sample" x="${W-100}" y="15" width="12" height="12"/><text x="${W-83}" y="25">Sample</text></svg>`;
}
function renderSampleTable(pop, sample) { $('#sampleTable tbody').innerHTML = data.sampling.blocks.map((block) => { const p=pop.composition[block]||0,s=sample.composition[block]||0; return `<tr><th scope="row">${esc(block)}</th><td>${p}</td><td>${s}</td><td>${(p/pop.size*100).toFixed(1)}%</td><td>${(s/sample.size*100).toFixed(1)}%</td></tr>`; }).join(''); }
function renderCorrelation() {
  const stratified = $('#stratifyToggle').checked;
  const W=700,H=360,L=64,R=24,T=24,B=60,xMin=0,xMax=10,yMin=70,yMax=300;
  const x=(v)=>L+(v-xMin)*((W-L-R)/(xMax-xMin));
  const y=(v)=>T+(yMax-v)*((H-T-B)/(yMax-yMin));
  let grid='';
  for(let i=0;i<=5;i++){const val=yMin+(yMax-yMin)*(i/5),yy=y(val);grid+=`<line class="grid" x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}"/><text x="${L-9}" y="${yy+4}" text-anchor="end">${Math.round(val)}</text>`;}
  let xTicks='';
  for(let v=0;v<=10;v+=2)xTicks+=`<text x="${x(v)}" y="${H-B+24}" text-anchor="middle">${v}</text>`;
  const dots=correlationData.map((r)=>`<circle class="dot ${stratified?r.difficulty.toLowerCase():''}" cx="${x(r.hints)}" cy="${y(r.seconds)}" r="5"><title>${r.session}: ${r.hints} hints, ${r.seconds} seconds, ${r.difficulty}</title></circle>`).join('');
  const legend=stratified?`<circle class="dot easy" cx="${W-230}" cy="20" r="5"/><text x="${W-218}" y="24">Easy</text><circle class="dot medium" cx="${W-165}" cy="20" r="5"/><text x="${W-153}" y="24">Medium</text><circle class="dot hard" cx="${W-86}" cy="20" r="5"/><text x="${W-74}" y="24">Hard</text>`:'';
  $('#correlationChart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><text x="${W/2}" y="${H-10}" text-anchor="middle">Hints used</text><text transform="translate(16 ${H/2}) rotate(-90)" text-anchor="middle">Completion time (seconds)</text>${grid}${xTicks}<line class="axis" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"/><line class="axis" x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}"/>${dots}${legend}</svg>`;
  const stats=correlationSummary(correlationData);
  const chips=[`Overall r = ${stats.overall}`];
  if(stratified) Object.entries(stats.byDifficulty).forEach(([g,r])=>chips.push(`${g} r = ${r}`));
  $('#correlationStats').innerHTML=chips.map((v)=>`<span class="stat-chip">${esc(v)}</span>`).join('');
}
function populateCorrelationTable(){
  $('#correlationTable tbody').innerHTML=correlationData.map((r)=>`<tr><th scope="row">${r.session}</th><td>${r.difficulty}</td><td>${r.hints}</td><td>${r.seconds}</td></tr>`).join('');
}
function restoreDraft(){
  const d=state.draft||defaultState().draft;
  $('#claimText').value=d.claim||''; $('#observationText').value=d.observation||''; $('#limitationText').value=d.limitation||'';
  $$('input[name="issue"]').forEach((el)=>el.checked=(d.issues||[]).includes(el.value));
}
function storeDraft(){
  state.draft={claim:$('#claimText').value,observation:$('#observationText').value,limitation:$('#limitationText').value,issues:$$('input[name="issue"]:checked').map((el)=>el.value)};
  saveState();
}
function resetUi(){
  $('#axisMin').value='0'; $('#axisMinOutput').textContent='0 seconds'; renderGraph(0); $$('input[name="graphAnswer"]').forEach((e)=>e.checked=false); $('#graphFeedback').textContent=''; $('#graphFeedback').className='feedback'; $('#graphHintText').hidden=true;
  $$('input[name="sampleMethod"]').forEach((e)=>e.checked=e.value==='closing-only'); $('#sampleSize').value='24'; $('#sampleSizeOutput').textContent='24 records'; state.sampleSeed=2026; runSample(); $$('input[name="biasAnswer"]').forEach((e)=>e.checked=false); $('#sampleFeedback').textContent=''; $('#sampleFeedback').className='feedback'; $('#sampleHintText').hidden=true;
  $('#stratifyToggle').checked=false; renderCorrelation(); $$('input[name="correlationAnswer"]').forEach((e)=>e.checked=false); $('#correlationFeedback').textContent=''; $('#correlationFeedback').className='feedback'; $('#correlationHintText').hidden=true;
  state.draft=defaultState().draft; restoreDraft(); $('#caseFeedback').textContent=''; $('#caseFeedback').className='feedback'; $('#caseHintText').hidden=true; $('#selfReview').open=false; saveState();
}
function clearProgress(){ state=defaultState(); saveState(); resetUi(); renderProgress(); renderNotebook(); }
function bindCoreEvents(){
  $('#startButton').addEventListener('click',()=>$('#graph-case').scrollIntoView({behavior:'smooth'}));
  $('#axisMin').addEventListener('input',(e)=>{ $('#axisMinOutput').textContent=`${e.target.value} seconds`; renderGraph(Number(e.target.value)); });
  $('#graphReset').addEventListener('click',()=>{ $('#axisMin').value='0'; $('#axisMinOutput').textContent='0 seconds'; renderGraph(0); });
  $('#graphHint').addEventListener('click',()=>toggleHint('#graphHintText'));
  $('#graphCheck').addEventListener('click',()=>{
    const a=selected('graphAnswer');
    if(!a) return feedback($('#graphFeedback'),'Choose a statement first. You can retry as many times as you want.');
    if(a==='appearance'){
      feedback($('#graphFeedback'),'Yes. The scale changes the visual emphasis, not the records or statistics. A non-zero axis can be useful when context is clear; it is not automatically deceptive.','good');
      completeStep('graph','Graph framing: moving the vertical-axis minimum changed visual emphasis while the six wait-time values, mean, and first-to-last change stayed identical.');
    } else if(a==='deceptive') feedback($('#graphFeedback'),'Not quite. A non-zero baseline is not automatically deceptive. It can reveal small variation; the key is whether the scale and context let a reader judge the actual magnitude.');
    else feedback($('#graphFeedback'),'The slider never edits the dataset. Recheck the table and fixed numeric summary, then try again.');
  });
  $('#sampleSize').addEventListener('input',(e)=>{ $('#sampleSizeOutput').textContent=`${e.target.value} records`; runSample(); });
  $$('input[name="sampleMethod"]').forEach((e)=>e.addEventListener('change',runSample));
  $('#drawSample').addEventListener('click',runSample);
  $('#drawAgain').addEventListener('click',()=>{state.sampleSeed+=1;runSample();});
  $('#sampleReset').addEventListener('click',()=>{ $$('input[name="sampleMethod"]').forEach((e)=>e.checked=e.value==='closing-only'); $('#sampleSize').value='24'; $('#sampleSizeOutput').textContent='24 records'; state.sampleSeed=2026; runSample(); });
  $('#sampleHint').addEventListener('click',()=>toggleHint('#sampleHintText'));
  $('#sampleCheck').addEventListener('click',()=>{
    const a=selected('biasAnswer');
    if(!a) return feedback($('#sampleFeedback'),'Choose an answer first, then compare sample size with sampling coverage.');
    if(a==='no'||a==='depends'){
      const msg=a==='no'?'Correct. Forty-eight closing-hour records are still records from only one part of the population. More of the same frame does not repair missing coverage.':'That is a defensible nuance. Size itself does not fix bias; coverage improves only if the added records give the missing time blocks a chance to appear.';
      feedback($('#sampleFeedback'),msg,'good'); completeStep('sample','Sampling: a larger closing-hour-only sample still omits three time blocks; size cannot repair coverage bias unless the sampling frame changes.');
    } else feedback($('#sampleFeedback'),'Not yet. Increasing n reduces some random sampling variation, but every record still comes from the same closing-hour frame. Try again.');
  });
  $('#stratifyToggle').addEventListener('change',renderCorrelation);
  $('#correlationReset').addEventListener('click',()=>{$('#stratifyToggle').checked=false;renderCorrelation();});
  $('#correlationHint').addEventListener('click',()=>toggleHint('#correlationHintText'));
  $('#correlationCheck').addEventListener('click',()=>{
    const a=selected('correlationAnswer');
    if(!a) return feedback($('#correlationFeedback'),'Choose a conclusion first. Use the difficulty toggle if you want another view.');
    if(a==='nuanced'){
      feedback($('#correlationFeedback'),'Yes. The overall association is real in this synthetic dataset, but puzzle difficulty is a plausible third-variable explanation. Association alone does not establish causation.','good');
      completeStep('correlation','Correlation: hints and completion time are associated overall, but stratifying by puzzle difficulty changes the pattern; association alone does not establish causation.');
    } else if(a==='cause') feedback($('#correlationFeedback'),'That conclusion is too strong. The data are observational and puzzle difficulty affects both hint use and completion time in this constructed dataset.');
    else feedback($('#correlationFeedback'),'Too strong in the other direction. An overall association can exist even when a third variable helps explain it. “Not causal” does not mean “no relationship.”');
  });
}
function bindFinalEvents(){
  ['claimText','observationText','limitationText'].forEach((id)=>$(`#${id}`).addEventListener('input',storeDraft));
  $$('input[name="issue"]').forEach((e)=>e.addEventListener('change',storeDraft));
  $('#caseHint').addEventListener('click',()=>toggleHint('#caseHintText'));
  $('#caseForm').addEventListener('submit',(event)=>{
    event.preventDefault(); storeDraft();
    const d=state.draft;
    const missing=[d.claim,d.observation,d.limitation].filter((v)=>v.trim().length<8).length;
    if(missing || d.issues.length<2){
      const parts=[]; if(missing)parts.push(`${missing} fuller written part${missing===1?'':'s'}`); if(d.issues.length<2)parts.push('at least two evidence issues');
      return feedback($('#caseFeedback'),`Structure check: add ${parts.join(' and ')}. This checks structure only—not whether arbitrary prose is “correct.”`);
    }
    feedback($('#caseFeedback'),'Structure complete. Now use the self-review checklist and exemplar below: this tool does not pretend to understand or grade your prose. Reasonable cautious conclusions can differ.','good');
    $('#selfReview').open=true;
    completeStep('transfer','Final case file: assembled a cautious claim with a supporting observation and limitation, using at least two of graph framing, sampling coverage, and correlation/causation.');
  });
  $('#notebookButton').addEventListener('click',openNotebook);
  $('#closeNotebook').addEventListener('click',closeNotebook);
  $('#scrim').addEventListener('click',closeNotebook);
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape' && $('#notebook').classList.contains('open'))closeNotebook();});
  const askReset=()=>{ if(window.confirm('Erase all Signal & Story progress and locally saved case notes? The lesson will reset without reloading.')) clearProgress(); };
  $('#resetAllButton').addEventListener('click',askReset);
  $('#eraseProgress').addEventListener('click',()=>{closeNotebook();askReset();});
  $('#replayButton').addEventListener('click',()=>$('#graph-case').scrollIntoView({behavior:'smooth'}));
}
async function init(){
  try{
    const response=await fetch('./data/datasets.json');
    if(!response.ok)throw new Error(`Dataset load failed: ${response.status}`);
    data=await response.json(); population=createPopulation(); correlationData=createCorrelationData();
    populateGraphTable(); populateCorrelationTable(); renderGraph(); runSample(); renderCorrelation(); restoreDraft(); renderProgress(); renderNotebook();
    bindCoreEvents(); bindFinalEvents(); window.__signalStoryReady=true;
  }catch(error){
    console.error(error);
    const alert=document.createElement('div'); alert.className='noscript'; alert.setAttribute('role','alert'); alert.textContent=`The bundled lesson data could not load. Serve the project with npm start. Error: ${error.message}`; document.body.prepend(alert);
  }
}
init();


