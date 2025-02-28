import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";

function GenData() {
    const [data, setData] = useState(false);
    console.log(setData);
    return (
        <div>
            <table className="w-full flex flex-col gap-2 ">
                <thead className="">
                    <tr className="flex p-4 rounded-md justify-between bg-gray-800 ">
                        <th>Date & Time</th>
                        <th>Amount (USDT)</th>
                        <th>Rank</th>
                        <th>Status</th>
                    </tr>
                </thead>
                {data ? (
                    <tbody className="space-y-1 ">
                        <tr className="flex justify-between bg-gray-700 rounded-md p-3 ">
                            <td>12 June</td>
                            <td>100</td>
                            <td>1</td>
                            <td>pending</td>
                        </tr>
                        <tr className="flex justify-between bg-gray-700 rounded-md p-3 ">
                            <td>12 June</td>
                            <td>100</td>
                            <td>1</td>
                            <td>pending</td>
                        </tr>
                    </tbody>
                ) : (
                    ""
                )}
            </table>
            {data ? (
                ""
            ) : (
                <div className=" min-h-[400px] flex flex-col gap-4 justify-center items-center ">
                    <MdOutlineFileCopy className="text-6xl text-gray-600" />
                    <p className="text-sm text-gray-500">
                        You do not have any data at the moment :{" "}
                    </p>
                </div>
            )}
        </div>
    );
}

export default GenData;
