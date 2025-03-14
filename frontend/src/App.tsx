import { useEffect } from "react";
import { initializeAuth } from "./utils/authenticator";
import Router from "./router/router";

function App() {
    useEffect(() => {
        // Initialize authentication from stored tokens
        initializeAuth();
    }, []);

    return (
        <>
            <Router />
        </>
    );
}

export default App;