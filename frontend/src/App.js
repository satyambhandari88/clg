// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import AdminLogin from './pages/AdminLogin';
// import TeacherLogin from './pages/TeacherLogin';
// import StudentLogin from './pages/StudentLogin';
// import AdminDashboard from './pages/AdminDashboard';
// import TeacherDashboard from './pages/TeacherDashboard';
// import StudentDashboard from './pages/StudentDashboard';
// import ProtectedRoute from './components/ProtectedRoute';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Login Pages */}
//         <Route path="/admin/login" element={<AdminLogin />} />
//         <Route path="/teacher/login" element={<TeacherLogin />} />
//         <Route path="/student/login" element={<StudentLogin />} />

//         {/* Dashboards */}
//         <Route
//           path="/admin/dashboard"
//           element={
//             <ProtectedRoute role="admin">
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/teacher/dashboard"
//           element={
//             <ProtectedRoute role="teacher">
//               <TeacherDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/student/dashboard"
//           element={
//             <ProtectedRoute role="student">
//               <StudentDashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AddStudent from './pages/AddStudent';
import AddTeacher from './pages/AddTeacher';
import AddClass from './pages/AddClass';
import AdminRegister from './pages/AdminRegister';
import HomePage from './pages/HomePage';
import AttendanceReport from './pages/AttendanceReport';


function App() {
  return (
    <Router>
      <Routes>


      <Route path="/" element={<HomePage />} />


      
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/reports" element={<AttendanceReport />} />
      



        {/* Login Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />

        {/* Dashboards */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />


        <Route path="/admin/add-student" element={<AddStudent />} />
        <Route path="/admin/add-teacher" element={<AddTeacher />} />
        <Route path="/admin/add-class" element={<AddClass />} />
        

      </Routes>
    </Router>
  );
}

export default App;

