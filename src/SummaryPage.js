import "./Summary.scss"
import React from "react";
import { useParams } from "react-router-dom"; // !!!!!!!!!! useParams import


const SummaryPage = () => {

    const { fileName } = useParams(); // !!!!!!!!!! 파일 이름을 URL에서 추출
    return (
        <div className="summary-block">
             <h2>{fileName.replace(".json", "")} 요약 내용</h2>
             <p>여기에 {fileName}의 요약 내용을 표시합니다.</p>
        </div>
    )
}


export default SummaryPage;
