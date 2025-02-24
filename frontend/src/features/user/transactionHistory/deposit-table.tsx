import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { IoOptionsSharp } from "react-icons/io5";

function DepositTable() {
    const [data, setData] = useState(false);
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="border-b-2 flex-1 border-gray-500 pb-4">
                    <span className="cursor-pointer gen-line pb-2">
                        Deposit
                    </span>
                </div>
                <div>
                    <IoOptionsSharp className="text-2xl text-blue-600" />
                </div>
            </div>
            <table className="w-full flex flex-col gap-2 ">
                <thead className="">
                    <tr className="flex p-4 rounded-md justify-between bg-gray-800 text-sm ">
                        <th>Date & Time</th>
                        <th>Amount (USDT)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                {data ? (
                    <tbody className="space-y-1 ">
                        <tr className="flex justify-between bg-gray-700 rounded-md p-3 ">
                            <td>12 June</td>
                            <td>100</td>
                            <td>pending</td>
                        </tr>
                        <tr className="flex justify-between bg-gray-700 rounded-md p-3 ">
                            <td>12 June</td>
                            <td>100</td>
                            <td>pending</td>
                        </tr>
                    </tbody>
                ) : (
                    <div className=" min-h-[400px] flex flex-col gap-4 justify-center items-center ">
                        <MdOutlineFileCopy className="text-6xl text-gray-600" />
                        <p className="text-sm text-gray-500">
                            You do not have any data at the moment :{" "}
                        </p>
                    </div>
                )}
            </table>
        </div>
    );
}

export default DepositTable;
