import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/players",
      name: "players",
      component: () => import("../views/PlayerListView.vue"),
    },
    {
      path: "/u/:id",
      name: "player",
      component: () => import("../views/PlayerView.vue"),
    }
  ],
})

export default router
