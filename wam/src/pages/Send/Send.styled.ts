import { styled } from '@channel.io/bezier-react'

import { isMobile } from '../../utils/userAgent'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${() => (isMobile() ? '220px' : '180px')};
  margin-top: ${() => (isMobile() ? '104px' : '0')};
`

export const CenterTextWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
`
