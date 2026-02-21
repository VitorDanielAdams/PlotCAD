export type { CardinalDirection } from "../../types/land.types"
import type { CardinalDirection } from "../../types/land.types"

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

export interface IParsedBearing {
  from: CardinalDirection
  to: CardinalDirection
  degrees: number
  minutes: number
  seconds: number
}
