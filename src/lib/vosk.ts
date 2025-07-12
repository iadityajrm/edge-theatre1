
import { createModel } from 'vosk-browser';

export class VoskWakeWordDetector {
  private model: any = null;
  private recognizer: any = null;
  private isInitialized = false;
  private onWakeWordCallback: (() => void) | null = null;
  private onCommandCallback: ((command: string) => void) | null = null;
  private isListeningForCommand = false;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  async initialize() {
    try {
      console.log('Initializing Vosk model...');
      
      // First, check if the model files exist
      const modelCheckUrl = '/vosk-model-small-en-us-0.15/conf/model.conf';
      const response = await fetch(modelCheckUrl);
      
      if (!response.ok) {
        throw new Error(`Model files not found (${response.status}). Falling back to Web Speech API.`);
      }
      
      // Use the local model files from the public folder
      const modelUrl = '/vosk-model-small-en-us-0.15';
      this.model = await createModel(modelUrl);
      
      if (!this.model || !this.model.KaldiRecognizer) {
        throw new Error('Vosk model creation failed');
      }
      
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
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Web Speech API started');
      };
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        
        console.log('Web Speech transcript:', transcript);
        
        if (this.isListeningForCommand && this.onCommandCallback) {
          if (event.results[last].isFinal) {
            console.log('Command recognized:', transcript);
            this.onCommandCallback(transcript);
            this.isListeningForCommand = false;
          }
        } else if (transcript.includes('hey atlas') || transcript.includes('atlas')) {
          console.log('Wake word detected via Web Speech:', transcript);
          this.onWakeWordCallback?.();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Web Speech error:', event.error);
      };

      try {
        recognition.start();
        this.isInitialized = true;
        console.log('Web Speech API fallback initialized successfully');
      } catch (error) {
        console.error('Failed to start Web Speech API:', error);
      }
    } else {
      console.error('No speech recognition available');
    }
  }

  async startListening(audioStream: MediaStream) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If Vosk is properly initialized, use it
    if (this.model && this.recognizer) {
      try {
        this.audioContext = new AudioContext({ sampleRate: 16000 });
        this.source = this.audioContext.createMediaStreamSource(audioStream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (event) => {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          
          // Convert to 16-bit PCM
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }

          try {
            if (this.recognizer && this.recognizer.AcceptWaveform(pcmData.buffer)) {
              const result = JSON.parse(this.recognizer.Result());
              if (result.text) {
                this.processResult(result.text);
              }
            }
          } catch (error) {
            console.warn('Vosk processing error:', error);
          }
        };

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        
        console.log('Vosk audio processing started');
      } catch (error) {
        console.error('Failed to start Vosk audio processing:', error);
      }
    }
    // Web Speech API is already running from initialization
  }

  private processResult(text: string) {
    const lowerText = text.toLowerCase();
    console.log('Vosk recognized:', lowerText);
    
    if (this.isListeningForCommand && this.onCommandCallback) {
      console.log('Processing as command:', text);
      this.onCommandCallback(text);
      this.isListeningForCommand = false;
    } else if (lowerText.includes('atlas') || lowerText.includes('hey atlas')) {
      console.log('Wake word detected via Vosk:', text);
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
    console.log('Starting command listening mode');
    this.isListeningForCommand = true;
  }

  stopCommandListening() {
    console.log('Stopping command listening mode');
    this.isListeningForCommand = false;
  }

  cleanup() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const voskDetector = new VoskWakeWordDetector();
