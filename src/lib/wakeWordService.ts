
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

      // Initialize VAD first
      await vadService.initialize();
      
      // Set up VAD callbacks
      vadService.setVoiceStartCallback(() => {
        console.log('Voice detected by VAD');
      });

      vadService.setSpeechCallback((audio: Float32Array) => {
        // Process audio through Vosk when speech is detected
        this.processAudioWithVosk(audio);
      });

      // Initialize Vosk (this will fall back to Web Speech API if needed)
      await voskDetector.initialize();
      
      // Set up Vosk callbacks
      voskDetector.setWakeWordCallback(() => {
        console.log('Wake word callback triggered');
        this.onWakeWordCallback?.();
      });

      voskDetector.setCommandCallback((command: string) => {
        console.log('Command callback triggered:', command);
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
      try {
        // Start VAD
        await vadService.start();
        
        // Start Vosk with audio stream
        if (this.audioStream) {
          await voskDetector.startListening(this.audioStream);
        }

        this.isListening = true;
        console.log('Wake word detection started');
      } catch (error) {
        console.error('Failed to start wake word detection:', error);
        throw error;
      }
    }
  }

  stop() {
    if (this.isListening) {
      try {
        vadService.pause();
        voskDetector.stopCommandListening();
        this.isListening = false;
        console.log('Wake word detection stopped');
      } catch (error) {
        console.error('Error stopping wake word detection:', error);
      }
    }
  }

  destroy() {
    this.stop();
    
    try {
      vadService.destroy();
      voskDetector.cleanup();
      
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
      
      this.isInitialized = false;
      console.log('Wake word service destroyed');
    } catch (error) {
      console.error('Error destroying wake word service:', error);
    }
  }

  private processAudioWithVosk(audio: Float32Array) {
    // This is called when VAD detects speech
    console.log('Processing audio with Vosk, length:', audio.length);
    // The actual processing is handled by the Vosk detector's audio processing pipeline
  }

  setWakeWordCallback(callback: () => void) {
    this.onWakeWordCallback = callback;
  }

  setCommandCallback(callback: (command: string) => void) {
    this.onCommandCallback = callback;
  }

  startCommandListening() {
    console.log('Wake word service starting command listening');
    voskDetector.startCommandListening();
  }

  stopCommandListening() {
    console.log('Wake word service stopping command listening');
    voskDetector.stopCommandListening();
  }
}

export const wakeWordService = new WakeWordService();
