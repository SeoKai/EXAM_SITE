import { useState, useEffect } from 'react';
import './App.scss';
import React from 'react';
import {
  HashRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'; // HashRouter와 useNavigate 가져오기

import SummaryPage from './SummaryPage.js';

function App() {
  const [allQuestions, setAllQuestions] = useState([]); // 모든 파일의 문제를 저장
  const [questions, setQuestions] = useState([]); // 현재 페이지의 문제
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [currentFileName, setCurrentFileName] = useState('전체'); // 현재 파일 이름 저장
  const [showAnswers, setShowAnswers] = useState({}); // 정답 표시 여부 관리
  const [isFinished, setIsFinished] = useState(false); // 종료 여부 상태 관리
  const [selectedFiles, setSelectedFiles] = useState([]); // 선택된 파일 목록
  const QUESTIONS_PER_PAGE = 10; // 한 페이지당 보여줄 문제 수
  const [version, setVersion] = useState('VERSION 2.0');

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/dataset/file-list.json`)
      .then((response) => response.json())
      .then((files) => {
        setFileList(files);
        setSelectedFiles(files); // 기본값으로 전체 파일 선택
      });
  }, []);

  // 번호별로 파일 그룹화
  const groupedFiles = fileList.reduce((acc, file) => {
    const groupKey = file.split('_')[0]; // "1_" 또는 "2_" 등 그룹 키 추출
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(file);
    return acc;
  }, {});
  // 그룹 체크박스 핸들러
  const handleGroupCheckboxChange = (groupKey, isSelected) => {
    const groupFiles = groupedFiles[groupKey];
    if (isSelected) {
      // 그룹 전체 선택
      setSelectedFiles((prev) => [...new Set([...prev, ...groupFiles])]);
    } else {
      // 그룹 전체 선택 해제
      setSelectedFiles((prev) =>
        prev.filter((file) => !groupFiles.includes(file))
      );
    }
  };

  const shuffleArray = (array) => {
    if (!Array.isArray(array)) {
      console.warn('shuffleArray: Provided argument is not an array', array);
      return []; // 비정상적인 경우 빈 배열 반환
    }
    return array
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  };

  const loadQuestionsFromFiles = () => {
    const fetchQuestions = selectedFiles.map((file) =>
      fetch(`${process.env.PUBLIC_URL}/dataset/${file}`)
        .then((response) => response.json())
        .catch((error) => {
          console.error(`Error loading file ${file}:`, error);
          return { questions: [] }; // 에러 발생 시 빈 배열 반환
        })
    );

    Promise.all(fetchQuestions).then((results) => {
      let allQuestions = results.flatMap((result) => result.questions);

      // 문제의 옵션을 섞는 로직 추가
      allQuestions = allQuestions.map((question) => {
        // ✅ 주관식 문제 예외 처리 (options가 없는 경우)
        if (!Array.isArray(question.options)) {
          return question; // 주관식 문제는 그대로 반환
        }

        const shuffledOptions = shuffleArray(question.options);

        // 기존 정답 키 찾기
        const correctOption = shuffledOptions.find(
          (option) => Object.keys(option)[0] === question.answer
        );

        if (!correctOption) {
          console.error(`Error:${question.question}`);
          return question; // 오류 발생 시 원본 문제 반환
        }

        const newAnswerKey = Object.keys(correctOption)[0];

        return {
          ...question,
          options: shuffledOptions,
          answer: newAnswerKey, // 정답 위치 업데이트
        };
      });

      setQuestions(allQuestions);

      // 초기 정답 상태 설정
      const initialAnswers = {};
      allQuestions.forEach((_, index) => {
        initialAnswers[index + 1] = { selected: '', result: '', input: '' };
      });
      setAnswers(initialAnswers);
      setShowAnswers({});
      setCurrentPage(0);
      setIsFinished(false);
    });
  };

  const handleFileSelection = (fileName) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileName)) {
        return prev.filter((file) => file !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  const retryIncorrectQuestions = () => {
    // 오답만 필터링하여 새로운 문제 목록으로 설정
    let incorrectQuestions = questions.filter((_, index) => {
      return answers[index + 1]?.result === 'X';
    });

    if (incorrectQuestions.length === 0) {
      alert('틀린 문제가 없습니다.');
      return;
    }

    // 틀린 문제들의 선택지를 다시 섞음
    incorrectQuestions = incorrectQuestions.map((question) => {
      if (!Array.isArray(question.options)) {
        console.error(`Error: 문제 구조가 올바르지 않습니다.`, question);
        return question;
      }

      const shuffledOptions = shuffleArray(question.options);

      // 기존 정답 키 찾기
      const correctOption = shuffledOptions.find(
        (option) => Object.keys(option)[0] === question.answer
      );

      if (!correctOption) {
        console.error(`Error: ${question.question}`);
        return question;
      }

      const newAnswerKey = Object.keys(correctOption)[0];

      return {
        ...question,
        options: shuffledOptions,
        answer: newAnswerKey, // 정답 위치 업데이트
      };
    });

    setQuestions(incorrectQuestions);

    // 초기 정답 상태로 재설정
    const newAnswers = {};
    incorrectQuestions.forEach((_, index) => {
      newAnswers[index + 1] = { selected: '', result: '', input: '' };
    });

    setAnswers(newAnswers);
    setShowAnswers({});
    setCurrentPage(0);
    setIsFinished(false);
  };

  const handleSelectAll = () => {
    setSelectedFiles(fileList);
  };

  const handleDeselectAll = () => {
    setSelectedFiles([]);
  };

  const handleSelectWithKeyword = (keyword) => {
    setSelectedFiles(fileList.filter((file) => file.includes(keyword)));
  };

  const handleDeselectWithKeyword = (keyword) => {
    setSelectedFiles((prev) => prev.filter((file) => !file.includes(keyword)));
  };

  const handleSelectByNumber = (number) => {
    const regex = new RegExp(`^${number}_`);
    setSelectedFiles(fileList.filter((file) => regex.test(file)));
  };

  const handleCheckboxChange = (questionNumber, optionKey) => {
    setAnswers((prevAnswers) => {
      const question = questions[questionNumber - 1];
      const isCorrect = question.answer === optionKey;

      const updatedAnswers = {
        ...prevAnswers,
        [questionNumber]: {
          ...prevAnswers[questionNumber],
          selected: optionKey,
          result: isCorrect ? 'O' : 'X',
        },
      };
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
          result: questions[questionNumber - 1].answer === value ? 'O' : 'X',
        },
      };
      return updatedAnswers;
    });
  };

  const handleRestart = () => {
    setQuestions([]);
    setAnswers({});
    setIsFinished(false);
    setShowAnswers({});
    setSelectedFiles(fileList);
    setCurrentFileName('전체');
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
      alert('마지막 페이지입니다.');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleFinish = () => {
    const updatedAnswers = { ...answers };
    questions.forEach((_, index) => {
      const questionNumber = index + 1;
      if (
        !updatedAnswers[questionNumber]?.selected &&
        !updatedAnswers[questionNumber]?.input
      ) {
        updatedAnswers[questionNumber] = {
          ...updatedAnswers[questionNumber],
          selected: '선택 안 함',
          input: '',
          result: 'X',
        };
      }
    });
    setAnswers(updatedAnswers);
    setIsFinished(true);
  };

  const getCurrentPageQuestions = () => {
    const start = currentPage * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return questions.slice(start, end);
  };

  const navigateToSummary = (fileName) => {
    // !!!!!!!!!! 요약 페이지로 이동하는 함수 추가
    setCurrentFileName(fileName.replace('.json', ''));
    navigate(`/summary/${fileName}`); // !!!!!!!!!! 라우팅 경로 설정
  };

  return (
    <div className="App">
      <header>
        <h2>정보처리산업기사 과정평가형 기출예상 문제</h2>
        <div className="copyright">
          Developed by Jung Woo Gyun, Seo Kai 2025. | {version} <br />
          Email : jwg8910@naver.com | Kakao : jwg1323 (선호) <br />
          정리된 자료주시면 문제에 반영하겠습니다
          <br />
        </div>
        <div style={{ fontSize: '1rem' }}>
          문제유형 |
          <span style={{ fontSize: '.7rem' }}>
            &nbsp;&nbsp;4지선다형 (O)&nbsp;&nbsp;
          </span>
          |
          <span style={{ fontSize: '.7rem' }}>
            &nbsp;&nbsp;빈칸문제_주관식 (O)&nbsp;&nbsp;
          </span>
          {/* <span style={{ fontSize: '.7rem' }}>
            &nbsp;&nbsp;OX문제 (예정)&nbsp;&nbsp;
          </span> */}
          |
        </div>
      </header>

      <main>
        {!questions.length ? (
          <div className="module_index">
            <h3>시험 모듈_목차 선택</h3>
            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => {
                    if (e.target.checked) handleSelectAll();
                    else handleDeselectAll();
                  }}
                />
                전체 선택
              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) handleSelectWithKeyword('빈칸');
                    else handleDeselectWithKeyword('빈칸');
                  }}
                />
                빈칸 문제
              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) handleSelectWithKeyword('4지선다');
                    else handleDeselectWithKeyword('4지선다');
                  }}
                />
                객관식 문제
              </label>
            </div>

            {/*  */}
            <div>
              <table className="module-table">
                <thead>
                  <tr>
                    <th
                      colSpan="3"
                      style={{ textAlign: 'center', fontSize: '1.3rem' }}
                    >
                      정보처리산업기사 과정평가형 필기 모듈 문제
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(groupedFiles).map(([groupKey, files]) => (
                    <React.Fragment key={groupKey}>
                      {/* 그룹 행 */}
                      <tr>
                        <td colSpan="3" className="module-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={files.every((file) =>
                                selectedFiles.includes(file)
                              )}
                              onChange={(e) =>
                                handleGroupCheckboxChange(
                                  groupKey,
                                  e.target.checked
                                )
                              }
                            />
                            {groupKey}번 그룹 전체 선택/해제
                          </label>
                        </td>
                      </tr>

                      {/* 그룹 내 파일 행 */}
                      {files.map((file, index) => (
                        <tr key={file}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file)}
                              onChange={() => handleFileSelection(file)}
                            />
                          </td>
                          <td>{file.replace('.json', '')}</td>
                          <td className="summary-note">
                            <button onClick={() => navigateToSummary(file)}>
                              요약내용 바로가기
                            </button>{' '}
                            {/* !!!!!!!!!! 버튼 클릭 시 요약 페이지로 이동 */}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              <footer>
                <button onClick={loadQuestionsFromFiles}>시험 시작</button>
              </footer>
            </div>
          </div>
        ) : !isFinished ? (
          <div>
            <h3>{currentFileName}</h3>
            {getCurrentPageQuestions().map((question, index) => {
              const questionIndex =
                currentPage * QUESTIONS_PER_PAGE + index + 1;
              return (
                <div key={index} className="question">
                  <p>
                    <strong>문제 {questionIndex}:</strong> {question.question}
                  </p>
                  {question.options ? (
                    <ul>
                      {question.options.map((option, optionIndex) => {
                        const optionKey = Object.keys(option)[0];
                        const optionValue = Object.values(option)[0];
                        return (
                          <li key={optionIndex}>
                            <label>
                              <input
                                type="checkbox"
                                name={`question-${questionIndex}`}
                                value={optionKey}
                                checked={
                                  answers[questionIndex]?.selected === optionKey
                                }
                                onChange={() =>
                                  handleCheckboxChange(questionIndex, optionKey)
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
                      value={answers[questionIndex]?.input || ''}
                      onChange={(e) =>
                        handleInputChange(questionIndex, e.target.value)
                      }
                      placeholder="답을 입력하세요"
                    />
                  )}
                </div>
              );
            })}
            <footer>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                이전 페이지
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(questions.length / QUESTIONS_PER_PAGE) - 1
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(questions.length / QUESTIONS_PER_PAGE) - 1
                }
              >
                다음 페이지
              </button>
              <button onClick={handleFinish}>시험 종료</button>
            </footer>
          </div>
        ) : (
          <div>
            <h3>결과</h3>
            <p>전체 문항 수: {questions.length}</p>
            <p>
              정답 수:{' '}
              {
                Object.values(answers).filter((ans) => ans.result === 'O')
                  .length
              }
            </p>
            <p>
              오답 수:{' '}
              {
                Object.values(answers).filter((ans) => ans.result === 'X')
                  .length
              }
            </p>
            <h3>틀린 문제</h3>
            <table className="result-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>문제</th>
                  <th>정답</th>
                  <th>내 답</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(answers)
                  .filter(([_, ans]) => ans.result === 'X')
                  .map(([key, answer]) => {
                    const questionNumber = parseInt(key, 10);
                    const question = questions[questionNumber - 1];

                    let correctAnswerText;

                    if (question.options) {
                      // 객관식 문제: options 배열에서 정답 찾기
                      const correctOption = question.options.find(
                        (option) => Object.keys(option)[0] === question.answer
                      );
                      correctAnswerText = correctOption
                        ? Object.values(correctOption)[0] // 정답 내용 표시
                        : '정답 없음';
                    } else {
                      // 주관식 문제: answer 필드에서 정답 직접 가져오기
                      correctAnswerText = question.answer || '정답 없음';
                    }

                    const userAnswerText = question.options
                      ? (() => {
                          const selectedOption = question.options.find(
                            (opt) => Object.keys(opt)[0] === answer.selected
                          );
                          return selectedOption
                            ? Object.values(selectedOption)[0]
                            : '선택 안 함';
                        })()
                      : answer.input || '입력 없음';

                    return (
                      <tr key={key}>
                        <td>{questionNumber}</td>
                        <td>{question.question}</td>
                        <td>{correctAnswerText}</td>
                        <td>{userAnswerText}</td>{' '}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <footer>
              <button onClick={handleRestart}>홈으로</button>
              <button
                onClick={retryIncorrectQuestions}
                disabled={Object.values(answers).every(
                  (ans) => ans.result === 'O'
                )}
              >
                틀린 문제 다시 풀기
              </button>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
