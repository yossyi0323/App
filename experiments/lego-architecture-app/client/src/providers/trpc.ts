import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@lego-app/server';

export const trpc = createTRPCReact<AppRouter>();
