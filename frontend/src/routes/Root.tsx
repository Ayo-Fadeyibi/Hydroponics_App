import { Outlet } from "react-router-dom";
import NavBar from "../layoutcomponents/NavBar";
import Footer from "../layoutcomponents/Footer";

/**
 * Root Component that handles the main page layout, outlets encapsulated by NavBar and Footer
 */
export default function Root() {
  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  );
}
