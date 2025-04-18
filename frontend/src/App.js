import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router";
import { useNavigate } from "react-router-dom";
import AddLearningPlan from "./pages/LearningPlan/AddLearningPlan";
import AllLearningPlan from "./pages/LearningPlan/AllLearningPlan";
import UpdateLearningPlan from "./pages/LearningPlan/UpdateLearningPlan";
import UserLogin from "./Pages/UserManagement/UserLogin";
import UserRegister from "./Pages/UserManagement/UserRegister";
import UpdateUserProfile from "./Pages/UserManagement/UpdateUserProfile";
import AddAchievements from "./pages/AchievementsManagement/AddAchievements";
import AllAchievements from "./pages/AchievementsManagement/AllAchievements";
import UpdateAchievements from "./pages/AchievementsManagement/UpdateAchievements";
import UserProfile from "./Pages/UserManagement/UserProfile";
import MyAchievements from "./pages/AchievementsManagement/MyAchievements";
import GoogalUserPro from "./Pages/UserManagement/GoogalUserPro";
import MyLearningPlan from "./pages/LearningPlan/MyLearningPlan";
import NavBar from "./Components/NavBar/NavBar";
import AddNewPost from "./Pages/PostManagement/AddNewPost";
import AllPost from "./Pages/PostManagement/AllPost";
import UpdatePost from "./pages/PostManagement/UpdatePost";


function ProtectedRoute({ children }) {
  const userID = localStorage.getItem("userID");
  if (!userID) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === "/oauth2/success") {
      const params = new URLSearchParams(window.location.search);
      const userID = params.get("userID");
      const name = params.get("name");
      const googleProfileImage = decodeURIComponent(params.get("googleProfileImage")); // Decode the URL

      if (userID && name) {
        localStorage.setItem("userID", userID);
        localStorage.setItem("userType", "google");
        if (googleProfileImage) {
          localStorage.setItem("googleProfileImage", googleProfileImage); // Save decoded URL
        }
        navigate("/userProfile");
      } else {
        alert("Login failed. Missing user information.");
      }
    }
  }, [navigate]);

  return (
    <div>
      <React.Fragment>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />

          {/* Protected Routes with Navbar */}
          <Route
            path="/addLearningPlan"
            element={
              <ProtectedRoute>
                <AddLearningPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allLearningPlan"
            element={
              <ProtectedRoute>
                <AllLearningPlan />
              </ProtectedRoute>
            }
          />
           <Route
            path="/myLearningPlan"
            element={
              <ProtectedRoute>
                <MyLearningPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updateLearningPlan/:id"
            element={
              <ProtectedRoute>
                <UpdateLearningPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updateUserProfile/:id"
            element={
              <ProtectedRoute>
                <NavBar />
                <UpdateUserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userProfile"
            element={
              <ProtectedRoute>
                <NavBar />
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/googalUserPro"
            element={
              <ProtectedRoute>
                <NavBar />
                <GoogalUserPro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addAchievements"
            element={
              <ProtectedRoute>
                <AddAchievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allAchievements"
            element={
              <ProtectedRoute>
                <AllAchievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myAchievements"
            element={
              <ProtectedRoute>
                <MyAchievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updateAchievements/:id"
            element={
              <ProtectedRoute>
                <UpdateAchievements />
              </ProtectedRoute>
            }
          />
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;