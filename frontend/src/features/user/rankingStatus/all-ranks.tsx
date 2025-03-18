import ant from "../../../assets/img/ant.png";
import { MdDone } from "react-icons/md";
import { Link } from "react-router";
// import { useGetAllLevels } from "../../../services/user/use-getLevels";
// import { useEffect, useState } from "react";
// import { useGetUserProfile } from "../../../services/user/use-get-user-profile";
import { useGetCurrentAndNextLevel } from "../../../hooks/useGetCurrentNextLevel";

interface Level {
    level_number: number;
    min_direct_referals: number;
    min_referral_depth: number;
    price: string;
}

function AllRanks() {
    // const { data: levels, isLoading, error } = useGetAllLevels();
    // console.log(levels, isLoading, error);
    // const [currentLevel, setCurrentLevel] = useState<number>(0);

    // const { data: userProfile } = useGetUserProfile();
    // console.log(userProfile);

    // const nextLevelInfo = levels?.results.find(
    //     (level: Level) => level.level_number === userProfile?.current_level + 1
    // );
    // console.log(nextLevelInfo);

    // useEffect(() => {
    //     console.log(typeof localStorage.getItem("current_level"));
    //     const userLevel = Number(localStorage.getItem("current_level"));
    //     setCurrentLevel(userLevel);
    // }, []);
    const { levels, currentLevel, nextLevelInfo } = useGetCurrentAndNextLevel();
    return (
        <>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 ">
                {/* level 0 */}
                <div className="bg-gray-800  flex items-center justify-center py-6 rounded-md cursor-pointer hover:bg-blue-900 relative ">
                    <img
                        src={ant}
                        className="absolute h-full w-full object-contain opacity-70"
                        alt=""
                    />
                    <span className="z-10 font-semibold">{currentLevel}</span>
                </div>

                {/* level 1 to 19 */}
                {levels?.results.map((level: Level) => {
                    return (
                        <div
                            className={`bg-gray-800  flex items-center justify-center py-6 rounded-md cursor-pointer hover:bg-blue-900 relative `}
                            key={level.level_number}
                        >
                            <span className="z-10 font-semibold">
                                {level.level_number}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* // level info    */}
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
                        <li>Rank Fee : 20 USDT</li>
                    </ul>
                </div>
                <p className="font-extralight text-sm">
                    Upgrade Cost : {nextLevelInfo?.price} USDT
                </p>
            </div>

            {/* buttons */}
            <div className="flex flex-col gap-8 ">
                <Link
                    to={`/user/make-payment`}
                    className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                >
                    Upgrade
                </Link>
                <Link
                    to={`/user/profile`}
                    className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                >
                    Complete Profile Setup
                </Link>
            </div>
        </>
    );
}

export default AllRanks;
