import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Performance from "./pages/Performance";
import Tasks from "./pages/Tasks";
import Quizzes from "./pages/Quizzes";
import ChatAI from "./pages/ChatAI";
import SalaIA from "./pages/SalaIA";
import Vocational from "./pages/Vocational";
import AugmentedReality from "./pages/AugmentedReality";
import SubjectSelection from "./pages/SubjectSelection";
import NotFound from "./pages/NotFound";
import { GameProvider } from "./context/GameContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GameProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/performance" element={<Performance />} />
            <Route path="/dashboard/tasks" element={<Tasks />} />
            <Route path="/dashboard/quizzes" element={<Quizzes />} />
            <Route path="/dashboard/chat" element={<ChatAI />} />
            <Route path="/dashboard/sala-ia" element={<SalaIA />} />
            <Route path="/dashboard/vocational" element={<Vocational />} />
            <Route path="/dashboard/ar" element={<AugmentedReality />} />
            <Route path="/dashboard/subjects" element={<SubjectSelection />} />
            <Route path="*" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
