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
import Vocational from "./pages/Vocational";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          <Route path="/dashboard/vocational" element={<Vocational />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
