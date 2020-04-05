import React from 'react'
import { render } from 'react-dom'

import App from './components/App'

import 'semantic-ui-css/semantic.min.css'
import '../static/index.css'

render(
  <div>
    <App />
  </div>,
  document.querySelector('#root')
)
