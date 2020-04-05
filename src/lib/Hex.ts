import {
  Checker,
  Allegiance,
  BotRunF,
  RoundState,
  BoardState,
  NextRoundStateF,
  RoundOverState,
  OngoingRoundState
} from './Hex.d'
import { makeBotRunFunction } from './Scripts'
import { winningAllegiance } from './Connections'
import { transposePositions, transposePosition } from './Transposition'

export const runFullRound = (redRunSource : string, blueRunSource : string) : RoundOverState => {
  let state = makeRound(redRunSource, blueRunSource)
  while ((state as RoundOverState).winner === undefined) {
    state = nextRoundState(state)
  }

  return state as RoundOverState
}

export const nextRoundState : NextRoundStateF = (state) => {
  // If the round is over then the next state is the same as this state
  if ((state as RoundOverState).winner !== undefined) { return state }

  // If the round is not over then forget about roundOver states
  state = state as OngoingRoundState

  // Which turn is deduced from the number of pieces on the board. (even number = red turn)
  const { red, blue } = state.board
  const numPieces = red.length + blue.length
  const isRedTurn = numPieces % 2 === 0

  // Run the bot
  // (If it's blues turn then we transpose the arguments to make red and blue scripts uniform)
  const bot = isRedTurn ? state.bots.red : state.bots.blue
  const botOutput = bot.run(
    isRedTurn ? red : transposePositions(blue),
    isRedTurn ? blue : transposePositions(red),
    bot.state
  )

  // Was there an error while running the bot?
  if (botOutput && botOutput.error) {
    return {
      board: state.board,
      logs: state.logs,
      error: botOutput.error,
      winner: isRedTurn ? 'BLUE' : 'RED'
    }
  }
  
  // Did the bot give a valid result?
  const botReturnErr = validateBotOutput(botOutput)
  if (botReturnErr) {
    return {
      board: state.board,
      logs: state.logs,
      error: botReturnErr,
      winner: isRedTurn ? 'BLUE' : 'RED'
    }
  }

  // Destructure the bot output
  let { hex, state : newBotState, logs : botLogMessages } = botOutput
  
  // Transpose the hex if its blues turn
  if (!isRedTurn) {
    hex = transposePosition(hex)
  }

  // Append new logs to list of logs for red and blue
  let newLogs = state.logs
  if (botLogMessages && botLogMessages.length) {
    const turn = state.board.red.length + state.board.blue.length
    const botLogs = botLogMessages.map(msg => ({ message: msg, turn }))
    newLogs = {
      red: isRedTurn ? [...state.logs.red, ...botLogs] : state.logs.red,
      blue: !isRedTurn ? [...state.logs.blue, ...botLogs] : state.logs.blue
    }
  }

  // Was this a valid move?
  const moveErr = validateMove(hex, state.board)
  if (moveErr) {
    return {
      board: state.board,
      logs: newLogs,
      error: moveErr,
      winner: isRedTurn ? 'BLUE' : 'RED'
    }
  }

  // Construct new state properties
  const newBoard = performMoveOnBoard(hex, isRedTurn ? 'RED' : 'BLUE', state.board)
  const newBots = {
    red: isRedTurn ? { run: bot.run, state: newBotState } : state.bots.red,
    blue: !isRedTurn ? { run: bot.run, state: newBotState } : state.bots.blue
  }

  // Check if anyone has won
  let winner = winningAllegiance(newBoard)
  if (winner) {
    console.log('WINNER IS ', winner)
    return {
      board: newBoard,
      logs: newLogs,
      winner: winner
    }
  }

  // Construct new state
  const newRoundState : RoundState = {
    bots: newBots,
    board: newBoard,
    logs: newLogs
  }

  return newRoundState
}

export const makeRound = (redRunSource : string, blueRunSource : string) : RoundState => ({
  bots: {
    red: { run: makeBotRunFunction(redRunSource), state: {} },
    blue: { run: makeBotRunFunction(blueRunSource), state: {} }
  },
  board: {
    red: [],
    blue: []
  },
  logs: {
    red: [],
    blue: []
  }
})

const performMoveOnBoard = (hex : Checker, allegiance : Allegiance, board : BoardState) : BoardState => {
  const isRedTurn = allegiance === 'RED'
  const { red, blue } = board
  return {
    red: isRedTurn ? [...red, hex] : red,
    blue: !isRedTurn ? [...blue, hex] : blue
  }
}

const validateBotOutput = (botOutput : any) : (Error | void) => {
  if (botOutput === undefined) {
    return new Error('Invalid Bot Output. Bot had no output')
  }

  if (botOutput.hex === undefined) {
    return new Error('Invalid Bot Output. Bot did not return a hex.')
  }

  if (botOutput.hex.x === undefined || botOutput.hex.y === undefined) {
    return new Error(`Invalid Bot Output. Bot returned malformed hex: "${JSON.stringify(botOutput.hex)}"`)
  }
}

const validateMove = (hex : Checker, board : BoardState) : (Error | void) => {
  // Is the hex is out of bounds?
  if (hex.x < 0 || hex.x > 10 || hex.y < 0 || hex.y > 10) {
    return new Error(`Invalid Move. Position (${hex.x}, ${hex.y}) is out of bounds.`)
  }

  // Is the target position empty?
  const allPieces = [...board.red, ...board.blue]
  const isTaken = allPieces.some(({x, y}) => x === hex.x && y === hex.y)
  if (isTaken) {
    return new Error(`Invalid Move. Position (${hex.x}, ${hex.y}) is not empty (already taken).`)
  }
}