import { RouterProvider } from "react-router-dom";
import "./App.css";
import { ReactQueryProvider } from "./Hooks/ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import routes from "./Routes/Routes";
import { useEffect, useState } from "react";
import LoaderSplash from "./Components/LoaderSplash";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 300); // Reduced from 1000ms
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <ToastContainer limit={2} />
      <ReactQueryProvider>
        {showSplash ? <LoaderSplash /> : <RouterProvider router={routes} />}
      </ReactQueryProvider>
    </>
  );
}

export default App;
