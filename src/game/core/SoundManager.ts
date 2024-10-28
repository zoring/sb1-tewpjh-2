import { isMobile } from '../../utils/device';

export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    const soundEffects = {
      'cannon': 'https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3',
      'machinegun': 'https://assets.mixkit.co/active_storage/sfx/2769/2769-preview.mp3',
      'plasma': 'https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3',
      'explosion': 'https://assets.mixkit.co/active_storage/sfx/2772/2772-preview.mp3',
      'hit': 'https://assets.mixkit.co/active_storage/sfx/2773/2773-preview.mp3',
      'powerup': 'https://assets.mixkit.co/active_storage/sfx/2774/2774-preview.mp3'
    };

    Object.entries(soundEffects).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = this.volume;
      this.sounds.set(key, audio);
    });
  }

  public play(soundName: string) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      // Clone the audio for overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(() => {
        // Ignore autoplay errors on mobile
      });
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }

  public toggle() {
    this.enabled = !this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}