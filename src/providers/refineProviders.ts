import {taruviClient} from "../taruviClient.ts"
import {
  dataProvider,
  authProvider,
  storageDataProvider,
  userDataProvider,
  accessControlProvider,
  appDataProvider
} from "@taruvi/refine-providers"

export const taruviDataProvider = dataProvider(taruviClient);
export const taruviAuthProvider = authProvider(taruviClient);
export const taruviStorageProvider = storageDataProvider(taruviClient);
export const taruviAppProvider = appDataProvider(taruviClient);
export const taruviUserProvider = userDataProvider(taruviClient);
export const taruviAccessControlProvider = accessControlProvider(taruviClient);
