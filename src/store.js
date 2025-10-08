import { reactive } from "vue";

import * as api from "@/api";

// simple store for managing user authentication state
export const auth = reactive({
    player: localStorage.player ? JSON.parse(localStorage.player) : null,

    clear() {
        localStorage.removeItem("player");
        this.player = null;
    },

    async update() {
        const identity = this.player ? this.player.id : await api.identity();

        if (identity == null) {
            this.clear();
            return;
        }

        const response = await api.get(`/players/${identity}`);

        if (!response.ok) throw new Error(response.statusText);

        this.player = await response.json();
        localStorage.player = JSON.stringify(this.player);
    },

    async login(name, password) {
        // TODO: if api.login is changed to provide full player info,
        // we should assign to `this.player` from here.
        const loginResponse = await api.login(name, password);

        if (!loginResponse.ok) return null;

        await this.update();
    },

    async logout() {
        const response = await api.logout();
        if (!response.ok) throw new Error(response.statusText);
        this.clear()
    }
})
