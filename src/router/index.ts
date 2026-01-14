import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Lazy load view components
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');
const ForgotPassword = () => import('../views/ForgotPassword.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const AllNotices = () => import('../views/AllNotices.vue');
const NoticeDetail = () => import('../views/NoticeDetail.vue');
const Profile = () => import('../views/Profile.vue');
const Security = () => import('../views/Security.vue');
const AdminUsers = () => import('../views/AdminUsers.vue');
const AdminAudits = () => import('../views/AdminAudits.vue');
const NoticeEditor = () => import('../views/NoticeEditor.vue');
const AuthWrapper = () => import('../views/AuthWrapper.vue');

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
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  if (auth.token) {
    if (!auth.user) {
      await auth.fetchCurrentUser();
    } else {
      auth.fetchCurrentUser(); // Run in background, don't await
    }
  }

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
