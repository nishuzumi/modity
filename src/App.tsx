import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeContent from "@/components/CodeContent";
import { DevTools } from 'jotai-devtools'
import 'jotai-devtools/styles.css'
import ToolsBar from "./components/ToolsBar";
const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen justify-between bg-background">
      <Header />
      <ToolsBar />
      <div className="m-4 h-full bg-white border">
        <CodeContent />
      </div>
      <Footer />
      <DevTools />
    </div>
  );
};

export default App;
