import { dummyData } from "../../../data/allRankDummyData";
import ant from "../../../assets/img/ant.png";
import { MdDone } from "react-icons/md";
import { Link } from "react-router";

function AllRanks() {
    return (
        <>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 ">
                {dummyData.map((level) => {
                    return (
                        <div
                            className={`bg-gray-800  flex items-center justify-center py-6 rounded-md cursor-pointer hover:bg-blue-900 relative `}
                            key={level.rank}
                        >
                            {level.rank === 0 && (
                                <img
                                    src={ant}
                                    className="absolute h-full w-full object-contain opacity-70"
                                    alt=""
                                />
                            )}
                            <span className="z-10 font-semibold">
                                {level.rank}
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
                        <span>Level 1</span>
                    </div>
                    <ul className="pl-20 font-light list-disc">
                        <li>Rank Price : 100 USDT</li>
                        <li>Rank Fee : 20 USDT</li>
                    </ul>
                </div>
                <p className="font-extralight text-sm">
                    Upgrade Cost : 120 USDT
                </p>
            </div>
            <div className="flex  ">
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
