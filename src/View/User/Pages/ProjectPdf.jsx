import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, getApiOrigin } from "../../../config/api";

function fileHref(fileUrl) {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const origin = getApiOrigin(API_BASE);
  return `${origin}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
}

export default function ProjectPdf() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/project-pdfs`)
      .then((res) => {
        if (!cancelled) setRows(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Could not load PDFs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="modern-plans-page">
      <div className="container-fluid">
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-file-earmark-pdf-fill"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">Project PDF</h2>
              <p className="prox-live-navbar-subtitle">Download the project documents</p>
            </div>
          </div>
        </div>

        <div className="income-history-card">
          {loading ? <p>Loading PDFs...</p> : null}
          {error ? <div className="wallet-error">{error}</div> : null}
          {!loading && !error && rows.length === 0 ? <p>No project PDF uploaded yet.</p> : null}
          {!loading && rows.length > 0 ? (
            <div className="income-history-table-wrap">
              <table className="income-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row._id}>
                      <td>{index + 1}</td>
                      <td>{row.title}</td>
                      <td>
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td>
                        <a href={fileHref(row.fileUrl)} target="_blank" rel="noreferrer">
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
