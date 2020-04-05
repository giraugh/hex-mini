import {
  BotRunF,
  BotOutput
} from './Hex.d'

const EVALUATION_F = eval

export const runScript = (source : string, friendlies, enemies, state) : BotOutput => {

  // Construct the function from the args
  const script = `
    const friendlies = ${JSON.stringify(friendlies)}
    const enemies = ${JSON.stringify(enemies)}
    let state = ${JSON.stringify(state)}
    let logs = []
    const log = (...args) => logs.push(args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '))
    const run = () => {
      ${source}
    }
    ({ hex: run(), state, logs })
  `

  let result
  let error
  try {
    result = EVALUATION_F(script)
  } catch (e) {
    error = String(e)
  }

  return {...result, error }
}

export const makeBotRunFunction = (sourceString : string) : BotRunF => {
  return (friendlies, enemies, state) =>
    runScript(sourceString, friendlies, enemies, state)
}