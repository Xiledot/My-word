// js/main.js

// Supabase 클라이언트 설정
const SUPABASE_URL = 'https://uyrcdqdbohygfdiuzkno.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cmNkcWRib2h5Z2ZkaXV6a25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyODM3MzksImV4cCI6MjA2Mjg1OTczOX0.jj0spqQ2W4LFrzNZ8dSlouJff7Yx-vEelhwTNar2C5U';

let supabaseClient;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        throw new Error("Supabase JavaScript client (supabase-js) is not loaded correctly.");
    }
} catch (error) {
    console.error("Supabase 클라이언트 초기화 실패:", error);
    alert("데이터베이스 연결에 심각한 오류가 발생했습니다...\n오류 상세: " + error.message);
}

// --- 데이터베이스 객체들 ---
const textbookData = {
    "중1": { publishers: ["능률(김기태)", "동아(윤정미)", "동아(이병민)", "천재(소영순)", "천재(이상기)"], lessons: ["1과", "2과", "3과", "4과", "5과", "6과", "7과", "8과", "Special Lesson"] },
    "중2": { publishers: ["동아(윤정미)", "동아(이병민)", "능률(김성곤)", "능률(양현권)", "천재(이재영)", "천재(정사열)", "비상(김진완)", "금성(최인철)", "YBM(박준언)", "YBM(송미정)", "미래엔(최연희)", "지학사(민찬규)"], lessons: ["1과", "2과", "3과", "4과", "5과", "6과", "7과", "8과", "Special Lesson"] },
    "중3": { publishers: ["동아(윤정미)", "동아(이병민)", "능률(김성곤)", "능률(양현권)", "천재(이재영)", "천재(정사열)", "비상(김진완)", "금성(최인철)", "YBM(박준언)", "YBM(송미정)", "미래엔(최연희)", "지학사(민찬규)"], lessons: ["1과", "2과", "3과", "4과", "5과", "6과", "7과", "8과", "Special Lesson"] },
    "공통영어": { publishers: ["능률(민병천)", "능률(오선영)", "YBM(박준언)", "YBM(김은형)", "미래엔(김성연)", "동아(이병민)", "비상(홍민표)", "지학사(신상근)", "천재(강상구)", "천재(조수경)"], lessons: ["1과", "2과", "3과", "4과", "5과", "6과", "7과", "8과", "Special Lesson 1", "Special Lesson 2"] },
    "영어1": { publishers: ["금성(최인철)", "능률(김성곤)", "동아(권혁승)", "비상(홍민표)", "천재(이재영)", "교학사(강문구)", "다락원(김길중)", "지학사(민찬규)", "YBM(박준언)", "YBM(한상호)"], lessons: ["1과", "2과", "3과", "4과", "5과", "6과", "7과", "8과", "Special Lesson 1", "Special Lesson 2"] },
    "영어2": { publishers: ["금성(최인철)", "능률(김성곤)", "동아(권혁승)", "비상(홍민표)", "천재(이재영)", "다락원(김길중)", "지학사(민찬규)", "YBM(박준언)", "YBM(한상호)"], lessons: ["1과", "2과", "3과", "4과", "5과", "6과", "Special Lesson"] },
    "영어 독해와 작문": { publishers: ["NE능률(양현권)", "YBM(박준언)", "비상(홍민표)", "지학사(김상호)", "천재(김태영)", "기타"], lessons: ["1과", "2과", "3과", "4과", "5과", "6과", "Special Topic"] } // "지학사(김상L이하)" -> "지학사(김상호)"로 임의 수정
};
const textbookGrades = Object.keys(textbookData); // 학년 목록 자동 생성

