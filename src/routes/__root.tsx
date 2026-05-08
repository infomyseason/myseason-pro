import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import "@/styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
