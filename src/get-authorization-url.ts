import { headers } from 'next/headers.js';
import { WORKOS_CLIENT_ID, WORKOS_LOGIN_PATH, WORKOS_REDIRECT_URI } from './env-variables.js';
import { GetAuthURLOptionsExtended } from './interfaces.js';
import { workos } from './workos.js';

async function getAuthorizationUrl(options: GetAuthURLOptionsExtended = {}) {
  const { returnPathname, screenHint } = options;

  const redirectUri = headers().get('x-redirect-uri');

  // gets authkit authorization url
  const authUrl = await workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId: WORKOS_CLIENT_ID,
    redirectUri: redirectUri ?? WORKOS_REDIRECT_URI,
    state: returnPathname ? btoa(JSON.stringify({ returnPathname })) : undefined,
    screenHint,
  });

  try {
    // use same authkit query params with our own login path
    const response = await fetch(authUrl);
    const url = new URL(response.url);
    url.host = headers().get('host') ?? url.host;
    url.protocol = headers().get('x-forwarded-proto') ?? url.protocol;
    url.pathname = WORKOS_LOGIN_PATH ?? '/login';

    return url.toString();
  } catch {
    return WORKOS_LOGIN_PATH ?? '/login';
  }
}

export { getAuthorizationUrl };
