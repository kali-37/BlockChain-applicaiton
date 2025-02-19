import AllRanks from "../../../features/user/rankingStatus/all-ranks";
import CurrentRank from "../../../features/user/rankingStatus/current-rank";

function RankingStatus() {
    return (
        <div className="space-y-8">
            <CurrentRank />
            <AllRanks />
        </div>
    );
}

export default RankingStatus;
