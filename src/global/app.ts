import '@material/web/all.js'

import '@shoelace-style/shoelace/dist/shoelace.js'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

import { registerNavigationApi } from './navigation.js'

dayjs.extend(localizedFormat)
dayjs.extend(utc)

export default function () {
  registerNavigationApi()
}
