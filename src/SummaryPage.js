import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './summary.css';

const SummaryPage = () => {
  const { fileName } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/envdata/${fileName}`)
      .then((response) => response.json())
      .then((data) => setSummary(data))
      .catch((error) =>
        console.error('데이터를 불러오는 중 오류 발생:', error)
      );
  }, [fileName]);

  return (
    <div className="summary-block">
      {summary && summary.questions ? (
        <ul>
          {summary.questions.map((q) => (
            <li key={q.id} className="question-item">
              <h3>{q.question}</h3>

              {/* choices가 없을 경우 빈 배열 []로 처리 */}
              <ul>
                {(q.choices ?? []).map((choice, index) => (
                  <li
                    key={index}
                    className={
                      choice === q.correct_answer ? 'correct-answer' : ''
                    }
                  >
                    {choice}
                  </li>
                ))}
              </ul>

              {/* 정답 및 해설 구역 */}
              <div className="answer-section">
                <p>
                  <strong>정답:</strong> {q.correct_answer}
                </p>
                <p>
                  <strong>정답 해설</strong> <br /> {q.explanation}
                </p>
              </div>

              {/* 오답 해설이 존재하는 경우에만 렌더링 */}
              {q.wrong_answers && Object.keys(q.wrong_answers).length > 0 && (
                <>
                  <strong>오답 해설</strong>
                  <ul className="wrong-answers">
                    {Object.entries(q.wrong_answers).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>문제를 불러오는 중입니다...</p>
      )}
    </div>
  );
};

export default SummaryPage;
