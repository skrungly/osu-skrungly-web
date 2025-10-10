import { reactive } from "vue";

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
