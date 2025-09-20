import { useCallback } from "react";
import { useAppDispatch } from "../app/hooks";
import { clearAuth } from "../features/auth/authSlice";
import { keycloak, ensureTokenValid } from "../features/auth/keycloak";
import { api } from "../services/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

interface AuthenticatedApiFunction {
  <T>(path: string, options?: ApiOptions): Promise<T>;
}

const handleAuthError = (dispatch: ReturnType<typeof useAppDispatch>): void => {
  console.log("[API] 401 error, clearing auth state");
  dispatch(clearAuth());
  keycloak.login();
};

const validateAuthentication = async (
  dispatch: ReturnType<typeof useAppDispatch>
): Promise<string> => {
  const isTokenValid = await ensureTokenValid();

  if (!isTokenValid || !keycloak.token) {
    dispatch(clearAuth());
    throw new Error("Authentication required");
  }

  return keycloak.token;
};

const isAuthenticationError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("401");
};

export const useAuthenticatedApi = (): AuthenticatedApiFunction => {
  const dispatch = useAppDispatch();

  return useCallback(
    async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
      try {
        const token = await validateAuthentication(dispatch);

        return await api<T>(path, {
          ...options,
          token,
        });
      } catch (error) {
        if (isAuthenticationError(error)) {
          handleAuthError(dispatch);
        }
        throw error;
      }
    },
    [dispatch]
  );
};
