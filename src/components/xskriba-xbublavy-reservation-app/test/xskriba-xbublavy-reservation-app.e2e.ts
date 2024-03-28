import { newE2EPage } from '@stencil/core/testing'

describe('xskriba-xbublavy-reservation-app', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<xskriba-xbublavy-reservation-app></xskriba-xbublavy-reservation-app>')

    const element = await page.find('xskriba-xbublavy-reservation-app')
    expect(element).toHaveClass('hydrated')
  })
})
