import {
  Checker,
  BoardState
} from './Hex.d'

export const transposePosition = ({x, y} : Checker) : Checker => ({ x: y, y: x}) 
export const transposePositions = (checkers : Checker[]) : Checker[] => checkers.map(transposePosition)
export const transposeBoard = (board : BoardState) : BoardState => ({
  red: transposePositions(board.red),
  blue: transposePositions(board.blue)
})
