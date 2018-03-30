import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    commands: ['cube', 'cylinder', 'union']
  },
  mutations: {
    addCommand (state) {
      // mutate state
      state.commands.push('translate')
    }
  }
})
