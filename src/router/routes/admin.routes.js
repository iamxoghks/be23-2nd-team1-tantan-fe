import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';
import AdminReportsView from '@/views/admin/AdminReportsView.vue';
import AdminUsersView from '@/views/admin/AdminUsersView.vue';
import AdminGymsView from '@/views/admin/AdminGymsView.vue';
import AdminUserDetailView from '@/views/admin/AdminUserDetailView.vue';
import AdminGymDetailView from '@/views/admin/AdminGymDetailView.vue';

const adminMeta = { requiresAuth: true, roles: ['ADMIN'] };

export const adminRoutes = [
  { path: '/admin', component: AdminDashboardView, meta: adminMeta },
  { path: '/admin/reports', component: AdminReportsView, meta: adminMeta },
  { path: '/admin/users', component: AdminUsersView, meta: adminMeta },
  { path: '/admin/users/:userId', component: AdminUserDetailView, meta: adminMeta },
  { path: '/admin/gyms', component: AdminGymsView, meta: adminMeta },
  { path: '/admin/gyms/:gymId', component: AdminGymDetailView, meta: adminMeta },
];
