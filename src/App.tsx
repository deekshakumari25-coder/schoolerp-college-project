import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import type { Role } from '@/types/auth';

import AdminLayout from '@/components/AdminLayout';
import TeacherLayout from '@/components/TeacherLayout';
import StudentLayout from '@/components/StudentLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Classes from '@/pages/Classes';
import Timetable from '@/pages/Timetable';
import Exams from '@/pages/Exams';
import AdminTeachers from '@/pages/AdminTeachers';
import AdminSchool from '@/pages/AdminSchool';
import AdminAttendance from '@/pages/AdminAttendance';

import TeacherNoClass from '@/pages/teacher/TeacherNoClass';
import TeacherMyClass from '@/pages/teacher/TeacherMyClass';
import TeacherStudentDetail from '@/pages/teacher/TeacherStudentDetail';
import TeacherTimetable from '@/pages/teacher/TeacherTimetable';
import TeacherAttendance from '@/pages/teacher/TeacherAttendance';
import TeacherMarks from '@/pages/teacher/TeacherMarks';
import TeacherReportCards from '@/pages/teacher/TeacherReportCards';
import TeacherReportCardPage from '@/pages/teacher/TeacherReportCardPage';

import StudentHome from '@/pages/student/StudentHome';
import StudentTimetable from '@/pages/student/StudentTimetable';
import StudentMarks from '@/pages/student/StudentMarks';
import StudentReportCard from '@/pages/student/StudentReportCard';
import StudentAttendance from '@/pages/student/StudentAttendance';

function RoleRoute({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { token, user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        Loading…
      </div>
    );
  }
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function TeacherIndex() {
  const { user } = useContext(AuthContext);
  if (!user?.isClassTeacher) return <Navigate to="no-class" replace />;
  return <Navigate to="my-class" replace />;
}

function RequireClassTeacher({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  if (!user?.isClassTeacher) return <Navigate to="/teacher/no-class" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { token, user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        Loading…
      </div>
    );
  }
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'teacher')
    return <Navigate to={user.isClassTeacher ? '/teacher/my-class' : '/teacher/no-class'} replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/admin"
        element={
          <RoleRoute roles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="exams" element={<Exams />} />
        <Route path="school" element={<AdminSchool />} />
        <Route path="attendance" element={<AdminAttendance />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <RoleRoute roles={['teacher']}>
            <TeacherLayout />
          </RoleRoute>
        }
      >
        <Route index element={<TeacherIndex />} />
        <Route path="no-class" element={<TeacherNoClass />} />
        <Route
          path="my-class"
          element={
            <RequireClassTeacher>
              <TeacherMyClass />
            </RequireClassTeacher>
          }
        />
        <Route
          path="my-class/:studentId"
          element={
            <RequireClassTeacher>
              <TeacherStudentDetail />
            </RequireClassTeacher>
          }
        />
        <Route
          path="timetable"
          element={
            <RequireClassTeacher>
              <TeacherTimetable />
            </RequireClassTeacher>
          }
        />
        <Route
          path="attendance"
          element={
            <RequireClassTeacher>
              <TeacherAttendance />
            </RequireClassTeacher>
          }
        />
        <Route
          path="marks"
          element={
            <RequireClassTeacher>
              <TeacherMarks />
            </RequireClassTeacher>
          }
        />
        <Route
          path="report-cards"
          element={
            <RequireClassTeacher>
              <TeacherReportCards />
            </RequireClassTeacher>
          }
        />
        <Route
          path="report-cards/:studentId"
          element={
            <RequireClassTeacher>
              <TeacherReportCardPage />
            </RequireClassTeacher>
          }
        />
      </Route>

      <Route
        path="/student"
        element={
          <RoleRoute roles={['student']}>
            <StudentLayout />
          </RoleRoute>
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="marks" element={<StudentMarks />} />
        <Route path="report-card" element={<StudentReportCard />} />
        <Route path="attendance" element={<StudentAttendance />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
