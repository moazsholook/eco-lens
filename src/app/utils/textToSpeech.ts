import { ObjectAnalysis } from '@/app/components/ResultsCard';

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  speak(analysis: ObjectAnalysis): void {
    // Cancel any ongoing speech
    this.cancel();

    // Create narration text
    const narration = this.createNarration(analysis);

    // Create utterance
    this.utterance = new SpeechSynthesisUtterance(narration);
    
    // Configure voice settings for calm, documentary style
    this.utterance.rate = 0.9; // Slightly slower for clarity
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;

    // Try to find a good voice (prefer female voices for documentary feel)
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => 
      voice.lang.startsWith('en')
    );

    if (preferredVoice) {
      this.utterance.voice = preferredVoice;
    }

    // Speak
    this.synthesis.speak(this.utterance);
  }

  cancel(): void {
    this.synthesis.cancel();
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  private createNarration(analysis: ObjectAnalysis): string {
    const mainImpact = `This ${analysis.name.toLowerCase()} costs approximately ${
      analysis.carbonFootprint >= 1000 
        ? `${(analysis.carbonFootprint / 1000).toFixed(1)} kilograms` 
        : `${analysis.carbonFootprint} grams`
    } of CO₂ to produce.`;

    const waterImpact = analysis.waterUsage > 100 
      ? ` It requires ${analysis.waterUsage} liters of water.` 
      : '';

    const recyclable = analysis.recyclable 
      ? ' While it is recyclable, many end up in landfills.' 
      : ' Unfortunately, it is not recyclable.';

    const alternative = analysis.alternatives[0];
    const suggestion = ` A better choice: ${alternative.name}. ${alternative.description} This could reduce your carbon footprint by ${alternative.carbonSavings} percent.`;

    return mainImpact + waterImpact + recyclable + suggestion;
  }
}

// Singleton instance
export const ttsService = new TextToSpeechService();
