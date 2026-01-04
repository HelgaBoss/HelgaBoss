import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import GoalDetail from "@/pages/GoalDetail";
import CalendarView from "@/pages/CalendarView";

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <Toaster position="top-right" theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goal/:id" element={<GoalDetail />} />
          <Route path="/calendar" element={<CalendarView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
