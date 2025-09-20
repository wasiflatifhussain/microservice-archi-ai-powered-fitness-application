import Keycloak, { type KeycloakLoginOptions } from "keycloak-js";

// Types
interface KeycloakConfig {
  readonly url: string;
  readonly realm: string;
  readonly clientId: string;
}

// Constants
const KEYCLOAK_CONFIG: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
} as const;

const SILENT_CHECK_SSO_PATH = "/silent-check-sso.html" as const;

// Keycloak instance
const keycloak = new Keycloak(KEYCLOAK_CONFIG);

// Event handlers
const handleAuthSuccess = (): void => {
  console.log("[KC] Auth success");
  console.log("[KC] tokenParsed:", keycloak.tokenParsed);
  console.log("[KC] idTokenParsed:", keycloak.idTokenParsed);

  keycloak
    .loadUserInfo()
    .then((info) => {
      console.log("[KC] userInfo:", info);
    })
    .catch((error) => {
      console.error("[KC] Failed to load user info:", error);
    });
};

// Set up event handlers
keycloak.onAuthSuccess = handleAuthSuccess;

// State tracking
let hasInit = false;

// Initialization function
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
    hasInit = false; // Reset flag on failure
    return false;
  }
};

// Authentication functions
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

// Export keycloak instance
export { keycloak };

// Export types for external use
export type { KeycloakLoginOptions };
