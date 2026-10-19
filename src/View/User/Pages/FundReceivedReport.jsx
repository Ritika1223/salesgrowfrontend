import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import { authJsonHeaders } from "../../../utils/auth";

const TYPE_LABELS = {
  BUY_COIN: "Buy",
  TOPUP: "Top up",
  REFERRAL_BONUS: "Referral",
  LEVEL_INCOME: "Level",
  POOL_INCOME: "Pool",
  RANK_BONUS: "Rank",
  DIRECT_INCOME: "Direct",
  VIP_INCOME: "VIP",
  SELF_INCOME: "Investment 1%",
  SALARY_INCOME: "Salary",
  ADMIN_ADJUST: "Admin",
  CHAT_EARN: "Chat",
  LIVE_TIP: "Live",
};

export default function FundReceivedReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/plans/fund-received`, { headers: authJsonHeaders() })
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch((err) => setError(err?.response?.data?.message || "Could not load received funds"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="income-history-page">
      <div className="container-fluid">
        <div className="income-history-card">
          <div className="income-history-filter-area">
            <h4>Fund Received Report</h4>
          </div>
          {error && <p>{error}</p>}
          <div className="income-history-table-wrap">
            <table className="income-history-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Sender ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>Loading...</td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((item, i) => (
                    <tr key={item._id}>
                      <td>{i + 1}</td>
                      <td>{item?.fromUserId?.referralCode || "-"}</td>
                      <td>{item?.fromUserId?.name || item?.fromUserId?.nickname || "-"}</td>
                      <td>{item.amount}</td>
                      <td>{TYPE_LABELS[item.type] || item.type || "-"}</td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No fund received yet
                    </td>
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
