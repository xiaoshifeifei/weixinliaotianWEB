import Vue from 'vue'
import Vuex from 'vuex'

import contact from './modules/contact'
import user from './modules/user'
import talks from './modules/talk'
import notify from './modules/notify'
import settings from './modules/settings'
import emoticon from './modules/emoticon'
import dialogue from './modules/dialogue'
import createPersistedState from 'vuex-persistedstate'

import state from './state'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [
    createPersistedState()
  ],
  modules: {
    contact,
    user,
    notify,
    talks,
    settings,
    emoticon,
    dialogue,
  },
  state,
  getters,
  mutations,
})

export default store
