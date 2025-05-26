import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // краще одразу імпортувати повний пакет
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SignUp from "./components/SignUp/SignUp";
import SignIn from "./components/SignIn/SignIn";
import UserWorkspaces from "./components/UserWorkspaces/UserWorkspaces";
import WorkspacePage from "./components/WorkspacePage/WorkspacePage";
import { Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import UserDetailsPage from "./components/UserProfilePage/UserProfilePage";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
        <Route path="sign-up" element={<><Header/><SignUp /></>} />
        <Route path="sign-in" element={<><Header/><SignIn /></>} />
        <Route path="workspaces" element={<><Header/><UserWorkspaces /></>} />
        <Route path="workspace/:id" element={<><Header/><WorkspacePage /></>} />
        <Route path="profile/:id" element={<><Header/><UserDetailsPage /></>} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
