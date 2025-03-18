import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

interface IHandleTransactionData {
    wallet_address: string;
    transaction_hash: string;
}

async function sendTransactionResult(data: IHandleTransactionData) {
    const response = await api.post("/api/upgrade", data);
    console.log("remaining levels signed transaction == >", response);
    return response;
}

export const useSubmitSignedTransactionRemainingLevels = () => {
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
