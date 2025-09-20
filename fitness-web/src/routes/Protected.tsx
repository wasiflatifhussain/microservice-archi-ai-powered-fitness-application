import React, { type PropsWithChildren, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { bootstrapAuth } from "../features/auth/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import Landing from "../pages/Landing";

interface ProtectedProps extends PropsWithChildren {
  readonly fallback?: React.ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({
  children,
  fallback = <Landing />,
}) => {
  const { isAuthenticated, bootstrapped } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  // Prevent double bootstrap in React 18 StrictMode (dev)
  const didInit = useRef<boolean>(false);

  useEffect(() => {
    if (didInit.current) return;

    didInit.current = true;
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // Show loading while checking authentication
  if (!bootstrapped) {
    return <LoadingSpinner message="Checking session…" />;
  }

  // Show fallback component for unauthenticated users
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Render protected content for authenticated users
  return <>{children}</>;
};

export default Protected;
