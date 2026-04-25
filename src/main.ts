import './styles.css';
import { BASE_HEIGHT, BASE_WIDTH } from './utils/constants';
import { InputManager } from './game/InputManager';
import { Game } from './game/Game';
import { GameLoop } from './game/GameLoop';

const canvas = document.getElementById('gameCanvas');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing canvas element #gameCanvas');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Failed to create 2D context');
}

canvas.width = BASE_WIDTH;
canvas.height = BASE_HEIGHT;

const resize = (): void => {
  const scale = Math.min(window.innerWidth / BASE_WIDTH, window.innerHeight / BASE_HEIGHT);
  canvas.style.width = `${Math.floor(BASE_WIDTH * scale)}px`;
  canvas.style.height = `${Math.floor(BASE_HEIGHT * scale)}px`;
};

window.addEventListener('resize', resize);
resize();

const input = new InputManager(window);
const game = new Game(input);
const loop = new GameLoop(game, ctx);
loop.start();
