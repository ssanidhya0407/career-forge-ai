"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { InterviewRecord, DashboardStats } from "@/lib/api";

interface AnalyticsChartProps {
    interviews: InterviewRecord[];
    stats: DashboardStats;
}

export function AnalyticsChart({ interviews, stats }: AnalyticsChartProps) {
    const chartData = useMemo(() => {
        const completed = interviews
            .filter((i) => i.score !== undefined && i.score !== null)
            .slice(0, 10)
            .reverse();

        return completed.map((interview) => ({
            label: new Date(interview.started_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            }),
            score: interview.score || 0,
            role: interview.role
        }));
    }, [interviews]);

    const maxScore = Math.max(...chartData.map((d) => d.score), 100);

    const TrendIcon = stats.recent_trend === "improving"
        ? TrendingUp
        : stats.recent_trend === "declining"
            ? TrendingDown
            : Minus;

    const trendColor = stats.recent_trend === "improving"
        ? "text-green-500"
        : stats.recent_trend === "declining"
            ? "text-red-500"
            : "text-yellow-500";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Interviews" value={stats.total_interviews} />
                <StatCard label="Average Score" value={`${stats.average_score}%`} />
                <StatCard label="Best Score" value={`${stats.best_score}%`} highlight />
                <div className="bg-white/5 rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Trend</p>
                    <div className={`flex items-center gap-2 ${trendColor}`}>
                        <TrendIcon className="w-5 h-5" />
                        <span className="font-semibold capitalize">{stats.recent_trend}</span>
                    </div>
                </div>
            </div>

            {chartData.length > 1 && (
                <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-6">Score History</h3>

                    <div className="h-48 flex items-end gap-2">
                        {chartData.map((data, index) => (
                            <motion.div
                                key={index}
                                initial={{ height: 0 }}
                                animate={{ height: `${(data.score / maxScore) * 100}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="flex-1 group relative"
                            >
                                <div
                                    className={`w-full h-full rounded-t-lg transition-colors ${data.score >= 70
                                        ? "bg-green-500/40 hover:bg-green-500/60"
                                        : data.score >= 50
                                            ? "bg-yellow-500/40 hover:bg-yellow-500/60"
                                            : "bg-red-500/40 hover:bg-red-500/60"
                                        }`}
                                />

                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
                                    {data.score}%
                                </div>

                                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                    {data.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Category Breakdown</h3>

                <div className="space-y-4">
                    <CategoryBar label="Communication" value={stats.category_averages.communication} />
                    <CategoryBar label="Technical" value={stats.category_averages.technical} />
                    <CategoryBar label="Problem Solving" value={stats.category_averages.problem_solving} />
                    <CategoryBar label="Culture Fit" value={stats.category_averages.culture_fit} />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
    return (
        <div className={`rounded-2xl p-4 ${highlight ? "bg-primary/10 border border-primary/20" : "bg-white/5"}`}>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
        </div>
    );
}

function CategoryBar({ label, value }: { label: string; value: number }) {
    const barColor = value >= 70 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${barColor} rounded-full`}
                />
            </div>
        </div>
    );
}

export function RadarChart({ scores }: { scores: { label: string; value: number }[] }) {
    const numPoints = scores.length;
    const angleStep = (2 * Math.PI) / numPoints;
    const centerX = 100;
    const centerY = 100;
    const maxRadius = 65;

    const points = scores.map((score, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const radius = (score.value / 100) * maxRadius;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            labelX: centerX + (maxRadius + 20) * Math.cos(angle),
            labelY: centerY + (maxRadius + 20) * Math.sin(angle),
            label: score.label,
            value: score.value
        };
    });

    const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    return (
        <svg viewBox="0 0 200 200" className="w-full max-w-xs mx-auto">
            {[20, 40, 60, 80, 100].map((level) => (
                <polygon
                    key={level}
                    points={scores
                        .map((_, i) => {
                            const angle = i * angleStep - Math.PI / 2;
                            const r = (level / 100) * maxRadius;
                            return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                        })
                        .join(" ")}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeWidth={1}
                />
            ))}

            <polygon
                points={polygonPoints}
                fill="currentColor"
                fillOpacity={0.2}
                stroke="currentColor"
                strokeWidth={2}
                className="text-primary"
            />

            {points.map((point, i) => (
                <g key={i}>
                    <circle
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        fill="currentColor"
                        className="text-primary"
                    />
                    <text
                        x={point.labelX}
                        y={point.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[10px] fill-current text-muted-foreground"
                    >
                        {point.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}
