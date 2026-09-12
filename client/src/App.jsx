import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Payments from "./pages/Payments";
import Emergency from "./pages/Emergency";
import Laboratory from "./pages/Laboratory";
import MedicalRecords from "./pages/MedicalRecords";
import Medicines from "./pages/Medicines";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ConfirmDialogHost from "./components/ConfirmDialog";


/*
==================================================
GET CURRENT USER
==================================================
*/

const getCurrentUser = () => {

  try {

    const user =
      localStorage.getItem("user");


    if (!user) {

      return null;

    }


    return JSON.parse(user);

  } catch (error) {

    console.error(
      "Failed to read logged-in user:",
      error
    );

    return null;

  }

};


/*
==================================================
PROTECTED ROUTE
==================================================
*/

function ProtectedRoute() {

  const token =
    localStorage.getItem("token");

  const user =
    getCurrentUser();


  if (!token || !user) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  return <Outlet />;

}


/*
==================================================
ADMIN ROUTE
==================================================
*/

function AdminRoute() {

  const token =
    localStorage.getItem("token");

  const user =
    getCurrentUser();


  if (!token || !user) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  if (user.role !== "admin") {

    return (

      <Navigate
        to="/dashboard"
        replace
      />

    );

  }


  return <Outlet />;

}


/*
==================================================
APP
==================================================
*/

function App() {

  return (

    <>
      <ConfirmDialogHost />
      <Routes>


      {/* ======================================
          AUTHENTICATION
      ====================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      <Route
        path="/login"
        element={<Login />}
      />


      <Route
        path="/register"
        element={<Register />}
      />


      {/* ======================================
          PROTECTED APPLICATION
      ====================================== */}

      <Route element={<ProtectedRoute />}>


        {/* ==================================
            MAIN APPLICATION LAYOUT
        ================================== */}

        <Route element={<Layout />}>


          {/* ==================================
              DASHBOARD
          ================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* ==================================
              PROFILE
          ================================== */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* ==================================
              ACCOUNT SETTINGS
          ================================== */}

          <Route
            path="/settings"
            element={<Settings />}
          />


          {/* ==================================
              PATIENTS
          ================================== */}

          <Route
            path="/patients"
            element={<Patients />}
          />


          {/* ==================================
              DOCTORS
          ================================== */}

          <Route
            path="/doctors"
            element={<Doctors />}
          />


          {/* ==================================
              APPOINTMENTS
          ================================== */}

          <Route
            path="/appointments"
            element={<Appointments />}
          />


          {/* ==================================
              BILLING
          ================================== */}

          <Route
            path="/billing"
            element={<Billing />}
          />
          {/* ==================================
    PAYMENTS
================================== */}

          <Route
            path="/payments"
            element={<Payments />}
          />

          {/* ==================================
              LABORATORY
          ================================== */}

          <Route
            path="/laboratory"
            element={<Laboratory />}
          />


          {/* ==================================
              MEDICAL RECORDS
          ================================== */}

          <Route
            path="/medical-records"
            element={<MedicalRecords />}
          />


          {/* ==================================
              MEDICINES
          ================================== */}

          <Route
            path="/medicines"
            element={<Medicines />}
          />


          {/* ==================================
              EMERGENCY
          ================================== */}

          <Route
            path="/emergency"
            element={<Emergency />}
          />


          {/* ==================================
              ADMIN ONLY
          ================================== */}

          <Route element={<AdminRoute />}>


            <Route
              path="/users"
              element={<Users />}
            />


          </Route>


        </Route>

      </Route>


      {/* ======================================
          UNKNOWN ROUTE
      ====================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      </Routes>
    </>

  );

}


export default App;