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
          path: "players/:id",
          name: "player",
          component: () => import("../views/PlayerView.vue"),
        },
        {
          // osu client sends players to /u/:id
          path: "u/:id",
          redirect: { name: "player" }
        }
      ]
    },
    {
      path: "/tasks/:task",
      name: "task",
      component: () => import("../views/TaskView.vue"),
    },
  ],
})

export default router
