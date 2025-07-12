
import { createModel } from 'vosk-browser';

export class VoskWakeWordDetector {
  private model: any = null;
  private recognizer: any = null;
  private isInitialized = false;
  private onWakeWordCallback: (() => void) | null = null;
  private onCommandCallback: ((command: string) => void) | null = null;
  private isListeningForCommand = false;

  async initialize() {
    try {
      console.log('Initializing Vosk model...');
      
      // Load a small English model for wake word detection
      const modelUrl = 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip';
      this.model = await createModel(modelUrl);
      this.recognizer = new this.model.KaldiRecognizer(16000);
      
      this.isInitialized = true;
      console.log('Vosk model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Vosk:', error);
      // Fallback to Web Speech API if Vosk fails
      this.initializeWebSpeechFallback();
    }
  }

  private initializeWebSpeechFallback() {
    console.log('Falling back to Web Speech API');
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        
        if (this.isListeningForCommand && this.onCommandCallback) {
          if (event.results[last].isFinal) {
            this.onCommandCallback(transcript);
            this.isListeningForCommand = false;
          }
        } else if (transcript.includes('hey atlas') || transcript.includes('atlas')) {
          this.onWakeWordCallback?.();
        }
      };

      recognition.start();
    }
  }

  async startListening(audioStream: MediaStream) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model || !this.recognizer) {
      console.error('Vosk not properly initialized');
      return;
    }

    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(audioStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      
      // Convert to 16-bit PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
      }

      if (this.recognizer.AcceptWaveform(pcmData.buffer)) {
        const result = JSON.parse(this.recognizer.Result());
        this.processResult(result.text);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  }

  private processResult(text: string) {
    const lowerText = text.toLowerCase();
    
    if (this.isListeningForCommand && this.onCommandCallback) {
      this.onCommandCallback(text);
      this.isListeningForCommand = false;
    } else if (lowerText.includes('atlas') || lowerText.includes('hey atlas')) {
      console.log('Wake word detected:', text);
      this.onWakeWordCallback?.();
    }
  }

  setWakeWordCallback(callback: () => void) {
    this.onWakeWordCallback = callback;
  }

  setCommandCallback(callback: (command: string) => void) {
    this.onCommandCallback = callback;
  }

  startCommandListening() {
    this.isListeningForCommand = true;
  }

  stopCommandListening() {
    this.isListeningForCommand = false;
  }
}

export const voskDetector = new VoskWakeWordDetector();
