import { useGetDashboardStats } from "../../services/user/use-get-dashboard-stats";

function TeamMembers() {
    const { data: stats, isLoading } = useGetDashboardStats("10d"); // We'll use 10d for this component
    
    return (
        <div className="space-y-3">
            <p className="text-xl font-semibold">My Team Members</p>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Members</span>
                <span className="text-sm text-gray-400">
                    {isLoading ? "Loading..." : `${stats?.team_size || 0} Members`}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                    Total Earnings (USDT)
                </span>
                <span className="text-sm text-gray-400">
                    {isLoading ? "Loading..." : stats?.total_earnings.toFixed(2) || 0}
                </span>
            </div>
        </div>
    );
}

export default TeamMembers;