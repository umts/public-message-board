import neostandard from 'neostandard'

export default [
  { ignores: ['dist/*'] },
  ...neostandard({ env: ['browser'] })
]
