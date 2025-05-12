# 정보처리산업기사 필기 대비 문제 은행
##### https://all-my-projects-2024.github.io/EXAM_SITE/
# ![image](https://github.com/user-attachments/assets/3c850087-6f11-4112-92ea-1aa3b6a75b79)
---

## 프로젝트 개요
이 프로젝트는 **정보처리산업기사 과정평가형 필기 시험 대비 문제 은행**으로, 기출 예상 문제를 연습할 수 있도록 설계된 웹 애플리케이션입니다. React를 사용하여 프론트엔드를 구축하였으며, JSON 형식의 문제 데이터를 활용하여 다양한 유형의 문제를 제공하고 있습니다.

## 주요 기능
- **문제 풀기**
  - 4지선다형 및 주관식 문제 제공
  - 선택한 모듈에 해당하는 문제만 출제 가능
  - 문제의 보기 순서 무작위 배치
- **문제 관리**
  - JSON 데이터 기반 문제 로딩
  - 그룹별 문제 선택 기능 (예: "응용 SW 개발 환경 구축" 전체 선택)
- **결과 확인**
  - 정답 여부 확인 및 피드백 제공
  - 틀린 문제만 다시 풀기 기능 지원

## 폴더 구조
```
/EXAM_SITE
│── public/
│   ├── dataset/         # JSON 형식의 문제 은행 데이터
│   ├── envdata/         # 환경 관련 JSON 데이터
│   ├── index.html       # 기본 HTML 파일
│── src/
│   ├── App.js           # 메인 애플리케이션
│   ├── SummaryPage.js   # 문제 해석 페이지
│   ├── components/      # UI 컴포넌트 모음
│── package.json         # 프로젝트 종속성 정보
│── README.md            # 프로젝트 설명 파일
```

## 사용 기술
- **Frontend**: React, React Router
- **데이터 저장소**: JSON 파일 기반 문제 데이터 관리

## 문제 데이터 형식
문제 데이터는 JSON 파일로 저장되며, 다음과 같은 구조를 가집니다.

```json
{
  "questions": [
    {
      "id": 1,
      "question": "OSI 7 계층에서 데이터를 인코딩하고 압축하는 역할을 하는 계층은?",
      "options": [
        {"a": "Application 계층"},
        {"b": "Presentation 계층"},
        {"c": "Transport 계층"},
        {"d": "Data Link 계층"}
      ],
      "answer": "b"
    }
  ]
}
```
