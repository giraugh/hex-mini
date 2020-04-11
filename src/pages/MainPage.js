import React, { useState, useMemo } from 'react'
import { Segment, Button } from 'semantic-ui-react'

import TurnControls from '../components/TurnControls'
import Board, { translateBoardData, boardAtTurn } from '../components/Board'
import BotCodeEditorPanel from '../components/BotCodeEditorPanel'
import { runGame } from '../controller'

const DEFAULT_BOT_CODE = `/* Welcome to Hex-Mini! */
// Below is an example script
// See if you can improve it!

// Every script is passed two arrays of positions, 'friendlies' and 'enemies'
// 'friendlies' contains the position of all of your pieces
// 'enemies' contains the position of all of your opponents pieces

// Create an array of all non-empty pieces
const checkers = [...friendlies, ...enemies]

// Define a predicate to determine whether a given position, h, is empty
const isEmpty = h =>
  !checkers.some(({ x, y}) => h.x === x && h.y === y)

// Create an array of every possible position
// (the board is 11x11 and indexed from [0, 10])
// this makes use of a built-in function 'makePositionList'
const pos = makePositionList()

// Filter the array of all positions to find only the empty ones
const empty = pos.filter(isEmpty)

// Return a random element of the array of empty positions
return empty[Math.floor(Math.random() * empty.length)]`

const MainPage = () => {
  const [scripts, setScripts] = useState([DEFAULT_BOT_CODE, DEFAULT_BOT_CODE])
  const [messages, setMessages] = useState([[], []])
  const [boardData, setBoardData] = useState()
  const [currentTurn, setCurrentTurn] = useState(0)
  const [winningPath, setWinningPath] = useState()
  const [showPath, setShowPath] = useState(true)

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

  const handleToggleShowPath = () => setShowPath(!showPath)

  // eslint-disable-next-line no-unused-vars
  const handleMatchResult = result => {
    console.log('match result of ', result)

    // Save messages
    const logs = [
      ...result.logs.red.map(log => ({ ...log, player: 'RED' })),
      ...result.logs.blue.map(log => ({ ...log, player: 'BLUE' }))
    ]
    const errors = result.error ? [result.error] : []
    const gameLength = result.board.red.length + result.board.blue.length
    const allMessages = [
      ...errors.map(error => ({ isError: true, message: error, turn: gameLength, player: result.winner === 'RED' ? 'BLUE' : 'RED' })),
      ...logs.map(({ player, message, turn }) => ({ player, message, turn, isError: false }))
    ]

    setMessages([
      allMessages.filter(message => message.player.toLowerCase() === 'red'),
      allMessages.filter(message => message.player.toLowerCase() === 'blue')
    ])

    // Save board data
    setBoardData(translateBoardData(result.board, 1, 1))

    // Set winning path display
    setWinningPath(result.path ? result.path.map(({ x, y }) => ({ x: x + 1, y: y + 1 })) : undefined)
  }

  // Calculate and memoize turn data
  const turnData = useMemo(() => {
    if (boardData) {
      return boardAtTurn(boardData, currentTurn)
    }
  }, [boardData, currentTurn])

  const gameLength = boardData && (boardData.red.length + boardData.blue.length)
  const isLastTurn = boardData && (currentTurn === gameLength)

  return (
    <Segment basic>
      <Button onClick={handleCompete}> Compete! </Button>
      <TurnControls
        boardData={boardData}
        onTurnChange={setCurrentTurn}
        disabled={boardData === undefined} />
      <Button
        icon={ showPath ? 'low vision' : 'eye'}
        style={{ marginLeft: 8 }}
        disabled={boardData === undefined}
        onClick={handleToggleShowPath} />
      <Button
        icon='question'
        as='a'
        href='http://github.com/retroverse/hex-mini/wiki/Basic-API'
        target='_blank' />
      <Board
        boardData={boardData ? turnData : undefined}
        highlightPath={(isLastTurn && showPath) ? winningPath : undefined} />
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
