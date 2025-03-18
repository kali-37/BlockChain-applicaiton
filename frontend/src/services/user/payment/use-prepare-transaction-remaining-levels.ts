import { useMutation } from "@tanstack/react-query";
import { api } from "../../../utils/api";
import { toast } from "react-toastify";

interface IHandleTransaction {
    wallet_address: string;
}

async function prepareTransaction(data: IHandleTransaction) {
    console.log(data);
    const response = await api.post("/api/upgrade/", data);
    console.log("remaining level response ==> ", response);
    return response;
}

export const usePrepareTransactionForRemainingLevels = () => {
    return useMutation({
        mutationFn: prepareTransaction,
        onSuccess: () => {
            toast.success("Preparing for transaction");
        },
    });
};
