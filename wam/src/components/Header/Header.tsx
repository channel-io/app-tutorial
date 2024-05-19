import {
  AlphaStack,
  Button,
  ButtonColorVariant,
  ButtonStyleVariant,
  Spacer,
  Text,
  Typography,
} from '@channel.io/bezier-react'
import { CancelIcon } from '@channel.io/bezier-icons'

import { close } from '../../utils/wam'

function Header() {
  return (
    <AlphaStack direction="horizontal">
      <Text
        color="txt-black-darkest"
        typo={Typography.Size24}
        bold
      >
        Tutorial
      </Text>
      <Spacer />
      <Button
        colorVariant={ButtonColorVariant.MonochromeDark}
        styleVariant={ButtonStyleVariant.Tertiary}
        leftContent={CancelIcon}
        onClick={() => close()}
      />
    </AlphaStack>
  )
}

export default Header
