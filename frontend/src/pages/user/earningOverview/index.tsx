import QuickStats from "../../../components/user/quick-stats";
import TeamMembers from "../../../components/user/team-members";
import Gen from "../../../features/user/earningOverview/gen";

function EarningOverview() {
    return (
        <>
            <div className="space-y-12">
                <QuickStats />
                <TeamMembers />
                <Gen />
            </div>
        </>
    );
}

export default EarningOverview;
