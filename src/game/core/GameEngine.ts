import { Tank } from '../entities/Tank';
import { Projectile } from '../entities/Projectile';
import { TerrainEffect } from '../effects/TerrainEffect';
import { WeatherEffect } from '../effects/WeatherEffect';
import { TankAI } from '../ai/TankAI';
import { Camera } from '../Camera';
import { Vector2D } from '../types';
import { Dispatch } from 'react';
import { GameAction } from '../../context/GameContext';
import { LevelManager } from '../LevelManager';
import { InputManager } from './InputManager';
import { CollisionManager } from './CollisionManager';
import { isMobile } from '../../utils/device';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerTank: Tank;
  private enemyTanks: { tank: Tank; ai: TankAI }[];
  private projectiles: Projectile[];
  private lastShot: number;
  private terrainEffect: TerrainEffect;
  private weatherEffect: WeatherEffect;
  private camera: Camera;
  private worldSize = { width: 3000, height: 3000 };
  private specialAbilityCooldown: number = 0;
  private dispatch: Dispatch<GameAction>;
  private lastUpdateTime: number = 0;
  private currentTime: number = 0;
  private levelManager: LevelManager;
  private enemiesDestroyed: number = 0;
  private inputManager: InputManager;

  constructor(canvas: HTMLCanvasElement, dispatch: Dispatch<GameAction>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dispatch = dispatch;
    this.currentTime = Date.now();
    this.levelManager = new LevelManager(1, dispatch);
    
    const currentLevel = this.levelManager.getCurrentLevel();
    this.playerTank = new Tank(
      currentLevel.playerStart.x, 
      currentLevel.playerStart.y, 
      true
    );
    
    this.camera = new Camera(canvas, this.playerTank, this.worldSize);
    this.enemyTanks = this.createEnemyTanks(currentLevel);
    this.projectiles = [];
    this.lastShot = 0;
    
    this.terrainEffect = new TerrainEffect(this.ctx, currentLevel.terrain, this.worldSize);
    this.weatherEffect = new WeatherEffect(this.ctx, currentLevel.weather);
    this.inputManager = new InputManager(canvas, isMobile());
  }

  private createEnemyTanks(level: any) {
    const tanks: { tank: Tank; ai: TankAI }[] = [];
    for (let i = 0; i < level.enemyCount; i++) {
      const x = Math.random() * (this.worldSize.width - 200) + 100;
      const y = Math.random() * (this.worldSize.height - 200) + 100;
      const tank = new Tank(x, y, false);
      tanks.push({
        tank,
        ai: new TankAI(tank, this.playerTank, this.worldSize.width, this.worldSize.height)
      });
    }
    return tanks;
  }

  private updatePlayerTank(deltaTime: number) {
    const input = this.inputManager.getInput();
    const direction = { x: 0, y: 0 };
    
    if (input.up) direction.y -= 1;
    if (input.down) direction.y += 1;
    if (input.left) direction.x -= 1;
    if (input.right) direction.x += 1;

    if (direction.x !== 0 || direction.y !== 0) {
      const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      direction.x /= length;
      direction.y /= length;
      
      const terrainModifier = this.terrainEffect.getMovementModifier(this.playerTank.position);
      direction.x *= terrainModifier;
      direction.y *= terrainModifier;

      this.playerTank.move(direction);
      this.playerTank.rotation = Math.atan2(direction.y, direction.x);
    }

    if (input.shoot && this.currentTime - this.lastShot > 500) {
      this.shoot(this.playerTank);
      this.lastShot = this.currentTime;
    }

    this.playerTank.update();
  }

  private updateEnemyTanks(deltaTime: number) {
    this.enemyTanks.forEach(({ tank, ai }) => {
      const command = ai.update();
      if (command?.shoot) {
        this.shoot(tank);
      }
      tank.update();
    });
  }

  private updateProjectiles(deltaTime: number) {
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update();
      
      if (projectile.position.x < 0 || projectile.position.x > this.worldSize.width ||
          projectile.position.y < 0 || projectile.position.y > this.worldSize.height) {
        return false;
      }
      
      return projectile.active;
    });
  }

  private handleCollisions() {
    this.projectiles.forEach(projectile => {
      if (CollisionManager.checkCollision(projectile, this.playerTank)) {
        projectile.active = false;
        const destroyed = this.playerTank.takeDamage(projectile.damage);
        if (destroyed) {
          this.dispatch({ type: 'UPDATE_HEALTH', payload: 0 });
        }
      }

      this.enemyTanks = this.enemyTanks.filter(({ tank }) => {
        if (CollisionManager.checkCollision(projectile, tank)) {
          projectile.active = false;
          const destroyed = tank.takeDamage(projectile.damage);
          if (destroyed) {
            this.enemiesDestroyed++;
            this.dispatch({ type: 'ENEMY_DESTROYED', payload: undefined });
            this.dispatch({ type: 'UPDATE_SCORE', payload: 100 });
            return false;
          }
        }
        return true;
      });
    });
  }

  private shoot(tank: Tank) {
    const offset = 30;
    const startPos = {
      x: tank.position.x + Math.cos(tank.turretRotation) * offset,
      y: tank.position.y + Math.sin(tank.turretRotation) * offset
    };
    this.projectiles.push(new Projectile(startPos, tank.turretRotation));
  }

  public update() {
    this.currentTime = Date.now();
    const deltaTime = (this.currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = this.currentTime;

    this.updatePlayerTank(deltaTime);
    this.updateEnemyTanks(deltaTime);
    this.updateProjectiles(deltaTime);
    this.handleCollisions();
    this.camera.update();
    this.weatherEffect.update();
    
    this.levelManager.updateObjectives(
      this.playerTank.position,
      this.enemiesDestroyed
    );

    this.updateGameState();
  }

  public draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.camera.applyTransform(this.ctx);
    this.terrainEffect.draw();
    this.playerTank.draw(this.ctx);
    this.enemyTanks.forEach(({ tank }) => tank.draw(this.ctx));
    this.projectiles.forEach(projectile => projectile.draw(this.ctx));
    this.camera.resetTransform(this.ctx);
    
    this.weatherEffect.draw();
  }

  private updateGameState() {
    this.dispatch({ type: 'UPDATE_HEALTH', payload: this.playerTank.health });
    this.dispatch({ type: 'UPDATE_ARMOR', payload: this.playerTank.armor });
    this.dispatch({ type: 'UPDATE_ENERGY', payload: this.playerTank.energy });
  }

  public handleResize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.updateViewport(width, height);
  }

  public getPlayerTank() {
    return this.playerTank;
  }

  public getEnemyTanks() {
    return this.enemyTanks.map(({ tank }) => tank);
  }

  public getCameraPosition() {
    return this.camera.getPosition();
  }

  public getLevelObjectives() {
    return this.levelManager.getObjectives();
  }

  public handleTouchMove(direction: Vector2D) {
    this.inputManager.handleTouchInput(direction);
  }

  public handleTouchShoot(shooting: boolean) {
    this.inputManager.handleTouchShoot(shooting);
  }

  public cleanup() {
    this.inputManager.cleanup();
  }
}