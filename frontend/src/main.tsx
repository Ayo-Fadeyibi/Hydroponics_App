import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Root from "./routes/Root";
import Simulate from "./routes/Simulate";
import SimulateCropPage from "./routes/SimulateCropPage";
import DataPage from "./routes/DataPage";
import About from "./routes/About";

/** Paging routing components */
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/simulate",
        element: <SimulateCropPage />,
      },
      { path: "/simulate/:crop", element: <Simulate /> },
      { path: "/data", element: <DataPage /> },
      { path: "/about", element: <About /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
