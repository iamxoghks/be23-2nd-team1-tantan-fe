import { homeRoutes } from '@/router/routes/home.routes';
import { chatRoutes } from '@/router/routes/chat.routes';
import { communityRoutes } from '@/router/routes/community.routes';
import { notificationRoutes } from '@/router/routes/notifications.routes';
import { userRoutes } from '@/router/routes/user.routes';
import { settingsRoutes } from '@/router/routes/settings.routes';
import { legalRoutes } from '@/router/routes/legal.routes';
import { adminRoutes } from '@/router/routes/admin.routes';

export const routes = [
  ...homeRoutes,
  ...chatRoutes,
  ...communityRoutes,
  ...notificationRoutes,
  ...userRoutes,
  ...settingsRoutes,
  ...legalRoutes,
  ...adminRoutes,
];
