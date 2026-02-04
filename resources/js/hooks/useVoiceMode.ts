import { apiClient } from '@/lib/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Web Speech API type declarations
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface UseVoiceModeOptions {
    agentId: string | null;
    onTranscriptReceived?: (transcript: string) => void;
    onResponseReceived?: (response: {
        text: string;
        audio: string | null;
    }) => void;
}

export function useVoiceMode({
    agentId,
    onTranscriptReceived,
    onResponseReceived,
}: UseVoiceModeOptions) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [transcript, setTranscript] = useState('');

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const interimTranscriptRef = useRef<string>('');
    const shouldRestartRef = useRef<boolean>(false);

    // Store callbacks in refs to avoid stale closures
    const onTranscriptReceivedRef = useRef(onTranscriptReceived);
    const onResponseReceivedRef = useRef(onResponseReceived);
    const agentIdRef = useRef(agentId);

    useEffect(() => {
        onTranscriptReceivedRef.current = onTranscriptReceived;
        onResponseReceivedRef.current = onResponseReceived;
        agentIdRef.current = agentId;
    }, [onTranscriptReceived, onResponseReceived, agentId]);

    // Send voice message to backend
    const sendVoiceMessage = useCallback(async (text: string) => {
        const currentAgentId = agentIdRef.current;

        if (!currentAgentId || !text.trim()) {
            console.log('[Voice] Skipping - no agentId or empty text');
            return;
        }

        console.log(
            '[Voice] Sending message:',
            text,
            'to agent:',
            currentAgentId,
        );
        setIsProcessing(true);

        try {
            console.log(
                '[Voice] Calling API:',
                `/api/portal/voice/${currentAgentId}`,
            );
            const response = await apiClient.post<{
                success: boolean;
                text: string;
                audio: string | null;
                error?: string;
            }>(`/api/portal/voice/${currentAgentId}`, {
                message: text,
            });

            console.log('[Voice] API response:', response);

            if (response.success) {
                onResponseReceivedRef.current?.(response);

                // Play audio response if available
                if (response.audio) {
                    console.log('[Voice] Playing audio response');
                    await playAudioResponse(response.audio);
                } else if (response.error) {
                    console.warn('[Voice] No audio:', response.error);
                    toast.warning(response.error);
                } else {
                    console.warn('[Voice] Success but no audio in response');
                }
            } else {
                console.error('[Voice] Request failed');
                toast.error('Failed to process voice message');
            }
        } catch (error) {
            console.error('[Voice] Error:', error);
            toast.error('Failed to send voice message');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    // Play audio response
    const playAudioResponse = useCallback(async (base64Audio: string) => {
        try {
            console.log('[Voice] Playing audio, length:', base64Audio.length);
            setIsPlaying(true);

            // Convert base64 to blob
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            console.log('[Voice] Audio URL created');

            // Create and play audio element
            if (audioRef.current) {
                audioRef.current.pause();
            }

            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => {
                console.log('[Voice] Audio playback ended');
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };
            audioRef.current.onerror = (e) => {
                console.error('[Voice] Audio playback error:', e);
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
                toast.error('Failed to play audio response');
            };

            console.log('[Voice] Starting audio playback');
            await audioRef.current.play();
        } catch (error) {
            console.error('[Voice] Failed to play audio:', error);
            setIsPlaying(false);
            toast.error('Failed to play audio response');
        }
    }, []);

    // Initialize speech recognition
    useEffect(() => {
        console.log('[Voice] Initializing speech recognition');

        if (
            'webkitSpeechRecognition' in window ||
            'SpeechRecognition' in window
        ) {
            const SpeechRecognition =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition() as SpeechRecognition;
            recognitionRef.current = recognition;

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                // Build the full transcript from NEW results only (starting from resultIndex)
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update accumulated transcript
                if (finalTranscript) {
                    interimTranscriptRef.current += finalTranscript;
                    console.log(
                        '[Voice] Final transcript accumulated:',
                        interimTranscriptRef.current,
                    );

                    // Clear any existing silence timer since we got new final text
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }

                    // Set a new silence timer after receiving final text
                    // If no more final text for 2 seconds, send the message
                    silenceTimerRef.current = setTimeout(() => {
                        const messageToSend =
                            interimTranscriptRef.current.trim();
                        if (messageToSend) {
                            console.log(
                                '[Voice] Silence detected, sending message:',
                                messageToSend,
                            );
                            onTranscriptReceivedRef.current?.(messageToSend);
                            sendVoiceMessage(messageToSend);
                            interimTranscriptRef.current = '';
                            setTranscript('');
                        }
                    }, 2000);
                }

                // Show current transcript (accumulated + interim)
                const currentTranscript = (
                    interimTranscriptRef.current + interimTranscript
                ).trim();
                setTranscript(currentTranscript);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('[Voice] Recognition error:', event.error);

                // Don't stop on "no-speech" error if we're in continuous mode
                if (event.error === 'no-speech' && shouldRestartRef.current) {
                    console.log(
                        '[Voice] No speech detected, continuing to listen...',
                    );
                    return;
                }

                // For other errors, stop and notify
                shouldRestartRef.current = false;
                setIsRecording(false);
                toast.error('Voice recognition failed: ' + event.error);
            };

            recognition.onend = () => {
                console.log(
                    '[Voice] Recognition ended, shouldRestart:',
                    shouldRestartRef.current,
                );

                // If we should restart (continuous mode is active), restart recognition
                if (shouldRestartRef.current && recognitionRef.current) {
                    try {
                        console.log(
                            '[Voice] Restarting recognition for continuous mode',
                        );
                        recognitionRef.current.start();
                    } catch (e) {
                        console.error(
                            '[Voice] Failed to restart recognition:',
                            e,
                        );
                        shouldRestartRef.current = false;
                        setIsRecording(false);
                    }
                } else {
                    setIsRecording(false);
                }
            };

            recognition.onstart = () => {
                console.log('[Voice] Recognition started');
            };

            console.log('[Voice] Speech recognition initialized');
        } else {
            console.warn(
                '[Voice] Speech recognition not supported in this browser',
            );
        }

        return () => {
            // Clear silence timer on unmount
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }

            // Stop recognition
            shouldRestartRef.current = false;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors on cleanup
                }
            }

            // Stop audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [sendVoiceMessage]);

    // Start recording
    const startRecording = useCallback(() => {
        console.log('[Voice] Start recording requested');

        if (!recognitionRef.current) {
            console.error('[Voice] Speech recognition not available');
            toast.error('Speech recognition not supported in this browser');
            return;
        }

        if (!agentIdRef.current) {
            console.error('[Voice] No agent selected');
            toast.error('Please select an agent first');
            return;
        }

        try {
            setTranscript('');
            interimTranscriptRef.current = '';
            shouldRestartRef.current = true;
            setIsRecording(true);
            recognitionRef.current.start();
            console.log('[Voice] Continuous recording started');
            toast.info('🎤 Listening continuously... Speak naturally.', {
                duration: 2000,
            });
        } catch (error) {
            console.error('[Voice] Failed to start recording:', error);
            shouldRestartRef.current = false;
            setIsRecording(false);
            toast.error('Failed to start voice recording');
        }
    }, []);

    // Stop recording
    const stopRecording = useCallback(() => {
        console.log('[Voice] Stop recording requested');

        // Clear any pending silence timer
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        // Send any remaining transcript before stopping
        const remainingTranscript = interimTranscriptRef.current.trim();
        if (remainingTranscript) {
            console.log(
                '[Voice] Sending remaining transcript before stop:',
                remainingTranscript,
            );
            onTranscriptReceivedRef.current?.(remainingTranscript);
            sendVoiceMessage(remainingTranscript);
            interimTranscriptRef.current = '';
        }

        // Stop continuous mode
        shouldRestartRef.current = false;

        if (recognitionRef.current && isRecording) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error('[Voice] Error stopping recognition:', e);
            }
        }

        setIsRecording(false);
        setTranscript('');
        console.log('[Voice] Continuous recording stopped');
    }, [isRecording, sendVoiceMessage]);

    // Stop playing audio
    const stopPlaying = useCallback(() => {
        console.log('[Voice] Stop playing requested');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }
    }, []);

    // Toggle voice mode
    const toggleVoiceMode = useCallback(() => {
        console.log(
            '[Voice] Toggle requested - recording:',
            isRecording,
            'playing:',
            isPlaying,
        );
        if (isRecording) {
            stopRecording();
        } else if (isPlaying) {
            stopPlaying();
        } else {
            startRecording();
        }
    }, [isRecording, isPlaying, startRecording, stopRecording, stopPlaying]);

    return {
        isRecording,
        isProcessing,
        isPlaying,
        transcript,
        startRecording,
        stopRecording,
        toggleVoiceMode,
        stopPlaying,
        isVoiceActive: isRecording || isProcessing || isPlaying,
    };
}
