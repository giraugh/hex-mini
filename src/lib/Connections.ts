import {
  BoardState,
  Allegiance,
  Checker
} from './Hex.d'
import { transposeBoard } from './Transposition'

export const winningAllegiance = (board : BoardState) : ( Allegiance | void) => {
  // Has red or blue won?
  let redWon = allegianceHasWon(board, 'RED')
  if (redWon) { return 'RED' }

  let blueWon = allegianceHasWon(board, 'BLUE')
  if (blueWon) { return 'BLUE' }

  // No winner yet
  return undefined
}

export const allegianceHasWon = (board : BoardState, allegiance : Allegiance) : boolean => {
  // An allegiance has won if,
  // any of their own hexes in the first column is indirectly connected to
  // an owned hex in the final column

  // Blue has same logic as red after all of their pieces positions are transposed i.e (x,y)=(y,x)
  if (allegiance === 'BLUE') {
    board = transposeBoard(board)
  }

  // Get all of my pieces in the first col
  const firstColumn = Array.from({length: 11}).map((_, y) => ({x: 0, y}))
  const connected = allConnected(board, allegiance, firstColumn)
  const hasPath = connected.some(({ x, y }) => x === 10)

  // Allegiance has won if we have a connected piece in the last column
  return hasPath
}

const allConnected = (board : BoardState, allegiance : Allegiance, positions : Checker[]) =>
  floodFill(
    adjacentPositions,
    (pos) => isAllegiance(board, allegiance, pos),
    [], positions
  )

type FloodFillF = (next : (checker : Checker) => Checker[], doProgress : (checker : Checker) => boolean, closed : Checker[], open : Checker[]) => Checker[]
const floodFill : FloodFillF = (next, doProgress, closed, open) => {
  // Recursive base case is when open is null
  if (open.length === 0) { return [] }

  const allAdjoining = open
    .map(pos => next(pos).filter(doProgress))
    .reduce((a, b) => a.concat(b))

  const uniqueAdjoining = uniquePositionsIn(allAdjoining)
  const closed_ = [...closed, ...open]
  const open_ = uniqueAdjoining.filter(pos => !hasPosition(closed_, pos))
  const closed__ = [...closed_, ...uniqueAdjoining]
  
  return [...open_, ...floodFill(next, doProgress, closed__, open_)] 
}

const isAllegiance = (board : BoardState, allegiance : Allegiance, position : Checker) : boolean => {
  let pieces = allegiance === 'RED'
    ? board.red
    : board.blue

  return hasPosition(pieces, position)
}

const hasPosition = (pieces : Checker[], { x: ax, y: ay } : Checker) : boolean =>
  pieces.some(({ x, y }) => ax === x && ay === y)

const adjacentPositions = ({ x, y } : Checker) : Checker[] =>
  [
    makePosition(x - 1, y), 
    makePosition(x + 1, y), 
    makePosition(x, y - 1), 
    makePosition(x, y + 1), 
    makePosition(x - 1, y + 1), 
    makePosition(x + 1, y - 1)
  ].filter(validPosition)

const uniquePositionsIn = (pieces : Checker[]) : Checker[] => {
  let acc = []
  for (let piece of pieces) {
    if (!hasPosition(acc, piece)) {
      acc.push(piece)
    }
  }

  return acc
}

const validPosition = ({ x, y } : Checker) : boolean =>
  x >= 0 && x <= 10 && y >= 0 && y <= 10

const makePosition = (x : number, y : number) : Checker => ({ x, y })