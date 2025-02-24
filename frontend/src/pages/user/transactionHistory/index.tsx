import DepositTable from "../../../features/user/transactionHistory/deposit-table";
import Earning from "../../../features/user/transactionHistory/earning";

function TransactionHistory() {
    return (
        <div className="px-4 space-y-10 mt-4">
            <Earning />
            <DepositTable />
        </div>
    );
}

export default TransactionHistory;
