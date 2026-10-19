import React from "react";
import { Navigate } from "react-router-dom";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import Users from "./Pages/Users";
import AdminHeaderLayout from "./Componets/AdminHeaderLayout";
import { isAdminLoggedIn } from "../../utils/adminAuth";
import BankDetailPage from "./Pages/BankDetail";
import AddFundPage from "./Pages/AddFund";
import AdminFundRequests from "./Pages/AdminFundRequests";
import AdminWithdrawals from "./Pages/AdminWithdrawals";


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
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: "add-fund",
        element: <AddFundPage />
      },
      {
        path: "host-requests",
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: "plan-requests",
        element: <Navigate to="/admin/fund/requests" replace />
      },
      {
        path: "stickers",
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: "fund/requests",
        element: <AdminFundRequests />
      },
      {
        path: "fund/report",
        element: <AdminFundRequests reportOnly />
      },
      {
        path: "withdraw/requests",
        element: <AdminWithdrawals />
      },
      {
        path: "withdraw/report",
        element: <AdminWithdrawals reportOnly />
      }
    ]
  }
];

export default Routes;