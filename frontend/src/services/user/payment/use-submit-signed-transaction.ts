import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

interface IHandleTransactionData {
    wallet_address: string;
    signed_transaction: string;
}

async function sendTransactionResult(data: IHandleTransactionData) {
    console.log("praakash");
    const response = await api.post("/api/register/", data);
    console.log(response);
    return response;
}

export const useSubmitSignedTransaction = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: sendTransactionResult,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            navigate("/user/rank-status");
            toast.success(
                "Transaction completed. You level is upgraded successfully."
            );
        },
    });
};
