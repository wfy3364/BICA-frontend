import { createStore } from 'vuex'

export default createStore({
    state: {
        playing: false,
    },
    mutations: {
        setPlaying(state, value) {
            state.playing = value
        },
    },
    actions: {
        startPlaying({ commit }) {
            commit('setPlaying', true)
        },
        stopPlaying({ commit }) {
            commit('setPlaying', false)
        },
    },
})