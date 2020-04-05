export type Checker = {x: number, y: number}
export type Allegiance = 'RED' | 'BLUE'

export type BoardState = {
  red: Checker[],
  blue: Checker[]
}

export type BotOutput = { hex: Checker, state : object, error? : Error }
export type BotRunF = (friendlies: Checker[], enemies: Checker[], state : object) => BotOutput

export type OngoingRoundState = {
  board: BoardState,
  bots: {
    red: { run: BotRunF, state: object },
    blue: { run: BotRunF, state: object }
  }
}

export type RoundOverState = {
  board: BoardState
  error?: Error
  winner: Allegiance
}

export type RoundState = OngoingRoundState | RoundOverState

export type NextRoundStateF = (state : RoundState) => RoundState