const mockExamDatabase = {
    "고1": { "2021년": ["3월", "6월", "9월", "11월"], "2022년": ["3월", "6월", "9월", "11월"], "2023년": ["3월", "6월", "9월", "11월"], "2024년": ["3월", "6월", "9월", "10월"], "2025년": ["3월", "6월", "9월"] },
    "고2": { "2021년": ["3월", "6월", "9월", "11월"], "2022년": ["3월", "6월", "9월", "11월"], "2023년": ["3월", "6월", "9월", "11월"], "2024년": ["3월", "6월", "9월", "10월"], "2025년": ["3월", "6월", "9월"] },
    "고3": { "2021년": ["3월", "6월", "9월", "10월", "11월(수능)"], "2022년": ["3월", "6월", "9월", "10월", "11월(수능)"], "2023년": ["3월", "6월", "9월", "10월", "11월(수능)"], "2024년": ["3월", "6월", "7월", "9월", "10월", "11월(수능)"], "2025년": ["3월", "5월", "6월", "9월"] }
};
const mockExamGrades = Object.keys(mockExamDatabase);
const mockExamYears = ["2025년", "2024년", "2023년", "2022년", "2021년"]; // 전체 년도 목록 (최신순)

const workbookDatabase = {
    "EBS": ["2026 수능특강 영어 (2025)", "2026 수능특강 영어독해연습 (2025)", "수능특강 Light 영어 (2022)", "수능 감 잡기 영어영역 (2020)", "2025 올림포스 전국연합학력평가 기출문제집 영어독해(고1)", "2025 올림포스 전국연합학력평가 기출문제집 영어독해(고2)", "올림포스 영어독해의 기본1", "올림포스 영어독해의 기본2", "하루 6개 1등급 영어독해 고2 (2023)"],
    "쎄듀": ["첫단추 독해실전편 모의고사 12회"],
    "해커스": ["수능영어독해 미니 모의고사 12+2회 필수 (2024)", "수능영어독해 미니 모의고사 12+2회 완성 (2024)"],
    "능률": ["The 상승 구문편"], "기타": ["직접입력"]
};
const workbookPublishers = Object.keys(workbookDatabase);


