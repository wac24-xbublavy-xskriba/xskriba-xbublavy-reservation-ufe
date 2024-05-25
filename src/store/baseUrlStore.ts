import { createStore } from '@stencil/store'

const { state } = createStore({
  baseUrl: ''
})

export const setBaseUrl = (url: string) => {
  state.baseUrl = url
}

export const getBaseUrl = () => state.baseUrl

export const withBase = (path: string) => `${state.baseUrl}${path}`

export default state
