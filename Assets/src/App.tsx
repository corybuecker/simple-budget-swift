import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { Root } from "./Root";
import { DashboardPage } from "./pages/Dashboard";
import { AccountsPage } from "./pages/Accounts";
import { SavingsPage } from "./pages/Savings";
import { GoalsPage } from "./pages/Goals";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [DashboardPage, AccountsPage, SavingsPage, GoalsPage],
  },
]);

const mainElements = document.getElementsByTagName("main");
const mainElement = mainElements[0];

if (mainElement) {
  const root = createRoot(mainElement);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
