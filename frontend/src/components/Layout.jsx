import Navbar from "./Navbar";

// Wraps every protected page with the nav bar above and page content below
function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default Layout;
