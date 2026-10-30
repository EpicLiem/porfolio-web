import { Chess } from "chess.js";
import test from "node:test";
import assert from "node:assert/strict";
import { replayGame, gameResult, timeoutResult } from "./game";

test("replay keeps actual chronological history and rejects illegal model moves", () => {
  const {game,historyFens}=replayGame(['e2e4','e7e5','g1f3']);
  assert.equal(historyFens.length,4);
  assert.equal(historyFens.at(-1),game.fen());
  assert.notEqual(historyFens[0],historyFens[1]);
  assert.throws(()=>replayGame(['e2e5']));
});
test("checkmate and repetition end a game", () => {
  assert.equal(gameResult(replayGame(['f2f3','e7e5','g2g4','d8h4']).game),'Black wins by checkmate.');
  const repeat=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1','f6g8'];
  assert.equal(gameResult(replayGame(repeat).game),'Draw by threefold repetition.');
  assert.equal(replayGame(repeat).historyFens.length,8);
});
test("castling and en passant survive replay", () => {
  const castle=replayGame(['e2e4','e7e5','g1f3','b8c6','f1c4','g8f6','e1g1']).game;
  assert.equal(castle.get('g1')?.type,'k'); assert.equal(castle.get('f1')?.type,'r');
  const ep=replayGame(['e2e4','a7a6','e4e5','d7d5','e5d6']).game;
  assert.equal(ep.get('d5'),undefined); assert.equal(ep.get('d6')?.color,'w');
});

test("a bare king cannot win on timeout",()=>{
 const game=new Chess('8/8/8/8/8/4k3/8/Q3K3 w - - 0 1');
 assert.equal(timeoutResult(game,'w'),'Draw on time: insufficient mating material.');
 assert.equal(timeoutResult(game,'b'),'White wins on time.');
});
