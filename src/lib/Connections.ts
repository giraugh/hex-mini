import {
  BoardState,
  Allegiance,
  Checker
} from './Hex.d'
import { transposeBoard, transposePositions } from './Transposition'

export const winningAllegiance = (board : BoardState) : ( Allegiance | void) => {
  // Has red or blue won?
  const redWon = allegianceHasWon(board, 'RED')
  if (redWon) { return 'RED' }

  const blueWon = allegianceHasWon(board, 'BLUE')
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
  const inRed = h => board.red.some(({x,y}) => h.x === x && h.y === y)
  const inBlue = h => board.blue.some(({x,y}) => h.x === x && h.y === y)
  const firstColumn = Array.from({length: 11}).map((_, y) => ({x: 0, y})).filter(h => allegiance === 'RED' ? inRed(h) : inBlue(h))
  const connected = allConnected(board, allegiance, firstColumn)
  const endNodes = connected.filter(({checker: { x, y }}) => x === 10)
  const hasPath = endNodes.length !== 0

  // Allegiance has won if we have a connected piece in the last column
  return hasPath
}

export const findWinningPath = (board : BoardState, allegiance : Allegiance): (Checker[] | void) => {
  // Blue has same logic as red after all of their pieces positions are transposed i.e (x,y)=(y,x)
  if (allegiance === 'BLUE') {
    board = transposeBoard(board)
  }

  // Get all of my pieces in the first col
  const inRed = h => board.red.some(({x,y}) => h.x === x && h.y === y)
  const inBlue = h => board.blue.some(({x,y}) => h.x === x && h.y === y)
  const firstColumn = Array.from({length: 11}).map((_, y) => ({x: 0, y})).filter(h => allegiance === 'RED' ? inRed(h) : inBlue(h))
  const connected = allConnected(board, allegiance, firstColumn)
  const endNodes = connected.filter(({checker: { x, y }}) => x === 10)
  
  // Do we not have a path
  const hasPath = endNodes.length !== 0
  if (!hasPath) { return }

  // Trace path
  let end : PathNode = endNodes[0]
  let path : Checker[] = []
  while (end) {
    path.push(end.checker)
    end = end.previous
  }

  if (allegiance === 'RED') {
    return path
  } else {
    return transposePositions(path)
  }
}

const allConnected = (board : BoardState, allegiance : Allegiance, positions : Checker[]) =>
  floodFill(
    adjacentPositions,
    (pos) => isAllegiance(board, allegiance, pos),
    [], positions.map(pos => ({ previous: null, checker: pos }))
  )

type PathNode = { checker: Checker, previous: PathNode | null }
type FloodFillF = (next : (checker : Checker) => Checker[], doProgress : (checker : Checker) => boolean, closed : PathNode[], open : PathNode[]) => PathNode[]
const floodFill : FloodFillF = (next, doProgress, closed, open) => {
  // Recursive base case is when open is null
  if (open.length === 0) { return [] }

  const allAdjoining = open
    .map(oNode => next(oNode.checker).filter(doProgress).map(checker => ({ checker, previous: oNode })))
    .reduce((a, b) => a.concat(b))

  const uniqueAdjoining = uniqueNodesIn(allAdjoining)
  const closed_ = [...closed, ...open]
  const open_ = uniqueAdjoining.filter(pos => !hasPosition(closed_.map(x => x.checker), pos.checker))
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

const uniqueNodesIn = (nodes : PathNode[]) : PathNode[] => {
  let acc = []
  for (let node of nodes) {
    if (!hasPosition(acc, node.checker)) {
      acc.push(node)
    }
  }

  return acc
}

const validPosition = ({ x, y } : Checker) : boolean =>
  x >= 0 && x <= 10 && y >= 0 && y <= 10

const makePosition = (x : number, y : number) : Checker => ({ x, y })