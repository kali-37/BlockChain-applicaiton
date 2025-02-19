import { Link } from "react-router";
import TeamMembers from "../../../components/user/team-members";

function DashboardTeamMembers() {
    return (
        <>
            <TeamMembers />
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 space-x-4">
                    <Link
                        to={`/user/genealogy`}
                        className="border-2 py-4 rounded-xl text-center border-blue-500 hover:bg-blue-900"
                    >
                        View Geneology
                    </Link>
                    <Link
                        to={`/user/earning-overview`}
                        className="border-2 py-4 rounded-xl text-center border-blue-500 hover:bg-blue-900"
                    >
                        View Earnings
                    </Link>
                </div>
            </div>
        </>
    );
}

export default DashboardTeamMembers;
