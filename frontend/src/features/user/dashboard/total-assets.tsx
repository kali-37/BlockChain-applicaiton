import ant from "../../../assets/img/ant.png";
import { useGetDashboardStats } from "../../../services/user/use-get-dashboard-stats";

function TotalAssets() {
    const { data: stats, isLoading } = useGetDashboardStats();
    
    return (
        <div className="flex justify-between items-center p-6 bg-opacity-70 rounded-xl relative bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10">
            <div>
                <p className="text-sm">Total Assets Balance</p>
                <div className="flex gap-2 items-center">
                    <span className="text-xl">
                        {isLoading ? "Loading..." : stats?.total_earnings.toFixed(2) || 0}
                    </span>
                    <span className="text-sm text-blue-300">USDT</span>
                </div>
            </div>
            <div className="h-[100px] w-[100px] absolute right-0 p-2">
                <img src={ant} alt="" className="h-full w-full" />
            </div>
        </div>
    );
}

export default TotalAssets;