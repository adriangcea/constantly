import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode, ReactElement } from "react";

interface Props {
  children: ReactNode;
}

export default function PublicRoute({ children }: Props): ReactElement {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}