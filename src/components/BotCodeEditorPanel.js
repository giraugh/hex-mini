import React, { useState } from 'react'
import {
  Header, Icon, Button
} from 'semantic-ui-react'
import propTypes from 'prop-types'

import MessagesDisplay from '../components/MessagesDisplay'
import { BotCodeEditor } from '../components/BotCodeDisplay'

const DO_NOTHING = () => {}

const BotCodeEditorPanel = ({ title, onApplyCode = DO_NOTHING, onSave = DO_NOTHING, messages = [], matchLoading, defaultBotCode }) => {
  const [currentCode, setCurrentCode] = useState(defaultBotCode)
  const [appliedCode, setAppliedCode] = useState(defaultBotCode)

  const handleReset = () => setCurrentCode(defaultBotCode)
  const handleClear = () => setCurrentCode('')
  const handleCodeChanged = (value) => setCurrentCode(value)

  const handleApplyCode = () => {
    setAppliedCode(currentCode)
    onApplyCode(currentCode)
  }

  const changedSinceApplication = currentCode !== appliedCode
  return (
    <div>
      <Header as='h2' style={{ marginLeft: 10, marginBottom: 0 }}> { title } { changedSinceApplication && '•' } </Header>
      <BotCodeEditor
        value={currentCode}
        onChange={handleCodeChanged}
        extraStyle={{ borderRadius: '5px 5px 0px 0px', borderBottom: 'none' }}/>
      <Button.Group compact style={{ width: '100%' }}>
        <Button style={{ borderRadius: 0 }} onClick={handleApplyCode} disabled={matchLoading}> <Icon name='save' /> Update </Button>
        <Button style={{ borderRadius: 0 }} onClick={handleReset}> <Icon name='redo' /> Reset </Button>
        <Button style={{ borderRadius: 0 }} onClick={handleClear}> <Icon name='delete' /> Clear </Button>
      </Button.Group>
      <MessagesDisplay messages={messages} titleStyle={{ marginTop: 20 }} />
    </div>
  )
}

BotCodeEditorPanel.propTypes = {
  title: propTypes.string,
  onApplyCode: propTypes.func,
  onSave: propTypes.func,
  messages: propTypes.array,
  matchLoading: propTypes.bool,
  defaultBotCode: propTypes.string
}

export default BotCodeEditorPanel
