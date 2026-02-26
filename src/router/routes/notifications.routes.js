import NotificationsView from '@/views/notifications/NotificationsView.vue';

export const notificationRoutes = [{ path: '/notifications', component: NotificationsView, meta: { requiresAuth: true } }];
