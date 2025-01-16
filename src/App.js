import { useState, useEffect } from "react";
import "./App.scss";

function App() {
  const [allQuestions, setAllQuestions] = useState([]); // 모든 파일의 문제를 저장
  const [questions, setQuestions] = useState([]); // 현재 페이지의 문제
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [currentFileName, setCurrentFileName] = useState(""); // 현재 파일 이름 저장
  const [showAnswers, setShowAnswers] = useState({}); // 정답 표시 여부 관리
  const [isFinished, setIsFinished] = useState(false); // 종료 여부 상태 관리

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/dataset/file-list.json`)
      .then((response) => response.json())
      .then((files) => {
        setFileList(files);
        setCurrentPage(0);

        // 모든 파일의 데이터를 로드
        const fetchAllQuestions = files.map((file) =>
          fetch(`${process.env.PUBLIC_URL}/dataset/${file}`).then((response) =>
            response.json()
          )
        );

        Promise.all(fetchAllQuestions).then((results) => {
          const combinedQuestions = results.flatMap((result) => result.questions);
          setAllQuestions(combinedQuestions);

          // 초기 정답 상태 설정
          const initialAnswers = {};
          combinedQuestions.forEach((question) => {
            initialAnswers[question.id] = { selected: "", result: "" };
          });
          setAnswers(initialAnswers);
        });
      });
  }, []);

  useEffect(() => {
    if (fileList.length > 0) {
      const currentFile = fileList[currentPage];
      setCurrentFileName(currentFile.replace(".json", ""));

      fetch(`${process.env.PUBLIC_URL}/dataset/${currentFile}`)
        .then((response) => response.json())
        .then((data) => {
          setQuestions(data.questions);

          // 초기 정답 표시 상태 설정
          const initialShowAnswers = {};
          data.questions.forEach((question) => {
            initialShowAnswers[question.id] = false;
          });
          setShowAnswers(initialShowAnswers);
        });
    }
  }, [fileList, currentPage]);

  const handleCheckboxChange = (questionId, optionKey) => {
    setAnswers((prevAnswers) => {
      const question = allQuestions.find((q) => q.id === questionId);
      const isCorrect = question.answer === optionKey;

      return {
        ...prevAnswers,
        [questionId]: {
          selected: optionKey,
          result: isCorrect ? "O" : "X",
        },
      };
    });
  };

  const toggleAnswerVisibility = (questionId) => {
    setShowAnswers((prevShowAnswers) => ({
      ...prevShowAnswers,
      [questionId]: !prevShowAnswers[questionId],
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

  const handleFinish = () => {
    // 체크하지 않은 항목을 모두 오답으로 처리
    const updatedAnswers = { ...answers };
    allQuestions.forEach((question) => {
      if (!updatedAnswers[question.id]?.selected) {
        updatedAnswers[question.id] = {
          selected: "선택 안 함",
          result: "X",
        };
      }
    });
    setAnswers(updatedAnswers);
    setIsFinished(true);
  };

  const getResults = () => {
    const totalQuestions = allQuestions.length; // 전체 문항 수
    const totalCorrect = Object.values(answers).filter(
      (ans) => ans.result === "O"
    ).length; // 정답 수
    const totalIncorrect = totalQuestions - totalCorrect; // 오답 수

    const incorrectDetails = allQuestions
      .filter((q) => answers[q.id]?.result === "X")
      .map((q) => {
        const correctOptionKey = q.answer; // 정답 옵션 키 (a, b, c, d)
        const correctOptionText =
          q.options.find((option) => Object.keys(option)[0] === correctOptionKey)[
            correctOptionKey
          ]; // 정답 옵션의 텍스트
        const userOptionKey = answers[q.id]?.selected || "선택 안 함";
        const userOptionText =
          userOptionKey !== "선택 안 함"
            ? q.options.find((option) => Object.keys(option)[0] === userOptionKey)[
                userOptionKey
              ]
            : "선택 안 함";

        return {
          questionNumber: allQuestions.indexOf(q) + 1, // 문제 번호 추가
          question: q.question,
          correctAnswer: `${correctOptionKey} (${correctOptionText})`,
          userAnswer:
            userOptionKey === "선택 안 함"
              ? "선택 안 함"
              : `${userOptionKey} (${userOptionText})`,
        };
      });

    return { totalQuestions, totalCorrect, totalIncorrect, incorrectDetails };
  };

  const { totalQuestions, totalCorrect, totalIncorrect, incorrectDetails } = getResults();

  return (
    <div className="App">
      <header>헤더</header>
      <main>
        {!isFinished ? (
          <>
            <div>
              <h3>{currentFileName}</h3>
            </div>
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <div key={question.id} className="question">
                  <p>
                    <strong>
                      문제 {index + 1 + currentPage * questions.length}:
                    </strong>{" "}
                    {question.question}
                  </p>
                  <ul>
                    {question.options.map((option, index) => {
                      const optionKey = Object.keys(option)[0];
                      const optionValue = Object.values(option)[0];
                      return (
                        <li key={index}>
                          <label>
                            <input
                              type="checkbox"
                              name={`question-${question.id}`}
                              value={optionKey}
                              checked={
                                answers[question.id]?.selected === optionKey
                              }
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
          </>
        ) : (
          <div>
            <h3>결과</h3>
            <p>전체 문항 수: {totalQuestions}</p>
            <p>정답 수: {totalCorrect}</p>
            <p>오답 수: {totalIncorrect}</p>
            <h3>틀린 문제</h3>
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>문제</th>
                  <th>정답</th>
                  <th>내 답</th>
                </tr>
              </thead>
              <tbody>
                {incorrectDetails.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.questionNumber}</td> {/* 문제 번호 추가 */}
                    <td>{detail.question}</td>
                    <td>{detail.correctAnswer}</td>
                    <td>{detail.userAnswer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <footer>
        {!isFinished ? (
          <>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              이전 페이지
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === fileList.length - 1}
            >
              다음 페이지
            </button>
            <button onClick={handleFinish}>종료하기</button>
          </>
        ) : (
          <button onClick={() => window.location.reload()}>다시 시작</button>
        )}
      </footer>
    </div>
  );
}

export default App;
