
import { voskDetector } from './vosk';
import { vadService } from './vad';

export class WakeWordService {
  private isInitialized = false;
  private isListening = false;
  private onWakeWordCallback: (() => void) | null = null;
  private onCommandCallback: ((command: string) => void) | null = null;
  private audioStream: MediaStream | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Wake Word Service...');
      
      // Get microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Initialize VAD
      await vadService.initialize();
      
      // Set up VAD callbacks
      vadService.setVoiceStartCallback(() => {
        console.log('Voice detected by VAD');
      });

      vadService.setSpeechCallback((audio: Float32Array) => {
        // Process audio through Vosk when speech is detected
        this.processAudioWithVosk(audio);
      });

      // Initialize Vosk
      await voskDetector.initialize();
      
      // Set up Vosk callbacks
      voskDetector.setWakeWordCallback(() => {
        this.onWakeWordCallback?.();
      });

      voskDetector.setCommandCallback((command: string) => {
        this.onCommandCallback?.(command);
      });

      this.isInitialized = true;
      console.log('Wake Word Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Wake Word Service:', error);
      throw error;
    }
  }

  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isListening) {
      // Start VAD
      await vadService.start();
      
      // Start Vosk with audio stream
      if (this.audioStream) {
        await voskDetector.startListening(this.audioStream);
      }

      this.isListening = true;
      console.log('Wake word detection started');
    }
  }

  stop() {
    if (this.isListening) {
      vadService.pause();
      voskDetector.stopCommandListening();
      this.isListening = false;
      console.log('Wake word detection stopped');
    }
  }

  destroy() {
    this.stop();
    vadService.destroy();
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    this.isInitialized = false;
    console.log('Wake word service destroyed');
  }

  private processAudioWithVosk(audio: Float32Array) {
    // Convert Float32Array to the format expected by Vosk
    // This is called when VAD detects speech
    console.log('Processing audio with Vosk, length:', audio.length);
  }

  setWakeWordCallback(callback: () => void) {
    this.onWakeWordCallback = callback;
  }

  setCommandCallback(callback: (command: string) => void) {
    this.onCommandCallback = callback;
  }

  startCommandListening() {
    voskDetector.startCommandListening();
  }

  stopCommandListening() {
    voskDetector.stopCommandListening();
  }
}

export const wakeWordService = new WakeWordService();
