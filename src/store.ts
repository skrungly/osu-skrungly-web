import { reactive } from "vue"

import * as api from "@/api"

interface AuthState {
  player: api.Player | null
  expired: boolean

  clear: () => void
  update: () => void
  login: (name: string, password: string) => Promise<Response>
  logout: () => Promise<Response>
}

// simple store for managing user authentication state
export const auth = reactive<AuthState>({
  player: localStorage.player ? JSON.parse(localStorage.player) : null,
  expired: false,

  clear() {
    localStorage.removeItem("player")
    this.player = null
  },

  async update() {
    const player = this.player ? this.player : await api.getIdentity()

    if (player == null) {
      this.clear()
      return
    }

    this.expired = false
    this.player = player
    localStorage.player = JSON.stringify(this.player)
  },

  async login(name: string, password: string) {
    const response = await api.login(name, password)

    if (!response.ok) {
      throw new Error(`failed to log in [${response.status}]`)
    }

    this.player = (await response.json()).identity
    this.update()
    return response
  },

  async logout() {
    const response = await api.logout()

    if (!response.ok && response.status != 401) {
      throw new Error(`unable to logout [${response.status}]`)
    }

    this.clear()
    return response
  }
})
