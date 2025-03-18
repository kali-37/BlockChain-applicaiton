import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGetUserProfile } from "../../../services/user/use-get-user-profile";
import { useUpdateUserProfile } from "../../../services/user/use-update-user-profile";

const schema = yup
    .object({
        username: yup.string().required("User name is required"),
        email: yup.string().email().required("email is required"),
        // phoneNujmber: yup.number(),
    })
    .required();

interface IFormInput {
    username: string;
    email: string;
}

function ProfileData() {
    const { data } = useGetUserProfile();
    console.log("user profile data => ", data);

    const { mutate } = useUpdateUserProfile();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        console.log(data);
        mutate(data);
    };

    return (
        <div>
            <form
                action=""
                className="grid grid-cols-1 gap-6 shadow-[0px_0px_20px_5px] shadow-blue-950 rounded-lg p-6 md:w-[800px] mx-auto overflow-x-hidden"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        User Wallet
                    </label>
                    <input
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        type="text"
                        name=""
                        id=""
                        value={data?.wallet_address || ""}
                        readOnly
                    />
                </div>
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        Referrer
                    </label>
                    <input
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        type="text"
                        name=""
                        id=""
                        value={data?.referrer_username || ""}
                        readOnly
                    />
                </div>
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        Username <sup className="text-red-400">*</sup>
                    </label>
                    <input
                        {...register("username")}
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        defaultValue={data?.username || ""}
                    />
                    {errors?.username ? (
                        <p className="text-red-500">
                            {String(errors?.username?.message)}
                        </p>
                    ) : (
                        ""
                    )}
                </div>
                <div className=" flex flex-col gap-2">
                    <label className="text-gray-400 font-semibold" htmlFor="">
                        Email Address <sup className="text-red-400">*</sup>
                    </label>
                    <input
                        className="outline-none text-gray-300 bg-black border-gray-400 border rounded-md px-2 py-1"
                        {...register("email")}
                        defaultValue={data?.email || ""}
                    />
                    {errors?.email ? (
                        <p className="text-red-500">
                            {String(errors?.email?.message)}
                        </p>
                    ) : (
                        ""
                    )}
                </div>
                {/* <div className=" flex flex-col gap-2 ">
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
                </div> */}

                {/* <div className="bg-container py-4 flex justify-center hover:bg-blue-950 cursor-pointer"> */}
                <input
                    type="submit"
                    value="Update"
                    className="bg-container py-4 flex justify-center hover:bg-blue-950 cursor-pointer"
                />
                {/* </div> */}
            </form>
        </div>
    );
}

export default ProfileData;
