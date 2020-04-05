import React, { useState, useMemo } from 'react'
import { Segment, Button } from 'semantic-ui-react'

import TurnControls from '../components/TurnControls'
import Board, { translateBoardData, boardAtTurn } from '../components/Board'
import BotCodeEditorPanel from '../components/BotCodeEditorPanel'
import { runGame } from '../controller'

const DEFAULT_BOT_CODE = `const taken = [...friendlies, ...enemies]
const pos = Array.from({length: 11}).map((_, x) => Array.from({length: 11}).map((_,y)=>({x, y}))).reduce((a,b)=>a.concat(b))
const empty = pos.filter(h => !taken.some(({x, y}) => h.x === x && h.y === y))
return empty[Math.random()*empty.length|0]`

const MainPage = () => {
  const [scripts, setScripts] = useState([DEFAULT_BOT_CODE, DEFAULT_BOT_CODE])
  const [messages, setMessages] = useState([[], []])
  const [boardData, setBoardData] = useState()
  const [currentTurn, setCurrentTurn] = useState(0)

  const handleApplyCode = index => value => {
    // Merge old and new scripts
    const newScripts = [
      index === 0 ? value : scripts[0],
      index === 1 ? value : scripts[1]
    ]

    // Update state
    setScripts(newScripts)
  }

  const handleCompete = () => {
    runGame(scripts[0], scripts[1])
      .then(handleMatchResult)
  }

  const decorateMessages = messages => messages.map(m => {
    if (boardData) {
      const gameLength = boardData.red.length + boardData.blue.length
      return {
        ...m,
        active: m.isError ? currentTurn === gameLength : m.turn <= currentTurn
      }
    } else {
      return m
    }
  })

  // eslint-disable-next-line no-unused-vars
  const handleMatchResult = result => {
    console.log('match result of ', result)

    // Save messages
    // #TODO:
    /*
    const logs = result.botLogs
    const errors = result.botErrors
    const gameState = JSON.parse(result.terminalStateStr)
    const gameLength = gameState.red.length + gameState.blue.length
    const allMessages = [
      ...errors.map(({ player, message }) => ({ player, message, isError: true, turn: gameLength + 1 })),
      ...logs.map(({ player, message, turn }) => ({ player, message, turn, isError: false }))
    ]

    setMessages([
      allMessages.filter(message => message.player.toLowerCase() === 'red'),
      allMessages.filter(message => message.player.toLowerCase() === 'blue')
    ])
    */

    // Save board data
    setBoardData(translateBoardData(result.board, 1, 1))
  }

  // Calculate and memoize turn data
  const turnData = useMemo(() => {
    if (boardData) {
      return boardAtTurn(boardData, currentTurn)
    }
  }, [boardData, currentTurn])

  return (
    <Segment>
      <Button onClick={handleCompete}> Compete! </Button>
      <TurnControls boardData={boardData} onTurnChange={setCurrentTurn} />
      <Board boardData={boardData ? turnData : undefined} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 10 }}>
        <BotCodeEditorPanel
          title={'Bot 1'}
          onApplyCode={handleApplyCode(0)}
          messages={decorateMessages(messages[0])}
          matchLoading={false}
          defaultBotCode={DEFAULT_BOT_CODE}
        />
        <BotCodeEditorPanel
          title={'Bot 2'}
          onApplyCode={handleApplyCode(1)}
          messages={decorateMessages(messages[1])}
          matchLoading={false}
          defaultBotCode={DEFAULT_BOT_CODE}
        />
      </div>
    </Segment>
  )
}

export default MainPage
