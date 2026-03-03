// components/HistoryTable.jsx

import React from "react";
import "./HistoryTable.css";

const COLS = [
  { key: "time",           label: "Time" },
  { key: "queueLength",    label: "Queue" },
  { key: "avgServiceTime", label: "Svc (min)" },
  { key: "waitTime",       label: "Wait (min)" },
  { key: "congestion",     label: "Congestion" },
  { key: "staff",          label: "Staff Rec." },
];

const HistoryTable = ({ history }) => {
  return (
    <div className="history-panel glass-card">
      <div className="history-header">
        <h2 className="history-title">Prediction History</h2>
        <span className="history-count">{history.length} entries</span>
      </div>

      {history.length === 0 ? (
        <div className="history-empty">No predictions yet — run your first prediction above</div>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>{COLS.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td className="td-time">{row.time}</td>
                  <td className="td-num">{row.queueLength}</td>
                  <td>{row.avgServiceTime}</td>
                  <td className="td-num">{row.waitTime}</td>
                  <td>
                    <span className={"congestion-badge congestion-badge--" + row.congestion}>
                      {row.congestion}
                    </span>
                  </td>
                  <td className="staff-col">
                    {row.staff > 0 ? "+" + row.staff : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
