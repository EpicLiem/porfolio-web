import test from "node:test";
import assert from "node:assert/strict";
import { newClock, clockSeconds, completeTurn, completePremove, pauseClock } from "./clock";
test('clocks freeze before ready and account for full elapsed turns',()=>{
 const c=newClock(); assert.deepEqual(clockSeconds(c,9000),{w:600,b:600});
 c.running=true;c.startedAt=1000;
 assert.equal(clockSeconds(c,2500).w,598.5);
 assert.equal(completeTurn(c,3000),true);assert.equal(c.turn,'b');assert.deepEqual(c.history.w,[2]);
 assert.equal(clockSeconds(c,7000).b,596);
 pauseClock(c,8000);assert.equal(c.remaining.b,595);assert.equal(clockSeconds(c,99999).b,595);
 c.startedAt=10000;c.running=true;completeTurn(c,12000);assert.deepEqual(c.history.b,[7]);
});
test('timeout cannot commit a move or earn increment',()=>{
 const c=newClock(60,10);c.remaining.w=1;c.running=true;c.startedAt=1000;
 assert.equal(completeTurn(c,2100),false);assert.equal(c.remaining.w,0);assert.equal(c.running,false);assert.deepEqual(c.history.w,[]);
});
test('premove charges at least 0.1 seconds before awarding increment',()=>{
 const c=newClock(60,1);c.running=true;c.startedAt=1000;
 assert.equal(completePremove(c,1002),true);
 assert.ok(Math.abs(c.remaining.w-60.9)<1e-9);
 assert.ok(Math.abs(c.history.w[0]-0.1)<1e-9);
 assert.equal(c.turn,'b');
 const expired=newClock(0.05,10);expired.running=true;expired.startedAt=1000;
 assert.equal(completePremove(expired,1000),false);
 assert.equal(expired.remaining.w,0);assert.deepEqual(expired.history.w,[]);
 const slow=newClock();slow.running=true;slow.startedAt=1000;
 completePremove(slow,1300);assert.ok(Math.abs(slow.history.w[0]-0.3)<1e-9);
});

test('each trained control starts frozen and awards increment without changing duration history', async () => {
 const { TRAINED_TIME_CONTROLS } = await import('./time-controls');
 assert.equal(TRAINED_TIME_CONTROLS.length,12);
 for (const control of TRAINED_TIME_CONTROLS) {
  const c=newClock(control.initialSeconds,control.incrementSeconds);
  assert.deepEqual(clockSeconds(c,999999),{w:control.initialSeconds,b:control.initialSeconds});
  c.running=true;c.startedAt=1000;
  assert.equal(completeTurn(c,3500),true);
  assert.equal(c.remaining.w,control.initialSeconds-2.5+control.incrementSeconds);
  assert.deepEqual(c.history.w,[2.5]);
  pauseClock(c,4500);
  c.startedAt=10000;c.running=true;
  assert.equal(completeTurn(c,12000),true);
  assert.equal(c.remaining.b,control.initialSeconds-3+control.incrementSeconds);
  assert.deepEqual(c.history.b,[3]);
 }
});
