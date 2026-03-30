/** アプリの主要フェーズ */
export type AppPhase = 'drawing' | 'faceDown' | 'flipping' | 'revealed'

/** 2D 正規化ベクトル（回転軸の XY 成分） */
export type Axis2D = { x: number; y: number }
