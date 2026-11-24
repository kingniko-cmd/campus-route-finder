import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { Dashboard } from "./components/Dashboard";
import { EditDistanceModal } from "./components/EditDistanceModal";
import { Header } from "./components/Header";
import { PathManagement } from "./components/PathManagement";
import { Sidebar } from "./components/Sidebar";
import { ToastViewport } from "./components/Toast";
import { AboutPage } from "./components/pages/AboutPage";
import { GraphPage } from "./components/pages/GraphPage";
import { RoutePage } from "./components/pages/RoutePage";

function CurrentPage() {
  const { page } = useApp();
  switch (page) {
    case "dashboard":
      return <Dashboard />;
    case "route":
      return <RoutePage />;
    case "graph":
      return <GraphPage />;
    case "paths":
      return <PathManagement />;
    case "about":
      return <AboutPage />;
  }
}

function Shell() {
  const { page } = useApp();
  return (
    <div className="flex h-full min-w-[1180px]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* key memicu animasi transisi setiap kali halaman berganti */}
          <div key={page} className="animate-page-in">
            <CurrentPage />
          </div>
        </main>
      </div>
      <EditDistanceModal />
      <ConfirmationModal />
      <ToastViewport />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ToastProvider>
  );
}
