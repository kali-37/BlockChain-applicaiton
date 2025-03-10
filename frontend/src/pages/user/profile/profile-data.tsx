function ProfileData() {
    return (
        <div>
            <form
                action=""
                className="grid grid-cols-1 gap-6 shadow-[0px_0px_20px_5px] shadow-blue-950 rounded-lg p-6 md:w-[800px] mx-auto overflow-x-hidden"
            >
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        Member ID
                    </label>
                    <input
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        type="number"
                        name=""
                        id=""
                    />
                </div>
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        DAPP Address
                    </label>
                    <input
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        type="text"
                        name=""
                        id=""
                    />
                </div>
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        Username <sup className="text-red-400">*</sup>
                    </label>
                    <input
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        type="text"
                        name=""
                        id=""
                    />
                </div>
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        Email Address <sup className="text-red-400">*</sup>
                    </label>
                    <input
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        type="email"
                        name=""
                        id=""
                    />
                </div>
                <div className=" flex flex-col gap-2 ">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        Mobile Number
                    </label>
                    <div className="text-gray-500 border-gray-400 border-2 rounded-md flex ">
                        <select
                            name=""
                            id=""
                            className="outline-none text-gray-300 bg-black  px-2 py-1"
                        >
                            <option value="+977">+977</option>
                            <option value="+93">+93</option>
                            <option value="+971">+971</option>
                        </select>
                        <input
                            type="number"
                            name=""
                            id=""
                            className="outline-none text-gray-300 bg-black  md:flex-1 py-1"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="bg-container py-4 flex justify-center hover:bg-blue-950 cursor-pointer">
                    <input type="submit" value="Update" className="" />
                </div>
            </form>
        </div>
    );
}

export default ProfileData;
