import {taruviClient} from "../taruviClient.ts"
import {
  dataProvider,
  authProvider,
  storageDataProvider,
  userDataProvider,
  accessControlProvider,
  appDataProvider
} from "../../../taruvi-refine-providers"

export const taruviDataProvider = dataProvider(taruviClient);
export const taruviStorageProvider = storageDataProvider(taruviClient);
export const taruviAppProvider = appDataProvider(taruviClient);
export const taruviUserProvider = userDataProvider(taruviClient);
export const taruviAccessControlProvider = accessControlProvider(taruviClient);

const _baseAuthProvider = authProvider(taruviClient);

/**
 * Override check() to strip out `redirectTo` from the unauthenticated response.
 * The base provider hardcodes redirectTo: "/login" which the Refine router
 * acts on unconditionally — even for public routes that sit outside the
 * <Authenticated> wrapper. By removing it here, we let the <Authenticated
 * fallback> component handle redirects for protected routes, while public
 * routes (e.g. /welcome) render freely without being bounced to login.
 */
export const taruviAuthProvider = {
  ..._baseAuthProvider,
  check: async () => {
    const result = await _baseAuthProvider.check();
    if (!result.authenticated) {
      // Return unauthenticated without a redirect — <Authenticated fallback>
      // handles navigation for protected routes.
      return { authenticated: false as const };
    }
    return result;
  },
};
