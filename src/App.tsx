
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Alarms from "./pages/Alarms";
import Gallery from "./pages/Gallery";
import More from "./pages/More";
import NotFound from "./pages/NotFound";
import BottomNavigation from "./components/BottomNavigation";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen pb-16">
              <Routes>
                <Route path="/" element={<Tasks />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/alarms" element={<Alarms />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/more" element={<More />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNavigation />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
