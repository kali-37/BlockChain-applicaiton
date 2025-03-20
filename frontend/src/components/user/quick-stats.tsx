import { useState } from "react";
import ant from "../../assets/img/ant.png";
import { useGetDashboardStats } from "../../services/user/use-get-dashboard-stats";

function QuickStats() {
    const [timePeriod, setTimePeriod] = useState<string>("24h");
    const { data: stats, isLoading } = useGetDashboardStats(timePeriod);

    const handleTimePeriodChange = (period: string) => {
        setTimePeriod(period);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-xl font-semibold">Quick Stats</p>
                <div className="flex border border-blue-800 rounded-xl">
                    <button 
                        className={`rounded-xl px-4 py-1 ${timePeriod === "10d" ? "bg-blue-900" : ""}`}
                        onClick={() => handleTimePeriodChange("10d")}
                    >
                        10 Days
                    </button>
                    <button 
                        className={`rounded-xl px-4 py-1 ${timePeriod === "7d" ? "bg-blue-900" : ""}`}
                        onClick={() => handleTimePeriodChange("7d")}
                    >
                        7 Days
                    </button>
                    <button 
                        className={`rounded-xl px-4 py-1 ${timePeriod === "24h" ? "bg-blue-900" : ""}`}
                        onClick={() => handleTimePeriodChange("24h")}
                    >
                        24 Hours
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10 rounded-xl relative">
                        <div>
                            <p className="text-sm">New Members</p>
                            <div className="flex gap-2 items-center">
                                <span className="text-xl">{isLoading ? "..." : stats?.new_members || 0}</span>
                                <span className="text-sm text-blue-300">
                                    Members
                                </span>
                            </div>
                        </div>
                        <div className="h-[80px] w-[80px] p-3 absolute right-0">
                            <img src={ant} alt="" className="h-full w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10 rounded-xl relative">
                        <div>
                            <p className="text-sm">
                                {timePeriod === "24h" ? "Daily" : timePeriod === "7d" ? "Weekly" : "10-Day"} Earnings (USDT)
                            </p>
                            <div className="flex gap-2 items-center">
                                <span className="text-xl">{isLoading ? "..." : stats?.period_earnings.toFixed(2) || 0}</span>
                            </div>
                        </div>
                        <div className="h-[80px] w-[80px] p-3 absolute right-0">
                            <img src={ant} alt="" className="h-full w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10 rounded-xl relative">
                        <div>
                            <p className="text-sm">Team Size</p>
                            <div className="flex gap-2 items-center">
                                <span className="text-xl">{isLoading ? "..." : stats?.team_size || 0}</span>
                            </div>
                        </div>
                        <div className="h-[80px] w-[80px] p-3 absolute right-0">
                            <img src={ant} alt="" className="h-full w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuickStats;