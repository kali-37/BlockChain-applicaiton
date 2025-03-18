// import { http } from "../../request/http";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/api";

async function getLevels() {
    const response = await api.get("/api/levels/");
    return response.data;
}

export const useGetAllLevels = () => {
    return useQuery({
        queryKey: ["levels"],
        queryFn: getLevels,
    });
};
