import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    children: ReactNode;
    handleWallet: () => void;
}

function Modal({ children, handleWallet }: ModalProps) {
    return createPortal(
        <>
            <div
                onClick={handleWallet}
                className="h-full w-full fixed bg-black bg-opacity-60 top-0 left-0 z-[150]"
            ></div>
            <div className="absolute z-[155] top-[30%] md:top-[25%] left-[50%] -translate-x-1/2 text-white ">
                {children}
            </div>
        </>,
        document.getElementById("modal")!
    );
}

export default Modal;
