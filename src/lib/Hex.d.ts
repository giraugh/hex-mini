export type Checker = {x: number, y: number}
export type Allegiance = 'RED' | 'BLUE'
export type LogMessage = String
export type Log = { message: LogMessage, turn: number }
export type LogsRB = { red: Log[], blue: Log[] }

export type BoardState = {
  red: Checker[],
  blue: Checker[]
}

export type BotOutput = { hex: Checker, state : object, error? : Error, logs: LogMessage[] }
export type BotRunF = (friendlies: Checker[], enemies: Checker[], state : object) => BotOutput

export type OngoingRoundState = {
  board: BoardState,
  logs: LogsRB,
  bots: {
    red: { run: BotRunF, state: object },
    blue: { run: BotRunF, state: object }
  }
}

export type RoundOverState = {
  board: BoardState
  error?: Error
  logs: LogsRB
  winner: Allegiance
}

export type RoundState = OngoingRoundState | RoundOverState

export type NextRoundStateF = (state : RoundState) => RoundState
