import LoginView from '@/views/user/LoginView.vue';
import LoginSuccessView from '@/views/user/LoginSuccessView.vue';
import SignupView from '@/views/user/SignupView.vue';
import SignupCreateView from '@/views/user/SignupCreateView.vue';
import PasswordResetView from '@/views/user/PasswordResetView.vue';
import ProfileView from '@/views/user/profile/ProfileView.vue';
import ProfileEditView from '@/views/user/profile/ProfileEditView.vue';
import ProfileDayWorkoutsView from '@/views/user/profile/ProfileDayWorkoutsView.vue';

export const userRoutes = [
  { path: '/login', component: LoginView },
  { path: '/login/success', component: LoginSuccessView },
  { path: '/signup', component: SignupView },
  { path: '/signup/new', component: SignupCreateView },
  { path: '/reset-password', component: PasswordResetView },
  { path: '/profile', component: ProfileView },
  { path: '/workoutHistory', component: ProfileDayWorkoutsView, meta: { requiresAuth: true } },
  { path: '/profile/history', redirect: { path: '/workoutHistory' } },
  {
    path: '/profile/activity/:date',
    redirect: (to) => {
      const date = String(to.params?.date || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { path: '/workoutHistory' };
      }
      return {
        path: '/workoutHistory',
        query: { date },
      };
    },
  },
  { path: '/profile/edit', component: ProfileEditView, meta: { requiresAuth: true } },
];
