import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE, getApiOrigin } from "../../../config/api";
import { resolveAuthUserId, authJsonHeaders } from "../../../utils/auth";


const API_BASE_URL = API_BASE;

export const INCOME_REPORTS = [
  { to: "reports/self", type: "SELF_INCOME", label: "Self Income", icon: "bi-person-fill" },
  { to: "reports/direct", type: "DIRECT_INCOME", label: "Direct Income", icon: "bi-person-plus-fill" },
  { to: "reports/level", type: "LEVEL_INCOME", label: "Level Income", icon: "bi-diagram-3-fill" },
  { to: "reports/pool", type: "POOL_INCOME", label: "Pool Income", icon: "bi-collection-fill" },
  { to: "reports/rank", type: "RANK_BONUS", label: "Rank Income", icon: "bi-award-fill" },
  { to: "reports/vip", type: "VIP_INCOME", label: "VIP Club", icon: "bi-gem" },
];

export default function History({
  incomeType = "SELF_INCOME",
  title = "Self Income",
}) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setlimit] = useState(10);
  const [pages, setPages] = useState(1);
  const [users, setUsers] = useState([]);
  const authHeaders = {
    ...authJsonHeaders(),
  };
  const fetchHistory = async (type) => {

    try {
      const res =
        await axios.get(`${API_BASE_URL}/plans/getWalletTransactions?page=${page}&limit=${limit}&type=${type}`, { headers: authHeaders });
      setUsers(res.data.data);
      setPages(res.data.pages);
    } catch (err) { console.log(err); }
  };

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");

  const filteredUsers = users.filter((item) => {
    // Search Filter
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      item?.fromUserId?.referralCode
        ?.toLowerCase()
        ?.includes(keyword) ||
      item?.fromUserId?.name
        ?.toLowerCase()
        ?.includes(keyword) ||
      item?.amount
        ?.toString()
        ?.includes(keyword);

    // Date Filter
    const createdDate = new Date(item.createdAt);
    const today = new Date();

    let matchesDate = true;

    switch (dateFilter) {
      case "TODAY":
        matchesDate =
          createdDate.toDateString() ===
          today.toDateString();
        break;

      case "LAST_7_DAYS":
        matchesDate =
          today - createdDate <=
          7 * 24 * 60 * 60 * 1000;
        break;

      case "LAST_30_DAYS":
        matchesDate =
          today - createdDate <=
          30 * 24 * 60 * 60 * 1000;
        break;

      case "THIS_YEAR":
        matchesDate =
          createdDate.getFullYear() ===
          today.getFullYear();
        break;

      default:
        matchesDate = true;
    }

    return matchesSearch && matchesDate;
  });

  useEffect(() => {
    fetchHistory(incomeType);
  }, [incomeType, page]);

  return (
    <>

      <div className="income-history-page">

        <div class="container-fluid">
          <div className="prox-live-navbar">

            <div className="prox-live-navbar-left">

              <div className="prox-live-logo">
                <i className="bi bi-clock-history"></i>
              </div>

              <div>
                <h2 className="prox-live-navbar-title">
                  {title}
                </h2>

                <p className="prox-live-navbar-subtitle">
                  Track this income report
                </p>
              </div>

            </div>

            <div className="prox-live-navbar-right">

              <button className="prox-live-outline-btn" onClick={() => navigate("/dashboard")}>
                <i className="bi bi-arrow-left"></i> Dashboard
              </button>

            </div>

          </div>


          {/* CARD */}
          <div className="income-history-card">

            {/* TOP FILTERS */}
            <div className="income-history-filter-area">

              <h4>{title}</h4>

            </div>

            {/* EXTRA FILTERS */}
            <div className="income-history-table-topbar">

              {/* SEARCH */}
              <div className="income-history-search-box">
                <i className="bi bi-search"></i>

                <input
                  type="text"
                  placeholder="Search by ID, name, amount..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* FILTERS */}
              <select
                className="income-history-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="TODAY">Today</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="THIS_YEAR">This Year</option>
              </select>

            </div>

            {/* TABLE */}
            <div className="income-history-table-wrap">
              <div className="row">
                <div className="col-md-12">

                  <div className="table-reponsive">
                    <table className="income-history-table">

                      <thead>
                        <tr>
                          <th>#</th>
                          <th>From ID</th>
                          <th>Name</th>
                          <th>Coin</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((item, i) => (
                            <tr key={item._id}>
                              <td>{i + 1}</td>
                              <td>{item?.fromUserId?.referralCode || "self Income"}</td>
                              <td>{item?.fromUserId?.nickname || "self"}</td>
                              <td className="income-history-green">
                                {item.amount}
                              </td>
                              <td>
                                {new Date(item.createdAt).toLocaleDateString("en-IN")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>
                              No income history found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                  </div>

                  <div
                    className="income-pagination">
                    <button
                      disabled={page === 1}
                      onClick={() =>
                        setPage(prev => prev - 1)
                      }
                    >
                      Prev
                    </button>
                    {
                      [...Array(pages)].map((_, i) => (
                        <button
                          key={i}
                          className={page === i + 1 ? 'active' : ''}
                          onClick={() => setPage(i + 1)
                          }
                        >
                          {i + 1}
                        </button>
                      )
                      )
                    }

                    <button
                      disabled={page === pages}
                      onClick={() => setPage(prev => prev + 1)}
                    >
                      Next
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </div>




    </>
  );
}