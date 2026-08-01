import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Enquiry from './pages/Enquiry/Enquiry';
import Trainers from './pages/Trainers/Trainers';
import Students from './pages/Students/Students';
import Attendance from './pages/Attendance/Attendance';
import StudentAttendanceDetails from './pages/Attendance/StudentAttendanceDetails';
import Payments from './pages/Payments/Payments';
import StudentPaymentDetails from './pages/Payments/StudentPaymentDetails';
import Income from './pages/Income/Income';

export default function App() {
  const location = useLocation();
  
  // Hide navbar only on the forgot-password page
  const hideNavbar = location.pathname === '/forgot-password';

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          {/* Add more protected routes here */}
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/students" element={<Students />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/student/:studentId" element={<StudentPaymentDetails />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/student/:studentId" element={<StudentAttendanceDetails />} />
          <Route path="/tests" element={<div className="p-8"><h1 className="text-4xl font-bold">Tests</h1></div>} />
          <Route path="/income" element={<Income />} />
          <Route path="/expense" element={<div className="p-8"><h1 className="text-4xl font-bold">Expense</h1></div>} />
        </Route>
      </Routes>
      <ToastContainer />
    </div>
  );
}