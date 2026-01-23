import { headers } from 'next/headers';
import { WORKOS_CLIENT_ID, WORKOS_LOGIN_PATH, WORKOS_REDIRECT_URI } from './env-variables.js';
import { GetAuthURLOptions } from './interfaces.js';
import { getWorkOS } from './workos.js';

async function getAuthorizationUrl(options: GetAuthURLOptions = {}) {
  const { returnPathname, screenHint, organizationId, loginHint, prompt, state: customState } = options;
  let redirectUri = options.redirectUri;
  if (!redirectUri) {
    const headersList = await headers();
    redirectUri = headersList.get('x-redirect-uri') ?? undefined;
  }

  const internalState = returnPathname
    ? btoa(JSON.stringify({ returnPathname })).replace(/\+/g, '-').replace(/\//g, '_')
    : null;

  const finalState =
    internalState && customState ? `${internalState}.${customState}` : internalState || customState || undefined;

  const authUrl = await getWorkOS().userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId: WORKOS_CLIENT_ID,
    redirectUri: redirectUri ?? WORKOS_REDIRECT_URI,
    state: finalState,
    screenHint,
    organizationId,
    loginHint,
    prompt,
  });

  if (WORKOS_LOGIN_PATH) {
    try {
      const response = await fetch(authUrl);
      const url = new URL(response.url);

      url.host = (await headers()).get('host') ?? url.host;
      url.protocol = (await headers()).get('x-forwarded-proto') ?? url.protocol;
      url.pathname = WORKOS_LOGIN_PATH;
      return url.toString();
    } catch (error) {
      // ignore
    }
  }

  return authUrl;
}

export { getAuthorizationUrl };
