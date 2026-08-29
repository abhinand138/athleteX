import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3500,
          style: {
            background: "#0e1014",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(16px)",
            borderRadius: "16px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "0.02em",
          },
          success: {
            iconTheme: {
              primary: "#ee9b74",
              secondary: "#0e1014",
            },
            style: {
              borderColor: "rgba(238, 155, 116, 0.4)",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#0e1014",
            },
            style: {
              borderColor: "rgba(248, 113, 113, 0.4)",
            },
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;