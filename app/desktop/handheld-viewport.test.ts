import assert from "node:assert/strict";
import test from "node:test";
import { getHandheldViewport, shouldRecoverHandheldKeyboard } from "./handheld-viewport";

const full = { height: 760, offsetTop: 0, scale: 1, layoutHeight: 760, unfocusedHeight: 760, editing: false, keyboardOpen: false };

test("browser bars can change the viewport without entering keyboard mode", () => {
  assert.deepEqual(getHandheldViewport({ ...full, height: 660, editing: true }), { height: 660, top: 0, keyboard: false });
});

test("a panned keyboard viewport retains its offset and usable height", () => {
  assert.deepEqual(getHandheldViewport({ ...full, height: 300, offsetTop: 70, editing: true }), { height: 300, top: 70, keyboard: true });
});

test("keyboard detection also works when the layout viewport shrinks", () => {
  assert.equal(getHandheldViewport({ ...full, height: 300, layoutHeight: 300, editing: true })?.keyboard, true);
});

test("keyboard mode lasts through blur until the viewport recovers", () => {
  assert.equal(getHandheldViewport({ ...full, height: 300, keyboardOpen: true })?.keyboard, true);
  assert.equal(getHandheldViewport({ ...full, keyboardOpen: true })?.keyboard, false);
});

test("very short viewports are not expanded, and pinch zoom keeps browser control", () => {
  assert.equal(getHandheldViewport({ ...full, height: 180, editing: true })?.height, 180);
  assert.equal(getHandheldViewport({ ...full, scale: 2 }), null);
});

test("native Safari's 32px landscape keyboard state requires recovery", () => {
  assert.equal(shouldRecoverHandheldKeyboard({ height: 32, keyboard: true }, true, true), true);
  assert.equal(shouldRecoverHandheldKeyboard({ height: 180, keyboard: true }, true, true), false);
  assert.equal(shouldRecoverHandheldKeyboard({ height: 160, keyboard: true }, true, true), false);
});

test("recovery does not interrupt portrait, a blurred field, or a closed keyboard", () => {
  assert.equal(shouldRecoverHandheldKeyboard({ height: 32, keyboard: true }, true, false), false);
  assert.equal(shouldRecoverHandheldKeyboard({ height: 32, keyboard: true }, false, true), false);
  assert.equal(shouldRecoverHandheldKeyboard({ height: 32, keyboard: false }, true, true), false);
});
