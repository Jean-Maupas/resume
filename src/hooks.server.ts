import type { Handle } from '@sveltejs/kit';
import { validateSession, SESSION_COOKIE } from '$auth';

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = event.cookies.get(SESSION_COOKIE);
    const authenticated = token ? await validateSession(token) : false;

    if (!authenticated) {
      return new Response(null, {
        status: 302,
        headers: { location: '/admin/login?redirect=' + encodeURIComponent(pathname) }
      });
    }
    event.locals.adminAuthenticated = true;
  }

  return resolve(event);
};
