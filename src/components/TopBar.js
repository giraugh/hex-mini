import React from 'react'

import {
  Menu,
  Container
} from 'semantic-ui-react'

const menuItemStyle = {
  alignSelf: 'center'
}

const TopBar = () => {
  return (
    <Menu
      size='large'
      secondary
      pointing
      style={{ border: 'none' }}
    >
      <Container>
        <Menu.Item header as='h3' to='/'style={menuItemStyle} active={true}>Hex <sup>Mini</sup></Menu.Item>
      </Container>
    </Menu>
  )
}

export default TopBar
