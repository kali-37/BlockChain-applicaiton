import { Link } from "react-router";

function PaymentLayout() {
    return (
        <>
            <div className="grid grid-cols-1 font-light gap-2 px-4">
                <div className="flex justify-between items-center">
                    <p>Current Rank</p>
                    <p>Level 0</p>
                </div>
                <div className="flex justify-between items-center">
                    <p>Next Rank</p>
                    <p>Level 1</p>
                </div>
                <div className="flex justify-between items-center">
                    <p>Rank Price</p>
                    <p>100 USDT</p>
                </div>
                <div className="flex justify-between items-center">
                    <p>Rank Fee</p>
                    <p>20 USDT</p>
                </div>
            </div>
        </>
    );
}

function MakePayment() {
    return (
        <>
            <div className="space-y-8">
                <p className="text-center text-xl  font-semibold ">
                    Make Payment
                </p>
                <PaymentLayout />
                <div className="border border-gray-500"></div>
                <PaymentLayout />
                <div className="border border-gray-500"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    <a
                        // to={`/user/make-payment`}
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                    >
                        Approve
                    </a>
                    <Link
                        to={`/user/rank-status`}
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                    >
                        Back
                    </Link>
                </div>
            </div>
        </>
    );
}

export default MakePayment;
