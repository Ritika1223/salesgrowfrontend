import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import { authJsonHeaders } from "../../../utils/auth";

const TYPE_LABELS = {
  BUY_COIN: "Fund",
  TOPUP: "Top up",
  REFERRAL_BONUS: "Referral",
  ADMIN_ADJUST: "Admin",
};

const REPORT_TYPES = {
  fund: ["BUY_COIN", "TOPUP", "ADMIN_ADJUST"],
  referral: ["REFERRAL_BONUS"],
};

function CreditReport({ title, kind, emptyText }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/plans/fund-received`, {
        headers: authJsonHeaders(),
        params: { kind },
      })
      .then((res) => {
        const all = Array.isArray(res.data?.data) ? res.data.data : [];
        const allow = REPORT_TYPES[kind] || REPORT_TYPES.fund;
        setRows(all.filter((row) => allow.includes(row.type)));
      })
      .catch((err) => setError(err?.response?.data?.message || "Could not load report"))
      .finally(() => setLoading(false));
  }, [kind]);

  return (
    <div className="income-history-page">
      <div className="container-fluid">
        <div className="income-history-card">
          <div className="income-history-filter-area">
            <h4>{title}</h4>
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
                      {emptyText}
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

export default function FundReceivedReport() {
  return (
    <CreditReport
      title="Fund Received Report"
      kind="fund"
      emptyText="No fund received yet"
    />
  );
}

export function ReferralCoinsReport() {
  return (
    <CreditReport
      title="Referral Coins Report"
      kind="referral"
      emptyText="No referral coins yet"
    />
  );
}
