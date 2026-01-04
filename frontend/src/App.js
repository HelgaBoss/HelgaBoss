import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import GoalDetail from "@/pages/GoalDetail";
import CalendarView from "@/pages/CalendarView";
import WeeklyReview from "@/pages/WeeklyReview";
import AuthCallback from "@/components/AuthCallback";

// Router component that checks for auth callback
function AppRouter() {
  const location = useLocation();
  
  // Check for session_id in URL fragment (auth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/goal/:id" element={<GoalDetail />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/weekly" element={<WeeklyReview />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <Toaster position="top-right" theme="dark" />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;
