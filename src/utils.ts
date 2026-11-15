import { Reactive, reactive } from "vue"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"

TimeAgo.addLocale(en)
export const timeAgo = new TimeAgo("en")

export interface ValidationStyle {
  confirm?: boolean
  error?: boolean
}

export interface InputState<T> {
  value: T | null
  style: ValidationStyle
  errorMessage: string | null

  confirm: () => void
  showError: (msg: string) => void
  clearStyle: () => void
  reset: () => void
}

export function inputStateFactory<T>(initial: T | null = null): Reactive<InputState<T>> {
  let state: InputState<T> = {
    value: initial,
    style: {},
    errorMessage: null,

    confirm() {
      this.style = { confirm: true }
    },

    showError(msg: string) {
      this.errorMessage = msg
      this.style = { error: true }
    },

    clearStyle() {
      this.style = {}
    },

    reset() {
      this.value = initial
      this.style = {}
      this.errorMessage = null
    }
  }

  return reactive(state)
}
