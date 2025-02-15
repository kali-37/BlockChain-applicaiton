import QuickStats from "../../../features/user/dashboard/quick-stats";
import SendInvites from "../../../features/user/dashboard/send-invite";
import TotalAssets from "../../../features/user/dashboard/total-assets";
import TeamMembers from "../../../features/user/dashboard/team-members";

function Dashboard() {
    return (
        <>
            <TotalAssets />
            <SendInvites />
            <QuickStats />
            <TeamMembers />
        </>
    );
}

export default Dashboard;
