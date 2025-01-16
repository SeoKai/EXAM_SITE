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

          // 초기 정답 상태 설정 (문제 번호를 키로 설정)
          const initialAnswers = {};
          combinedQuestions.forEach((question, index) => {
            initialAnswers[index + 1] = { selected: "", result: "", input: "" };
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
          data.questions.forEach((question, index) => {
            initialShowAnswers[index + 1] = false;
          });
          setShowAnswers(initialShowAnswers);
        });
    }
  }, [fileList, currentPage]);

  const handleCheckboxChange = (questionNumber, optionKey) => {
    setAnswers((prevAnswers) => {
      const question = allQuestions[questionNumber - 1]; // 번호로 문제 찾기
      const isCorrect = question.answer === optionKey;

      const updatedAnswers = {
        ...prevAnswers,
        [questionNumber]: {
          ...prevAnswers[questionNumber],
          selected: optionKey,
          result: isCorrect ? "O" : "X",
        },
      };
      console.log("Updated Answers:", updatedAnswers); // 체크할 때마다 출력
      return updatedAnswers;
    });
  };

  const handleInputChange = (questionNumber, value) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [questionNumber]: {
          ...prevAnswers[questionNumber],
          input: value,
          result: allQuestions[questionNumber - 1].answer === value ? "O" : "X",
        },
      };
      console.log("Updated Answers:", updatedAnswers); // 입력할 때마다 출력
      return updatedAnswers;
    });
  };



  const handleRestart = () => {
    const initialAnswers = {};
    allQuestions.forEach((question, index) => {
      initialAnswers[index + 1] = { selected: "", result: "", input: "" };
    });
    setAnswers(initialAnswers);
    setIsFinished(false);
    setCurrentPage(0);
    setShowAnswers({});
  };

  const toggleAnswerVisibility = (questionNumber) => {
    setShowAnswers((prevShowAnswers) => ({
      ...prevShowAnswers,
      [questionNumber]: !prevShowAnswers[questionNumber],
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
    const updatedAnswers = { ...answers };
    allQuestions.forEach((question, index) => {
      const questionNumber = index + 1;
      if (!updatedAnswers[questionNumber]?.selected && !updatedAnswers[questionNumber]?.input) {
        updatedAnswers[questionNumber] = {
          ...updatedAnswers[questionNumber],
          selected: "선택 안 함",
          input: "",
          result: "X",
        };
      }
    });
    setAnswers(updatedAnswers);
    setIsFinished(true);
  };

   return (
    <div className="App">
      <header>
        <h2>정보처리산업기사 과정평가형 기출예상 문제</h2>
      </header>
      <main>
        {!isFinished ? (
          <>
            <div>
              <h3>{currentFileName}</h3>
            </div>
            {questions.length > 0 ? (
              questions.map((question, index) => {
                const questionNumber = index + 1 + currentPage * questions.length; // 문제 번호 계산
                return (
                  <div key={questionNumber} className="question">
                    <p>
                      <strong>문제 {questionNumber}:</strong> {question.question}
                    </p>
                    {question.options ? (
                      <ul>
                        {question.options.map((option, index) => {
                          const optionKey = Object.keys(option)[0];
                          const optionValue = Object.values(option)[0];
                          return (
                            <li key={index}>
                              <label>
                                <input
                                  type="checkbox"
                                  name={`question-${questionNumber}`}
                                  value={optionKey}
                                  checked={
                                    answers[questionNumber]?.selected === optionKey
                                  }
                                  onChange={() =>
                                    handleCheckboxChange(questionNumber, optionKey)
                                  }
                                />
                                {optionValue}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <input
                        type="text"
                        value={answers[questionNumber]?.input || ""}
                        onChange={(e) =>
                          handleInputChange(questionNumber, e.target.value)
                        }
                        placeholder="답을 입력하세요"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <p>문제를 로딩 중...</p>
            )}
          </>
        ) : (
          <div>
            <h3>결과</h3>
            <p>전체 문항 수: {allQuestions.length}</p>
            <p>
              정답 수:{" "}
              {
                Object.values(answers).filter((ans) => ans.result === "O").length
              }
            </p>
            <p>
              오답 수:{" "}
              {
                Object.values(answers).filter((ans) => ans.result === "X").length
              }
            </p>
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
                {allQuestions
                  .filter((q, index) => answers[index + 1]?.result === "X") // 틀린 문제만 필터링
                  .map((question, index) => {
                    const questionNumber = index + 1;
                    const correctOptionKey = question.answer; // 정답 옵션 키
                    const correctOptionText = question.options
                      ? question.options.find(
                          (option) => Object.keys(option)[0] === correctOptionKey
                        )[correctOptionKey]
                      : question.answer;
                    const userOptionKey = answers[questionNumber]?.selected || "선택 안 함";
                    const userOptionText =
                      userOptionKey !== "선택 안 함"
                        ? question.options?.find(
                            (option) => Object.keys(option)[0] === userOptionKey
                          )?.[userOptionKey] || answers[questionNumber]?.input
                        : "선택 안 함";

                    return (
                      <tr key={questionNumber}>
                        <td>{questionNumber}</td>
                        <td>{question.question}</td>
                        <td>
                          {correctOptionKey} ({correctOptionText})
                        </td>
                        <td>{userOptionText}</td>
                      </tr>
                    );
                  })}
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
          <button onClick={handleRestart}>다시 시작</button>
        )}
      </footer>
    </div>
  );
}

export default App;
