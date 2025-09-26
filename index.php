<?php
/* Standalone Jeopardy Game */

$baseScore = 200;
$categories = ['A', 'B', 'C', 'D', 'E', 'F'];
$players = ['Player 1', 'Player 2', 'Player 3'];

include( 'data/data.php' );
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
                                    <div id="cat-<?php echo $categories[$i] . $round; ?>" class="round-cat-name round-cat-<?php echo $round; ?>">
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

        <div id="final-jeopardy">
            <div id="final-start"></div>
            <?php foreach( $data['final'] as $key => $val ): ?>
                <div id="final-<?php echo $key; ?>" class="hidden">
                    <?php echo $val; ?>
                </div>
            <?php endforeach; ?>
            <div id="final-answer-prompt" class="hidden">
                <div id="final-player-name"></div>
                <input type="number" id="final-wager-input" />
                <div class="final-prompt-buttons">
                    <button id="final-correct">Correct</button>
                    <button id="final-incorrect">Incorrect</button>
                </div>
            </div>
            <div id="final-scores" class="hidden">
                <?php foreach( $players as $place => $score ): ?>
                    <div id="final-score-<?php echo $place + 1; ?>" class="final-score invisible"></div>
                <?php endforeach; ?>
            </div>
        </div>

        <div id="scoreboard">
            <?php foreach( $players as $k => $player ): ?>
                <?php $key = $k + 1; ?>
                <div class="player-podium" id="player<?php echo $key; ?>">
                    <div class="player-score">
                        $<span id="player<?php echo $key; ?>-score">0</span>
                    </div>
                    <div class="player-name" id="player<?php echo $key;?>-name" style="background-image: url( 'images/JeopardyNameplates_Wide-0<?php echo $key; ?>.png' )">
                        <?php echo $player; ?>
                    </div>
                </div>
            <?php endforeach; ?>
            
            <?php if ( isset( $_GET['test'] ) ): ?>
                <div class="player-podium ps-logging" id="playerLogging">
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
                <?php foreach ($data['2']['cats'] as $k => $cat): ?>
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
                            <?php $key = $col . $row . $round; ?>
                            <?php $dd = ( array_key_exists( 'dd', $dataRound ) && in_array( $col . $row, $dataRound['dd'] ) ) ? 'daily-double="true"' : ''; ?>
                            <div <?php echo $dd; ?> id="<?php echo 'P' . $key; ?>" class="prompt-cell col-<?php echo ord($col) - 65; ?> row-<?php echo $row; ?>">
                                <?php $qaData = $dataRound['questions'][$col . $row]; ?>

                                <?php $image = $image_class = ''; ?>

                                <?php /* if ( file_exists( __DIR__ . '/images/' . $key . '.jpg' ) ) {
                                    $image = 'images/' . $key . '.jpg';
                                    $image_class = 'has-image';
                                } elseif ( file_exists( __DIR__ . '/images/' . $key . '.png' ) ) {
                                    $image = 'images/' . $key . '.png';
                                    $image_class = 'has-image';
                                } */ ?>

                                <?php if ( array_key_exists( 'img', $qaData ) ) {
                                    $image = 'images/prompts/' . $qaData['img'];
                                    $image_class = 'has-image';
                                } ?>

                                <div class="prompt-question <?php echo $image_class; ?>" style="background-image: url( <?php echo $image; ?>);">
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

        <?php foreach( ['left','right'] as $dir ): ?>
            <div class="active-lights al-<?php echo $dir; ?>">
                <?php foreach( ['off','lit'] as $lit ): ?>
                    <div class="timer-lights tl-<?php echo $lit; ?>">
                        <div class="tl-container">
                            <?php for ( $i = 0; $i < 9; $i++ ): ?>
                                <i></i>
                            <?php endfor; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>

        <div id="daily-double-wager">
            <div id="daily-double-wager-inner">
                <p id="dd-player">NAME</p>
                <p class="ddmm">
                    Please choose a wager between <span id="dd-min-max">$5 and <?php echo $baseScore * 5; ?></span>
                </p>
                <input id="dd-wager" type="number" min="5" max="<?php echo $baseScore * 5; ?>" />
            </div>
        </div>

    </div> <?php // End #jeopardy-container ?>

    <script src="js/script.js"></script>

    <?php $audio = preg_grep('/^([^.])/', scandir('assets/sounds')); ?>
    <?php foreach( $audio as $mp3 ): ?>
        <audio id="<?php echo str_replace(['jeopardy-','.mp3'], '', $mp3); ?>" src="assets/sounds/<?php echo $mp3; ?>" preload="audio"></audio>
    <?php endforeach; ?>
</body>
</html>
