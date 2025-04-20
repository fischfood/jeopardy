<?php
/* Standalone Jeopardy Game */

$baseScore = 200;
$categories = ['A', 'B', 'C', 'D', 'E', 'F'];

// include( 'data/data.php' );
include( 'data/data-sample.php' );

$maybeTesting = isset( $_GET['test'] ) ? 'jTest' : '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jeopardy Game</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
</head>
<body class="<?php echo $maybeTesting; ?>">
    <div id="jeopardy-container">
        <div id="game-grid">
            <div id="board">
                <div class="game-row category-row">
                    <?php for ( $i = 0; $i <= 5; $i++ ): ?>
                        <div class="game-cell category-cell">
                            <?php foreach( $data as $round => $dataRound ): ?>
                                <?php if ( is_numeric( $round ) ): ?>
                                    <div class="round-cat-name round-cat-<?php echo $round; ?>">
                                        <?php echo $dataRound['cats'][$i]; ?>
                                    </div>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </div>
                    <?php endfor; ?>
                </div>
                <?php foreach( $data as $round => $dataRound ): ?>
                    <?php if ( is_numeric( $round ) ): ?>
                        <?php $show = ( $round === 1 ) ? '' : 'hidden'; ?>
                        <div class="board-container <?php echo $show; ?>" id="bc-round-<?php echo $round; ?>">
                            <?php for ($row = 1; $row <= 5; $row++): ?>
                                <div class="game-row">
                                    <?php foreach ($categories as $col): ?>
                                        <div class="game-cell invisible" id="<?php echo $col . $row . $round; ?>" 
                                            data-question="<?php echo $col . $row . $round; ?>?" 
                                            data-answer="<?php echo $col . $row . $round; ?>A"
                                            data-score="<?php echo ( $round * $row * $baseScore ); ?>">
                                            $<?php echo ( $round * $row * $baseScore ); ?>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endfor; ?>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div> <?php // End #game-grid ?>

        <div id="scoreboard">
            <div class="player-score" id="player1">Player 1: $100</div>
            <div class="player-score" id="player2">Player 2: $0</div>
            <div class="player-score" id="player3">Player 3: $0</div>
            <?php if ( isset( $_GET['test'] ) ): ?>
                <div class="player-score ps-logging" id="playerLogging">
                    <span id="logPhase">start</span>
                    <span id="logJS"></span>
                </div>
            <?php endif; ?>
        </div> <?php // End #scoreboard ?>

        <div class="category-slider-container">
            <div id="categories-1" class="category-slider">
                <?php foreach ($data['1']['cats'] as $k => $cat): ?>
                    <div class="category-full" id="<?php echo $cat; ?>">
                        <div id="cf-1-<?php echo $k+1; ?>" class="category-text"><?php echo $cat; ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
            <div id="categories-2" class="category-slider">
                <?php foreach ($data['2']['cats'] as $cat): ?>
                    <div class="category-full" id="<?php echo $cat; ?>">
                        <div id="cf-2-<?php echo $k+1; ?>" class="category-text"><?php echo $cat; ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div> <?php // End .category-slider-container ?>

        <?php // Questions and Answers ?>
        <?php foreach( $data as $round => $dataRound ): ?>
            <?php if ( is_numeric( $round ) ): ?>
                <div class="prompt-container" id="prompt-round-<?php echo $round; ?>">
                    <?php for ($row = 1; $row <= 5; $row++): ?>
                        <?php foreach ($categories as $col): ?>
                            <div id="<?php echo 'P' . $col . $row . $round; ?>" class="prompt-cell col-<?php echo ord($col) - 65; ?> row-<?php echo $row; ?>">
                                <?php $qaData = $dataRound['questions'][$col . $row]; ?>
                                <div class="prompt-question">
                                    <?php echo $qaData['question']; ?>
                                </div>
                                <div class="prompt-answer">
                                    <?php echo $qaData['answer']; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endfor; ?>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>

        <div class="active-lights al-left"></div>
        <div class="active-lights al-right"></div>

    </div> <?php // End #jeopardy-container ?>

    <script src="js/script.js"></script>

    <?php $audio = preg_grep('/^([^.])/', scandir('assets/sounds')); ?>
    <?php foreach( $audio as $mp3 ): ?>
        <audio id="<?php echo str_replace(['jeopardy-','.mp3'], '', $mp3); ?>" src="assets/sounds/<?php echo $mp3; ?>" preload="audio"></audio>
    <?php endforeach; ?>
</body>
</html>
