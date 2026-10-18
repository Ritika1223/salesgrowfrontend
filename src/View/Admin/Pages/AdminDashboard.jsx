      import React, { useCallback, useEffect, useState } from "react";
      import { useNavigate } from "react-router-dom";
      import { API_ADMIN } from "../../../config/api";
      import { clearAdminSession, getAdminToken } from "../../../utils/adminAuth";
      function authHeaders() {
        const t = getAdminToken();
        return {
          "Content-Type": "application/json",
          ...(t ? { Authorization: `Bearer ${t}` } : {})
        };
      }
      export default function AdminDashboard() {
        const navigate = useNavigate();
        const [users, setUsers] = useState([]);
        const [error, setError] = useState("");

        const loadAll = useCallback(async () => {
          setError("");
          const headers = authHeaders();
          if (!headers.Authorization) {
            navigate("/admin/login", { replace: true });
            return;
          }

          const uRes = await fetch(`${API_ADMIN}/users`, { headers });

          if (uRes.status === 401) {
            clearAdminSession();
            navigate("/admin/login", { replace: true });
            return;
          }

          try {
            const uJson = await uRes.json().catch(() => ({}));

            if (!uRes.ok) throw new Error(uJson.message || "Users request failed");

            setUsers(Array.isArray(uJson.users) ? uJson.users : []);
          } catch (e) {
            setError(e.message || "Failed to load dashboard");
          }
        }, [navigate]);

        useEffect(() => {
          loadAll();
        }, [loadAll]);

        return (


        <div className="admin-dashboard-section">

    <div className="users-header-card">

        <div className="header-left">

          <div className="header-icon">
            <i className="bi bi-speedometer2"></i>
          </div>

          <div>
            <h2>Admin Dashboard</h2>
            <p>Manage users and fund requests</p>
          </div>

        </div>

        

      </div>


    {error && (
      <div className="cp-form-msg cp-form-msg--error mb-4">
        {error}
      </div>
    )}

    {/* Stats */}
    <div className="row g-4 mb-4">
      <div className="col-xl-4 col-md-4">
        <div className="stats-card">
          <h6>Total Users</h6>
          <h2>{users.length}</h2>
        </div>
      </div>

    </div>

</div>
        );
      }
