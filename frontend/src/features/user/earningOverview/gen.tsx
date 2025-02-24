import GenTotalEarning from "./gen-total-earning";
import GenData from "./gen-data";
import GenLevels from "../../../components/user/gen-levels";

function Gen() {
    return (
        <div className="space-y-10">
            <GenLevels />

            <GenTotalEarning />
            <GenData />
        </div>
    );
}

export default Gen;
