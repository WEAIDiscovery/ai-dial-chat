import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { MiddlewareManager, middlewareFactory } from '@/src/utils/middleware';
import routes from '@epam/ai-dial-backend-routes';

const middlewareRoutes = middlewareFactory(routes);
const middlewares = Object.keys(routes).map((key) => middlewareRoutes(key));
const middlewareManager = MiddlewareManager.init(middlewares);

export async function middleware(
  req: NextRequest,
  event: NextFetchEvent,
): Promise<NextResponse | undefined> {
  return await middlewareManager.runMiddleware(req, event);
}

export const config = {
  matcher: middlewareManager.getMatchers(),
};
