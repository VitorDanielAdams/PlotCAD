export type CardinalDirection = "N" | "S" | "E" | "O" | "NE" | "NO" | "SE" | "SO"

export interface ISegment {
  id: string
  from: CardinalDirection
  to: CardinalDirection
  degrees: number
  minutes: number
  seconds: number
  distance: number
  bearingRaw: string
  label: string
}

export interface IRegistration {
  name: string
  registrationNumber: string
  location: string
  client: string
  notes: string
}

export interface IDrawPoint {
  x: number
  y: number
}
