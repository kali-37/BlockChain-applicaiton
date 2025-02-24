import GenLevels from "../../../components/user/gen-levels";
import GenTotalEarning from "../../../features/user/earningOverview/gen-total-earning";
import SearchUser from "../../../features/user/generology/search-user";
import TeamMembers from "../../../features/user/generology/team-members";

function Genealogy() {
    return (
        <div className="space-y-8">
            <p className="text-center font-semibold text-xl">Genealogy</p>
            <TeamMembers />
            <SearchUser />
            <GenLevels />
            <GenTotalEarning />
        </div>
    );
}

export default Genealogy;
