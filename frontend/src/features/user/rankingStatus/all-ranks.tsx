import ant from "../../../assets/img/ant.png";
import { MdDone } from "react-icons/md";
import { Link } from "react-router";

import { useGetCurrentAndNextLevel } from "../../../hooks/useGetCurrentNextLevel";
import { useGetUserProfile } from "../../../services/user/use-get-user-profile";
import ProfileData from "../../../pages/user/profile/profile-data";
import { toast } from "react-toastify";

interface Level {
    level_number: number;
    min_direct_referals: number;
    min_referral_depth: number;
    price: string;
}

function AllRanks() {
    const { levels, currentLevel, nextLevelInfo } = useGetCurrentAndNextLevel();
    const { data: userProfile } = useGetUserProfile();
    console.log("levels ==> ", levels);
    console.log("current level ", currentLevel);
    return (
        <>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 ">
                {/* level 0 to 19 */}
                {levels?.results.map((level: Level) => {
                    return (
                        <div
                            className={`  flex items-center justify-center py-6 rounded-md cursor-pointer hover:bg-blue-900 relative ${
                                level?.level_number === currentLevel ||
                                level?.level_number < currentLevel
                                    ? "bg-blue-900 "
                                    : " bg-gray-800"
                            } `}
                            key={level.level_number}
                        >
                            {level?.level_number === currentLevel ||
                            level?.level_number < currentLevel ? (
                                <img
                                    src={ant}
                                    className="absolute h-full w-full object-contain opacity-70"
                                    alt=""
                                />
                            ) : (
                                ""
                            )}
                            <span className="z-10 font-semibold">
                                {level?.level_number}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* // level info    */}
            {currentLevel === 19 ? (
                ""
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-blue-800 p-2">
                                <MdDone className="font-light text-xl" />
                            </div>
                            <span>Level {nextLevelInfo?.level_number}</span>
                        </div>
                        <ul className="pl-20 font-light list-disc">
                            <li>Rank Price : {nextLevelInfo?.price} USDT</li>
                            <li>Rank Fee : {nextLevelInfo?.rank_fee} USDT</li>
                        </ul>
                    </div>
                    <p className="font-extralight text-sm">
                        Upgrade Cost : {nextLevelInfo?.price} USDT
                    </p>
                </div>
            )}

            {/* buttons */}
            <div className="flex flex-col gap-8 ">
                {currentLevel === 19 ? (
                    <button
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950 "
                        disabled
                    >
                        You have reached Max Level
                    </button>
                ) : (
                    <Link
                        to={`${
                            userProfile?.is_profile_complete
                                ? "/user/make-payment"
                                : ""
                        }`}
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                        onClick={() => {
                            if (!userProfile?.is_profile_complete) {
                                toast.error("Competer your profile first");
                            }
                        }}
                    >
                        Upgrade
                    </Link>
                )}

                {userProfile?.is_profile_complete ? (
                    ""
                ) : (
                    <Link
                        to={`/user/profile`}
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                    >
                        Complete Profile Setup
                    </Link>
                )}
            </div>
        </>
    );
}

export default AllRanks;
