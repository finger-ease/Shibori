/** トランプ風カード（px） */
export const CARD_WIDTH = 240
export const CARD_HEIGHT = 336
export const CARD_RADIUS = 14

/**
 * めくり方向への変位がこの px に達すると peelProgress が 1（全開）。
 * カード座標系（CSS px と同スケール）で計算するため、大きいほど同じマウス移動では進みにくい。
 */
export const PIXELS_FOR_FULL_PEEL = 420

/**
 * めくりで表面がカード矩形外にはみ出してもクリップされないよう、
 * DOM / 正射影の余白（px ＝ Three.js のワールド単位）
 */
export const PEEL_VIEW_MARGIN = 360
