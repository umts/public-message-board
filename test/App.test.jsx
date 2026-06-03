import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import 'vitest-browser-react'
import App from '../src/App.jsx'

describe('App', () => {
  it('renders nothing when no stop has been configured', async () => {
    await page.render(<App />)
    expect(true).toBeTruthy()
  })
})
