"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

import { money, dateTime } from "@/lib/format";

type Investment = {
    _id: string;

    amountUSD: number;
    originalAmount: number;
    currency: "BTC" | "USDT" | "USDC" | "ETH";

    cycleDaysMin: number;
    cycleDaysMax: number;

    targetReturnPercent: number;

    status:
        | "active"
        | "completed"
        | "declined";

    startedAt: string;
    endsAt?: string;

    profitUSD?: number;
    payoutUSD?: number;
};

export default function Investments() {
    const [rows, setRows] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInvestments() {
            try {
                const response =
                    await fetch(
                        "/api/investments"
                    );

                const data =
                    await response.json();

                setRows(
                    data.investments || []
                );
            } catch (error) {
                console.error(
                    "Failed to load investments:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadInvestments();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="container-app">
                <div className="welcome-row">
                    <div>
                        <span className="section-kicker">
                            PORTFOLIO
                        </span>

                        <h1>
                            Your investments
                        </h1>

                        <p className="muted">
                            Review your approved
                            investment positions
                            and terms.
                        </p>
                    </div>
                </div>

                <div className="panel table-panel">
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        Investment
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Cycle
                                    </th>

                                    <th>
                                        Target
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Started
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map(
                                    (investment) => (
                                        <tr
                                            key={
                                                investment._id
                                            }
                                        >
                                            {/* INVESTMENT */}
                                            <td>
                                                <div className="table-name">
                                                    <div className="tiny-icon">
                                                        <TrendingUp
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <b>
                                                            {
                                                                investment.currency
                                                            }{" "}
                                                            investment
                                                        </b>

                                                        <small>
                                                            {
                                                                investment.originalAmount
                                                            }{" "}
                                                            {
                                                                investment.currency
                                                            }
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* USD AMOUNT */}
                                            <td>
                                                <b>
                                                    {money(
                                                        investment.amountUSD,
                                                        "USD"
                                                    )}
                                                </b>
                                            </td>

                                            {/* CYCLE */}
                                            <td>
                                                {
                                                    investment.cycleDaysMin
                                                }
                                                –
                                                {
                                                    investment.cycleDaysMax
                                                }{" "}
                                                days
                                            </td>

                                            {/* TARGET */}
                                            <td>
                                                Up to{" "}
                                                {
                                                    investment.targetReturnPercent
                                                }
                                                %
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span
                                                    className={`status ${investment.status}`}
                                                >
                                                    {
                                                        investment.status
                                                    }
                                                </span>
                                            </td>

                                            {/* STARTED */}
                                            <td>
                                                {dateTime(
                                                    investment.startedAt
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="empty">
                            Loading investments...
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading &&
                        !rows.length && (
                            <div className="empty">
                                No investments yet.
                                Start from your
                                dashboard when
                                you are ready.
                            </div>
                        )}

                    {/* RISK NOTICE */}
                    <div className="risk-note">
                        *Target returns are not
                        guaranteed. Review the
                        applicable investment
                        agreement and risk
                        disclosures before
                        relying on any projection.
                    </div>
                </div>
            </div>
        </div>
    );
}