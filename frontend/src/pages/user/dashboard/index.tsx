import DashboardTeamMembers from "../../../features/user/dashboard/dashboard-team-members";
import DashboardQuickStats from "../../../features/user/dashboard/quick-stats";
import SendInvites from "../../../features/user/dashboard/send-invite";
import TotalAssets from "../../../features/user/dashboard/total-assets";

function Dashboard() {
    return (
        <>
            <TotalAssets />
            <SendInvites />
            <DashboardQuickStats />
            <DashboardTeamMembers />
        </>
    );
}

export default Dashboard;