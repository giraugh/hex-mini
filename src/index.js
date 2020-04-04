import {
  runFullRound
} from './lib/Hex'

const TEST_SCRIPT = 'return {x: Math.random()*11|0, y: Math.random()*11|0}'
const TEST_SCRIPT_2 = `
  const taken = [...friendlies, ...enemies]
  const pos = Array.from({length: 11}).map((_, x) => Array.from({length: 11}).map((_,y)=>({x, y}))).reduce((a,b)=>a.concat(b))
  const empty = pos.filter(h => !taken.some(({x, y}) => h.x === x && h.y === y))
  return empty[Math.random()*empty.length|0]
`

const res = runFullRound(TEST_SCRIPT_2, TEST_SCRIPT_2)
console.log(res)

window.res = res