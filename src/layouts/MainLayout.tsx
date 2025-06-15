
import TabBar from "@/components/TabBar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    // Padding bottom on mobile to avoid content being hidden by the fixed tab bar.
    // On medium screens and up, the tab bar is hidden, so no padding is needed.
    <div className="pb-16 md:pb-0">
      <Outlet />
      <TabBar />
    </div>
  );
};

export default MainLayout;
