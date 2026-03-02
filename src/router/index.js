import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("../views/MainView.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: () => import("../views/HomeView.vue"),
        },
        {
          path: "players",
          name: "players",
          component: () => import("../views/PlayerListView.vue"),
        },
        {
          path: "u/:id",
          name: "player",
          component: () => import("../views/PlayerView.vue"),
        },
      ]
    },
  ],
})

export default router
