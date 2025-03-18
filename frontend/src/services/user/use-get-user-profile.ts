import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/api";

interface IHandleResponse {
    current_level: number;
    id: number;
    is_profile_complete: boolean;
}

function handleDataInLocalStorage(data: IHandleResponse) {
    localStorage.setItem("user_id", data.id.toString());
    localStorage.setItem("current_level", data.current_level.toString());
    localStorage.setItem(
        "is_profile_complete",
        data.is_profile_complete.toString()
    );
}

async function getUserPRofile() {
    const userWalletAddress = localStorage.getItem("walletAddress");
    console.log(api.defaults.headers);
    const response = await api.get(
        `/api/profiles/by_wallet/?address=${userWalletAddress}`
    );
    handleDataInLocalStorage(response.data);
    return response.data;
}
export const useGetUserProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserPRofile,
    });
};
