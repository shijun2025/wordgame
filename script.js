 let wordList = [];
        let selectedBubble = null;
        let startTime = null;
        let errorCount = 0;
        const colors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#FFC1F3'];
        
        // 初始化音效（确保路径正确）
        const sounds = {
            click: new Audio('/wordgame/sounds/click.mp3'),
            correct: new Audio('/wordgame/sounds/correct.mp3'),
            wrong: new Audio('/wordgame/sounds/wrong.mp3'),
            win: new Audio('/wordgame/sounds/win.mp3')
        };

	// 事件监听器初始化
	document.addEventListener('DOMContentLoaded', function() {	
		document.getElementById('wordFile').addEventListener('change', loadWords);
		document.querySelector('button').addEventListener('click', startGame);
 	});

	// 所有函数定义...
	function loadWords() { /* ... */ }
	function startGame() { /* ... */ }
	// 其他函数...        
	function loadWords() {
            const file = document.getElementById('wordFile').files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                wordList = XLSX.utils.sheet_to_json(sheet, {header: ['english', 'chinese']});
            };
            reader.readAsArrayBuffer(file);
        }

        function startGame() {
            if(wordList.length < 30) return alert('请先导入至少30个单词');
            errorCount = 0;
            startTime = Date.now();
            document.getElementById('overlay').style.display = 'none';
            
            const selectedWords = getRandomWords(30);
            createBubbles(selectedWords);
        }

        function createBubbles(words) {
            const englishCol = document.getElementById('englishCol');
            const chineseCol = document.getElementById('chineseCol');
            englishCol.innerHTML = '';
            chineseCol.innerHTML = '';

            words.forEach(word => {
                createBubble(word.english, englishCol, word);
                createBubble(word.chinese, chineseCol, word);
            });
        }

        function createBubble(text, parent, word) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.textContent = text;
            bubble.dataset.word = JSON.stringify(word);
            
            // 随机位置和颜色
            bubble.style.left = `${Math.random()*80 + 10}%`;
            bubble.style.top = `${Math.random()*80 + 10}%`;
            bubble.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
            
            bubble.onclick = () => handleClick(bubble, word);
            parent.appendChild(bubble);
        }

        function handleClick(bubble, word) {
            sounds.click.play();
            bubble.classList.add('selected');
            
            if(!selectedBubble) {
                selectedBubble = {element: bubble, word};
            } else {
                const isPair = JSON.stringify(selectedBubble.word) === JSON.stringify(word);
                setTimeout(() => {
                    bubble.classList.remove('selected');
                    selectedBubble.element.classList.remove('selected');
                    
                    if(isPair) {
                        sounds.correct.play();
                        bubble.remove();
                        selectedBubble.element.remove();
                        checkWin();
                    } else {
                        sounds.wrong.play();
                        errorCount++;
                    }
                    selectedBubble = null;
                }, 500);
            }
        }

        function checkWin() {
            if(document.querySelectorAll('.bubble').length === 0) {
                sounds.win.play();
                const time = Math.floor((Date.now() - startTime)/1000);
                document.getElementById('stats').innerHTML = `
                    <p>单词数量: 30</p >
                    <p>通关时间: ${Math.floor(time/60)}分${time%60}秒</p >
                    <p>错误次数: ${errorCount}</p >
                `;
                document.getElementById('overlay').style.display = 'block';
            }
        }

        function getRandomWords(n) {
            return [...wordList].sort(() => Math.random() - 0.5).slice(0, n);
        }
