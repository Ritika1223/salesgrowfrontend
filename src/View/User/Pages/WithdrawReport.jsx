import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import { authJsonHeaders } from "../../../utils/auth";

export default function WithdrawReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/plans/withdraw/history`, { headers: authJsonHeaders() })
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch((err) => setError(err?.response?.data?.message || "Could not load withdrawals"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="income-history-page">
      <div className="container-fluid">
        <div className="income-history-card">
          <div className="income-history-filter-area">
            <h4>Withdrawal Request Report</h4>
          </div>
          {error && <p>{error}</p>}
          <div className="income-history-table-wrap">
            <table className="income-history-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Amount</th>
                  <th>Deduction</th>
                  <th>Payout</th>
                  <th>USDT Address</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>Loading...</td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((item, i) => (
                    <tr key={item._id}>
                      <td>{i + 1}</td>
                      <td>{item.amount}</td>
                      <td>{item.deduction}</td>
                      <td>{item.payout}</td>
                      <td>{item.upiId}</td>
                      <td>{item.status}</td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>No withdrawal requests yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
