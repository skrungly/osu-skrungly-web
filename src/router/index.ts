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
          path: "mapsets/:id",
          name: "mapset",
          component: () => import("../views/MapsetView.vue"),
        },
        {
          path: "maps/:id",
          name: "maps",
          component: () => import("../views/MapView.vue"),
        },
        // handle userpage and beatmap redirects from osu client:
        {
          path: "u/:id",
          redirect: { name: "player" },
        },
        {
          path: "beatmaps/:id",
          redirect: { name: "maps" },
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
