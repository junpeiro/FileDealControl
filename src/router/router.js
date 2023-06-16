import { createRouter, createWebHistory } from 'vue-router'

const routes = [
        {
            path:'/InitDeal',
            name:'InitDeal',
            component: () => import('@/views/InitDeal')
        }
    ]

const routeHistory = createWebHistory()

const router = createRouter({
    history:routeHistory,
    routes
})

export default router