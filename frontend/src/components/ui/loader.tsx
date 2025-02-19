import { CSSProperties } from "react";
import PropagateLoader from "react-spinners/PropagateLoader";

const override: CSSProperties = {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50% , -50%)",
};

function Loading() {
    return (
        <>
            <PropagateLoader color="#274abc" size={25} cssOverride={override} />
        </>
    );
}

export default Loading;
