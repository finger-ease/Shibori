/** アプリの主要フェーズ */
export type AppPhase = 'drawing' | 'faceDown' | 'flipping' | 'revealed'

/** めくりの起点となる辺または角 */
export type PeelEdge =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
