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

  const didInit = useRef<boolean>(false);

  useEffect(() => {
    if (didInit.current) return;

    didInit.current = true;
    dispatch(bootstrapAuth());
  }, [dispatch]);

  if (!bootstrapped) {
    return <LoadingSpinner message="Checking session…" />;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Protected;
