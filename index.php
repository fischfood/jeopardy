<?php
/* Standalone Jeopardy Game */

$baseScore = 200;
$categories = ['A', 'B', 'C', 'D', 'E', 'F'];

// Sample array of categories, questions, and answers
$data = [
    '1' => [
        'cats' => ['Mush', 'All About Mush', 'Family Photos', 'I HATE WORKING', 'Chicken Shit', 'Pringles'],
        'questions' => [
            'A1' => ['question' => 'Question 1A', 'answer' => 'Answer 1A'],
            'B1' => ['question' => 'Question 1B', 'answer' => 'Answer 1B'],
            'C1' => ['question' => 'Question 1C', 'answer' => 'Answer 1C'],
            'D1' => ['question' => 'Question 1D', 'answer' => 'Answer 1D'],
            'E1' => ['question' => 'Question 1E', 'answer' => 'Answer 1E'],
            'F1' => ['question' => 'Question 1F', 'answer' => 'Answer 1F'],
            'A2' => ['question' => 'Question 2A', 'answer' => 'Answer 2A'],
            'B2' => ['question' => 'Question 2B', 'answer' => 'Answer 2B'],
            'C2' => ['question' => 'Question 2C', 'answer' => 'Answer 2C'],
            'D2' => ['question' => 'Question 2D', 'answer' => 'Answer 2D'],
            'E2' => ['question' => 'Question 2E', 'answer' => 'Answer 2E'],
            'F2' => ['question' => 'Question 2F', 'answer' => 'Answer 2F'],
            'A3' => ['question' => 'Question 3A', 'answer' => 'Answer 3A'],
            'B3' => ['question' => 'Question 3B', 'answer' => 'Answer 3B'],
            'C3' => ['question' => 'Question 3C', 'answer' => 'Answer 3C'],
            'D3' => ['question' => 'Question 3D', 'answer' => 'Answer 3D'],
            'E3' => ['question' => 'Question 3E', 'answer' => 'Answer 3E'],
            'F3' => ['question' => 'Question 3F', 'answer' => 'Answer 3F'],
            'A4' => ['question' => 'Question 4A', 'answer' => 'Answer 4A'],
            'B4' => ['question' => 'Question 4B', 'answer' => 'Answer 4B'],
            'C4' => ['question' => 'Question 4C', 'answer' => 'Answer 4C'],
            'D4' => ['question' => 'Question 4D', 'answer' => 'Answer 4D'],
            'E4' => ['question' => 'Question 4E', 'answer' => 'Answer 4E'],
            'F4' => ['question' => 'Question 4F', 'answer' => 'Answer 4F'],
            'A5' => ['question' => 'Question 5A', 'answer' => 'Answer 5A'],
            'B5' => ['question' => 'Question 5B', 'answer' => 'Answer 5B'],
            'C5' => ['question' => 'Question 5C', 'answer' => 'Answer 5C'],
            'D5' => ['question' => 'Question 5D', 'answer' => 'Answer 5D'],
            'E5' => ['question' => 'Question 5E', 'answer' => 'Answer 5E'],
            'F5' => ['question' => 'Question 5F', 'answer' => 'Answer 5F'],
        ],
    ],
    '2' => [
        'cats' => ['A2', 'B2', 'C2', 'D2', 'E2', 'F2'],
        'questions' => [
            'A1' => ['question' => 'Question 1A', 'answer' => 'Answer 1A'],
            'B1' => ['question' => 'Question 1B', 'answer' => 'Answer 1B'],
            'C1' => ['question' => 'Question 1C', 'answer' => 'Answer 1C'],
            'D1' => ['question' => 'Question 1D', 'answer' => 'Answer 1D'],
            'E1' => ['question' => 'Question 1E', 'answer' => 'Answer 1E'],
            'F1' => ['question' => 'Question 1F', 'answer' => 'Answer 1F'],
            'A2' => ['question' => 'Question 2A', 'answer' => 'Answer 2A'],
            'B2' => ['question' => 'Question 2B', 'answer' => 'Answer 2B'],
            'C2' => ['question' => 'Question 2C', 'answer' => 'Answer 2C'],
            'D2' => ['question' => 'Question 2D', 'answer' => 'Answer 2D'],
            'E2' => ['question' => 'Question 2E', 'answer' => 'Answer 2E'],
            'F2' => ['question' => 'Question 2F', 'answer' => 'Answer 2F'],
            'A3' => ['question' => 'Question 3A', 'answer' => 'Answer 3A'],
            'B3' => ['question' => 'Question 3B', 'answer' => 'Answer 3B'],
            'C3' => ['question' => 'Question 3C', 'answer' => 'Answer 3C'],
            'D3' => ['question' => 'Question 3D', 'answer' => 'Answer 3D'],
            'E3' => ['question' => 'Question 3E', 'answer' => 'Answer 3E'],
            'F3' => ['question' => 'Question 3F', 'answer' => 'Answer 3F'],
            'A4' => ['question' => 'Question 4A', 'answer' => 'Answer 4A'],
            'B4' => ['question' => 'Question 4B', 'answer' => 'Answer 4B'],
            'C4' => ['question' => 'Question 4C', 'answer' => 'Answer 4C'],
            'D4' => ['question' => 'Question 4D', 'answer' => 'Answer 4D'],
            'E4' => ['question' => 'Question 4E', 'answer' => 'Answer 4E'],
            'F4' => ['question' => 'Question 4F', 'answer' => 'Answer 4F'],
            'A5' => ['question' => 'Question 5A', 'answer' => 'Answer 5A'],
            'B5' => ['question' => 'Question 5B', 'answer' => 'Answer 5B'],
            'C5' => ['question' => 'Question 5C', 'answer' => 'Answer 5C'],
            'D5' => ['question' => 'Question 5D', 'answer' => 'Answer 5D'],
            'E5' => ['question' => 'Question 5E', 'answer' => 'Answer 5E'],
            'F5' => ['question' => 'Question 5F', 'answer' => 'Answer 5F'],
        ],
    ],
    'final' => [
        'cat' => 'Final Jeopardy',
        'question' => 'Final Jeopardy Question',
        'answer' => 'Final Jeopardy Answer',
    ]
];
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

    </div> <?php // End #jeopardy-container ?>

    <script src="js/script.js"></script>

    <?php $audio = preg_grep('/^([^.])/', scandir('assets/sounds')); ?>
    <?php foreach( $audio as $mp3 ): ?>
        <audio id="<?php echo str_replace(['jeopardy-','.mp3'], '', $mp3); ?>" src="assets/sounds/<?php echo $mp3; ?>" preload="audio"></audio>
    <?php endforeach; ?>

    <?php // Questions and Answers ?>
    <?php foreach( $data as $round => $dataRound ): ?>
        <?php if ( is_numeric( $round ) ): ?>
            <div class="prompt-container" id="prompt-round-<?php echo $round; ?>">
                <?php for ($row = 1; $row <= 5; $row++): ?>
                    <?php foreach ($categories as $col): ?>
                        <div id="<?php echo 'P' . $col . $row . $round; ?>" class="prompt-cell col-<?php echo ord($col) - 65; ?> row-<?php echo $row; ?>">
                            <?php $qaData = $dataRound['questions'][$col . $row]; ?>
                            <div class="prompt-question">
                            Later the top Norse god, with his brothers he slew the giant Ymir & constructed the world from the corpse <?php //echo $qaData['question']; ?>
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

</body>
</html>
