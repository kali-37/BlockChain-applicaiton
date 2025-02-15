function TeamMembers() {
    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-3">
                <p className="text-xl font-semibold">My Team Members</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Members</span>
                    <span className="text-sm text-gray-400">0 Members</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                        Total Earnings (USDT)
                    </span>
                    <span className="text-sm text-gray-400">0</span>
                </div>
            </div>
            <div className="grid grid-cols-2 space-x-4">
                <button className="border-2 py-4 rounded-xl border-gray-500 hover:bg-gray-600">
                    View Geneology
                </button>
                <button className="border-2 py-4 rounded-xl border-gray-500 hover:bg-gray-600">
                    View Earnings
                </button>
            </div>
        </div>
    );
}

export default TeamMembers;
