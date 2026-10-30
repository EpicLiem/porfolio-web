"use client";

import { createModel, ratingContextForControl, type ModelPosition } from "@epicliem/liemfish-browser";

export type { ModelPosition, ModelProgress, ModelPrediction } from "@epicliem/liemfish-browser";

const engine = createModel({ assetBaseUrl: "/chess/engine/" });
export const loadModel = engine.loadModel;
export const predict: typeof engine.predict = (position: ModelPosition, options) =>
  engine.predict({
    ...position,
    ...ratingContextForControl(position.initialSeconds, position.incrementSeconds),
  }, options);
export const disposeModel = engine.disposeModel;
