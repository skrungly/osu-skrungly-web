import { reactive } from "vue";

import * as api from "@/api";

// simple store for managing user authentication state
export const auth = reactive({
    player: localStorage.player ? JSON.parse(localStorage.player) : null,
    expired: false,

    clear() {
        localStorage.removeItem("player");
        this.player = null;
    },

    async update() {
        const identity = this.player ? this.player.id : await api.getIdentity();

        if (identity == null) {
            this.clear();
            return;
        }

        const response = await api.get(`/players/${identity}`);

        if (!response.ok) {
            throw new Error(`failed to fetch info for authorized player [${response.status}]`);
        }

        this.expired = false;
        this.player = await response.json();
        localStorage.player = JSON.stringify(this.player);
    },

    async login(name, password) {
        // TODO: if api.login is changed to provide full player info,
        // we should assign to `this.player` from here.
        const response = await api.login(name, password);
        await this.update();
        return response;
    },

    async logout() {
        const response = await api.logout();

        if (!response.ok && response.status != 401) {
            throw new Error(`unable to logout [${response.status}]`)
        }

        this.clear();
        return response;
    }
})
