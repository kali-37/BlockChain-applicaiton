import ant from "../../../assets/img/ant.png";

function QuickStats() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-xl font-semibold">Quick Stats</p>
                <div className="flex border border-blue-800 rounded-xl">
                    <button className=" rounded-xl px-4 py-1 ">10 Days</button>
                    <button className=" rounded-xl px-4 py-1 ">7 Days</button>
                    <button className=" rounded-xl px-4 py-1 bg-blue-900">
                        24 Hours
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10  rounded-xl relative">
                        <div>
                            <p className="text-sm">New Members</p>
                            <div className="flex gap-2 items-center">
                                <span className="text-xl">0</span>
                                <span className="text-sm text-blue-300">
                                    Members
                                </span>
                            </div>
                        </div>
                        <div className="h-[80px] w-[80px] p-3 absolute right-0">
                            <img src={ant} alt="" className="h-full w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10  rounded-xl relative">
                        <div>
                            <p className="text-sm">
                                Accumulated Earnings (USDT)
                            </p>
                            <div className="flex gap-2 items-center">
                                <span className="text-xl">0</span>
                            </div>
                        </div>
                        <div className="h-[80px] w-[80px] p-3 absolute right-0">
                            <img src={ant} alt="" className="h-full w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10  rounded-xl relative">
                        <div>
                            <p className="text-sm">Team Size</p>
                            <div className="flex gap-2 items-center">
                                <span className="text-xl">0</span>
                            </div>
                        </div>
                        <div className="h-[80px] w-[80px] p-3 absolute right-0">
                            <img src={ant} alt="" className="h-full w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuickStats;
