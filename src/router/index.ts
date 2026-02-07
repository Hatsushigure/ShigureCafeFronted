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
const Chat = () => import('../views/Chat.vue');
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
      path: '/chat',
      name: 'Chat',
      component: Chat,
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
  scrollBehavior(_to, _from, savedPosition) {
    return new Promise((resolve) => {
      // 延迟 300ms 以匹配 App.vue 中 fade-slide 过渡动画的时间
      // 这样滚动会发生在旧页面淡出之后，新页面淡入之前
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition);
        } else {
          resolve({ top: 0, behavior: 'smooth' });
        }
      }, 300);
    });
  },
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  if (auth.token && !auth.user) {
    auth.fetchCurrentUser();
  }

  const isAuthenticated = !!auth.token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Dashboard' });
  } else if (to.meta.requiresAdmin && auth.user?.role !== 'ADMIN') {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
