import { useState, useEffect } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { IoOptionsSharp } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useTransactionService, Transaction } from "../../../services/transaction-service"
import { format } from "date-fns";

function TransactionTable() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const transactionService = useTransactionService();

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const user_id = localStorage.getItem('user_id');
                if (user_id){
                const data = await transactionService.getTransactionById(Number(user_id));
                setTransactions(data);
                }
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    const closeDetails = () => {
        setSelectedTransaction(null);
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

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="border-b-2 flex-1 border-gray-500 pb-4">
                    <span className="cursor-pointer gen-line pb-2">
                        Transactions
                    </span>
                </div>
                <div>
                    <IoOptionsSharp className="text-2xl text-blue-600" />
                </div>
            </div>

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
                            <span>{selectedTransaction.transaction_type}</span>
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
                                <th className="text-left">Date</th>
                                <th className="text-right">Amount (USDT)</th>
                                <th className="text-right">Status</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <tbody className="flex justify-center py-8">
                                <tr>
                                    <td>Loading transactions...</td>
                                </tr>
                            </tbody>
                        ) : transactions.length > 0 ? (
                            <tbody className="space-y-1">
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="flex justify-between bg-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                                        onClick={() => handleTransactionClick(tx)}
                                    >
                                        <td className="text-left">
                                            {formatDate(tx.created_at)}
                                        </td>
                                        <td className="text-right">{tx.amount}</td>
                                        <td className={`text-right ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <div className="min-h-[300px] flex flex-col gap-4 justify-center items-center">
                                <MdOutlineFileCopy className="text-6xl text-gray-600" />
                                <p className="text-sm text-gray-500">
                                    You do not have any transactions at the moment
                                </p>
                            </div>
                        )}
                    </table>
                </>
            )}
        </div>
    );
}

export default TransactionTable;