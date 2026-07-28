import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import Sidebar from "./Sidebar";

const ProtectedRoute = () => {
  const token = useAppSelector((state) => state.login.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[rgba(255,252,245,0.5)]">
      <Sidebar />
      <main className="flex-1 pt-16 transition-all duration-300 lg:ml-64 lg:pt-6">
        <div className="mx-auto w-full max-w-[1600px] pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute;
