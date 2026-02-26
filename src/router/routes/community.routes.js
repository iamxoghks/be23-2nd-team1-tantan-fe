import CommunityView from '@/views/community/CommunityView.vue';
import CommunityWriteView from '@/views/community/CommunityWriteView.vue';
import CommunityDetailView from '@/views/community/CommunityDetailView.vue';

export const communityRoutes = [
  { path: '/community', component: CommunityView },
  { path: '/community/:postId', component: CommunityDetailView },
  { path: '/community/write', component: CommunityWriteView },
];
