/** アプリの主要フェーズ */
export type AppPhase = 'drawing' | 'faceDown' | 'flipping' | 'revealed'

/** めくりの起点となる辺 */
export type PeelEdge = 'top' | 'bottom' | 'left' | 'right'
