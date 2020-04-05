import React from 'react'
import {
  Segment,
  Container
} from 'semantic-ui-react'

import MainPage from '../pages/MainPage'
import TopBar from './TopBar'

const App = () => (
  <Segment basic style={{ minHeight: 700, padding: '1em 0em' }}>
    <TopBar />
    <Container>
      <MainPage />
    </Container>
  </Segment>
)

export default App
