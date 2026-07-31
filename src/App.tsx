import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Agents from '@/pages/Agents'
import Teams from '@/pages/Teams'
import Conversations from '@/pages/Conversations'
import Goals from '@/pages/Goals'
import Feedback from '@/pages/Feedback'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/conversations" element={<Conversations />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/feedback" element={<Feedback />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
