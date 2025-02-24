function ReferalEarnings() {
    return (
        <div className="grid grid-cols-2 bg-pattern min-h-28 rounded-xl ">
            <div className=" flex items-center justify-center tect-white">
                <div className=" flex flex-col text-center">
                    <span className="text-blue-500 text-3xl font-bold">0</span>
                    <span className="text-xs text-gray-300 font-semibold">
                        Todays Earnings
                    </span>
                    <span className="text-xs text-gray-300 font-semibold">
                        (USDT)
                    </span>
                </div>
            </div>
            <div className=" flex items-center justify-center tect-white">
                <div className=" flex flex-col text-center">
                    <span className="text-blue-500 text-3xl font-bold">0</span>
                    <span className="text-xs text-gray-300 font-semibold">
                        Total Earnings
                    </span>
                    <span className="text-xs text-gray-300 font-semibold">
                        (USDT)
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ReferalEarnings;
