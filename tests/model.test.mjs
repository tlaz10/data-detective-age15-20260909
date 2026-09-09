import test from 'node:test';
import assert from 'node:assert/strict';
import { graphStats, createPopulation, drawSample, summarizeRatings, createCorrelationData, correlationSummary } from '../src/model.js';

test('graph statistics are independent of rendering axis', () => {
  const records=[82,80,79,77,75,74].map((waitSeconds,i)=>({night:`Night ${i+1}`,waitSeconds}));
  assert.deepEqual(graphStats(records), { count:6, min:74, max:82, mean:77.8, change:-8 });
});

test('synthetic population has documented equal time-block coverage', () => {
  const summary=summarizeRatings(createPopulation());
  assert.equal(summary.size,240);
  assert.deepEqual(summary.composition, {'Opening hour':60,'Mid-session':60,'Late session':60,'Closing hour':60});
  assert.equal(summary.mean,3.45);
});

test('closing-only method samples only its documented biased frame', () => {
  const population=createPopulation();
  const sample=drawSample(population,'closing-only',24,2026);
  assert.equal(sample.length,24);
  assert.ok(sample.every((r)=>r.timeBlock==='Closing hour'));
  assert.equal(summarizeRatings(sample).mean,4.23);
});

test('all-window stratified method includes each stratum equally for equal population strata', () => {
  const summary=summarizeRatings(drawSample(createPopulation(),'all-window-stratified',24,2026));
  assert.deepEqual(summary.composition, {'Opening hour':6,'Mid-session':6,'Late session':6,'Closing hour':6});
  assert.equal(summary.mean,3.47);
});

test('sampling is reproducible by seed and changes for another seed', () => {
  const p=createPopulation();
  const ids=(seed)=>drawSample(p,'all-window-stratified',24,seed).map((r)=>r.id);
  assert.deepEqual(ids(2026),ids(2026));
  assert.notDeepEqual(ids(2026),ids(2027));
});

test('larger biased sample still excludes unrepresented blocks', () => {
  const sample=drawSample(createPopulation(),'closing-only',48,2026);
  assert.equal(sample.length,48);
  assert.deepEqual([...new Set(sample.map((r)=>r.timeBlock))],['Closing hour']);
});

test('third-variable construction yields positive overall but negative within-group associations', () => {
  const summary=correlationSummary(createCorrelationData());
  assert.equal(summary.overall,0.826);
  assert.deepEqual(summary.byDifficulty,{Easy:-0.881,Medium:-0.881,Hard:-0.881});
});
