import SettingsHubView from '@/views/settings/SettingsHubView.vue';
import UserSettingsView from '@/views/settings/UserSettingsView.vue';
import GymOwnerSettingsView from '@/views/settings/GymOwnerSettingsView.vue';
import NotificationSettingsView from '@/views/settings/NotificationSettingsView.vue';

export const settingsRoutes = [
  { path: '/settings', component: SettingsHubView, meta: { requiresAuth: true } },
  { path: '/settings/user', component: UserSettingsView, meta: { requiresAuth: true, roles: ['USER'] } },
  { path: '/settings/gym-owner', component: GymOwnerSettingsView, meta: { requiresAuth: true, roles: ['GYM_OWNER'] } },
  { path: '/settings/notifications', component: NotificationSettingsView, meta: { requiresAuth: true } },
];
