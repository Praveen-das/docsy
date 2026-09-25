export interface TOTPSetupState {
  secret?: string;
  uri?: string;
  backupCodes?: string[];
}

export { extractClerkErrorMessage } from "../../utils/clerk-error";
