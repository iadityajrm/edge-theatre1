
import { MicVAD, utils } from '@ricky0123/vad-web';

export class VADService {
  private vad: MicVAD | null = null;
  private onVoiceStartCallback: (() => void) | null = null;
  private onVoiceEndCallback: (() => void) | null = null;
  private onSpeechCallback: ((audio: Float32Array) => void) | null = null;

  async initialize() {
    try {
      console.log('Initializing VAD...');
      
      this.vad = await MicVAD.new({
        onSpeechStart: () => {
          console.log('Voice activity detected');
          this.onVoiceStartCallback?.();
        },
        onSpeechEnd: (audio) => {
          console.log('Voice activity ended');
          this.onVoiceEndCallback?.();
          this.onSpeechCallback?.(audio);
        },
        onVADMisfire: () => {
          console.log('VAD misfire detected');
        },
        positiveSpeechThreshold: 0.5,
        negativeSpeechThreshold: 0.35,
        preSpeechPadFrames: 10,
      });

      console.log('VAD initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VAD:', error);
    }
  }

  async start() {
    if (!this.vad) {
      await this.initialize();
    }
    
    if (this.vad) {
      this.vad.start();
      console.log('VAD started');
    }
  }

  pause() {
    if (this.vad) {
      this.vad.pause();
      console.log('VAD paused');
    }
  }

  destroy() {
    if (this.vad) {
      this.vad.destroy();
      this.vad = null;
      console.log('VAD destroyed');
    }
  }

  setVoiceStartCallback(callback: () => void) {
    this.onVoiceStartCallback = callback;
  }

  setVoiceEndCallback(callback: () => void) {
    this.onVoiceEndCallback = callback;
  }

  setSpeechCallback(callback: (audio: Float32Array) => void) {
    this.onSpeechCallback = callback;
  }
}

export const vadService = new VADService();
