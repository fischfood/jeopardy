document.addEventListener("DOMContentLoaded", () => {
    const gameState = {
        round: 1,
        maxRounds: 2,
        boardPhase: 'start',
        allowKeys: true,
        selectedCategory: null,
        selectedQuestion: null,
        activePlayer: null,
        playerScores: { 1: 0, 2: 0, 3: 0 },
        answeredQuestions: [],
        lastCategory: null
    };
    
    const grid = document.getElementById("game-grid");
    const categories = document.getElementById("categories");
    const scoreboard = document.getElementById("scoreboard");

    let transitionTime = 500;
    let logBlock = document.getElementById("playerLogging");
    
    if ( logBlock != null ) {
        transitionTime = 5;
    }

    function setPhase( phase ) {
        gameState.boardPhase = phase;
        jLog( `Phase set to: ${phase}` );
        grid.setAttribute("data-phase", phase);
        
        if ( logBlock != null ) {
            document.getElementById("logPhase").innerHTML = phase;
        }
    }

    function jLog( text ) {
        console.log( text );
        if ( logBlock != null ) {
            let logText = document.getElementById("logJS");
            let curText = logText.innerHTML;
            logText.innerHTML = text + "<br>" + curText;
        }
    }

    
    // Allow mouse over and click to select category and question
    grid.addEventListener("mouseover", (event) => {
        if ( gameState.boardPhase === "roundRunning" ) {
            if (event.target.classList.contains("game-cell")) {
                const cellId = event.target.id;
                const column = cellId.charAt(0);
                const row = cellId.charAt(1);
                // jLog( "Mouse over cell " + cellId );
                selectCategory(column);
                selectQuestion(row);
            }
        }
    });

    // On click of a selected question, load the question
    grid.addEventListener("click", (event) => {
        if ( gameState.boardPhase === "roundRunning" ) {
            if (event.target.classList.contains("game-cell")) {
                const cellId = event.target.id;
                const column = cellId.charAt(0);
                const row = cellId.charAt(1);
                selectCategory(column);
                selectQuestion(row);
                displayQuestion(cellId);
            }
        }
    });

    document.addEventListener("keydown", (event) => {

        // Prevent all keypresses while board is transitioning
        if ( !gameState.allowKeys ) { 
            jLog("Keypresses disabled during transition");
            return
        };

        if (event.code === "Space") {
            handleSpacebarPress();
        }

        if ( gameState.boardPhase === "roundRunning" ) {
            if (["KeyA", "KeyB", "KeyC", "KeyD", "KeyE", "KeyF"].includes(event.code)) {
                selectCategory(event.code.charAt(3));
                jLog( "Highlighting cat " + event.code.charAt(3) );
            } else if (["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"].includes(event.code)) {
                selectQuestion(event.code.charAt(5));
            }
        }

        // If escape is pressed, clear question and category
        if (event.code === "Escape") {
            gameState.selectedCategory = null;
            gameState.selectedQuestion = null;
            clearHighlights();
        }

        if (["Keypad1"].includes(event.code)) {
            const playerDiv = document.getElementById(`player1`);
            playerDiv.classList.add("active");
            setTimeout(() => {
                playerDiv.classList.remove("active");
            }, 100);
        }

        if (["Keypad5"].includes(event.code)) {
            const playerDiv = document.getElementById(`player2`);
            playerDiv.classList.add("active");
            setTimeout(() => {
                playerDiv.classList.remove("active");
            }, 100);
        }

        if (["open_bracket"].includes(event.code)) {
            const playerDiv = document.getElementById(`player3`);
            playerDiv.classList.add("active");
            setTimeout(() => {
                playerDiv.classList.remove("active");
            }, 100);
        }

        if ( gameState.selectedQuestion ) {
            if (["KeyI", "KeyO", "KeyP"].includes(event.code)) {
                handleBuzzIn(event.code);
            } else if (event.code === "Slash") {
                handleCorrectAnswer();
            } else if (event.code === "KeyX") {
                handleWrongAnswer();
            } else if (event.code === "Period") {
                skipQuestion();
            }
        }
    });
    
    // Spacebar triggers everything 
    function handleSpacebarPress() {
        if (gameState.boardPhase === 'start') {
            startGame();
        } else if (gameState.boardPhase === 'displayCategories') {
            displayCategories();
        } else if (gameState.boardPhase === 'slideCategories') {
            slideNextCategories();
        } else if (gameState.selectedQuestion) {
            displayQuestion(gameState.selectedQuestion);
        }
    }

    function startGame() {
        jLog("Game started");
        gameState.allowKeys = false;
        fillGameBoard( gameState.round );
    }

    function fillGameBoard( round ) {
        jLog("Filling Board");
        const audio = document.getElementById("board-fill-2016");
        if (audio) { audio.play(); }

        // let prices = [200, 400, 600, 800, 1000];
        let order = [
            ["A3", "B1", "C4", "E2", "F5"],
            ["A5", "B4", "D1", "D3", "F2"],
            ["A1", "B3", "C2", "D5", "E4"],
            ["A4", "B2", "C5", "E3", "F1"],
            ["C1", "C3", "D2", "E5", "F4"],
            ["A2", "B5", "D4", "E1", "F3"],
        ];
        order.forEach((batch, index) => {
            setTimeout(() => {
                batch.forEach(cell => {
                    document.getElementById(cell + gameState.round).classList.remove("invisible");
                    // document.getElementById(cell + gameState.round).innerText = `$${prices[cell[1]-1] * round}`;
                });
            }, index * transitionTime);
        });

        // once the board is filled, allow key events
        setTimeout(() => {
            gameState.allowKeys = true;
            setPhase( "displayCategories" );
        }, order.length * transitionTime);
    }

    function displayCategories() {
        jLog("Displaying Categories for Round " + gameState.round);
        let roundCats = document.getElementById("categories-" + gameState.round);
        roundCats.classList.add('visible');
        roundCats.setAttribute("catNum", "1");

        setTimeout(() => {
            let catDiv = roundCats.querySelector(`#cf-${gameState.round}-1`);
            catDiv.classList.add('visible');
            jLog( `Category 1 is now visible` );

            let boxes = document.querySelectorAll(".round-cat-" + gameState.round);
            boxes.forEach(box => {
                box.classList.add("visible");
            });
            jLog( `Category Bar is now visible` );
        }, transitionTime * 2);

        setPhase( "slideCategories" );
    }

    function slideNextCategories() {

        let roundCats = document.getElementById("categories-" + gameState.round);
        let currentCatNum = parseInt(roundCats.getAttribute("catNum"));
        let nextCatNum = currentCatNum + 1;

        if ( currentCatNum >= 6 ) {
            roundCats.classList.remove('visible');
            setPhase( "roundRunning" );
            return;
        }

        jLog( `Sliding Categories to number ${nextCatNum}` );
        roundCats.setAttribute("catNum", nextCatNum);
        // Add CSS style to move category left 100vw by number
        roundCats.style.left = `-${currentCatNum * 100}vw`;

        setTimeout(() => {
            let catDiv = roundCats.querySelector(`#cf-${gameState.round}-${nextCatNum}`);
            jLog( `Category ${nextCatNum} is now visible` );
            catDiv.classList.add('visible');
        }, transitionTime * 2);
    }

    function selectCategory(column) {
        clearHighlights();
        gameState.selectedCategory = column;
        document.querySelectorAll(`[id^="${column}"]`).forEach(cell => cell.classList.add("highlight"));
    }

    function selectQuestion(row) {
        if (!gameState.selectedCategory) {
            gameState.selectedCategory = gameState.lastCategory;
        }
        
        let sqCellId = gameState.selectedCategory + row + gameState.round;

        if ( gameState.answeredQuestions.includes(sqCellId)) {
            jLog( 'This cell has already been played' );
        } else {
            clearHighlights();

            gameState.selectedQuestion = sqCellId;
            document.getElementById(sqCellId).classList.add("highlight");
            jLog( "Selecting cell " + sqCellId );
        }
    }

    function clearHighlights() {
        document.querySelectorAll(".highlight").forEach(cell => cell.classList.remove("highlight"));
    }

    function displayQuestion(cellId) {
        if (gameState.answeredQuestions.includes(cellId)) {
            jLog( "Already played cell " + cellId );
        } else {
            clearHighlights();
            jLog( "Loading cell " + cellId );
            let thisQ = document.getElementById('P' + cellId )
            thisQ.classList.add('active');
            setPhase( "readingQuestion" );
        }
    }

    // Not done yet
    function handleBuzzIn(playerKey) {
        let player = { "KeyI": 1, "KeyO": 2, "KeyP": 3 }[playerKey];
        gameState.activePlayer = player;
        highlightPlayer(player);
    }

    function handleCorrectAnswer() {
        let value = getQuestionValue(gameState.selectedQuestion);
        gameState.playerScores[gameState.activePlayer] += value;
        updateScoreboard();
        revealAnswer();
    }

    function handleWrongAnswer() {
        let value = getQuestionValue(gameState.selectedQuestion);
        gameState.playerScores[gameState.activePlayer] -= value;
        updateScoreboard();
        resetBuzzers();
    }

    function skipQuestion() {
        revealAnswer();
    }

    function revealAnswer() {
        // Reveal correct answer and continue game logic
        gameState.answeredQuestions.push(gameState.selectedQuestion);
        gameState.selectedQuestion = null;
        gameState.boardActive = true;
    }

    function getQuestionValue(cell) {
        return parseInt(document.getElementById(cell + gameState.round).innerText.replace('$', ''));
    }

    

    function highlightPlayer(player) {
        document.getElementById(`player${player}`).classList.add("answering");
    }

    function resetBuzzers() {
        document.querySelectorAll(".answering").forEach(el => el.classList.remove("answering"));
        gameState.activePlayer = null;
    }

    function updateScoreboard() {
        Object.keys(gameState.playerScores).forEach(player => {
            let scoreDiv = document.getElementById(`score${player}`);
            scoreDiv.innerText = `$${gameState.playerScores[player]}`;
            if (gameState.playerScores[player] < 0) {
                scoreDiv.classList.add("negative");
            } else {
                scoreDiv.classList.remove("negative");
            }
        });
    }
});
