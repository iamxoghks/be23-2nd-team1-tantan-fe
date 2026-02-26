import TermsView from '@/views/legal/TermsView.vue';
import PrivacyView from '@/views/legal/PrivacyView.vue';

export const legalRoutes = [
  { path: '/legal/terms', component: TermsView },
  { path: '/legal/privacy', component: PrivacyView },
];
