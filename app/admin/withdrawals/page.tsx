"use client";

import { useEffect, useState } from "react";

import {
  Check,
  Copy,
  Eye,
  Search,
  X,
} from "lucide-react";

type Withdrawal = {
  _id: string;

  userId: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  amountUSD: number;

  payoutAmount?: number;

  currency: string;

  network: string;

  walletAddress: string;

  note?: string;

  status: string;

  declineReason?: string;

  transactionHash?: string;

  fxRate?: number;

  createdAt: string;

  reviewedAt?: string;

  reviewedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [
    selectedWithdrawal,
    setSelectedWithdrawal,
  ] = useState<Withdrawal | null>(null);

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const [
    showDecline,
    setShowDecline,
  ] = useState(false);

  const [reason, setReason] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/withdrawals"
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load withdrawals."
        );
      }

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : data.withdrawals || [];

      setWithdrawals(list);
    } catch (error) {
      console.error(
        "Load withdrawals error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const reviewWithdrawal = async (
    withdrawalId: string,
    action: "approve" | "decline",
    declineReason?: string
  ) => {
    try {
      setProcessing(true);

      const res = await fetch(
        "/api/admin/withdrawals",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            withdrawalId,
            action,
            reason:
              declineReason || "",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to update withdrawal."
        );
      }

      setShowDecline(false);
      setShowDetails(false);
      setSelectedWithdrawal(null);
      setReason("");

      await loadWithdrawals();
    } catch (error: any) {
      alert(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = (
    withdrawal: Withdrawal
  ) => {
    const confirmed = window.confirm(
      `Approve withdrawal of ${formatUSD(
        withdrawal.amountUSD
      )} for ${
        withdrawal.userId?.name ||
        "this user"
      }?`
    );

    if (!confirmed) return;

    reviewWithdrawal(
      withdrawal._id,
      "approve"
    );
  };

  const openDecline = (
    withdrawal: Withdrawal
  ) => {
    setSelectedWithdrawal(
      withdrawal
    );

    setReason("");

    setShowDecline(true);
  };

  const handleDecline = () => {
    if (!selectedWithdrawal) {
      return;
    }

    if (!reason.trim()) {
      alert(
        "Please enter a reason for declining this withdrawal."
      );

      return;
    }

    reviewWithdrawal(
      selectedWithdrawal._id,
      "decline",
      reason.trim()
    );
  };

  const formatUSD = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }
    ).format(amount || 0);
  };

  const formatCrypto = (
    amount: number | undefined,
    currency: string
  ) => {
    if (
      amount === undefined ||
      amount === null
    ) {
      return "—";
    }

    const decimals =
      currency === "BTC" ||
      currency === "ETH"
        ? 8
        : 2;

    return `${Number(amount).toFixed(
      decimals
    )} ${currency}`;
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyValue = async (
    value: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        value
      );

      alert("Copied.");
    } catch {
      alert("Could not copy value.");
    }
  };

  const filteredWithdrawals =
    withdrawals.filter(
      (withdrawal) => {
        const value = search
          .toLowerCase()
          .trim();

        if (!value) {
          return true;
        }

        const name =
          withdrawal.userId?.name?.toLowerCase() ||
          "";

        const email =
          withdrawal.userId?.email?.toLowerCase() ||
          "";

        const currency =
          withdrawal.currency?.toLowerCase() ||
          "";

        const network =
          withdrawal.network?.toLowerCase() ||
          "";

        const wallet =
          withdrawal.walletAddress?.toLowerCase() ||
          "";

        const status =
          withdrawal.status?.toLowerCase() ||
          "";

        return (
          name.includes(value) ||
          email.includes(value) ||
          currency.includes(value) ||
          network.includes(value) ||
          wallet.includes(value) ||
          status.includes(value)
        );
      }
    );

  return (
    <>
      <header className="admin-header">
        <div>
          <h1>Withdrawals</h1>

          <p>
            Review and manage cryptocurrency
            withdrawal requests.
          </p>
        </div>
      </header>

      <div className="container-app">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>
                Withdrawal Requests
              </h2>

              <p>
                Approve or decline withdrawal
                requests submitted by users.
              </p>
            </div>

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search withdrawals..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading withdrawals...
            </div>
          ) : filteredWithdrawals.length ===
            0 ? (
            <div className="empty-state">
              No withdrawals found.
            </div>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>

                    <th>Amount</th>

                    <th>Currency</th>

                    <th>Network</th>

                    <th>Wallet</th>

                    <th>Submitted</th>

                    <th>Status</th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredWithdrawals.map(
                    (withdrawal) => (
                      <tr
                        key={
                          withdrawal._id
                        }
                      >
                        <td>
                          <div className="client-cell">
                            <strong>
                              {
                                withdrawal
                                  .userId
                                  ?.name
                              }
                            </strong>

                            <small>
                              {
                                withdrawal
                                  .userId
                                  ?.email
                              }
                            </small>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {formatUSD(
                              withdrawal.amountUSD
                            )}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {
                              withdrawal.currency
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            withdrawal.network
                          }
                        </td>

                        <td>
                          <span className="reference-text">
                            {withdrawal.walletAddress
                              ? `${withdrawal.walletAddress.slice(
                                  0,
                                  10
                                )}...${withdrawal.walletAddress.slice(
                                  -8
                                )}`
                              : "—"}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            withdrawal.createdAt
                          )}
                        </td>

                        <td>
                          <span
                            className={`status status-${withdrawal.status?.toLowerCase()}`}
                          >
                            {
                              withdrawal.status
                            }
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="icon-btn"
                              title="View details"
                              onClick={() => {
                                setSelectedWithdrawal(
                                  withdrawal
                                );

                                setShowDetails(
                                  true
                                );
                              }}
                            >
                              <Eye size={17} />
                            </button>

                            {withdrawal.status?.toLowerCase() ===
                              "pending" && (
                              <>
                                <button
                                  type="button"
                                  className="icon-btn success"
                                  title="Approve"
                                  disabled={
                                    processing
                                  }
                                  onClick={() =>
                                    handleApprove(
                                      withdrawal
                                    )
                                  }
                                >
                                  <Check
                                    size={17}
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="icon-btn danger"
                                  title="Decline"
                                  disabled={
                                    processing
                                  }
                                  onClick={() =>
                                    openDecline(
                                      withdrawal
                                    )
                                  }
                                >
                                  <X
                                    size={17}
                                  />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* DETAILS MODAL */}

      {showDetails &&
        selectedWithdrawal && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setShowDetails(false)
            }
          >
            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-head">
                <div>
                  <h2>
                    Withdrawal Details
                  </h2>

                  <p>
                    Review the user's withdrawal
                    request.
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setShowDetails(false)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="payment-details">
                <div>
                  <span>
                    Client
                  </span>

                  <strong>
                    {
                      selectedWithdrawal
                        .userId?.name
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {
                      selectedWithdrawal
                        .userId?.email
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Amount
                  </span>

                  <strong>
                    {formatUSD(
                      selectedWithdrawal.amountUSD
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Currency
                  </span>

                  <strong>
                    {
                      selectedWithdrawal.currency
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Network
                  </span>

                  <strong>
                    {
                      selectedWithdrawal.network
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    <span
                      className={`status status-${selectedWithdrawal.status?.toLowerCase()}`}
                    >
                      {
                        selectedWithdrawal.status
                      }
                    </span>
                  </strong>
                </div>

                <div className="full-detail">
                  <span>
                    Destination Wallet
                  </span>

                  <div className="copy-row">
                    <strong
                      style={{
                        wordBreak:
                          "break-all",
                      }}
                    >
                      {
                        selectedWithdrawal.walletAddress
                      }
                    </strong>

                    <button
                      type="button"
                      className="copy-btn"
                      title="Copy wallet address"
                      onClick={() =>
                        copyValue(
                          selectedWithdrawal.walletAddress
                        )
                      }
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>

                {selectedWithdrawal.payoutAmount &&
                  selectedWithdrawal.payoutAmount >
                    0 && (
                    <div>
                      <span>
                        Payout Amount
                      </span>

                      <strong>
                        {formatCrypto(
                          selectedWithdrawal.payoutAmount,
                          selectedWithdrawal.currency
                        )}
                      </strong>
                    </div>
                  )}

                <div>
                  <span>
                    Submitted
                  </span>

                  <strong>
                    {formatDate(
                      selectedWithdrawal.createdAt
                    )}
                  </strong>
                </div>

                {selectedWithdrawal.reviewedAt && (
                  <div>
                    <span>
                      Reviewed
                    </span>

                    <strong>
                      {formatDate(
                        selectedWithdrawal.reviewedAt
                      )}
                    </strong>
                  </div>
                )}

                {selectedWithdrawal.transactionHash && (
                  <div className="full-detail">
                    <span>
                      Transaction Hash
                    </span>

                    <div className="copy-row">
                      <strong
                        style={{
                          wordBreak:
                            "break-all",
                        }}
                      >
                        {
                          selectedWithdrawal.transactionHash
                        }
                      </strong>

                      <button
                        type="button"
                        className="copy-btn"
                        title="Copy transaction hash"
                        onClick={() =>
                          copyValue(
                            selectedWithdrawal.transactionHash ||
                              ""
                          )
                        }
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {selectedWithdrawal.note && (
                  <div className="full-detail">
                    <span>
                      User Note
                    </span>

                    <strong>
                      {
                        selectedWithdrawal.note
                      }
                    </strong>
                  </div>
                )}

                {selectedWithdrawal.declineReason && (
                  <div className="full-detail">
                    <span>
                      Decline Reason
                    </span>

                    <strong>
                      {
                        selectedWithdrawal.declineReason
                      }
                    </strong>
                  </div>
                )}
              </div>

              {selectedWithdrawal.status?.toLowerCase() ===
                "pending" && (
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={processing}
                    onClick={() =>
                      handleApprove(
                        selectedWithdrawal
                      )
                    }
                  >
                    <Check size={17} />

                    Approve Withdrawal
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={processing}
                    onClick={() =>
                      openDecline(
                        selectedWithdrawal
                      )
                    }
                  >
                    <X size={17} />

                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* DECLINE MODAL */}

      {showDecline &&
        selectedWithdrawal && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setShowDecline(false)
            }
          >
            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-head">
                <div>
                  <h2>
                    Decline Withdrawal
                  </h2>

                  <p>
                    Give a reason so the user
                    knows why the withdrawal was
                    declined.
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setShowDecline(false)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="form">
                <label>
                  Decline Reason
                </label>

                <textarea
                  rows={5}
                  placeholder="Enter the reason for declining this withdrawal..."
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setShowDecline(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={processing}
                  onClick={
                    handleDecline
                  }
                >
                  <X size={17} />

                  {processing
                    ? "Declining..."
                    : "Decline Withdrawal"}
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}