import { IoSearch } from "react-icons/io5";

function SearchUser() {
    return (
        <div>
            <form action="">
                <div className="rounded-xl flex items-center bg-gray-800 overflow-hidden ">
                    <div className="p-4 ">
                        <IoSearch className="text-2xl" />
                    </div>
                    <input
                        type="text"
                        name=""
                        id=""
                        placeholder="Search User"
                        className="flex-1 outline-none text-gray-300 p-2 rounded-xl bg-gray-800"
                    />
                </div>
            </form>
            <div className="min-h-20"></div>
        </div>
    );
}

export default SearchUser;
