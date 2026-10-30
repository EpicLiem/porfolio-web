import { Chess } from "chess.js";
import test from "node:test";
import assert from "node:assert/strict";
import { legalPremove, premoveTargets } from "./premove";

test("premove candidates use own-piece geometry for either color, not current occupancy", () => {
  const game = new Chess();
  assert.deepEqual(premoveTargets(game, "e2", "w"), ["d3", "e3", "e4", "f3"]);
  assert.deepEqual(premoveTargets(game, "e7", "b"), ["d6", "e5", "e6", "f6"]);
  assert.ok(premoveTargets(game, "a1", "w").includes("a8"));
  assert.ok(premoveTargets(game, "b1", "w").includes("d2"));
  assert.deepEqual(premoveTargets(game, "e7", "w"), []);
  assert.deepEqual(premoveTargets(game, "e4", "w"), []);
  assert.deepEqual(premoveTargets(game, "invalid", "w"), []);
  game.move("e4");
  assert.ok(!premoveTargets(game, "e4", "w").includes("e6"));
});

test("a queued diagonal pawn capture becomes legal only after the opponent arrives", () => {
  const game = new Chess();
  game.move("e4");
  const move = { from: "e4", to: "d5" };
  assert.ok(premoveTargets(game, move.from, "w").includes(move.to));
  assert.equal(legalPremove(game, move), null);
  game.move("d5");
  const before = game.fen();
  assert.equal(legalPremove(game, move), "e4d5");
  assert.equal(game.fen(), before);
});

test("execution rejects a captured source and a move that fails to answer check", () => {
  const captured = new Chess("4k3/8/8/8/8/8/rN6/4K3 b - - 0 1");
  captured.move("Rxb2");
  assert.equal(legalPremove(captured, { from: "b2", to: "c4" }), null);
  const checked = new Chess("4k3/8/8/8/8/8/r7/4K2N b - - 0 1");
  checked.move("Ra1+");
  assert.equal(legalPremove(checked, { from: "h1", to: "f2" }), null);
});

test("castling candidates respect rights and execution respects blockers and attacked squares", () => {
  const blocked = new Chess();
  assert.ok(premoveTargets(blocked, "e1", "w").includes("g1"));
  assert.equal(legalPremove(blocked, { from: "e1", to: "g1" }), null);
  const clear = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
  assert.equal(legalPremove(clear, { from: "e1", to: "g1" }), "e1g1");
  assert.ok(premoveTargets(clear, "e8", "b").includes("c8"));
  clear.setCastlingRights("w", { k: false, q: false });
  assert.ok(!premoveTargets(clear, "e1", "w").includes("g1"));
  const attacked = new Chess("4kr2/8/8/8/8/8/8/4K2R w K - 0 1");
  assert.equal(legalPremove(attacked, { from: "e1", to: "g1" }), null);
});

test("execution permits en passant and requires an explicit valid promotion choice", () => {
  const ep = new Chess();
  for (const move of ["e4", "a6", "e5", "d5"]) ep.move(move);
  assert.equal(legalPremove(ep, { from: "e5", to: "d6" }), "e5d6");
  for (const side of ["w", "b"] as const) {
    const game = new Chess(side === "w" ? "4k3/P7/8/8/8/8/8/4K3 w - - 0 1" : "4k3/8/8/8/8/8/p7/4K3 b - - 0 1");
    const move = { from: side === "w" ? "a7" : "a2", to: side === "w" ? "a8" : "a1" };
    assert.equal(legalPremove(game, move), null);
    assert.equal(legalPremove(game, { ...move, promotion: "k" }), null);
    for (const promotion of ["q", "r", "b", "n"]) {
      assert.equal(legalPremove(game, { ...move, promotion }), `${move.from}${move.to}${promotion}`);
    }
  }
  assert.equal(legalPremove(ep, null), null);
});
