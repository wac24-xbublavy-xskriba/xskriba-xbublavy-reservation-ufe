import { formatFullName } from './utils'

describe('formatFullName', () => {
  it('returns full name', () => {
    expect(formatFullName('John', 'Doe')).toEqual('John Doe')
  })
})
