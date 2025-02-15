import ant from "../../../assets/img/ant.png";

function TotalAssets() {
    return (
        <div className="flex justify-between items-center p-6 bg-opacity-70 bg-blue-800 rounded-xl relative">
            <div>
                <p className="text-sm">Total Assets Balance</p>
                <div className="flex gap-2 items-center">
                    <span className="text-xl">0</span>
                    <span className="text-sm text-blue-300">USDT</span>
                </div>
            </div>
            <div className="h-[150px] w-[150px] absolute right-0">
                <img src={ant} alt="" className="h-full w-full" />
            </div>
        </div>
    );
}

export default TotalAssets;
