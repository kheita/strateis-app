import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CommandPaletteProvider } from "./contexts/CommandPaletteContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { CommandPalette } from "./components/palette/CommandPalette";
import { LoginPage } from "./pages/LoginPage";
import { ModulePlaceholder } from "./pages/ModulePlaceholder";
import { SettingsPage } from "./pages/SettingsPage";
import { IntelligenceDashboardPage } from "./pages/IntelligenceDashboardPage";
import { ALL_MODULES } from "./config/navigation";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <CommandPaletteProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/intelligence/dashboard" replace />} />
                <Route path="/intelligence/dashboard" element={<IntelligenceDashboardPage />} />
                {ALL_MODULES.filter((m) => m.id !== "dashboard").map((m) => (
                  <Route
                    key={m.id}
                    path={m.path}
                    element={<ModulePlaceholder moduleId={m.id} />}
                  />
                ))}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/intelligence/dashboard" replace />} />
              </Route>
            </Routes>
            <CommandPalette />
          </CommandPaletteProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
