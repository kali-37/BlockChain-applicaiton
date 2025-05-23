import { useEffect } from "react";
// import { initializeAuth } from "./utils/authenticator";
import Router from "./router/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { initializeAuth } from "./utils/authenticator";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    useEffect(() => {
        // Initialize authentication from stored tokens
        initializeAuth();
    }, []);

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <Router />
            </QueryClientProvider>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
            />
        </>
    );
}

export default App;
