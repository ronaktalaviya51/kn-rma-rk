import { createStore } from 'vuex'
import { AuthState } from './modules/auth'
import { RmaState } from './modules/rma'
import auth from './modules/auth'
import rma from './modules/rma'

export interface RootState {
  auth: AuthState
  rma: RmaState
}

export default createStore<RootState>({
  modules: {
    auth,
    rma
  }
})