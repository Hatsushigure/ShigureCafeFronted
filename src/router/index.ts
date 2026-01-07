import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from '../views/Profile.vue';
import Security from '../views/Security.vue';
import AdminUsers from '../views/AdminUsers.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/login', 
      name: 'Login', 
      component: Login,
      meta: { guestOnly: true }
    },
    { 
      path: '/register', 
      name: 'Register', 
      component: Register,
      meta: { guestOnly: true }
    },
    { 
      path: '/forgot-password', 
      name: 'ForgotPassword', 
      component: ForgotPassword,
      meta: { guestOnly: true }
    },
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    { 
      path: '/profile', 
      name: 'Profile', 
      component: Profile,
      meta: { requiresAuth: true }
    },
    { 
      path: '/security', 
      name: 'Security', 
      component: Security,
      meta: { requiresAuth: true }
    },
    { 
      path: '/admin/users', 
      name: 'AdminUsers', 
      component: AdminUsers,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    { path: '/', redirect: '/dashboard' }, // Redirect to dashboard, guard will handle if not logged in
  ],
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isAuthenticated = !!auth.token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Dashboard' });
  } else if (to.meta.requiresAdmin && auth.user?.role !== 'ADMIN') {
    next({ name: 'Dashboard' }); // Or 403 page
  } else {
    next();
  }
});

export default router;
