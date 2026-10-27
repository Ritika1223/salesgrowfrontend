import React, { useEffect, useState } from "react";
import axios from "axios";
import { resolveAuthUserId, authJsonHeaders } from "../../../utils/auth";
import { API_CHAT,API_BASE, getApiOrigin } from "../../../config/api";

const apiOrigin = getApiOrigin ? getApiOrigin(API_BASE) : "";

// Helper for previewing QR/image URLs
function getImageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? url : "/" + url}`;
}

function historyLabel(item) {
  const type = String(item.type || "");
  const desc = String(item.description || "").trim();
  if (type === "WITHDRAW") return desc || "Withdrawal";
  if (type === "SELF_INCOME") return desc || "ROI Income";
  if (type === "DIRECT_INCOME") {
    if (/level\s*([2-9]|1\d)/i.test(desc)) return desc || "Level Income";
    return desc || "Direct Income";
  }
  if (type === "LEVEL_INCOME") return desc || "Level Income";
  if (type === "ROI_TO_ROI") return desc || "ROI to ROI Income";
  if (type === "SALARY_INCOME") return desc || "Salary Income";
  if (type === "POOL_INCOME") return desc || "Pool Income";
  if (type === "RANK_BONUS") return desc || "Rank Income";
  if (type === "VIP_INCOME") return desc || "VIP Income";
  return desc || "Income";
}

function money(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function Wallet() {
  const [userId] = useState(resolveAuthUserId());
  const [income, setIncome] = useState(null);
  const [walletError, setWalletError] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupError, setTopupError] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [coinsPerRupee, setCoinsPerRupee] = useState(10);
  const [showFund, setShowFund] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundCoins, setFundCoins] = useState("");
  const [fundTransactionNo, setFundTransactionNo] = useState("");
  const [fundScreenshot, setFundScreenshot] = useState(null);
  const [fundError, setFundError] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  const [paymentSubmissions, setPaymentSubmissions] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPaymentSubmissions([]);
      setLoadingPayments(false);
      return;
    }

    axios
      .get(`${API_CHAT}/payment-history/user/${userId}`, {
        headers: authJsonHeaders(),
      })
      .then((res) => {
        setPaymentSubmissions(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch(() => setPaymentSubmissions([]))
      .finally(() => setLoadingPayments(false));
  }, [userId]);

  async function handleFundSubmit(e) {
    e.preventDefault();
    setFundError("");

    const rupees = Number(fundAmount);
    if (!selectedOffer) {
      setFundError("Select a coin offer first");
      return;
    }
    if (!rupees || rupees < 1) {
      setFundError("Enter a valid amount");
      return;
    }
    if (!fundTransactionNo.trim()) {
      setFundError("Enter transaction number");
      return;
    }
    if (!fundScreenshot) {
      setFundError("Upload payment screenshot");
      return;
    }

    const formData = new FormData();
    formData.append("amount", selectedOffer.amount);
    formData.append("coins", selectedOffer.coins);
    formData.append("offerId", selectedOffer.id);
    formData.append("transactionNo", fundTransactionNo.trim());
    formData.append("screenshot", fundScreenshot);

    try {
      setFundLoading(true);
      const token = authJsonHeaders().Authorization;
      await axios.post(`${API_CHAT}/payment-history`, formData, {
        headers: {
          ...(token ? { Authorization: token } : {}),
          "Content-Type": "multipart/form-data",
        },
      });

      const payRes = await axios.get(
        `${API_CHAT}/payment-history/user/${userId}`,
        { headers: authJsonHeaders() }
      );
      setPaymentSubmissions(Array.isArray(payRes.data.data) ? payRes.data.data : []);

      setShowFund(false);
      setSelectedOffer(null);
      setFundAmount("");
      setFundCoins("");
      setFundTransactionNo("");
      setFundScreenshot(null);
    } catch (err) {
      setFundError(err?.response?.data?.message || "Payment submission failed");
    } finally {
      setFundLoading(false);
    }
  }

  function statusBadgeClass(status) {
    switch (status) {
      case "approved":
        return "bg-success";
      case "declined":
        return "bg-danger";
      case "completed":
        return "bg-primary";
      default:
        return "bg-warning text-dark";
    }
  }

  const [bankLoading, setBankLoading] = useState(true);
  const [bankError, setBankError] = useState("");
  const [bank, setBank] = useState(null);

  useEffect(() => {
    // Fetch UPI/bank info on mount
    setBankLoading(true);
    setBankError("");
    axios
      .get(`${API_CHAT}/bank`, { headers: authJsonHeaders() })
      .then((res) => {
        // expects { data: { upi, qrCode } }
        if (res.data && res.data.data) {
          setBank(res.data.data);
        } else {
          setBank(null);
        }
      })
      .catch((err) => {
        setBankError(
          err?.response?.data?.message || "Unable to load bank info"
        );
        setBank(null);
      })
      .finally(() => setBankLoading(false));
  }, []);

  useEffect(() => {
    if (!userId) {
      setIncome(null);
      setLoadingWallet(false);
      return;
    }

    axios
      .get(`${API_BASE}/plans/getIncomeReport`, {
        headers: authJsonHeaders(),
      })
      .then((res) => {
        setIncome(res.data?.data || null);
      })
      .catch((err) => {
        setWalletError(
          err?.response?.data?.message ||
          "Income loading failed"
        );
      })
      .finally(() => setLoadingWallet(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setHistory([]);
      setLoadingHistory(false);
      return;
    }

    axios
      .get(
        `${API_BASE}/plans/getWalletTransactions?page=1&limit=50&type=INCOME`,
        { headers: authJsonHeaders() }
      )
      .then((res) => {
        setHistory(
          Array.isArray(res.data.data)
            ? res.data.data
            : []
        );
      })
      .catch(() => setHistory([]))
      .finally(() =>
        setLoadingHistory(false)
      );
  }, [userId]);

  async function handleTopupSubmit(e) {
    e.preventDefault();

    const rupees = Number(topupAmount);

    if (!rupees || rupees < 1) {
      setTopupError(
        "Enter valid amount"
      );
      return;
    }

    try {
      setTopupLoading(true);

      const res = await axios.post(
        `${API_CHAT}/wallet/topup`,
        {
          userId,
          rupees,
        }
      );

      setShowTopup(false);
      setTopupAmount("");
    } catch (err) {
      setTopupError(
        err?.response?.data?.message ||
        "Topup failed"
      );
    } finally {
      setTopupLoading(false);
    }
  }

  return (
    <div className="wallet-page">

      <div className="container-fluid">

        {/* TOPBAR */}
        <div className="wallet-topbar">

          <div className="wallet-topbar-left">

            <div className="wallet-user">

              <div className="wallet-avatar">
                <i className="bi bi-wallet2"></i>
              </div>

              <div>

                <h2>
                  Income Wallet
                </h2>

                <p>
                  Your income balance and income history
                </p>

              </div>

            </div>

          </div>

          <div className="wallet-topbar-right">

          </div>

        </div>

        {/* MAIN BALANCE CARD */}
        <div className="wallet-main-card">

          <div className="wallet-card-glow one"></div>
          <div className="wallet-card-glow two"></div>

          <div className="row align-items-center">

            <div className="col-lg-8">

              <div className="wallet-balance-wrap">

                <div className="wallet-balance-icon">
                  <img src="/images/icon2.png" className="w-100" />
                </div>

                <div>

                  <span className="wallet-balance-label">
                    Available Income
                  </span>

                  <h1 className="wallet-balance-amount">
                    {loadingWallet
                      ? "Loading..."
                      : walletError
                        ? "$0"
                        : `$${money(
                          Math.max(
                            0,
                            Number(income?.TotalEarn || 0) - Number(income?.TotalWithdraw || 0)
                          )
                        )}`}
                  </h1>

                  <div className="wallet-balance-footer">

                    <span className="wallet-badge">
                      <i className="bi bi-check-circle-fill"></i>
                      Income Wallet
                    </span>

                    <span className="wallet-balance-sub">
                      Earned minus withdrawn
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* SMALL STATS */}
        <div className="row g-4 wallet-mini-row">

          <div className="col-lg-3 col-md-6">

            <div className="wallet-mini-card">

              <div className="wallet-mini-icon purple">
                <i className="bi bi-wallet-fill"></i>
              </div>

              <span>Available Income</span>

              <h3>
                ${money(
                  Math.max(
                    0,
                    Number(income?.TotalEarn || 0) - Number(income?.TotalWithdraw || 0)
                  )
                )}
              </h3>

            </div>

          </div>

          <div className="col-lg-3 col-md-6">

            <div className="wallet-mini-card">

              <div className="wallet-mini-icon green">
                <i className="bi bi-arrow-down-circle-fill"></i>
              </div>

              <span>Total Earned</span>

              <h3>
                ${money(income?.TotalEarn || 0)}
              </h3>
            </div>

          </div>

          <div className="col-lg-3 col-md-6">

            <div className="wallet-mini-card">

              <div className="wallet-mini-icon red">
                <i className="bi bi-arrow-up-circle-fill"></i>
              </div>

              <span>Withdrawn</span>

              <h3>
                ${money(income?.TotalWithdraw || 0)}
              </h3>

            </div>

          </div>

          <div className="col-lg-3 col-md-6">

            <div className="wallet-mini-card">

              <div className="wallet-mini-icon yellow">
                <i className="bi bi-clock-fill"></i>
              </div>

              <span>Transactions</span>

              <h3>
                  {history.length}
              </h3>

            </div>

          </div>

        </div>

        {/* HISTORY */}
        <div className="wallet-history-card">

          <div className="wallet-history-head">

            <div>

              <h2>
                Income History
              </h2>

              <p>
                ROI, direct, level, salary, and withdrawals
              </p>
                      
            </div>

            <div className="wallet-records">
              {history.length} Records
            </div>

          </div>

          {loadingHistory && (
            <div className="wallet-loading">
              Loading income...
            </div>
          )}

          {!loadingHistory &&
            history.length === 0 && (

              <div className="wallet-empty">

                <div className="wallet-empty-icon">
                  <i className="bi bi-receipt"></i>
                </div>

                <h4>No income yet</h4>

                <p>
                  Your income history will appear here
                </p>

              </div>

            )}

          {!loadingHistory &&
            history.map((item) => {

              const isCredit =
                String(item.direction || "").toLowerCase() === "credit";

              const amount = isCredit
                ? Number(item.credit || item.amount || 0)
                : Number(item.debit || item.amount || 0);

              const when = item.createdAt || item.updatedAt || "";

              return (

                <div
                  key={item._id}
                  className="wallet-history-item"
                >

                  <div className="wallet-history-left">

                    <div
                      className={`wallet-history-icon ${isCredit
                        ? "credit"
                        : "debit"
                        }`}
                    >
                      <i
                        className={`bi ${isCredit
                          ? "bi-arrow-down"
                          : "bi-arrow-up"
                          }`}
                      ></i>
                    </div>

                    <div>

                      <h5>
                        {historyLabel(item)}
                      </h5>

                      <p>
                        {when ? String(when).slice(0, 10) : ""}
                      </p>

                    </div>

                  </div>

                  <div
                    className={`wallet-history-amount ${isCredit
                      ? "credit-text"
                      : "debit-text"
                      }`}
                  >
                    {isCredit ? "+" : "-"}${money(Math.abs(amount))}
                  </div>

                </div>

              );

            })}

        </div>

        {/* PAYMENT SUBMISSIONS */}
        <div className="wallet-history-card mt-4">

          <div className="wallet-history-head">
            <div>
              <h2>Payment Submissions</h2>
              <p>Track your fund requests and approval status</p>
            </div>
            <div className="wallet-records">
              {paymentSubmissions.length} Records
            </div>
          </div>

          {loadingPayments && (
            <div className="wallet-loading">Loading payment submissions...</div>
          )}

          {!loadingPayments && paymentSubmissions.length === 0 && (
            <div className="wallet-empty">
              <div className="wallet-empty-icon">
                <i className="bi bi-credit-card"></i>
              </div>
              <h4>No payment submissions yet</h4>
              <p>Income from your subscription appears here</p>
            </div>
          )}

          {!loadingPayments &&
            paymentSubmissions.map((item) => (
              <div key={item._id} className="wallet-history-item">
                <div className="wallet-history-left">
                  <div className="wallet-history-icon credit">
                    <i className="bi bi-cash-coin "></i>
                  </div>
                  <div>
                    <h5>₹{Number(item.amount).toLocaleString()} — {item.transactionNo}</h5>
                    <p>
                      {item.createdAt ? String(item.createdAt).slice(0, 10) : ""}
                    </p>
                    <span className={`badge ${statusBadgeClass(item.status)}`}>
                      {item.status || "pending"}
                    </span>
                  </div>
                </div>
                {item.screenshot && (
                  <a
                    href={getImageUrl(item.screenshot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary"
                  >
                    View Screenshot
                  </a>
                )}
              </div>
            ))}

        </div>

        {showFund && (
          <div className="wallet-modal">

            <div className="wallet-modal-box payment-modal">

              <button
                className="wallet-close-btn"
                onClick={() => {
                  setShowFund(false);
                  setSelectedOffer(null);
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <div className="d-flex align-items-center justify-content-center">
                <div className="wallet-modal-icon"><i className="bi bi-wallet2"></i></div>
                <h2>Add Funds</h2>
              </div>
              {selectedOffer ? (
                <p className="qr-text" style={{ fontWeight: 600 }}>
                  {Number(selectedOffer.coins).toLocaleString()} coins for ₹
                  {Number(selectedOffer.amount).toLocaleString()}
                </p>
              ) : null}

              {/* QR Code */}

              <div className="qr-section">

                {bankLoading ? (
                  <div className="wallet-loading">Loading payment info...</div>
                ) : bankError ? (
                  <div className="wallet-error">{bankError}</div>
                ) : (
                  <>
                    <img
                      src={getImageUrl(bank?.qrCode)}
                      alt="QR Code"
                      className="payment-qr"
                    />
                    <p className="qr-text">
                      Scan QR Code & Complete Payment
                    </p>
                    <div className="upi-box">
                      <span>
                        {bank?.upi || "UPI Not available"}
                      </span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() =>
                          navigator.clipboard.writeText(bank?.upi || "")
                        }
                        disabled={!bank?.upi}
                      >
                        Copy
                      </button>
                    </div>
                  </>
                )}

              </div>

              {/* Payment Form */}

              <form className="payment-form" onSubmit={handleFundSubmit}>

                <div className="form-group">
                  <label>
                    Amount (₹)
                  </label>

                  <input
                    type="number"
                    placeholder="Offer amount"
                    className="wallet-input"
                    value={fundAmount}
                    readOnly
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Coins
                  </label>

                  <input
                    type="number"
                    className="wallet-input"
                    value={fundCoins}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>
                    Transaction Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter UTR / Transaction ID"
                    className="wallet-input"
                    value={fundTransactionNo}
                    onChange={(e) => setFundTransactionNo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Upload Screenshot
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    className="wallet-input"
                    onChange={(e) => setFundScreenshot(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                {fundError && (
                  <div className="wallet-error">{fundError}</div>
                )}

                <div className="wallet-modal-actions">
                  <button type="button" className="wallet-cancel-btn" onClick={() => {
                    setShowFund(false);
                    setSelectedOffer(null);
                  }}>Cancel</button>
                  <button type="submit" className="wallet-submit-btn" disabled={fundLoading}>
                    {fundLoading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>

            </div>

          </div>
        )}

        {/* MODAL */}        
        {showTopup && (

          <div className="wallet-modal">

            <div className="wallet-modal-box">

              <button
                className="wallet-close-btn"
                onClick={() =>
                  setShowTopup(false)
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <div className="wallet-modal-icon">
                <i className="bi bi-wallet2"></i>
              </div>

              <h2>
                Add Funds
              </h2>

              <p className="wallet-modal-rate">
                ₹1 = {coinsPerRupee} coins
              </p>

              <form onSubmit={handleTopupSubmit}>

                <input
                  type="number"
                  placeholder="Enter amount in ₹"
                  value={topupAmount}
                  onChange={(e) =>
                    setTopupAmount(e.target.value)
                  }
                  className="wallet-input"
                />

                {topupError && (
                  <div className="wallet-error">
                    {topupError}
                  </div>
                )}

                <div className="wallet-modal-actions">

                  <button
                    type="button"
                    onClick={() =>
                      setShowTopup(false)
                    }
                    className="wallet-cancel-btn"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={topupLoading}
                    className="wallet-submit-btn"
                  >
                    {topupLoading
                      ? "Processing..."
                      : "Add Funds"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



      </div>

    </div>
  );
}