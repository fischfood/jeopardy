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
        playerScores: {
            player1: 0,
            player2: 0,
            player3: 0
        },
        answeredQuestions: [],
        lastCategory: null
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

    let players = ['player1','player2','player3'];
    let player1 = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'];
    let player2 = ['Numpad5', 'Numpad6', 'Numpad7', 'Numpad8'];
    let player3 = ['Numpad9', 'Numpad0', 'NumpadMultiply', 'NumpadSubtract'];

    // Testing
    player1 = ['Numpad9'];
    player2 = ['Numpad0'];
    player3 = ['NumpadMultiply'];

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
                finishQuestion( thisQ );
                document.querySelector('.board-control').classList.remove('board-control');
                setControl( player );
            }

            // Wrong Answer
            if ( event.code === "KeyX" ) {
                jLog( `${player} got ${thisQ} wrong. Continue`);
                giveScore( player, thisQ, -1);
                disablePlayer( player );
                container.classList.remove('answer-lights');
                setPhase('allowAnswer');
            }

            // Wrong Answer
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
            startGame();
        } else if (gameState.boardPhase === 'displayCategories') {
            displayCategories();
        } else if (gameState.boardPhase === 'slideCategories') {
            slideNextCategories();
        } else if ( gameState.boardPhase === 'roundRunning' && gameState.selectedQuestion ) {
            displayQuestion(gameState.selectedQuestion);
        } else if ( gameState.boardPhase === 'readingQuestion' ) {
            allowAnswer();
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
            setPhase( "readingQuestion" );
            jLog("Showing question, showing lights");
            container.classList.add('show-lights');
        }
    }

    function allowAnswer() {
        setPhase( "allowAnswer" );
        jLog( "Awaiting answer from players" );
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
        gameState.answeredQuestions.push( cellId );
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

        // @TODO: If 15 questions answered, go to commercial
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

        gameState.playerScores[ player ] = newScore;
        playerScore.innerHTML = newScore;

        if ( newScore < 0 ) {
            playerPodium.classList.add('negative');
        } else {
            playerPodium.classList.remove('negative');
        }
    }
});
