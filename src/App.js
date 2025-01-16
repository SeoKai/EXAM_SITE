import { useState, useEffect } from "react";
import "./App.scss";

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [showAnswers, setShowAnswers] = useState({}); // 정답 표시 여부 관리

  useEffect(() => {
    // '/dataset' 디렉토리에서 파일 목록을 가져옵니다.
    fetch("/dataset/file-list.json")
      .then((response) => response.json())
      .then((files) => {
        setFileList(files); // 파일 목록을 저장
        setCurrentPage(0); // 첫 번째 페이지로 설정
      });
  }, []);

  useEffect(() => {
    if (fileList.length > 0) {
      // 현재 페이지의 JSON 파일 로드
      fetch(`/dataset/${fileList[currentPage]}`)
        .then((response) => response.json())
        .then((data) => {
          setQuestions(data.questions);

          // 초기 정답 상태 및 표시 상태 설정
          const initialAnswers = {};
          const initialShowAnswers = {};
          data.questions.forEach((question) => {
            initialAnswers[question.id] = { selected: "", result: "" };
            initialShowAnswers[question.id] = false; // 정답 표시 여부 초기화
          });
          setAnswers(initialAnswers);
          setShowAnswers(initialShowAnswers);
        });
    }
  }, [fileList, currentPage]);

  const handleCheckboxChange = (questionId, optionKey) => {
    setAnswers((prevAnswers) => {
      const question = questions.find((q) => q.id === questionId);
      const isCorrect = question.answer === optionKey; // 정답 여부 확인

      const updatedAnswers = {
        ...prevAnswers,
        [questionId]: {
          selected: optionKey,
          result: isCorrect ? "O" : "X",
        },
      };

      console.log("현재 체크된 상태:", updatedAnswers);
      return updatedAnswers;
    });
  };

  const toggleAnswerVisibility = (questionId) => {
    setShowAnswers((prevShowAnswers) => ({
      ...prevShowAnswers,
      [questionId]: !prevShowAnswers[questionId], // 표시 상태를 토글
    }));
  };

  const handleNextPage = () => {
    if (currentPage < fileList.length - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      alert("마지막 페이지입니다.");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="App">
      <header>헤더</header>
      <main>
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div key={question.id} className="question">
              <p>
                <strong>문제 {index + 1}:</strong> {question.question}
              </p>
              <ul>
                {question.options.map((option, index) => {
                  const optionKey = Object.keys(option)[0]; // a, b, c, d 중 하나
                  const optionValue = Object.values(option)[0]; // 옵션의 실제 값
                  return (
                    <li key={index}>
                      <label>
                        <input
                          type="checkbox"
                          name={`question-${question.id}`}
                          value={optionKey}
                          checked={answers[question.id]?.selected === optionKey}
                          onChange={() =>
                            handleCheckboxChange(question.id, optionKey)
                          }
                        />
                        {optionValue}
                      </label>
                    </li>
                  );
                })}
              </ul>
              {/* 정답 여부 숨기고 버튼으로 표시 */}
              <button onClick={() => toggleAnswerVisibility(question.id)}>
                {showAnswers[question.id] ? "숨기기" : "정답 확인"}
              </button>
              {showAnswers[question.id] && (
                <p>
                  정답 여부: <strong>{answers[question.id]?.result}</strong>
                </p>
              )}
            </div>
          ))
        ) : (
          <p>문제를 로딩 중...</p>
        )}
      </main>
      <footer>
        <button onClick={handlePreviousPage} disabled={currentPage === 0}>
          이전 페이지
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === fileList.length - 1}
        >
          다음 페이지
        </button>
      </footer>
    </div>
  );
}

export default App;
