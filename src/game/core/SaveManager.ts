interface GameSave {
  level: number;
  score: number;
  unlockedWeapons: string[];
  upgrades: string[];
  timestamp: number;
}

export class SaveManager {
  private static readonly SAVE_KEY = 'tank_battle_save';

  public static save(gameState: any): void {
    const saveData: GameSave = {
      level: gameState.level,
      score: gameState.score,
      unlockedWeapons: gameState.unlockedWeapons,
      upgrades: gameState.upgrades,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  public static load(): GameSave | null {
    try {
      const saveData = localStorage.getItem(this.SAVE_KEY);
      return saveData ? JSON.parse(saveData) : null;
    } catch (error) {
      console.error('Failed to load save:', error);
      return null;
    }
  }

  public static hasSave(): boolean {
    return !!localStorage.getItem(this.SAVE_KEY);
  }

  public static deleteSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }
}