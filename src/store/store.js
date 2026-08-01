
import { configureStore } from '@reduxjs/toolkit';
import loginReducer from '../pages/Login/Login.slice';
import forgotPasswordReducer from '../pages/ForgotPassword/ForgotPassword.slice';
import enquiryReducer from '../pages/Enquiry/Enquiry.slice';
import trainerReducer from '../pages/Trainers/Trainer.slice';
import studentReducer from '../pages/Students/Student.slice';
import attendanceReducer from '../pages/Attendance/Attendance.slice';
import paymentReducer from '../pages/Payments/Payment.slice';
import incomeReducer from '../pages/Income/Income.slice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    forgotPassword: forgotPasswordReducer,
    enquiry: enquiryReducer,
    trainer: trainerReducer,
    student: studentReducer,
    attendance: attendanceReducer,
    payment: paymentReducer,
    income: incomeReducer,
  },
});
