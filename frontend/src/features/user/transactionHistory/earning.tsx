import ant from "../../../assets/img/ant.png";

function Earning() {
    return (
        <div>
            <div className="flex justify-between items-center p-6 bg-gradient-to-r shadow-md shadow-gray-800 from-blue-800/70 to-blue-800/10  rounded-xl relative">
                <div>
                    <p className="text-sm">Accumulated Earnings (USDT)</p>
                    <div className="flex gap-2 items-center">
                        <span className="text-xl">0</span>
                    </div>
                </div>
                <div className="h-[80px] w-[80px] p-3 absolute right-0">
                    <img src={ant} alt="" className="h-full w-full" />
                </div>
            </div>
        </div>
    );
}

export default Earning;
