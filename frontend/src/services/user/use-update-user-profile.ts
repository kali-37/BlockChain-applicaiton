import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

interface IFormInput {
    username: string;
    email: string;
}

async function updateUserProfile(data: IFormInput) {
    const user_id = localStorage.getItem("user_id");
    console.log(data);
    const response = await api.patch(`/api/profiles/${user_id}/`, data);
    console.log("patch response ==> ", response);
    return response;
}

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            navigate("/user/rank-status");
            toast.success("Your data is successfully updated ");
        },
    });
};
