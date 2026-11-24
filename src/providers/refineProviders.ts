import {
  dataProvider,
  authProvider,
  storageDataProvider,
  appDataProvider,
  userDataProvider,
  accessControlProvider,
} from "@taruvi/refine-providers";
import { taruviClient } from "../taruviClient";

export type { UserData as TaruviUser } from "@taruvi/sdk";
export type {
  TaruviMeta,
  TaruviListResponse,
  StorageUploadVariables,
  LoginParams,
  LogoutParams,
  RegisterParams,
  FunctionMeta,
  AnalyticsMeta,
} from "@taruvi/refine-providers";

export {
  buildRefineQueryParams,
  convertRefineFilters,
  convertRefineSorters,
  convertRefinePagination,
  buildQueryString,
  REFINE_OPERATOR_MAP,
} from "@taruvi/refine-providers";

/**
 * Refine providers for Taruvi
 *
 * - taruviDataProvider (default): Database CRUD
 * - taruviStorageProvider (storage): File upload/download/delete
 * - taruviAppProvider (app): Functions, analytics, roles, settings, secrets
 * - taruviUserProvider (user): User CRUD and roles
 * - taruviAuthProvider: Authentication
 * - taruviAccessControlProvider: Cerbos permission checks
 */

export const taruviDataProvider = dataProvider(taruviClient);
export const taruviAuthProvider = authProvider(taruviClient);
export const taruviStorageProvider = storageDataProvider(taruviClient);
export const taruviAppProvider = appDataProvider(taruviClient);
export const taruviUserProvider = userDataProvider(taruviClient);
/**
 * Cerbos permission checks. Refine's built-in buttons/CanAccess pass the bare
 * resource name ("posts"), but Cerbos policies are keyed by prefixed kind
 * ("datatable:posts"). `entityType` adds the prefix for bare names; names that
 * already carry a prefix ("function:run-report", "query:summary") pass through.
 * Refine actions are mapped to Cerbos actions by the provider
 * (list/show -> read, edit -> update). Override per resource with
 * `meta.entityType` on the resource definition.
 */
export const taruviAccessControlProvider = accessControlProvider(taruviClient, {
  entityType: (resource) => (resource.includes(":") ? resource : `datatable:${resource}`),
});
