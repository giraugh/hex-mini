import { runFullRound } from './lib/Hex'

export const runGame = (redScript, blueScript) => {
  return new Promise((resolve, reject) => {
    const result = runFullRound(redScript, blueScript)
    resolve(result)
  })
}
