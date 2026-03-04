import GymOwnerSettingsView from '@/views/settings/GymOwnerSettingsView.vue';
import NotificationSettingsView from '@/views/settings/NotificationSettingsView.vue';

export const settingsRoutes = [
  { path: '/settings/gym-owner', component: GymOwnerSettingsView, meta: { requiresAuth: true, roles: ['GYM_OWNER'] } },
  { path: '/settings/notifications', component: NotificationSettingsView, meta: { requiresAuth: true } },
];
