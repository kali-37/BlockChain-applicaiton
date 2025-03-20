import { useState, useEffect } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { IoOptionsSharp } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useTransactionService, Transaction } from "../../../services/transaction-service";
import { format, subDays } from "date-fns";
import { FiFilter } from "react-icons/fi";
import { AiOutlineCalendar } from "react-icons/ai";

function TransactionTable() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const transactionService = useTransactionService();
    
    // Filter states
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<string>("ALL");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const user_id = localStorage.getItem('user_id');
                if (user_id) {
                    const data = await transactionService.getTransactionById(Number(user_id));
                    setTransactions(data);
                    setFilteredTransactions(data);
                }
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Apply filters to transactions
    useEffect(() => {
        let result = [...transactions];
        
        // Filter by transaction type
        if (typeFilter !== "ALL") {
            result = result.filter(tx => tx.transaction_type === typeFilter);
        }
        
        // Filter by status
        if (statusFilter !== "ALL") {
            result = result.filter(tx => tx.status === statusFilter);
        }
        
        // Filter by date
        if (dateFilter === "CUSTOM") {
            if (fromDate) {
                const fromDateTime = new Date(fromDate);
                result = result.filter(tx => new Date(tx.created_at) >= fromDateTime);
            }
            if (toDate) {
                const toDateTime = new Date(toDate);
                toDateTime.setHours(23, 59, 59, 999); // End of day
                result = result.filter(tx => new Date(tx.created_at) <= toDateTime);
            }
        } else if (dateFilter === "LAST_7_DAYS") {
            const sevenDaysAgo = subDays(new Date(), 7);
            result = result.filter(tx => new Date(tx.created_at) >= sevenDaysAgo);
        } else if (dateFilter === "LAST_30_DAYS") {
            const thirtyDaysAgo = subDays(new Date(), 30);
            result = result.filter(tx => new Date(tx.created_at) >= thirtyDaysAgo);
        }
        
        setFilteredTransactions(result);
    }, [transactions, typeFilter, statusFilter, dateFilter, fromDate, toDate]);

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    const closeDetails = () => {
        setSelectedTransaction(null);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const resetFilters = () => {
        setTypeFilter("ALL");
        setStatusFilter("ALL");
        setDateFilter("ALL");
        setFromDate("");
        setToDate("");
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm");
        } catch (e) {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "text-green-500";
            case "PENDING":
                return "text-yellow-500";
            case "FAILED":
                return "text-red-500";
            default:
                return "text-gray-400";
        }
    };

    const getTransactionTypeDisplay = (type: string) => {
        switch (type) {
            case "REGISTRATION":
                return "Registration";
            case "UPGRADE":
                return "Level Upgrade";
            case "REWARD":
                return "Reward";
            default:
                return type;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="border-b-2 flex-1 border-gray-500 pb-4">
                    <span className="cursor-pointer gen-line pb-2">
                        Transactions
                    </span>
                </div>
                <div>
                    <IoOptionsSharp 
                        className="text-2xl text-blue-600 cursor-pointer" 
                        onClick={toggleFilters}
                    />
                </div>
            </div>

            {/* Filter Section */}
            {showFilters && (
                <div className="bg-gray-800 rounded-lg p-4 animate-fadeIn space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center">
                            <FiFilter className="mr-2" /> Filters
                        </h3>
                        <button 
                            onClick={resetFilters}
                            className="text-xs bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded"
                        >
                            Reset Filters
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Transaction Type Filter */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Transaction Type</label>
                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white"
                            >
                                <option value="ALL">All Types</option>
                                <option value="REGISTRATION">Registration</option>
                                <option value="UPGRADE">Level Upgrade</option>
                                <option value="REWARD">Reward</option>
                            </select>
                        </div>
                        
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Status</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                        
                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Date Range</label>
                            <select 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white"
                            >
                                <option value="ALL">All Time</option>
                                <option value="LAST_7_DAYS">Last 7 Days</option>
                                <option value="LAST_30_DAYS">Last 30 Days</option>
                                <option value="CUSTOM">Custom Range</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Custom Date Range */}
                    {dateFilter === "CUSTOM" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1 flex items-center">
                                    <AiOutlineCalendar className="mr-1" /> From Date
                                </label>
                                <input 
                                    type="date" 
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1 flex items-center">
                                    <AiOutlineCalendar className="mr-1" /> To Date
                                </label>
                                <input 
                                    type="date" 
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedTransaction ? (
                <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Transaction Details</h3>
                        <button 
                            onClick={closeDetails}
                            className="text-gray-400 hover:text-white"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span>{getTransactionTypeDisplay(selectedTransaction.transaction_type)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Amount:</span>
                            <span>{selectedTransaction.amount} USDT</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Date:</span>
                            <span>{formatDate(selectedTransaction.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className={getStatusColor(selectedTransaction.status)}>
                                {selectedTransaction.status}
                            </span>
                        </div>
                        {selectedTransaction.level && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Level:</span>
                                <span>Level {selectedTransaction.level}</span>
                            </div>
                        )}
                        {selectedTransaction.transaction_hash && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Transaction Hash:</span>
                                <span className="truncate max-w-[150px]">
                                    {selectedTransaction.transaction_hash}
                                </span>
                            </div>
                        )}
                        {selectedTransaction.recipient_username && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Recipient:</span>
                                <span>{selectedTransaction.recipient_username}</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <table className="w-full flex flex-col gap-2">
                        <thead>
                            <tr className="flex p-4 rounded-md justify-between bg-gray-800 text-sm">
                                <th className="text-left w-1/4">Date</th>
                                <th className="text-center w-1/4">Type</th>
                                <th className="text-right w-1/4">Amount (USDT)</th>
                                <th className="text-right w-1/4">Status</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <tbody className="flex justify-center py-8">
                                <tr>
                                    <td>Loading transactions...</td>
                                </tr>
                            </tbody>
                        ) : filteredTransactions.length > 0 ? (
                            <tbody className="space-y-1">
                                {filteredTransactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="flex justify-between bg-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                                        onClick={() => handleTransactionClick(tx)}
                                    >
                                        <td className="text-left w-1/4">
                                            {formatDate(tx.created_at)}
                                        </td>
                                        <td className="text-center w-1/4">
                                            {getTransactionTypeDisplay(tx.transaction_type)}
                                        </td>
                                        <td className="text-right w-1/4">
                                            {tx.amount}
                                        </td>
                                        <td className={`text-right w-1/4 ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <div className="min-h-[300px] flex flex-col gap-4 justify-center items-center">
                                <MdOutlineFileCopy className="text-6xl text-gray-600" />
                                <p className="text-sm text-gray-500">
                                    {transactions.length > 0 
                                        ? "No transactions match your filters" 
                                        : "You do not have any transactions at the moment"}
                                </p>
                                {transactions.length > 0 && filteredTransactions.length === 0 && (
                                    <button 
                                        onClick={resetFilters}
                                        className="mt-2 bg-blue-700 hover:bg-blue-600 py-2 px-4 rounded text-sm"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </table>
                </>
            )}
            
            {/* Transaction Count */}
            {filteredTransactions.length > 0 && !selectedTransaction && (
                <div className="text-right text-xs text-gray-400 mt-2">
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
            )}
        </div>
    );
}

export default TransactionTable;