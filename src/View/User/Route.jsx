import ProtectedHeaderLayout from "./Componets/ProtectedHeaderLayout";
import Dashboard from "./Pages/Dashboard";
import History, { INCOME_REPORTS } from "./Pages/History";
import LeaderBoard from "./Pages/LeaderBoard";
import Offers from "./Pages/Offers";
import Referral from "./Pages/Referral";
import MyTeam from "./Pages/MyTeam";
import Support from "./Pages/Support";
import Wallet from "./Pages/Wallet";
import React from "react";
import MyProfile from "./Pages/MyProfile";
import Packages from "./Pages/Packages";
import { Navigate, useLocation } from "react-router-dom";
import LevelIncome from "./Pages/LevelIncome";
import { appRoute } from "../../utils/auth";
import PoolIncomePage from "./Pages/PoolIncome";

/** Old URLs `/user/:mongoId/...` → `/...` */
function LegacyUserMongoRedirect() {
  const { pathname } = useLocation();
  const m = pathname.match(/^\/user\/[^/]+\/?(.*)$/);
  const raw =
    m?.[1] != null && String(m[1]).trim() !== "" ? m[1] : "dashboard";
  const tail = String(raw).replace(/^\/+/, "").replace(/\/$/, "") || "dashboard";
  return <Navigate to={appRoute(tail)} replace />;
}

const Routes = [
  { path: "/user/:id", element: <Navigate to="/dashboard" replace /> },
  { path: "/user/:id/*", element: <LegacyUserMongoRedirect /> },
  {
    element: <ProtectedHeaderLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/profile", element: <MyProfile /> },
      { path: "/chat", element: <Navigate to="/dashboard" replace /> },
      { path: "/live", element: <Navigate to="/dashboard" replace /> },
      { path: "/live/:sessionId", element: <Navigate to="/dashboard" replace /> },
      { path: "/referral", element: <Referral /> },
      { path: "/team", element: <MyTeam /> },
      { path: "/offers", element: <Offers /> },
      { path: "/wallet", element: <Wallet /> },
      { path: "/plans", element: <Packages /> },
      { path: "/level", element: <LevelIncome /> },
      { path: "/pool/level", element: <PoolIncomePage /> },
      { path: "/support", element: <Support /> },
      { path: "/leaderboard", element: <LeaderBoard /> },
      ...INCOME_REPORTS.map((report) => ({
        path: `/${report.to}`,
        element: <History incomeType={report.type} title={report.label} />,
      })),
      { path: "/history", element: <Navigate to="/reports/self" replace /> },
    ],
    
  },
];

export default Routes;
