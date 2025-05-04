document.addEventListener("DOMContentLoaded", () => {
    const gameState = {
        round: 1,
        maxRounds: 2,
        boardPhase: 'start',
        allowKeys: true,
        selectedCategory: null,
        selectedQuestion: null,
        activePlayer: null,
        controlPlayer: null,
        currentWager: 0,
        playerScores: {
            player1: 0,
            player2: 0,
            player3: 0
        },
        answeredQuestions: [],
        lastCategory: null,
        finalPlayerOrder: [],
        finalPlayerIndex: 0
    };
    
    const container = document.getElementById('jeopardy-container');
    const grid = document.getElementById("game-grid");
    const logBlock = document.getElementById("playerLogging");

    let transitionTime = 500;
    let lockTime = 250;
    
    if ( logBlock != null ) {
        transitionTime = 5;
    }

    function setPhase( phase ) {
        gameState.boardPhase = phase;
        jLog( `Phase set to: ${phase}` );
        container.setAttribute("data-phase", phase);
        
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

    // Final Jeopardy correct
    document.getElementById("final-correct").addEventListener("click", () => {
        finalAnswerResult(true);
    });
    
    // Final Jeopardy Incorrect
    document.getElementById("final-incorrect").addEventListener("click", () => {
        finalAnswerResult(false);
    });

    let players = ['player1','player2','player3'];
    let player1 = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'];
    let player2 = ['Numpad5', 'Numpad6', 'Numpad7', 'Numpad8'];
    let player3 = ['Numpad9', 'Numpad0', 'NumpadMultiply', 'NumpadSubtract'];

    // Testing
    player1 = ['Numpad9', 'KeyD'];
    player2 = ['Numpad0', 'KeyF'];
    player3 = ['NumpadMultiply', 'KeyG'];

    const keyToPlayerMap = {
        player1,
        player2,
        player3
    };

    document.addEventListener("keydown", (event) => {

        let matchedPlayer = null;

        // Allow Player Answer or Lockout90*-
        if ( gameState.boardPhase === "readingQuestion" || gameState.boardPhase === "allowAnswer" || gameState.boardPhase === "checkingAnswer" ) {
            for (const [player, keys] of Object.entries(keyToPlayerMap)) {
                if (keys.includes(event.code)) {
                    matchedPlayer = player;
                    handleBuzzerPress( player );
                }
            }
        }

        // Prevent all keypresses while board is transitioning
        if ( !gameState.allowKeys ) { 
            jLog("Keypresses disabled during transition");
            return
        };

        if (event.code === "Space") {
            handleSpacebarPress();
        }

        if ( event.code === "Enter" ) {
            handleEnterPress();
        }

        // Category / Question Select
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
            if ( gameState.boardPhase === "roundRunning" ) {
                gameState.selectedCategory = null;
                gameState.selectedQuestion = null;
                clearHighlights();
                jLog('Escape: Clearing Selections');
            }
            if ( gameState.boardPhase === "readingQuestion" ) {
                let cellId = gameState.selectedQuestion;
                console.log( cellId );
                document.getElementById('P' + cellId ).classList.remove("active");
                gameState.selectedCategory = null;
                gameState.selectedQuestion = null;
                clearHighlights();
                jLog('Escape: Backing out of question');
                setPhase( "roundRunning" );
            }
        }

        // Answer buttons
        if ( gameState.boardPhase === "awaitingAnswer" ) {
            let player = gameState.activePlayer;
            let thisQ = gameState.selectedQuestion;

            // Correct Answer
            if ( event.code === "Slash" ) {
                jLog( `${player} got ${thisQ} correct. Back to board`);
                giveScore( player, thisQ );

                document.querySelector('.board-control').classList.remove('board-control');
                setControl( player );

                finishQuestion( thisQ );
            }

            // Wrong Answer
            if ( event.code === "KeyX" ) {

                giveScore( player, thisQ, -1);

                if ( document.getElementById('P' + thisQ ).hasAttribute('daily-double' ) ) {
                    jLog( `${player} got the Daily Double wrong. Back out`);
                    finishQuestion( thisQ );
                } else {
                    jLog( `${player} got ${thisQ} wrong. Continue`);                    
                    disablePlayer( player );
                    container.classList.remove('answer-lights');
                    setPhase('allowAnswer');
                }
            }

            // Timed Out
            if ( event.code === "KeyT" ) {
                jLog( `${player} timed out.`);
                document.getElementById("times-up").play();
                giveScore( player, thisQ, -1);
                disablePlayer( player );
                container.classList.remove('answer-lights');
                setPhase('allowAnswer');
            }

        // Or no one answers
        } else if ( gameState.boardPhase === "allowAnswer" && event.code === "KeyX" ) {
            let thisQ = gameState.selectedQuestion;
            jLog( `No one answered ${thisQ} Back to board`);
            finishQuestion( thisQ );
        }
    });
    
    // Spacebar triggers everything 
    function handleSpacebarPress() {
        if (gameState.boardPhase === 'start') {
            startRound();
        } else if (gameState.boardPhase === 'displayCategories') {
            displayCategories();
        } else if (gameState.boardPhase === 'slideCategories') {
            slideNextCategories();
        } else if ( gameState.boardPhase === 'roundRunning' && gameState.selectedQuestion ) {
            displayQuestion(gameState.selectedQuestion);
        } else if ( gameState.boardPhase === 'readingQuestion' ) {
            allowAnswer();
        }

        // Final Jeopardy
        if ( gameState.boardPhase === 'finalJeopardy' ) {
            setPhase('finalCategory');
        } else if ( gameState.boardPhase === 'finalCategory' ) {
            setPhase('finalQuestion');
        } else if ( gameState.boardPhase === 'finalQuestion' ) {
            setPhase( 'finalCountdown' );
            document.getElementById("final-countdown").play();
        } else if ( gameState.boardPhase === 'finalCountdown' ) {
            setPhase( 'finalAnswers' );

            gameState.finalPlayerOrder = getFinalPlayersSorted();
            gameState.finalPlayerIndex = 0;
            showFinalAnswerPrompt();

        } else if (gameState.boardPhase === 'finalScores') {
            if (gameState.revealIndex > 0) {
                const index = 3 - gameState.revealIndex; // 0, 1, 2
                const { id, name, score } = gameState.finalResults[index];
        
                const div = document.getElementById(`final-score-${gameState.revealIndex}`); // 3 → 2 → 1
                if (div) {
                    div.innerText = `${name}: $${score}`;
                    div.classList.remove('invisible');
                }
        
                gameState.revealIndex--;
            } else {
                jLog("All final scores revealed.");
            }
        }
    }

    // Enter Triggers Wagers
    function handleEnterPress() {
        if ( gameState.boardPhase === 'dailyDouble' ) {
            displayDailyDouble();
        }
    }

    function startRound() {
        jLog("Round started");
        gameState.allowKeys = false;
        fillGameBoard( gameState.round );
    }

    function fillGameBoard( round ) {
        jLog("Filling Board");
        const audio = document.getElementById("board-fill-2016");
        if (audio) { audio.play(); }

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
            if ( gameState.activePlayer == null ) {
                setControl( 'player1' );
            }
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

    function setControl( player ) {
        gameState.activePlayer = player;
        let activePlayer = document.getElementById( player );
        activePlayer.classList.add('board-control');
        jLog( `Board control set to ${player}`);
    }

    function selectCategory(column) {
        clearHighlights();
        gameState.selectedCategory = column;
        document.querySelectorAll(`[id^="${column}"]`).forEach(cell => cell.classList.add("highlight"));
    }

    function selectQuestion(row) {
        clearHighlights();
        if (!gameState.selectedCategory) {
            gameState.selectedCategory = gameState.lastCategory;
        }
        
        let sqCellId = gameState.selectedCategory + row + gameState.round;

        if ( gameState.answeredQuestions.includes(sqCellId)) {
            
            jLog( `${sqCellId} has already been played` );

        } else {
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

            if ( thisQ.hasAttribute("daily-double") ) {

                startDailyDouble(cellId);

            } else {
                setPhase( "readingQuestion" );
                jLog("Showing question, showing lights");
                container.classList.add('show-lights');
            }
        }
    }

    function startDailyDouble() {
        setPhase( "dailyDouble" );
        jLog("Showing DD, showing wager");
        document.getElementById("daily-double").play();

        // Assign Values
        document.getElementById("dd-player").innerHTML = document.getElementById( gameState.activePlayer + '-name' ).innerHTML;
        let [min, max] = ddMinMax();
        document.getElementById("dd-min-max").innerHTML = (`$${min} - $${max}`);
    }

    function displayDailyDouble() {

        let wager = document.getElementById('dd-wager').value
        let [min, max] = ddMinMax();

        if ( wager >= min && wager <= max ) {
            // Allowed Wager
            jLog(`Allowed Wager - ${wager}`);

            setPhase( "awaitingAnswer" );
            setAnsweringPlayer( gameState.activePlayer );
            document.getElementById('dd-wager').value = 0;
            document.getElementById( gameState.selectedQuestion ).setAttribute( 'data-score', wager );

        } else {
            // Not allowed, try again
            jLog(`Select New Wager - ${wager}`);

        }        
    }

    function ddMinMax() {
        let player = gameState.activePlayer;
        let score = gameState.playerScores[ player ];

        let min = 5;
        let max = gameState.round * 1000;

        if ( score > max ) {
            max = score;
        }

        return [min, max];
    }

    function allowAnswer() {
        setPhase( "allowAnswer" );
        jLog( "Awaiting answer from player" );
        container.classList.add('trigger-lights');
    }

    function handleBuzzerPress( player ) {
        // Lock out if too early
        if ( gameState.boardPhase === "readingQuestion" ) {
            lockoutPlayer( player );
        }

        // Allow buzz if not locked
        if ( gameState.boardPhase === "allowAnswer" ) {
            let playerPodium = document.getElementById( player );
            if ( ! playerPodium.classList.contains('locked') && ! playerPodium.classList.contains('disabled') ) {
                setAnsweringPlayer( player );
                setPhase('awaitingAnswer');
                removeLockouts();
            }
        }
    }

    function lockoutPlayer( player ) {
        let $player = document.getElementById( player );

        if ( ! $player.classList.contains('locked') ) {
            $player.classList.add('locked');
            jLog( `${player} locked for ${lockTime}ms`);
            setTimeout(() => {
                $player.classList.remove('locked');
            }, lockTime );
        }
    }

    function disablePlayer( player ) {
        document.getElementById( player ).classList.add('disabled');
        document.getElementById( player ).classList.remove('answering');
        jLog( `${player} disabled from answering`);
    }

    function setAnsweringPlayer( player ) {
        gameState.activePlayer = player;
        jLog( `Active player set to ${player}`);
        container.classList.add('answer-lights');

        let $player = document.getElementById( player );
        $player.classList.add('answering');
    }

    function removeLockouts() {
        players.forEach((playerID) => {
            let player = document.getElementById(playerID);
            player.classList.remove('locked');
        });
    }

    function removeDisabled() {
        // Also reset answering since this only runs on end of question
        players.forEach((playerID) => {
            let player = document.getElementById(playerID);
            player.classList.remove('answering');
            player.classList.remove('disabled');
        });
    }

    function finishQuestion( cellId ) {
        gameState.answeredQuestions.push(cellId);

        let roundKey = `round-${gameState.round}`;
        localStorage.setItem(`${roundKey}-scores`, JSON.stringify(gameState.playerScores));
        localStorage.setItem(`${roundKey}-answered`, JSON.stringify(gameState.answeredQuestions));
        

        removeLockouts();
        removeDisabled();
        clearHighlights();
        container.className = '';

        let thisPrompt = document.getElementById('P' + cellId );
        let thisQ = document.getElementById( cellId );

        thisPrompt.classList.remove('active');
        thisQ.classList.add('answered');

        checkCategoryCompletion( cellId.charAt(0) );

        setPhase( 'roundRunning' );
        jLog( `${30 - gameState.answeredQuestions.length} questions remain` );

        // @TODO: If 30 questions answered, end of round
        if ( 30 - gameState.answeredQuestions.length === 0 ) {

            jLog( `End of round ${gameState.round}`);
            moveNextRound();
        }

        // @TODO: If 15 questions answered, go to commercial
    }

    function moveNextRound() {

        document.getElementById('bc-round-' + gameState.round ).classList.add('hidden');
        let thisCats = document.querySelectorAll('.round-cat-' + gameState.round );
        
        thisCats.forEach((tCat) => {
            tCat.classList.remove('visible');
        });

        gameState.round = gameState.round + 1;

        if ( gameState.round <= gameState.maxRounds ) {

            jLog( `Starting round ${gameState.round}`);

            document.getElementById('bc-round-' + gameState.round ).classList.remove('hidden');
            let nextCats = document.querySelectorAll('.round-cat-' + gameState.round );
            nextCats.forEach((nCat) => {
                nCat.classList.remove('visible');
            });

            setPhase( 'start' );

            let lowestPlayer = Object.keys(gameState.playerScores).reduce((lowest, player) => {
                return gameState.playerScores[player] < gameState.playerScores[lowest] ? player : lowest;
            });

            document.querySelector('.board-control').classList.remove('board-control');
            setControl( lowestPlayer );

            gameState.answeredQuestions = [];

        } else {
            jLog( 'Starting Final Jeopardy');

            Object.entries(gameState.playerScores).forEach(([player, score]) => {
                if (score <= 0) {
                    disablePlayer(player);
                    jLog(`${player} is ineligible for Final Jeopardy with $${score}`);
                }
            });

            setPhase( 'finalJeopardy' );
        }
    }

    function checkCategoryCompletion(column) {
        let answered = 0;
    
        for (let row = 1; row <= 5; row++) {
            const id = column + row + gameState.round;
            if (gameState.answeredQuestions.includes(id)) {
                answered++;
            }
        }

        jLog( answered );
    
        if (answered === 5) {
            jLog('on fifth');
            const catLabel = document.getElementById(`cat-${column}${gameState.round}`);
            jLog( catLabel );
            if (catLabel) {
                catLabel.classList.add('category-complete');
                jLog(`Category ${column} completed`);
            }
        }
    }

    function giveScore( player, thisQ, val = 1 ) {
        let qData = document.getElementById(thisQ);
        let playerPodium = document.getElementById( player );
        let playerScore = document.getElementById( player + '-score' );
        let score = qData.getAttribute('data-score');
        let currentScore = gameState.playerScores[ player ];
        let newScore = currentScore + ( score * val );

        jLog( `${player}'s score has been adjusted by ${score * val}`)

        gameState.playerScores[ player ] = newScore;
        playerScore.innerHTML = newScore;

        if ( newScore < 0 ) {
            playerPodium.classList.add('negative');
        } else {
            playerPodium.classList.remove('negative');
        }
    }

    function getFinalPlayersSorted() {
        return players
            .filter(p => !document.getElementById(p).classList.contains('disabled'))
            .sort((a, b) => gameState.playerScores[a] - gameState.playerScores[b]);
    }

    function showFinalAnswerPrompt() {
        let player = gameState.finalPlayerOrder[ gameState.finalPlayerIndex ];
        if ( ! player ) {
            finalizeFinalScores();
            return;
        }
    
        document.getElementById('final-answer-prompt').classList.remove('hidden');
        document.getElementById('final-player-name').innerText = document.getElementById(`${player}-name`).innerText;
        document.getElementById('final-wager-input').value = '';
    }

    function finalAnswerResult( correct ) {
        let player = gameState.finalPlayerOrder[gameState.finalPlayerIndex];
        let wager = parseInt(document.getElementById('final-wager-input').value) || 0;
        let scoreChange = correct ? wager : -wager;
    
        gameState.playerScores[player] += scoreChange;

        document.getElementById(`${player}-score`).innerText = gameState.playerScores[ player ];

        if ( gameState.playerScores[player] < 0 ) {
            document.getElementById(player).classList.add('negative');
        }
    
        gameState.finalPlayerIndex++;
        showFinalAnswerPrompt();
    }

    function finalizeFinalScores() {
        gameState.finalResults = players.map(p => ({
            id: p,
            name: document.getElementById(`${p}-name`).innerText,
            score: gameState.playerScores[p]
        }))
        .sort((a, b) => a.score - b.score);
    
        const finalScoresContainer = document.getElementById('final-scores');
        finalScoresContainer.innerHTML = ''; // Clear previous
    
        gameState.finalResults.forEach((player, index) => {
            const position = index + 1;
            const div = document.createElement('div');
            div.id = `final-score-${position}`;
            div.className = 'final-score invisible';
            div.innerText = `${player.name}: $${player.score}`;
            finalScoresContainer.appendChild(div);
        });
    
        document.getElementById('final-answer-prompt').classList.add('hidden');
        finalScoresContainer.classList.remove('hidden');
    
        gameState.revealIndex = 3; // Start from 3rd
        setPhase('finalScores');
        jLog('Final scores ready');
    }

    // Restarting
    function checkLocalStorageOnLoad() {
        for (let round = 1; round <= gameState.maxRounds; round++) {
            if (localStorage.getItem(`round-${round}-scores`) || localStorage.getItem(`round-${round}-answered`)) {
                const resume = confirm("Resume saved game?");
                if (resume) {
                    loadGameFromLocalStorage();
                } else {
                    clearLocalStorageData();
                }
                break;
            }
        }
    }

    function loadGameFromLocalStorage() {
        const savedRound = localStorage.getItem("saved-round") || "1";
        const scoresKey = `round-${savedRound}-scores`;
        const answeredKey = `round-${savedRound}-answered`;
    
        const savedScores = localStorage.getItem(scoresKey);
        const savedAnswered = localStorage.getItem(answeredKey);
    
        if (!savedScores || !savedAnswered) {
            jLog("No saved game found in localStorage.");
            return;
        }
    
        gameState.round = parseInt(savedRound);
        const scores = JSON.parse(savedScores);
        const answered = JSON.parse(savedAnswered);
    
        // Restore scores
        for (let player in scores) {
            gameState.playerScores[player] = scores[player];
            const scoreEl = document.getElementById(`${player}-score`);
            if (scoreEl) {
                scoreEl.innerText = scores[player];
            }
            const podium = document.getElementById(player);
            if (podium) {
                if (scores[player] < 0) {
                    podium.classList.add('negative');
                } else {
                    podium.classList.remove('negative');
                }
            }
        }
    
        gameState.answeredQuestions = answered;
    
        // Fill the board first
        gameState.allowKeys = false;
        fillGameBoard(gameState.round);
    
        setTimeout(() => {
            answered.forEach(cellId => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    cell.classList.add("answered");
                }
            });
            gameState.allowKeys = true;
            setPhase("roundRunning");
            jLog(`Resumed Round ${gameState.round}`);
        }, 6 * transitionTime + 100);
    }

    function clearLocalStorageData() {
        for (let round = 1; round <= gameState.maxRounds; round++) {
            localStorage.removeItem(`round-${round}-scores`);
            localStorage.removeItem(`round-${round}-answered`);
        }
    }
    
    checkLocalStorageOnLoad();
});
