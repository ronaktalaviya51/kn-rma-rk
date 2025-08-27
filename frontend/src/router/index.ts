import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from '../store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/request',
    name: 'Request',
    component: () => import('../views/RequestRMA.vue')
  },
  {
    path: '/status',
    name: 'Status',
    component: () => import('../views/StatusQuery.vue')
  },
  {
    path: '/status/:rmaNumber',
    name: 'StatusDetail',
    component: () => import('../views/StatusDetail.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/requests',
    name: 'AdminRequests',
    component: () => import('../views/admin/RequestList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/requests/:id',
    name: 'AdminRequestDetail',
    component: () => import('../views/admin/RequestDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.getters.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated) {
    next('/admin')
  } else {
    next()
  }
})

export default router