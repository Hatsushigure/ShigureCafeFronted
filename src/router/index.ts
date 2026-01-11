import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import Dashboard from '../views/Dashboard.vue';
import AllNotices from '../views/AllNotices.vue';
import NoticeDetail from '../views/NoticeDetail.vue';
import Profile from '../views/Profile.vue';
import Security from '../views/Security.vue';
import AdminUsers from '../views/AdminUsers.vue';
import AdminAudits from '../views/AdminAudits.vue';
import AdminNotices from '../views/AdminNotices.vue';
import NoticeEditor from '../views/NoticeEditor.vue';
import AuthWrapper from '../views/AuthWrapper.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/',
      component: AuthWrapper,
      children: [
        { 
          path: 'login', 
          name: 'Login', 
          component: Login,
          meta: { guestOnly: true }
        },
        { 
          path: 'register', 
          name: 'Register', 
          component: Register,
          meta: { guestOnly: true }
        },
        { 
          path: 'forgot-password', 
          name: 'ForgotPassword', 
          component: ForgotPassword,
          meta: { guestOnly: true }
        },
      ]
    },
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    { 
      path: '/notices', 
      name: 'AllNotices', 
      component: AllNotices,
      meta: { requiresAuth: true }
    },
    { 
      path: '/notices/:id', 
      name: 'NoticeDetail', 
      component: NoticeDetail,
      meta: { requiresAuth: true }
    },
    { 
      path: '/admin/notices/new', 
      name: 'NoticeCreate', 
      component: NoticeEditor,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    { 
      path: '/admin/notices/:id/edit', 
      name: 'NoticeEdit', 
      component: NoticeEditor,
      meta: { requiresAuth: true, requiresAdmin: true }
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
    { 
      path: '/admin/audits', 
      name: 'AdminAudits', 
      component: AdminAudits,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    { 
      path: '/admin/notices', 
      name: 'AdminNotices', 
      component: AdminNotices,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
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
