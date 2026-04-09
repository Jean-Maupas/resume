import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword, createSession, SESSION_COOKIE, cookieOptions } from '$auth';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.adminAuthenticated) throw redirect(302, '/admin');
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const password = data.get('password')?.toString() ?? '';

    const ok = await verifyPassword(password);
    if (!ok) return fail(401, { error: 'Incorrect password' });

    const token = await createSession();
    cookies.set(SESSION_COOKIE, token, cookieOptions());

    const redirectTo = url.searchParams.get('redirect') ?? '/admin';
    throw redirect(302, redirectTo);
  }
};
