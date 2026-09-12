"use client";

import { useEffect, useState } from "react";

import {
  Eye,
  Wallet,
  X,
} from "lucide-react";

type Withdrawal = {
  _id: string;

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
};

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selected, setSelected] =
    useState<Withdrawal | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/withdrawals"
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load withdrawals."
        );
      }

      const data = await res.json();

      setWithdrawals(
        Array.isArray(data)
          ? data
          : data.withdrawals || []
      );
    } catch (error) {
      console.error(
        "Load withdrawals error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount || 0);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const shortenWallet = (
    address: string
  ) => {
    if (!address) return "—";

    if (address.length <= 22) {
      return address;
    }

    return `${address.slice(
      0,
      10
    )}...${address.slice(-8)}`;
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1>Withdrawals</h1>

          <p>
            View your cryptocurrency withdrawal
            requests and their status.
          </p>
        </div>
      </header>

      <div className="container-app">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>
                Withdrawal History
              </h2>

              <p>
                Track the status of all your
                withdrawal requests.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading withdrawals...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="empty-state">
              <Wallet
                size={35}
                strokeWidth={1.5}
              />

              <strong>
                No withdrawals yet
              </strong>

              <span>
                Your withdrawal requests will
                appear here.
              </span>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
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
                  {withdrawals.map(
                    (withdrawal) => (
                      <tr
                        key={
                          withdrawal._id
                        }
                      >
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
                            {shortenWallet(
                              withdrawal.walletAddress
                            )}
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
                          <button
                            type="button"
                            className="icon-btn"
                            title="View details"
                            onClick={() => {
                              setSelected(
                                withdrawal
                              );

                              setShowDetails(
                                true
                              );
                            }}
                          >
                            <Eye size={17} />
                          </button>
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

      {showDetails &&
        selected && (
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
                    Details of your withdrawal
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
                    Amount
                  </span>

                  <strong>
                    {formatUSD(
                      selected.amountUSD
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Currency
                  </span>

                  <strong>
                    {selected.currency}
                  </strong>
                </div>

                <div>
                  <span>
                    Network
                  </span>

                  <strong>
                    {selected.network}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    <span
                      className={`status status-${selected.status?.toLowerCase()}`}
                    >
                      {selected.status}
                    </span>
                  </strong>
                </div>

                <div className="full-detail">
                  <span>
                    Destination Wallet
                  </span>

                  <strong
                    style={{
                      wordBreak:
                        "break-all",
                    }}
                  >
                    {
                      selected.walletAddress
                    }
                  </strong>
                </div>

                {selected.payoutAmount !==
                    undefined &&
                  selected.payoutAmount >
                    0 && (
                    <div>
                      <span>
                        Payout Amount
                      </span>

                      <strong>
                        {formatCrypto(
                          selected.payoutAmount,
                          selected.currency
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
                      selected.createdAt
                    )}
                  </strong>
                </div>

                {selected.reviewedAt && (
                  <div>
                    <span>
                      Reviewed
                    </span>

                    <strong>
                      {formatDate(
                        selected.reviewedAt
                      )}
                    </strong>
                  </div>
                )}

                {selected.transactionHash && (
                  <div className="full-detail">
                    <span>
                      Transaction Hash
                    </span>

                    <strong
                      style={{
                        wordBreak:
                          "break-all",
                      }}
                    >
                      {
                        selected.transactionHash
                      }
                    </strong>
                  </div>
                )}

                {selected.note && (
                  <div className="full-detail">
                    <span>
                      Note
                    </span>

                    <strong>
                      {selected.note}
                    </strong>
                  </div>
                )}

                {selected.declineReason && (
                  <div className="full-detail">
                    <span>
                      Decline Reason
                    </span>

                    <strong>
                      {
                        selected.declineReason
                      }
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  );
}