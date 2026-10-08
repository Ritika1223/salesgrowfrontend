import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import Header from "./Header";
import { isLoggedIn } from "../../../utils/auth";

export default function ProtectedHeaderLayout() {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Header />;
}
