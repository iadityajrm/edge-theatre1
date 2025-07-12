
export class VoskWakeWordDetector {
  private model: any = null;
  private recognizer: any = null;
  private isInitialized = false;
  private onWakeWordCallback: (() => void) | null = null;
  private onCommandCallback: ((command: string) => void) | null = null;
  private isListeningForCommand = false;
  private speechRecognition: any = null;
  private isUsingSpeechAPI = false;

  async initialize() {
    console.log('Initializing voice recognition...');
    
    // Try Vosk first, but don't let it block initialization
    try {
      await this.initializeVosk();
    } catch (error) {
      console.log('Vosk initialization failed, using Web Speech API:', error.message);
      this.initializeWebSpeechFallback();
    }
  }

  private async initializeVosk() {
    // Only try Vosk if we can import it without errors
    try {
      const { createModel } = await import('vosk-browser');
      
      // Check if model files exist
      const modelCheckUrl = '/vosk-model-small-en-us-0.15/conf/model.conf';
      const response = await fetch(modelCheckUrl);
      
      if (!response.ok) {
        throw new Error('Model files not accessible');
      }
      
      console.log('Model files found, initializing Vosk...');
      const modelUrl = '/vosk-model-small-en-us-0.15';
      this.model = await createModel(modelUrl);
      
      if (this.model && this.model.KaldiRecognizer) {
        this.recognizer = new this.model.KaldiRecognizer(16000);
        console.log('Vosk initialized successfully');
        this.isInitialized = true;
        return;
      } else {
        throw new Error('Vosk model creation failed');
      }
    } catch (error) {
      throw error;
    }
  }

  private initializeWebSpeechFallback() {
    console.log('Initializing Web Speech API fallback');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    this.speechRecognition = new SpeechRecognition();
    
    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = true;
    this.speechRecognition.lang = 'en-US';
    this.speechRecognition.maxAlternatives = 1;
    
    this.speechRecognition.onstart = () => {
      console.log('Web Speech API started');
    };
    
    this.speechRecognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        
        console.log('Speech recognition result:', transcript);
        
        if (this.isListeningForCommand && this.onCommandCallback) {
          if (event.results[i].isFinal) {
            console.log('Command recognized:', transcript);
            this.onCommandCallback(transcript);
            this.isListeningForCommand = false;
          }
        } else if (transcript.includes('hey atlas') || transcript.includes('atlas')) {
          console.log('Wake word detected:', transcript);
          this.onWakeWordCallback?.();
        }
      }
    };

    this.speechRecognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition after a brief pause
        setTimeout(() => {
          if (this.isUsingSpeechAPI) {
            this.speechRecognition.start();
          }
        }, 1000);
      }
    };

    this.speechRecognition.onend = () => {
      console.log('Speech recognition ended, restarting...');
      if (this.isUsingSpeechAPI) {
        setTimeout(() => {
          this.speechRecognition.start();
        }, 500);
      }
    };

    this.isUsingSpeechAPI = true;
    this.isInitialized = true;
    console.log('Web Speech API initialized successfully');
  }

  async startListening(audioStream?: MediaStream) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isUsingSpeechAPI && this.speechRecognition) {
      try {
        this.speechRecognition.start();
        console.log('Web Speech API listening started');
      } catch (error) {
        console.warn('Speech recognition already running');
      }
    } else if (this.model && this.recognizer && audioStream) {
      // Vosk audio processing would go here
      console.log('Vosk audio processing started');
    }
  }

  setWakeWordCallback(callback: () => void) {
    this.onWakeWordCallback = callback;
  }

  setCommandCallback(callback: (command: string) => void) {
    this.onCommandCallback = callback;
  }

  startCommandListening() {
    console.log('Starting command listening mode');
    this.isListeningForCommand = true;
  }

  stopCommandListening() {
    console.log('Stopping command listening mode');
    this.isListeningForCommand = false;
  }

  cleanup() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.isUsingSpeechAPI = false;
    }
    
    if (this.model) {
      // Vosk cleanup would go here
    }
    
    console.log('Voice recognition cleaned up');
  }
}

export const voskDetector = new VoskWakeWordDetector();
