import Keycloak, { type KeycloakLoginOptions } from "keycloak-js";
import { setAuthenticated, clearAuth } from "./authSlice";

interface KeycloakConfig {
  readonly url: string;
  readonly realm: string;
  readonly clientId: string;
}

const KEYCLOAK_CONFIG: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
} as const;

const SILENT_CHECK_SSO_PATH = "/silent-check-sso.html" as const;

const keycloak = new Keycloak(KEYCLOAK_CONFIG);
let storeDispatch: any = null;
let hasInit = false;

export const setStoreDispatch = (dispatch: any) => {
  storeDispatch = dispatch;
};

const createTimestamp = (): string => new Date().toISOString();

const syncReduxState = (isAuthenticated: boolean, context = ""): void => {
  if (!storeDispatch) return;

  const timestamp = createTimestamp();
  const action = isAuthenticated ? "setAuthenticated(true)" : "clearAuth()";
  console.log(
    `[${timestamp}] Syncing Redux: ${action}${context ? ` ${context}` : ""}`
  );

  if (isAuthenticated) {
    storeDispatch(setAuthenticated(true));
  } else {
    storeDispatch(clearAuth());
  }
};

const handleAuthSuccess = (): void => {
  const timestamp = createTimestamp();
  console.log(`[${timestamp}] [KC] Auth success`);
  console.log("[KC] tokenParsed:", keycloak.tokenParsed);
  console.log(
    "[KC] Token expires at:",
    new Date((keycloak.tokenParsed?.exp || 0) * 1000)
  );

  syncReduxState(true, "after auth success");

  keycloak
    .loadUserInfo()
    .then((info) => {
      console.log("[KC] userInfo:", info);
    })
    .catch((error) => {
      console.error("[KC] Failed to load user info:", error);
    });
};

const handleTokenExpired = (): void => {
  const timestamp = createTimestamp();
  console.log(`[${timestamp}] [KC] Token expired, attempting refresh...`);

  keycloak
    .updateToken(30)
    .then((refreshed) => {
      if (refreshed) {
        console.log(`[${timestamp}] [KC] Token refreshed successfully`);
        console.log(
          "[KC] New token expires at:",
          new Date((keycloak.tokenParsed?.exp || 0) * 1000)
        );
        syncReduxState(true, "after token refresh");
      } else {
        console.log(`[${timestamp}] [KC] Token is still valid`);
      }
    })
    .catch((error) => {
      console.error(`[${timestamp}] [KC] Token refresh failed:`, error);
      console.log(
        `[${timestamp}] [KC] Clearing auth state and redirecting to login...`
      );
      syncReduxState(false, "after refresh failure");
      keycloak.login();
    });
};

const handleAuthError = (): void => {
  const timestamp = createTimestamp();
  console.error(
    `[${timestamp}] [KC] Authentication error - likely refresh token expired`
  );
  syncReduxState(false, "after auth error");
  keycloak.login();
};

const handleAuthLogout = (): void => {
  const timestamp = createTimestamp();
  console.log(`[${timestamp}] [KC] User logged out`);
  syncReduxState(false, "after logout");
};

keycloak.onAuthSuccess = handleAuthSuccess;
keycloak.onTokenExpired = handleTokenExpired;
keycloak.onAuthError = handleAuthError;
keycloak.onAuthLogout = handleAuthLogout;

export const ensureTokenValid = async (): Promise<boolean> => {
  try {
    if (!keycloak.authenticated) {
      console.log("[ensureTokenValid] Not authenticated");
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const tokenExp = keycloak.tokenParsed?.exp || 0;
    const timeUntilExpiry = tokenExp - now;

    console.log(
      `[ensureTokenValid] Token expires in ${timeUntilExpiry} seconds`
    );

    const refreshed = await keycloak.updateToken(30);
    if (refreshed) {
      const timestamp = createTimestamp();
      console.log(
        `[${timestamp}] [ensureTokenValid] Token refreshed proactively`
      );
      console.log(
        "[ensureTokenValid] New token expires at:",
        new Date((keycloak.tokenParsed?.exp || 0) * 1000)
      );
      syncReduxState(true, "after proactive refresh");
    }
    return true;
  } catch (error) {
    const timestamp = createTimestamp();
    console.error(
      `[${timestamp}] [ensureTokenValid] Token validation failed:`,
      error
    );
    syncReduxState(false, "after validation failure");
    return false;
  }
};

export const initKeycloak = async (): Promise<boolean> => {
  if (hasInit) {
    return Boolean(keycloak.authenticated);
  }

  try {
    const isAuthenticated = await keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      silentCheckSsoRedirectUri: `${window.location.origin}${SILENT_CHECK_SSO_PATH}`,
      checkLoginIframe: false,
    });

    hasInit = true;
    return isAuthenticated;
  } catch (error) {
    console.error("Keycloak init failed:", error);
    hasInit = false;
    return false;
  }
};

export const login = (opts?: KeycloakLoginOptions): Promise<void> => {
  return keycloak.login(opts);
};

export const logout = (): Promise<void> => {
  return keycloak.logout();
};

export const loginToHome = async (): Promise<Promise<void>> => {
  if (!hasInit) {
    await initKeycloak();
  }

  return login({
    redirectUri: `${window.location.origin}/`,
  });
};

export const getCurrentKeycloakId = (): string | null => {
  return keycloak.tokenParsed?.sub || null;
};

export { keycloak };
export type { KeycloakLoginOptions };
