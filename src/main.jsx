import './index.css'
import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, PIECES } from './const'

document.addEventListener('DOMContentLoaded', function () {
  const startScreen = document.getElementById('start-screen')
  const playButton = document.getElementById('play-button')
  const canvas = document.getElementById('gameCanvas')
  const context = canvas.getContext('2d')
  const nextPieceCanvas = document.getElementById('nextPieceCanvas')
  const nextPieceContext = nextPieceCanvas.getContext('2d')
  const $score = document.getElementById('score-span')
  const gameOverScreen = document.getElementById('game-over-screen')
  const finalScoreElement = document.getElementById('final-score')
  const restartButton = document.getElementById('restart-button')
  const restartButtonGame = document.getElementById('restart-button-game')
  const overlay = document.getElementById('overlay')

  const buttonPause = document.getElementById('pause-button')

  let isPaused = false

  playButton.addEventListener('click', function () {
    startScreen.style.visibility = 'hidden'

    canvas.width = BLOCK_SIZE * BOARD_WIDTH
    canvas.height = BLOCK_SIZE * BOARD_HEIGHT

    context.scale(BLOCK_SIZE, BLOCK_SIZE)
    nextPieceContext.scale(20, 20)

    const board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))

    const piece = {
      position: { x: 5, y: 5 },
      shape: [
        [1, 1],
        [1, 1]
      ]
    }
    const nextPiece = {
      shape: [
        [1, 1],
        [1, 1]
      ]
    }

    let dropCounter = 0
    let lastTime = 0
    let score = 0

    function selectNewShape () {
      nextPiece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
      nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height)

      // Calcular la posición inicial para centrar la pieza
      const offsetX = Math.floor((nextPieceCanvas.width / 20 - nextPiece.shape[0].length) / 2)
      const offsetY = Math.floor((nextPieceCanvas.height / 20 - nextPiece.shape.length) / 2)

      nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            nextPieceContext.fillStyle = 'red'
            nextPieceContext.fillRect(x + offsetX, y + offsetY, 1, 1)
          }
        })
      })
    }

    function draw () {
      context.fillStyle = '#000'
      context.fillRect(0, 0, canvas.width, canvas.height)

      board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value === 1) {
            context.fillStyle = 'yellow'
            context.fillRect(x, y, 1, 1)
          }
        })
      })

      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            context.fillStyle = 'red'
            context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
          }
        })
      })

      $score.innerText = score
    }

    function update (time = 0) {
      if (isPaused) {
        window.requestAnimationFrame(update)
        return
      }
      const deltaTime = time - lastTime
      lastTime = time
      dropCounter += deltaTime

      if (dropCounter > 500) {
        piece.position.y++
        dropCounter = 0
        if (checkCollision()) {
          piece.position.y--
          solidifyPiece()
          removeRows()
        }
      }
      draw()

      window.requestAnimationFrame(update)
    }

    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        piece.position.x--
        if (checkCollision()) {
          piece.position.x++
        }
      }
      if (event.key === 'ArrowRight') {
        piece.position.x++
        if (checkCollision()) {
          piece.position.x--
        }
      }
      if (event.key === 'ArrowDown') {
        piece.position.y++
        if (checkCollision()) {
          piece.position.y--
          solidifyPiece()
          removeRows()
        }
      }
      if (event.key === 'ArrowUp') {
        const rotated = []
        for (let i = 0; i < piece.shape[0].length; i++) {
          const row = []
          for (let j = piece.shape.length - 1; j >= 0; j--) {
            row.push(piece.shape[j][i])
          }
          rotated.push(row)
        }
        const previousShape = piece.shape
        piece.shape = rotated
        if (checkCollision()) {
          piece.shape = previousShape
        }
      }
    })

    function checkCollision () {
      return piece.shape.find((row, y) => {
        return row.find((value, x) => {
          return (
            value !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
          )
        })
      })
    }

    function solidifyPiece () {
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value === 1) {
            board[y + piece.position.y][x + piece.position.x] = 1
          }
        })
      })
      piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2)
      piece.position.y = 0
      piece.shape = nextPiece.shape

      if (!isPaused) {
        selectNewShape()
      }

      if (checkCollision()) {
        showGameOverScreen()
      }
    }

    function removeRows () {
      const rowsToRemove = []

      board.forEach((row, y) => {
        if (row.every(value => value === 1)) {
          rowsToRemove.push(y)
        }
      })

      rowsToRemove.forEach(y => {
        board.splice(y, 1)
        const newRow = Array(BOARD_WIDTH).fill(0)
        board.unshift(newRow)
        score += 10
      })
    }
    function showGameOverScreen () {
      gameOverScreen.style.display = 'block'
      finalScoreElement.innerText = score
      overlay.style.display = 'block'
      isPaused = true
    }

    function restartGame () {
      gameOverScreen.style.display = 'none'
      overlay.style.display = 'none'
      isPaused = false
      board.forEach((row) => row.fill(0))

      score = 0

      piece.position = { x: Math.floor(BOARD_WIDTH / 2 - 2), y: 0 }
      piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
      selectNewShape()

      nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height)
      draw()
    }

    restartButton.addEventListener('click', restartGame)
    restartButtonGame.addEventListener('click', restartGame)

    update()
  })

  buttonPause.addEventListener('click', () => {
    isPaused = !isPaused
  })
})
