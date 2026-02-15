import { reactive } from "vue";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en"

TimeAgo.addLocale(en);
export const timeAgo = new TimeAgo("en")

export function inputStateFactory(initial=null) {
    return reactive({
        value: initial,
        style: {},
        errorMessage: null,

        confirm() {
            this.style = { confirm: true };
        },

        showError(msg) {
            this.errorMessage = msg;
            this.style = { error: true };
        },

        clearStyle() {
            this.style = {};
        },

        reset() {
            this.value = initial;
            this.style = {};
            this.errorMessage = null;
        }
    });
}
