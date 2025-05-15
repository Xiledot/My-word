// js/main.js

// Supabase 클라이언트 설정 (실제 URL과 ANON KEY로 교체해주세요)
const SUPABASE_URL = 'https://uyrcdqdbohygfdiuzkno.supabase.co'; // 실제 값으로!
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cmNkcWRib2h5Z2ZkaXV6a25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyODM3MzksImV4cCI6MjA2Mjg1OTczOX0.jj0spqQ2W4LFrzNZ8dSlouJff7Yx-vEelhwTNar2C5U'; // 실제 값으로!

let supabaseClient;

try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        throw new Error("Supabase JavaScript client (supabase-js) is not loaded correctly.");
    }
} catch (error) {
    console.error("Supabase 클라이언트 초기화 실패:", error);
    alert("데이터베이스 연결에 심각한 오류가 발생했습니다. 다음을 확인해주세요:\n1. 인터넷 연결 상태\n2. HTML 파일의 Supabase CDN 스크립트 태그\n3. Supabase URL 및 Key 값\n\n오류 상세: " + error.message);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!supabaseClient) {
        console.error("Supabase client (supabaseClient) is not initialized. Aborting further script execution.");
        return;
    }

    const wordForm = document.getElementById('wordForm');
    const wordPairsTextarea = document.getElementById('wordPairs');
    const categorySelect = document.getElementById('category');

    const filterCategorySelect = document.getElementById('filterCategory');
    const filterWordsBtn = document.getElementById('filterWordsBtn');
    const loadAllWordsBtn = document.getElementById('loadAllWordsBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn'); // 일괄 삭제 버튼

    const wordTableBody = document.getElementById('wordTableBody');
    const displayedWordCountSpan = document.getElementById('displayedWordCount');
    const startTestBtn = document.getElementById('startTestBtn');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox'); // 전체 선택 체크박스

    function toggleDetailSection(selectElement, sectionPrefix, detailsSectionsClass) {
        document.querySelectorAll(`.${detailsSectionsClass}`).forEach(section => {
            section.style.display = 'none';
            if (detailsSectionsClass === 'details-section') {
                 section.querySelectorAll('select, input[type="text"], textarea').forEach(el => {
                    if (el.tagName === 'SELECT') el.value = "";
                    else el.value = '';
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

    categorySelect.addEventListener('change', () => {
        toggleDetailSection(categorySelect, 'details-', 'details-section');
    });

    filterCategorySelect.addEventListener('change', () => {
        toggleDetailSection(filterCategorySelect, 'filter-details-', 'filter-details-section');
    });

    wordForm.addEventListener('submit', async function(event) {
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

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            const match = trimmedLine.match(wordMeaningRegex);
            let word = '';
            let meaning = '';
            if (match && match[1] && match[2]) {
                word = match[1].trim();
                meaning = match[2].trim();
            } else {
                const firstSpaceIndex = trimmedLine.indexOf(' ');
                if (firstSpaceIndex > 0 && firstSpaceIndex < trimmedLine.length -1) {
                    word = trimmedLine.substring(0, firstSpaceIndex).trim();
                    meaning = trimmedLine.substring(firstSpaceIndex + 1).trim();
                    console.warn(`정규표현식 매칭 실패, 첫 공백 기준으로 파싱: "${trimmedLine}" -> 단어: "${word}", 뜻: "${meaning}"`);
                } else {
                    parseErrorCount++;
                    console.warn(`파싱 오류: "${trimmedLine}"`); continue;
                }
            }
            if (!word || !meaning) { parseErrorCount++; console.warn(`파싱 후 단어 또는 뜻 누락: "${trimmedLine}"`); continue; }

            const wordData = { word: word, meaning: meaning, category: categoryValue, common_memo: commonMemoValue, details: {} };
            const detailSectionElements = document.querySelectorAll(`#details-${categoryValue} select, #details-${categoryValue} input[type="text"], #details-${categoryValue} textarea`);
            detailSectionElements.forEach(element => {
                const nameAttr = element.getAttribute('name');
                if (nameAttr) {
                    let key;
                    if (nameAttr.startsWith('tb_') || nameAttr.startsWith('wb_') || nameAttr.startsWith('me_') || nameAttr.startsWith('ext_')) {
                        key = nameAttr.substring(3);
                    } else if (nameAttr === "etc_memo") { key = "memo"; }
                    if (key) {
                        wordData.details[key] = element.value.trim() || null;
                         if (element.value.trim() === "" && element.tagName === 'SELECT') wordData.details[key] = null;
                    }
                }
            });
            wordsToInsert.push(wordData);
        }

        if (parseErrorCount > 0) { alert(`${parseErrorCount}개의 라인에서 단어와 뜻을 정확히 파싱하지 못했습니다. (콘솔 로그 확인)`); }
        if (wordsToInsert.length === 0) { alert('저장할 유효한 단어가 없습니다.'); return; }

        try {
            const { error } = await supabaseClient.from('words').insert(wordsToInsert);
            if (error) throw error;
            alert(`${wordsToInsert.length}개의 단어가 성공적으로 저장되었습니다.`);
            wordForm.reset(); categorySelect.value = "";
            toggleDetailSection(categorySelect, 'details-', 'details-section');
            loadWords();
        } catch (error) {
            console.error('Error saving words:', error);
            alert(`단어 저장 중 오류 발생: ${error.message}\n(오류 코드: ${error.code}, 상세: ${error.details})`);
        }
    });

    async function loadWords(filters = null) {
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
            }
            query = query.order('created_at', { ascending: false });
            const { data: words, error } = await query;
            if (error) throw error;
            renderWordList(words || []);
        } catch (error) {
            console.error('Error loading words:', error);
            alert(`단어 목록 로딩 중 오류 발생: ${error.message}`);
            renderWordList([]);
        }
    }

    function renderWordList(words) {
        wordTableBody.innerHTML = '';
        displayedWordCountSpan.textContent = words.length;
        selectAllCheckbox.checked = false; // 목록 새로고침 시 전체선택 해제
        toggleDeleteSelectedBtn(); // 선택된 항목 없으므로 버튼 숨김

        if (words.length > 0) {
            words.forEach(word => {
                const row = wordTableBody.insertRow();
                row.setAttribute('data-id', word.id);

                // 개별 체크박스 추가
                const checkboxCell = row.insertCell();
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('row-checkbox');
                checkbox.value = word.id; // 체크박스 값으로 단어 ID 사용
                checkbox.addEventListener('change', toggleDeleteSelectedBtn); // 개별 체크박스 변경 시 버튼 상태 업데이트
                checkboxCell.appendChild(checkbox);

                row.insertCell().textContent = word.word;
                row.insertCell().textContent = word.meaning;
                row.insertCell().textContent = getCategoryDisplayName(word.category);
                let detailsText = '-';
                if (word.details) {
                    const detailParts = [];
                    if (word.category === 'textbook') { if(word.details.grade) detailParts.push(word.details.grade); if(word.details.publisher) detailParts.push(word.details.publisher); if(word.details.lesson) detailParts.push(word.details.lesson); if(word.details.sentence_numbers) detailParts.push(word.details.sentence_numbers);
                    } else if (word.category === 'workbook') { if(word.details.publisher) detailParts.push(word.details.publisher); if(word.details.name) detailParts.push(word.details.name); if(word.details.unit) detailParts.push(word.details.unit); if(word.details.passage_number) detailParts.push(word.details.passage_number);
                    } else if (word.category === 'mock_exam') { if(word.details.year) detailParts.push(word.details.year); if(word.details.grade) detailParts.push(word.details.grade); if(word.details.month) detailParts.push(word.details.month); if(word.details.number) detailParts.push(word.details.number);
                    } else if (word.category === 'external') { if(word.details.school) detailParts.push(word.details.school); if(word.details.grade) detailParts.push(word.details.grade); if(word.details.name) detailParts.push(word.details.name);
                    } else if (word.category === 'etc') { if(word.details.memo) detailParts.push(word.details.memo); }
                    detailsText = detailParts.join(' / ') || '-';
                }
                row.insertCell().textContent = detailsText;
                row.insertCell().textContent = word.common_memo || '-';
                const actionsCell = row.insertCell();
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '삭제'; deleteBtn.classList.add('delete-btn');
                deleteBtn.onclick = () => deleteWord(word.id, word.word); // 개별 삭제는 유지
                actionsCell.appendChild(deleteBtn);
            });
            startTestBtn.style.display = 'block';
        } else {
            wordTableBody.innerHTML = `<tr><td colspan="7">표시할 단어가 없습니다.</td></tr>`; // colspan 7로 변경
            startTestBtn.style.display = 'none';
        }
    }

    filterWordsBtn.addEventListener('click', () => {
        const categoryValue = filterCategorySelect.value;
        const filters = { category: categoryValue, details: {} };
        if (categoryValue) {
            const filterDetailSection = document.getElementById(`filter-details-${categoryValue}`);
            if (filterDetailSection) {
                filterDetailSection.querySelectorAll('select, input[type="text"], textarea').forEach(element => {
                    const key = element.dataset.filterKey;
                    const value = element.value;
                    if (key && value !== '') { filters.details[key] = value; }
                });
            }
        }
        if (categoryValue === "") filters.category = null;
        loadWords(filters);
    });

    loadAllWordsBtn.addEventListener('click', () => {
        filterCategorySelect.value = "";
        toggleDetailSection(filterCategorySelect, 'filter-details-', 'filter-details-section');
        document.querySelectorAll('.filter-details-section select, .filter-details-section input[type="text"], .filter-details-section textarea').forEach(el => {
            if (el.tagName === 'SELECT') el.value = ""; else el.value = '';
        });
        loadWords();
    });

    function getCategoryDisplayName(categoryKey) {
        const names = { 'textbook': '교과서', 'workbook': '부교재', 'mock_exam': '모의고사', 'external': '외부지문', 'etc': '기타' };
        return names[categoryKey] || categoryKey;
    }

    async function deleteWord(wordId, wordText) { // 개별 삭제 함수
        if (!confirm(`'${wordText}' 단어를 정말로 삭제하시겠습니까?`)) return;
        try {
            const { error } = await supabaseClient.from('words').delete().eq('id', wordId);
            if (error) throw error;
            alert('단어가 성공적으로 삭제되었습니다.');
            refreshCurrentWordList();
        } catch (error) {
            console.error('Error deleting word:', error);
            alert(`단어 삭제 중 오류 발생: ${error.message}`);
        }
    }

    // --- 일괄 삭제 관련 로직 ---
    selectAllCheckbox.addEventListener('change', function() {
        wordTableBody.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        toggleDeleteSelectedBtn();
    });

    function toggleDeleteSelectedBtn() {
        const checkedCheckboxes = wordTableBody.querySelectorAll('.row-checkbox:checked');
        if (checkedCheckboxes.length > 0) {
            deleteSelectedBtn.style.display = 'inline-block';
        } else {
            deleteSelectedBtn.style.display = 'none';
        }
        // 모든 개별 체크박스가 선택되면 전체선택 체크박스도 체크, 아니면 해제
        const allRowCheckboxes = wordTableBody.querySelectorAll('.row-checkbox');
        if (allRowCheckboxes.length > 0 && checkedCheckboxes.length === allRowCheckboxes.length) {
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.checked = false;
        }
    }

    deleteSelectedBtn.addEventListener('click', async function() {
        const selectedIds = [];
        wordTableBody.querySelectorAll('.row-checkbox:checked').forEach(checkbox => {
            selectedIds.push(checkbox.value);
        });

        if (selectedIds.length === 0) {
            alert('삭제할 단어를 선택해주세요.');
            return;
        }

        if (!confirm(`선택된 ${selectedIds.length}개의 단어를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

        try {
            // Supabase는 한 번의 delete 호출로 여러 ID를 삭제하는 것을 in 필터로 지원
            const { error } = await supabaseClient
                                    .from('words')
                                    .delete()
                                    .in('id', selectedIds);
            if (error) throw error;
            alert(`${selectedIds.length}개의 단어가 성공적으로 삭제되었습니다.`);
            refreshCurrentWordList();
        } catch (error) {
            console.error('Error deleting selected words:', error);
            alert(`선택된 단어 삭제 중 오류 발생: ${error.message}`);
        }
    });

    // 현재 필터 상태를 유지하며 목록을 새로고침하는 헬퍼 함수
    function refreshCurrentWordList() {
        const currentFilterCategoryValue = filterCategorySelect.value;
        if (currentFilterCategoryValue && currentFilterCategoryValue !== "") {
            filterWordsBtn.click(); // 저장된 필터값으로 다시 로드
        } else {
            loadAllWordsBtn.click(); // 전체 목록 다시 로드
        }
    }


    startTestBtn.addEventListener('click', function() {
        // ... (이전과 동일)
        const wordsForTest = [];
        wordTableBody.querySelectorAll('tr').forEach(row => {
            const checkbox = row.querySelector('.row-checkbox'); // 체크박스는 제외하고 데이터 수집
            if (checkbox && row.cells.length > 2 && row.dataset.id) { // 체크박스 셀 다음부터 데이터
                 wordsForTest.push({
                    id: row.dataset.id,
                    word: row.cells[1].textContent, // 단어는 두 번째 셀
                    meaning: row.cells[2].textContent // 뜻은 세 번째 셀
                });
            }
        });
        if (wordsForTest.length === 0) { alert('테스트할 단어가 없습니다.'); return; }
        try {
            localStorage.setItem('wordsForTest', JSON.stringify(wordsForTest));
            const testWindow = window.open('test.html', '_blank');
            if (!testWindow) { alert('팝업 창이 차단되었습니다.'); }
        } catch (e) {
            console.error("localStorage/새 창 오류:", e); alert("테스트 시작 중 오류 발생.");
        }
    });

    // --- 패치노트 관련 로직 (이전과 동일) ---
    const patchNotesBtn = document.getElementById('patchNotesBtn');
    const patchNotesModal = document.getElementById('patchNotesModal');
    const closePatchNotesModalBtn = document.getElementById('closePatchNotesModal');
    const patchNotesContentDiv = document.getElementById('patchNotesContent');
    const patchNotesData = [
        {
            version: "v0.6.0", // 버전 업데이트
            date: "2025-05-15",
            notes: [
                "단어 목록 일괄 삭제 기능 추가 (체크박스 사용).",
                "전체 선택/해제 체크박스 기능 추가.",
                "선택된 항목이 있을 때만 '선택 단어 일괄 삭제' 버튼 표시."
            ]
        },
        { version: "v0.5.2", date: "2025-05-15", notes: ["단어/뜻 파싱 로직 개선 (정규표현식 사용).", "정규표현식 미매칭 시 이전 방식(첫 공백 기준)으로 파싱 시도 및 콘솔 경고 추가."] },
        { version: "v0.5.1", date: "2025-05-15", notes: ["단일 단어 수정 기능 및 관련 UI 요소(수정 버튼) 제거.", "단어 저장 로직에서 수정 관련 분기 제거 (항상 삽입)."] },
        { version: "v0.5.0", date: "2025-05-15", notes: ["패치노트 기능 추가: 오른쪽 상단 버튼 클릭 시 팝업 표시.", "패치노트 내용은 js/main.js의 patchNotesData 배열에 기록."] },
        { version: "v0.4.0", date: "2025-05-15", notes: ["교과서 상세 정보(학년, 출판사, 단원) 입력 방식을 드롭다운 선택으로 변경.", "필터 기능에서 교과서 상세 정보도 드롭다운으로 선택 가능하도록 수정.", "단어 입력 폼 및 필터 폼의 상세 섹션 UI 관리 로직 개선.", "단어 저장 시 상세 정보 키 추출 로직 개선."] },
        { version: "v0.3.0", date: "2025-05-15", notes: ["여러 단어 한 번에 입력 기능 추가 (textarea 사용).", "특정 조건으로 단어 목록 필터링 기능 추가 (분류 및 상세 정보 기반).", "필터링된 목록 기준으로 단어 테스트 시작 기능 구현.", "Supabase 클라이언트 초기화 방식 수정 (window.supabase 사용)."] },
        { version: "v0.2.0", date: "2025-05-14", notes: ["Supabase 연동: 단어 저장, 불러오기, 삭제 기능 구현.", "RLS (Row-Level Security) 정책 설정 안내 및 관련 오류 해결.", "Supabase 클라이언트 초기화 오류 해결."] },
        { version: "v0.1.0", date: "2025-05-13", notes: ["기본 HTML, CSS, JavaScript 구조 생성.", "단어 입력 폼, 단어 목록 표시, 단어 테스트 기본 흐름 구현 (DB 연동 전)."] }
    ];
    function displayPatchNotes() { /* ... (이전과 동일) ... */ patchNotesContentDiv.innerHTML = ''; patchNotesData.forEach(patch => { const versionHeader = document.createElement('h3'); versionHeader.textContent = `${patch.version} (${patch.date})`; patchNotesContentDiv.appendChild(versionHeader); const notesList = document.createElement('ul'); patch.notes.forEach(noteText => { const listItem = document.createElement('li'); listItem.textContent = noteText; notesList.appendChild(listItem); }); patchNotesContentDiv.appendChild(notesList); }); patchNotesModal.style.display = 'block'; }
    if (patchNotesBtn) { patchNotesBtn.addEventListener('click', displayPatchNotes); }
    if (closePatchNotesModalBtn) { closePatchNotesModalBtn.addEventListener('click', () => { patchNotesModal.style.display = 'none'; }); }
    window.addEventListener('click', (event) => { if (event.target == patchNotesModal) { patchNotesModal.style.display = 'none'; } });

    // --- 페이지 로드 시 초기화 ---
    loadWords();
    toggleDetailSection(categorySelect, 'details-', 'details-section');
    toggleDetailSection(filterCategorySelect, 'filter-details-', 'filter-details-section');
});