document.addEventListener('DOMContentLoaded', () => {
    if (!supabaseClient) { return; }

    // --- DOM 요소 가져오기 ---
    const wordForm = document.getElementById('wordForm');
    const wordPairsTextarea = document.getElementById('wordPairs');
    const categorySelect = document.getElementById('category'); // 입력 폼의 분류

    // 입력 폼 상세 요소
    const tbGradeSelect = document.getElementById('tb_grade');
    const tbPublisherSelect = document.getElementById('tb_publisher');
    const tbLessonSelect = document.getElementById('tb_lesson');
    const wbPublisherSelect = document.getElementById('wb_publisher');
    const wbNameSelect = document.getElementById('wb_name');
    const meGradeSelect = document.getElementById('me_grade');
    const meYearSelect = document.getElementById('me_year');
    const meMonthSelect = document.getElementById('me_month');

    // 필터 폼 요소
    const filterCategorySelect = document.getElementById('filterCategory');
    const filterTbGradeSelect = document.getElementById('filter_tb_grade');
    const filterTbPublisherSelect = document.getElementById('filter_tb_publisher');
    const filterTbLessonSelect = document.getElementById('filter_tb_lesson');
    const filterWbPublisherSelect = document.getElementById('filter_wb_publisher');
    const filterWbNameSelect = document.getElementById('filter_wb_name');
    const filterMeGradeSelect = document.getElementById('filter_me_grade');
    const filterMeYearSelect = document.getElementById('filter_me_year');
    const filterMeMonthSelect = document.getElementById('filter_me_month');

    // 버튼 및 목록 관련 요소
    const filterWordsBtn = document.getElementById('filterWordsBtn');
    const loadAllWordsBtn = document.getElementById('loadAllWordsBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const wordTableBody = document.getElementById('wordTableBody');
    const displayedWordCountSpan = document.getElementById('displayedWordCount');
    const startTestBtn = document.getElementById('startTestBtn');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

    // --- 유틸리티 함수: 드롭다운 옵션 채우기 ---
    function populateDropdown(selectElement, options, defaultOptionText = "-- 선택 --") {
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`; // 기존 옵션 초기화 및 기본 옵션 추가
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            selectElement.appendChild(option);
        });
    }

    // --- 초기 드롭다운 채우기 ---
    // 교과서 학년
    populateDropdown(tbGradeSelect, textbookGrades, "-- 학년 선택 --");
    populateDropdown(filterTbGradeSelect, textbookGrades, "-- 전체 학년 --");
    // 부교재 출판사
    populateDropdown(wbPublisherSelect, workbookPublishers, "-- 출판사 선택 --");
    populateDropdown(filterWbPublisherSelect, workbookPublishers, "-- 전체 출판사 --");
    // 모의고사 학년
    populateDropdown(meGradeSelect, mockExamGrades, "-- 학년 선택 --");
    populateDropdown(filterMeGradeSelect, mockExamGrades, "-- 전체 학년 --");


    // --- 연동형 드롭다운 로직 ---
    // 입력 폼: 교과서 학년 -> 출판사 -> 단원
    tbGradeSelect.addEventListener('change', function() {
        const selectedGrade = this.value;
        if (selectedGrade && textbookData[selectedGrade]) {
            populateDropdown(tbPublisherSelect, textbookData[selectedGrade].publishers, "-- 출판사 선택 --");
            populateDropdown(tbLessonSelect, textbookData[selectedGrade].lessons, "-- 단원 선택 --"); // 학년별 공통 단원 목록
        } else {
            populateDropdown(tbPublisherSelect, [], "-- 학년 먼저 선택 --");
            populateDropdown(tbLessonSelect, [], "-- 출판사 먼저 선택 --");
        }
    });
    // 참고: 교과서에서 출판사 선택 시 단원 목록이 달라진다면, tbPublisherSelect에도 change 리스너 추가 필요

    // 입력 폼: 부교재 출판사 -> 부교재명
    wbPublisherSelect.addEventListener('change', function() {
        const selectedPublisher = this.value;
        if (selectedPublisher && workbookDatabase[selectedPublisher]) {
            populateDropdown(wbNameSelect, workbookDatabase[selectedPublisher], "-- 부교재명 선택 --");
        } else {
            populateDropdown(wbNameSelect, [], "-- 출판사 먼저 선택 --");
        }
    });

    // 입력 폼: 모의고사 학년 -> 년도 -> 월
    meGradeSelect.addEventListener('change', function() {
        const selectedGrade = this.value;
        if (selectedGrade && mockExamDatabase[selectedGrade]) {
            const yearsForGrade = Object.keys(mockExamDatabase[selectedGrade]).sort((a,b) => parseInt(b) - parseInt(a)); // 년도 최신순
            populateDropdown(meYearSelect, yearsForGrade, "-- 년도 선택 --");
            populateDropdown(meMonthSelect, [], "-- 년도 먼저 선택 --");
        } else {
            populateDropdown(meYearSelect, [], "-- 학년 먼저 선택 --");
            populateDropdown(meMonthSelect, [], "-- 년도 먼저 선택 --");
        }
    });
    meYearSelect.addEventListener('change', function() {
        const selectedGrade = meGradeSelect.value;
        const selectedYear = this.value;
        if (selectedGrade && selectedYear && mockExamDatabase[selectedGrade] && mockExamDatabase[selectedGrade][selectedYear]) {
            populateDropdown(meMonthSelect, mockExamDatabase[selectedGrade][selectedYear], "-- 월 선택 --");
        } else {
            populateDropdown(meMonthSelect, [], "-- 년도 먼저 선택 --");
        }
    });

    // 필터 폼: 교과서 학년 -> 출판사 -> 단원
    filterTbGradeSelect.addEventListener('change', function() {
        const selectedGrade = this.value;
        if (selectedGrade && textbookData[selectedGrade]) {
            populateDropdown(filterTbPublisherSelect, textbookData[selectedGrade].publishers, "-- 전체 출판사 --");
            populateDropdown(filterTbLessonSelect, textbookData[selectedGrade].lessons, "-- 전체 단원 --");
        } else {
            populateDropdown(filterTbPublisherSelect, [], "-- 전체 출판사 (학년 선택) --");
            populateDropdown(filterTbLessonSelect, [], "-- 전체 단원 (학년 선택) --");
        }
    });

    // 필터 폼: 부교재 출판사 -> 부교재명
    filterWbPublisherSelect.addEventListener('change', function() {
        const selectedPublisher = this.value;
        if (selectedPublisher && workbookDatabase[selectedPublisher]) {
            populateDropdown(filterWbNameSelect, workbookDatabase[selectedPublisher], "-- 전체 부교재 --");
        } else {
            populateDropdown(filterWbNameSelect, [], "-- 전체 부교재 (출판사 선택) --");
        }
    });

    // 필터 폼: 모의고사 학년 -> 년도 -> 월
    filterMeGradeSelect.addEventListener('change', function() {
        const selectedGrade = this.value;
        if (selectedGrade && mockExamDatabase[selectedGrade]) {
            const yearsForGrade = Object.keys(mockExamDatabase[selectedGrade]).sort((a,b) => parseInt(b) - parseInt(a));
            populateDropdown(filterMeYearSelect, yearsForGrade, "-- 전체 년도 --");
            populateDropdown(filterMeMonthSelect, [], "-- 전체 월 (년도 선택) --");
        } else {
            populateDropdown(filterMeYearSelect, [], "-- 전체 년도 (학년 선택) --");
            populateDropdown(filterMeMonthSelect, [], "-- 전체 월 (년도 선택) --");
        }
    });
    filterMeYearSelect.addEventListener('change', function() {
        const selectedGrade = filterMeGradeSelect.value;
        const selectedYear = this.value;
        if (selectedGrade && selectedYear && mockExamDatabase[selectedGrade] && mockExamDatabase[selectedGrade][selectedYear]) {
            populateDropdown(filterMeMonthSelect, mockExamDatabase[selectedGrade][selectedYear], "-- 전체 월 --");
        } else {
            populateDropdown(filterMeMonthSelect, [], "-- 전체 월 (년도 선택) --");
        }
    });


    // --- 상세 정보 섹션 표시/숨김 로직 ---
    function toggleDetailSection(selectElement, sectionPrefix, detailsSectionsClass) {
        // ... (이전과 동일한 함수 내용) ...
        document.querySelectorAll(`.${detailsSectionsClass}`).forEach(section => {
            section.style.display = 'none';
            if (detailsSectionsClass === 'details-section') { // 입력폼의 경우만 내부 필드 초기화
                 section.querySelectorAll('select, input[type="text"], textarea').forEach(el => {
                    if (el.tagName === 'SELECT' && el.id !== 'tb_grade' && el.id !== 'wb_publisher' && el.id !== 'me_grade') { // 첫번째 연동 select는 제외
                        populateDropdown(el, [], el.options[0].textContent); // 하위 select는 비우기
                    } else if (el.tagName !== 'SELECT') {
                        el.value = '';
                    }
                 });
            }
        });
        const selectedValue = selectElement.value;
        if (selectedValue) {
            const detailSection = document.getElementById(`${sectionPrefix}${selectedValue}`);
            if (detailSection) {
                detailSection.style.display = 'block';
            }
        }
    }

    categorySelect.addEventListener('change', () => { // 입력 폼 분류 변경 시
        toggleDetailSection(categorySelect, 'details-', 'details-section');
    });

    filterCategorySelect.addEventListener('change', () => { // 필터 폼 분류 변경 시
        toggleDetailSection(filterCategorySelect, 'filter-details-', 'filter-details-section');
    });


    // --- 단어 저장 로직 (일괄 처리) ---
    wordForm.addEventListener('submit', async function(event) {
        // ... (이전과 동일한 단어 저장 로직) ...
        event.preventDefault();
        const wordPairsValue = wordPairsTextarea.value.trim();
        const categoryValue = categorySelect.value;
        const commonMemoValue = wordForm.elements['commonMemo'].value.trim() || null;

        if (!wordPairsValue) { alert('단어와 뜻을 입력해주세요.'); return; }
        if (!categoryValue) { alert('공통 적용될 분류를 선택해주세요.'); return; }

        const lines = wordPairsValue.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) { alert('입력된 단어가 없습니다.'); return; }

        const wordsToInsert = [];
        let parseErrorCount = 0;
        const wordMeaningRegex = /^([a-zA-Z0-9\s'-]*[a-zA-Z0-9'-])\s+(.*)$/;

        for (const line of lines) { /* ... (이전과 동일한 파싱 로직) ... */
            const trimmedLine = line.trim(); if (!trimmedLine) continue;
            const match = trimmedLine.match(wordMeaningRegex);
            let word = ''; let meaning = '';
            if (match && match[1] && match[2]) { word = match[1].trim(); meaning = match[2].trim();
            } else {
                const firstSpaceIndex = trimmedLine.indexOf(' ');
                if (firstSpaceIndex > 0 && firstSpaceIndex < trimmedLine.length -1) { word = trimmedLine.substring(0, firstSpaceIndex).trim(); meaning = trimmedLine.substring(firstSpaceIndex + 1).trim(); console.warn(`정규표현식 매칭 실패, 첫 공백 기준으로 파싱: "${trimmedLine}"`);
                } else { parseErrorCount++; console.warn(`파싱 오류: "${trimmedLine}"`); continue; }
            }
            if (!word || !meaning) { parseErrorCount++; console.warn(`파싱 후 단어 또는 뜻 누락: "${trimmedLine}"`); continue; }

            const wordData = { word: word, meaning: meaning, category: categoryValue, common_memo: commonMemoValue, details: {} };
            const detailSectionElements = document.querySelectorAll(`#details-${categoryValue} select, #details-${categoryValue} input[type="text"], #details-${categoryValue} textarea`);
            detailSectionElements.forEach(element => {
                const nameAttr = element.getAttribute('name');
                if (nameAttr) {
                    let key;
                    if (nameAttr.startsWith('tb_') || nameAttr.startsWith('wb_') || nameAttr.startsWith('me_') || nameAttr.startsWith('ext_')) {
                        key = nameAttr.substring(3); // tb_grade -> grade
                        if (nameAttr === 'wb_publisher') key = 'publisher'; // wb_publisher -> publisher (일관성)
                        else if (nameAttr === 'wb_name') key = 'name'; // wb_name -> name
                    } else if (nameAttr === "etc_memo") { key = "memo"; }

                    if (key) {
                        wordData.details[key] = element.value.trim() || null;
                         if (element.value.trim() === "" && element.tagName === 'SELECT') wordData.details[key] = null;
                    }
                }
            });
            wordsToInsert.push(wordData);
        }

        if (parseErrorCount > 0) { alert(`${parseErrorCount}개의 라인에서 단어와 뜻을 정확히 파싱하지 못했습니다.`); }
        if (wordsToInsert.length === 0) { alert('저장할 유효한 단어가 없습니다.'); return; }

        try { /* ... (이전과 동일한 Supabase insert 로직) ... */
            const { error } = await supabaseClient.from('words').insert(wordsToInsert);
            if (error) throw error;
            alert(`${wordsToInsert.length}개의 단어가 성공적으로 저장되었습니다.`);
            wordForm.reset(); categorySelect.value = "";
            toggleDetailSection(categorySelect, 'details-', 'details-section');
            loadWords();
        } catch (error) { console.error('Error saving words:', error); alert(`단어 저장 중 오류 발생: ${error.message}`); }
    });

    // --- 단어 목록 로드 및 필터링 로직 ---
    async function loadWords(filters = null) { /* ... (이전과 동일) ... */
        try {
            let query = supabaseClient.from('words').select('*');
            if (filters && filters.category) {
                query = query.eq('category', filters.category);
                if (filters.details) {
                    for (const key in filters.details) {
                        if (filters.details[key] && filters.details[key].trim() !== '') {
                            query = query.eq(`details->>${key}`, filters.details[key].trim());
                        }
                    }
                }
            } else if (filters && !filters.category) { // 카테고리 필터가 "" (전체)인 경우
                 // 아무것도 안하면 전체 카테고리 대상, details만 필터링 (이 경우는 없음)
            }
            query = query.order('created_at', { ascending: false });
            const { data: words, error } = await query;
            if (error) throw error;
            renderWordList(words || []);
        } catch (error) { console.error('Error loading words:', error); alert(`단어 목록 로딩 중 오류 발생: ${error.message}`); renderWordList([]);}
    }

    function renderWordList(words) { /* ... (이전과 동일) ... */
        wordTableBody.innerHTML = ''; displayedWordCountSpan.textContent = words.length;
        selectAllCheckbox.checked = false; toggleDeleteSelectedBtn();
        if (words.length > 0) {
            words.forEach(word => {
                const row = wordTableBody.insertRow(); row.setAttribute('data-id', word.id);
                const checkboxCell = row.insertCell(); const checkbox = document.createElement('input');
                checkbox.type = 'checkbox'; checkbox.classList.add('row-checkbox'); checkbox.value = word.id;
                checkbox.addEventListener('change', toggleDeleteSelectedBtn); checkboxCell.appendChild(checkbox);
                row.insertCell().textContent = word.word; row.insertCell().textContent = word.meaning;
                row.insertCell().textContent = getCategoryDisplayName(word.category);
                let detailsText = '-'; if (word.details) { const dp = []; /* ... */ if(word.category==='textbook'){if(word.details.grade)dp.push(word.details.grade);if(word.details.publisher)dp.push(word.details.publisher);if(word.details.lesson)dp.push(word.details.lesson);if(word.details.sentence_numbers)dp.push(word.details.sentence_numbers);}else if(word.category==='workbook'){if(word.details.publisher)dp.push(word.details.publisher);if(word.details.name)dp.push(word.details.name);if(word.details.unit)dp.push(word.details.unit);if(word.details.passage_number)dp.push(word.details.passage_number);}else if(word.category==='mock_exam'){if(word.details.grade)dp.push(word.details.grade);if(word.details.year)dp.push(word.details.year);if(word.details.month)dp.push(word.details.month);if(word.details.number)dp.push(word.details.number);}else if(word.category==='external'){if(word.details.school)dp.push(word.details.school);if(word.details.grade)dp.push(word.details.grade);if(word.details.name)dp.push(word.details.name);}else if(word.category==='etc'){if(word.details.memo)dp.push(word.details.memo);} detailsText=dp.join(' / ')||'-';}
                row.insertCell().textContent = detailsText; row.insertCell().textContent = word.common_memo || '-';
                const actionsCell = row.insertCell(); const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '삭제'; deleteBtn.classList.add('delete-btn');
                deleteBtn.onclick = () => deleteWord(word.id, word.word); actionsCell.appendChild(deleteBtn);
            });
            startTestBtn.style.display = 'block';
        } else { wordTableBody.innerHTML = `<tr><td colspan="7">표시할 단어가 없습니다.</td></tr>`; startTestBtn.style.display = 'none'; }
    }

    filterWordsBtn.addEventListener('click', () => { /* ... (이전과 동일) ... */
        const categoryValue = filterCategorySelect.value;
        const filters = { category: categoryValue, details: {} };
        if (categoryValue) {
            const filterDetailSection = document.getElementById(`filter-details-${categoryValue}`);
            if (filterDetailSection) {
                filterDetailSection.querySelectorAll('select, input[type="text"], textarea').forEach(element => {
                    const key = element.dataset.filterKey; const value = element.value;
                    if (key && value !== '') { filters.details[key] = value; }
                });
            }
        }
        if (categoryValue === "") filters.category = null; loadWords(filters);
    });

    loadAllWordsBtn.addEventListener('click', () => { /* ... (이전과 동일) ... */
        filterCategorySelect.value = ""; toggleDetailSection(filterCategorySelect, 'filter-details-', 'filter-details-section');
        document.querySelectorAll('.filter-details-section select, .filter-details-section input[type="text"], .filter-details-section textarea').forEach(el => { if (el.tagName === 'SELECT') el.value = ""; else el.value = '';});
        loadWords();
    });

    function getCategoryDisplayName(categoryKey) { /* ... (이전과 동일) ... */ const n={'textbook':'교과서','workbook':'부교재','mock_exam':'모의고사','external':'외부지문','etc':'기타'};return n[categoryKey]||categoryKey;}
    async function deleteWord(wordId, wordText) { /* ... (이전과 동일) ... */ if(!confirm(`'${wordText}' 삭제?`))return;try{const{error}=await supabaseClient.from('words').delete().eq('id',wordId);if(error)throw error;alert('삭제됨.');refreshCurrentWordList();}catch(e){console.error(e);alert('삭제 오류');}}
    function refreshCurrentWordList() { /* ... (이전과 동일) ... */ const c=filterCategorySelect.value;if(c&&c!==""){filterWordsBtn.click();}else{loadAllWordsBtn.click();}}
    
    // --- 일괄 삭제 관련 로직 ---
    selectAllCheckbox.addEventListener('change', function() { /* ... (이전과 동일) ... */ wordTableBody.querySelectorAll('.row-checkbox').forEach(c => c.checked=this.checked); toggleDeleteSelectedBtn();});
    function toggleDeleteSelectedBtn() { /* ... (이전과 동일) ... */ const c=wordTableBody.querySelectorAll('.row-checkbox:checked');deleteSelectedBtn.style.display=c.length>0?'inline-block':'none';const a=wordTableBody.querySelectorAll('.row-checkbox');selectAllCheckbox.checked=a.length>0&&c.length===a.length;}
    deleteSelectedBtn.addEventListener('click', async function() { /* ... (이전과 동일) ... */ const s=[];wordTableBody.querySelectorAll('.row-checkbox:checked').forEach(c=>s.push(c.value));if(s.length===0){alert('선택된 단어 없음');return;}if(!confirm(`${s.length}개 단어 삭제?`))return;try{const{error}=await supabaseClient.from('words').delete().in('id',s);if(error)throw error;alert(`${s.length}개 삭제됨.`);refreshCurrentWordList();}catch(e){console.error(e);alert('일괄 삭제 오류');}});
    
    startTestBtn.addEventListener('click', function() { /* ... (이전과 동일, 셀 인덱스 확인) ... */
        const wordsForTest = [];
        wordTableBody.querySelectorAll('tr').forEach(row => {
            const checkbox = row.querySelector('.row-checkbox');
            // 체크박스 셀(cells[0]) 다음부터 단어, 뜻...
            if (checkbox && row.cells.length > 2 && row.dataset.id) {
                 wordsForTest.push({ id: row.dataset.id, word: row.cells[1].textContent, meaning: row.cells[2].textContent });
            }
        });
        if (wordsForTest.length === 0) { alert('테스트할 단어가 없습니다.'); return; }
        try { localStorage.setItem('wordsForTest', JSON.stringify(wordsForTest)); const tW=window.open('test.html','_blank'); if(!tW)alert('팝업차단 해제요망');}
        catch(e){console.error(e);alert('테스트 시작 오류');}
    });

    // --- 패치노트 관련 로직 (이전과 동일) ---
    const patchNotesBtn = document.getElementById('patchNotesBtn'); /* ... (이하 동일) ... */
    const patchNotesModal = document.getElementById('patchNotesModal');
    const closePatchNotesModalBtn = document.getElementById('closePatchNotesModal');
    const patchNotesContentDiv = document.getElementById('patchNotesContent');
    const patchNotesData = [
        { version: "v0.7.0", date: "2025-05-15", notes: ["상세 정보 입력란 연동형 드롭다운 기능 추가 (교과서, 모의고사, 부교재).", "관련 데이터베이스 객체(textbookData, mockExamData, workbookData) 정의."] },
        { version: "v0.6.0", date: "2025-05-15", notes: ["단어 목록 일괄 삭제 기능 추가 (체크박스 사용).", "전체 선택/해제 체크박스 기능 추가.", "선택된 항목이 있을 때만 '선택 단어 일괄 삭제' 버튼 표시."] },
        { version: "v0.5.2", date: "2025-05-15", notes: ["단어/뜻 파싱 로직 개선 (정규표현식 사용).", "정규표현식 미매칭 시 이전 방식(첫 공백 기준)으로 파싱 시도 및 콘솔 경고 추가."] },
        { version: "v0.5.1", date: "2025-05-15", notes: ["단일 단어 수정 기능 및 관련 UI 요소(수정 버튼) 제거.", "단어 저장 로직에서 수정 관련 분기 제거 (항상 삽입)."] },
        { version: "v0.5.0", date: "2025-05-15", notes: ["패치노트 기능 추가.", "패치노트 내용은 js/main.js의 patchNotesData 배열에 기록."] },
        { version: "v0.4.0", date: "2025-05-15", notes: ["교과서 상세 정보(학년, 출판사, 단원) 입력 방식을 드롭다운 선택으로 변경.", "필터 기능에서 교과서 상세 정보도 드롭다운으로 선택 가능하도록 수정.", "단어 입력 폼 및 필터 폼의 상세 섹션 UI 관리 로직 개선.", "단어 저장 시 상세 정보 키 추출 로직 개선."] },
        { version: "v0.3.0", date: "2025-05-15", notes: ["여러 단어 한 번에 입력 기능 추가.", "특정 조건으로 단어 목록 필터링 기능 추가.", "필터링된 목록 기준으로 단어 테스트 시작 기능 구현.", "Supabase 클라이언트 초기화 방식 수정."] },
        { version: "v0.2.0", date: "2025-05-14", notes: ["Supabase 연동: 단어 저장, 불러오기, 삭제 기능 구현.", "RLS 정책 설정 안내 및 관련 오류 해결.", "Supabase 클라이언트 초기화 오류 해결."] },
        { version: "v0.1.0", date: "2025-05-13", notes: ["기본 HTML, CSS, JavaScript 구조 생성.", "단어 입력 폼, 단어 목록 표시, 단어 테스트 기본 흐름 구현 (DB 연동 전)."] }
    ];
    function displayPatchNotes() { patchNotesContentDiv.innerHTML = ''; patchNotesData.forEach(p => { const h=document.createElement('h3');h.textContent=`${p.version} (${p.date})`;patchNotesContentDiv.appendChild(h); const ul=document.createElement('ul');p.notes.forEach(n=>{const li=document.createElement('li');li.textContent=n;ul.appendChild(li);});patchNotesContentDiv.appendChild(ul);}); patchNotesModal.style.display = 'block'; }
    if (patchNotesBtn) patchNotesBtn.addEventListener('click', displayPatchNotes);
    if (closePatchNotesModalBtn) closePatchNotesModalBtn.addEventListener('click', () => patchNotesModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target == patchNotesModal) patchNotesModal.style.display = 'none'; });

    // --- 페이지 로드 시 초기화 ---
    loadWords();
    toggleDetailSection(categorySelect, 'details-', 'details-section'); // 입력폼 상세 숨김
    toggleDetailSection(filterCategorySelect, 'filter-details-', 'filter-details-section'); // 필터폼 상세 숨김
});