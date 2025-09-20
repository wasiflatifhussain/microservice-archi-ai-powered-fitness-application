import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../app/hooks";
import { keycloak } from "../features/auth/keycloak";

interface TokenInfo {
  hasToken: boolean;
  isExpired: boolean;
  expiresIn: number;
  refreshExpiresIn: number;
  lastRefresh: Date | null;
}

const UPDATE_INTERVAL = 1000;
const FORCE_REFRESH_THRESHOLD = 60;

const TokenMonitor: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    hasToken: false,
    isExpired: false,
    expiresIn: 0,
    refreshExpiresIn: 0,
    lastRefresh: null,
  });

  const updateTokenInfo = useCallback((): void => {
    if (!keycloak.token) {
      setTokenInfo({
        hasToken: false,
        isExpired: true,
        expiresIn: 0,
        refreshExpiresIn: 0,
        lastRefresh: null,
      });
      return;
    }

    const now = Date.now() / 1000;
    const tokenExp = keycloak.tokenParsed?.exp || 0;
    const refreshExp = keycloak.refreshTokenParsed?.exp || 0;

    setTokenInfo({
      hasToken: true,
      isExpired: now > tokenExp,
      expiresIn: Math.max(0, tokenExp - now),
      refreshExpiresIn: Math.max(0, refreshExp - now),
      lastRefresh: new Date(),
    });
  }, []);

  useEffect(() => {
    updateTokenInfo();

    const interval = setInterval(updateTokenInfo, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isAuthenticated, updateTokenInfo]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTestRefresh = async (): Promise<void> => {
    try {
      console.log("Manual token refresh test...");
      const refreshed = await keycloak.updateToken(FORCE_REFRESH_THRESHOLD);
      console.log("Token refresh result:", refreshed);
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  };

  const handleLogToken = (): void => {
    const tokenPreview = keycloak.token?.substring(0, 50) + "...";
    console.log("Current token:", tokenPreview);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-800">Not Authenticated</h3>
        <p className="text-red-600">Redux state: {String(isAuthenticated)}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <h3 className="font-medium text-green-800">Authentication Monitor</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Redux State:</strong>
          <ul className="ml-4 space-y-1">
            <li>isAuthenticated: {String(isAuthenticated)}</li>
            <li>Keycloak.authenticated: {String(keycloak.authenticated)}</li>
          </ul>
        </div>

        <div>
          <strong>Token Status:</strong>
          <ul className="ml-4 space-y-1">
            <li>Has Token: {String(tokenInfo.hasToken)}</li>
            <li>Is Expired: {String(tokenInfo.isExpired)}</li>
            <li>Expires In: {formatTime(tokenInfo.expiresIn)}</li>
            <li>
              Refresh Expires In: {formatTime(tokenInfo.refreshExpiresIn)}
            </li>
          </ul>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleTestRefresh}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Test Refresh
        </button>

        <button
          onClick={handleLogToken}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          Log Token
        </button>
      </div>

      {tokenInfo.lastRefresh && (
        <p className="text-xs text-gray-600">
          Last checked: {tokenInfo.lastRefresh.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default TokenMonitor;
