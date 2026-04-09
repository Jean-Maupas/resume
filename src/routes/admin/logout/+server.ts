import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { revokeSession, SESSION_COOKIE, cookieOptions } from '$auth';

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE);
  if (token) await revokeSession(token);
  cookies.delete(SESSION_COOKIE, { path: '/' });
  throw redirect(302, '/admin/login');
};
