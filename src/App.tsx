import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { RequireAdmin } from "./components/auth/RequireAdmin"
import { RequireAuth } from "./components/auth/RequireAuth"
import { ScrollToTopFab } from "./components/ScrollToTopFab"
import { ScrollToTopOnRouteChange } from "./components/ScrollToTopOnRouteChange"
import { AddRacePage } from "./pages/add-race/AddRacePage"
import { AdminPage } from "./pages/admin/AdminPage"
import { ClubDetailPage } from "./pages/community/ClubDetailPage"
import { CommunityPage } from "./pages/community/CommunityPage"
import { ExplorePage } from "./pages/explore/ExplorePage"
import { HomePage } from "./pages/home/HomePage"
import { MyCalendarPage } from "./pages/my-calendar/MyCalendarPage"
import { ForgotPasswordPage } from "./pages/forgot-password/ForgotPasswordPage"
import { LoginPage } from "./pages/login/LoginPage"
import { ProfilePage } from "./pages/profile/ProfilePage"
import { RegisterPage } from "./pages/register/RegisterPage"
import { UpdatePasswordPage } from "./pages/update-password/UpdatePasswordPage"
import { RaceDetailPage } from "./pages/race-detail/RaceDetailPage"
import { SettingsPage } from "./pages/settings/SettingsPage"

function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnRouteChange />
      <ScrollToTopFab />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/add-race" element={<AddRacePage />} />
        <Route
          path="/my-calendar"
          element={
            <RequireAuth signInNotice="Sign in to view and manage your race calendar.">
              <MyCalendarPage />
            </RequireAuth>
          }
        />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/club-details/:clubId" element={<ClubDetailPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="/race/:raceId" element={<RaceDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App