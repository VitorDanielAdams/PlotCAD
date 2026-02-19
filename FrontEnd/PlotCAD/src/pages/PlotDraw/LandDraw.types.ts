export type CardinalDirection = "N" | "S" | "E" | "O" | "NE" | "NO" | "SE" | "SO"

export interface ISegment {
  id: string
  from: CardinalDirection
  to: CardinalDirection
  degrees: number
  minutes: number
  seconds: number
  distance: number
  /** Raw bearing text input in the format SO1235NE, controlled by the user */
  bearingRaw: string
}

export interface IDrawPoint {
  x: number
  y: number
}
