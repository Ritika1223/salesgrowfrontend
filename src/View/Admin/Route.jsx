import React from "react";
import { Navigate } from "react-router-dom";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import Users from "./Pages/Users";
import Stickers from "./Pages/Stickers";
import AdminHeaderLayout from "./Componets/AdminHeaderLayout";
import { isAdminLoggedIn } from "../../utils/adminAuth";
import BankDetailPage from "./Pages/BankDetail";
import PaymentHistoryPage from "./Pages/PaymentHistory";
import AddFundPage from "./Pages/AddFund";
import HostRequestsPage from "./Pages/HostRequests";
import PlanRequestsPage from "./Pages/PlanRequests";

function AdminGuard({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AdminGuardLogin() {
  if (isAdminLoggedIn()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLogin />;
}

const Routes = [
  {
    path: "/admin/login",
    element: <AdminGuardLogin />
  },

  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminHeaderLayout />
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />
      },
      {
        path: "dashboard",
        element: <AdminDashboard />
      },
      {
        path: "users",
        element: <Users />
      },
      {
        path: "bankDetail",
        element: <BankDetailPage/>
      },
      {
        path: "payment-history",
        element: <PaymentHistoryPage />
      },
      {
        path: "add-fund",
        element: <AddFundPage />
      },
      {
        path: "host-requests",
        element: <HostRequestsPage />
      },
      {
        path: "plan-requests",
        element: <PlanRequestsPage />
      },
      {
        path: "stickers",
        element: <Stickers />
      }
    ]
  }
];

export default Routes;