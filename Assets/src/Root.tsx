import { Outlet } from "react-router";
import { Navigation } from "./Navigation";

export const Root = () => {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
};
