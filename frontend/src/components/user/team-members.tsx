function TeamMembers() {
    return (
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
    );
}

export default TeamMembers;
