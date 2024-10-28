import { Tank } from '../entities/Tank';
import { Projectile } from '../entities/Projectile';

export class CollisionManager {
  private static TANK_HITBOX_RADIUS = 25;

  public static checkCollision(projectile: Projectile, tank: Tank): boolean {
    const dx = projectile.position.x - tank.position.x;
    const dy = projectile.position.y - tank.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.TANK_HITBOX_RADIUS;
  }

  public static checkTankCollision(tank1: Tank, tank2: Tank): boolean {
    const dx = tank1.position.x - tank2.position.x;
    const dy = tank1.position.y - tank2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.TANK_HITBOX_RADIUS * 2;
  }
}