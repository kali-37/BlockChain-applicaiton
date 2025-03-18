import { useGetUserProfile } from "../../../services/user/use-get-user-profile";

function CurrentRank() {
    const { data } = useGetUserProfile();
    console.log("data ==> ", data);
    return (
        <>
            <div>
                <h2 className="text-center text-xl  font-semibold  ">
                    Ranking Status
                </h2>
                <div className="bg-container flex flex-col mt-4 py-8">
                    <p className="text-sm">My Current Rank</p>
                    <span className="text-xl font-semibold">
                        Level {data?.current_level}
                    </span>
                </div>
            </div>
        </>
    );
}

export default CurrentRank;
