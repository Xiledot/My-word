// js/test.js

document.addEventListener('DOMContentLoaded', () => {
    const testSetupDiv = document.getElementById('test-setup');
    const testInProgressDiv = document.getElementById('test-in-progress');
    const testResultsDiv = document.getElementById('test-results');
    const beginTestBtn = document.getElementById('beginTestBtn');
    const wordCountSpan = document.getElementById('wordCount');

    // 타이머 숫자 표시 요소
    const wordTimerDisplaySpan = document.getElementById('wordTimerDisplay');
    const blankTimerDisplaySpan = document.getElementById('blankTimerDisplay');

    const currentWordP = document.getElementById('currentWord');
    const blankScreenDiv = document.getElementById('blankScreen');
    // const blankScreenMessageP = document.getElementById('blankScreenMessage'); // HTML ID 확인

    const answerTableBody = document.getElementById('answerTableBody');
    const transitionSound = document.getElementById('transitionSound');

    let allWords = [];
    let wordsToTest = [];
    let currentWordIndex = 0;
    let timerIntervalId; // setInterval의 ID를 저장하여 clearInterval에 사용

    const WORD_DISPLAY_TIME = 2; // 단어 표시 시간 (초)
    const BLANK_SCREEN_TIME = 5; // 검은 화면 시간 (초)
    const NUM_TEST_WORDS = 30;   // 테스트할 단어 수

    // localStorage에서 단어 목록 가져오기
    const storedWords = localStorage.getItem('wordsForTest');
    if (storedWords) {
        try {
            allWords = JSON.parse(storedWords);
            if (!Array.isArray(allWords)) throw new Error("Stored data is not an array.");
            wordCountSpan.textContent = allWords.length;
            if (allWords.length === 0) {
                beginTestBtn.disabled = true;
                wordCountSpan.textContent = '0 (테스트할 단어 없음)';
            }
        } catch (e) {
            console.error("Error parsing words from localStorage:", e);
            allWords = [];
            wordCountSpan.textContent = '0 (오류 발생)';
            beginTestBtn.disabled = true;
        }
    } else {
        wordCountSpan.textContent = '0 (단어 목록 없음)';
        beginTestBtn.disabled = true;
    }

    beginTestBtn.addEventListener('click', startTest);

    function startTest() {
        if (allWords.length === 0) {
            alert('테스트할 단어가 없습니다.');
            return;
        }

        // 화면 전환
        testSetupDiv.style.display = 'none';
        testInProgressDiv.style.display = 'flex'; // CSS에서 flex로 중앙 정렬
        blankScreenDiv.style.display = 'none';
        testResultsDiv.style.display = 'none';

        // 단어 섞기 (Fisher-Yates Shuffle)
        let shuffledWords = [...allWords];
        for (let i = shuffledWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }

        // 테스트할 단어 선택
        wordsToTest = shuffledWords.slice(0, Math.min(NUM_TEST_WORDS, shuffledWords.length));
        currentWordIndex = 0;
        showNextWord();
    }

    function showNextWord() {
        clearInterval(timerIntervalId); // 이전 타이머가 있다면 중지

        if (currentWordIndex >= wordsToTest.length) {
            endTest();
            return;
        }

        const wordData = wordsToTest[currentWordIndex];
        currentWordP.textContent = wordData.word;

        testInProgressDiv.style.display = 'flex'; // 단어 표시 화면 보이기
        blankScreenDiv.style.display = 'none';    // 검은 화면 숨기기

        let timeLeft = WORD_DISPLAY_TIME;
        wordTimerDisplaySpan.textContent = timeLeft;

        timerIntervalId = setInterval(() => {
            timeLeft--;
            wordTimerDisplaySpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerIntervalId);
                showBlankScreen();
            }
        }, 1000);
    }

    function showBlankScreen() {
        clearInterval(timerIntervalId); // 이전 타이머가 있다면 중지

        testInProgressDiv.style.display = 'none'; // 단어 표시 화면 숨기기
        blankScreenDiv.style.display = 'flex';    // 검은 화면 보이기

        if (transitionSound) {
            transitionSound.currentTime = 0; // 사운드 처음부터 재생
            transitionSound.play().catch(e => console.warn("Sound play failed:", e));
        }

        let timeLeft = BLANK_SCREEN_TIME;
        blankTimerDisplaySpan.textContent = timeLeft;

        timerIntervalId = setInterval(() => {
            timeLeft--;
            blankTimerDisplaySpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerIntervalId);
                currentWordIndex++;
                showNextWord();
            }
        }, 1000);
    }

    function endTest() {
        clearInterval(timerIntervalId); // 모든 타이머 확실히 중지

        testInProgressDiv.style.display = 'none';
        blankScreenDiv.style.display = 'none';
        testResultsDiv.style.display = 'block'; // 결과 표시 (CSS에서 block으로 잘 정렬되도록)

        answerTableBody.innerHTML = ''; // 이전 결과 초기화
        wordsToTest.forEach((wordData, index) => {
            const row = answerTableBody.insertRow();
            row.insertCell().textContent = index + 1; // 1부터 시작하는 번호
            row.insertCell().textContent = wordData.word;
            row.insertCell().textContent = wordData.meaning;
        });

        // 테스트가 끝난 후 localStorage에서 단어 목록 제거 (선택 사항)
        // localStorage.removeItem('wordsForTest');
    }
});