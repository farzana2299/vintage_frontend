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
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute;
