import QuickStats from "../../../components/user/quick-stats";
import TeamMembers from "../../../components/user/team-members";

function EarningOverview() {
    return (
        <>
            <div className="space-y-6">
                <QuickStats />
                <TeamMembers />
            </div>
        </>
    );
}

export default EarningOverview;
