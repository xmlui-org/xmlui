/**
 * Audio utility functions
 */

/**
 * Generates a beep sound using the Web Audio API
 * @param frequency - The frequency of the beep in Hz (default: 800)
 * @param durationInMs - The duration of the beep in milliseconds (default: 200)
 */
export function beep(frequency: number = 800, durationInMs: number = 200): void {
  // Check if Web Audio API is supported
  if (typeof window === 'undefined' || !window.AudioContext && !(window as any).webkitAudioContext) {
    console.warn('Web Audio API is not supported in this environment');
    return;
  }

  try {
    // Create audio context (handle both standard and webkit prefixed versions)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();

    // Create oscillator for the tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect nodes: oscillator -> gain -> destination
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure oscillator
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine'; // Use sine wave for a clean tone

    // Configure gain (volume) with fade in/out to avoid clicking
    const currentTime = audioContext.currentTime;
    const endTime = currentTime + durationInMs / 1000;
    const fadeTime = Math.min(0.01, durationInMs / 1000 / 4); // Fade time is 1/4 of duration or 10ms, whichever is smaller

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + fadeTime); // Fade in
    gainNode.gain.setValueAtTime(0.3, endTime - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, endTime); // Fade out

    // Start and stop the oscillator
    oscillator.start(currentTime);
    oscillator.stop(endTime);

    // Clean up after the beep is done
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gainNode.disconnect();
      audioContext.close();
    });

  } catch (error) {
    console.warn('Failed to generate beep:', error);
  }
}

/**
 * Generates a sequence of beeps
 * @param count - Number of beeps
 * @param frequency - The frequency of each beep in Hz (default: 800)
 * @param durationInMs - The duration of each beep in milliseconds (default: 200)
 * @param intervalInMs - The interval between beeps in milliseconds (default: 300)
 */
export function beepSequence(
  count: number, 
  frequency: number = 800, 
  durationInMs: number = 200, 
  intervalInMs: number = 300
): void {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      beep(frequency, durationInMs);
    }, i * intervalInMs);
  }
}

/**
 * Predefined beep patterns for common use cases
 */
export const BeepPatterns = {
  /** Short, high-pitched beep for success */
  success: () => beep(1000, 150),
  
  /** Lower frequency beep for errors */
  error: () => beep(400, 300),
  
  /** Quick beep for notifications */
  notification: () => beep(800, 100),
  
  /** Double beep for warnings */
  warning: () => beepSequence(2, 600, 150, 200),
  
  /** Triple beep for alerts */
  alert: () => beepSequence(3, 900, 100, 150),
} as const;
