import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom"; // !!!!!!!!!! HashRouter 사용
import App from "./App";
import SummaryPage from "./SummaryPage"; // !!!!!!!!!! Summary 컴포넌트 import


function Path() {
    return (
      <Router>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/summary/:fileName" element={<SummaryPage />} /> {/* !!!!!!!!!! 요약 페이지 경로 추가 */}
        </Routes>
      </Router>
    );
  }
  
  export default Path;