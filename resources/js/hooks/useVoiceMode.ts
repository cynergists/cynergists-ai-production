import { apiClient } from '@/lib/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseVoiceModeOptions {
    agentId: string | null;
    onTranscriptReceived?: (transcript: string) => void;
    onResponseReceived?: (response: { text: string }) => void;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export function useVoiceMode({
    agentId,
    onTranscriptReceived,
    onResponseReceived,
}: UseVoiceModeOptions) {
    const [state, setState] = useState<VoiceState>('idle');

    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const shouldContinueRef = useRef(false); // Track if we should continue listening after speaking

    const agentIdRef = useRef(agentId);
    const onTranscriptReceivedRef = useRef(onTranscriptReceived);
    const onResponseReceivedRef = useRef(onResponseReceived);

    // Keep refs in sync
    useEffect(() => {
        agentIdRef.current = agentId;
        onTranscriptReceivedRef.current = onTranscriptReceived;
        onResponseReceivedRef.current = onResponseReceived;
    }, [agentId, onTranscriptReceived, onResponseReceived]);

    // Process voice message
    const processVoiceMessage = useCallback(async (transcript: string) => {
        const currentAgentId = agentIdRef.current;
        if (!currentAgentId || !transcript.trim()) return;

        console.log('[Voice] Processing:', transcript);
        setState('processing');

        try {
            const response = await apiClient.post<{
                success: boolean;
                text: string;
                audio: string | null;
            }>(`/api/portal/voice/${currentAgentId}`, {
                message: transcript,
            });

            if (response.success) {
                onResponseReceivedRef.current?.({ text: response.text });

                if (response.audio) {
                    // Play audio
                    setState('speaking');

                    const binaryString = atob(response.audio);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: 'audio/mpeg' });
                    const audioUrl = URL.createObjectURL(blob);

                    if (audioRef.current) {
                        audioRef.current.pause();
                    }

                    const audio = new Audio(audioUrl);
                    audioRef.current = audio;

                    audio.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        audioRef.current = null;

                        // If we should continue, restart listening
                        if (shouldContinueRef.current) {
                            startListening();
                        } else {
                            setState('idle');
                        }
                    };

                    audio.onerror = () => {
                        URL.revokeObjectURL(audioUrl);
                        audioRef.current = null;
                        toast.error('Failed to play audio');

                        // If we should continue, restart listening
                        if (shouldContinueRef.current) {
                            startListening();
                        } else {
                            setState('idle');
                        }
                    };

                    await audio.play();
                } else {
                    // No audio, continue if needed
                    if (shouldContinueRef.current) {
                        startListening();
                    } else {
                        setState('idle');
                    }
                }
            }
        } catch (error) {
            console.error('[Voice] Error:', error);
            toast.error('Failed to process voice message');

            // On error, continue if needed
            if (shouldContinueRef.current) {
                startListening();
            } else {
                setState('idle');
            }
        }
    }, []);

    // Start listening
    const startListening = useCallback(() => {
        if (!agentIdRef.current) {
            toast.error('Please select an agent first');
            return;
        }

        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            toast.error('Speech recognition not supported');
            return;
        }

        // Clean up existing recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore
            }
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // One utterance at a time
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setState('listening');
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('[Voice] Transcript:', transcript);

            onTranscriptReceivedRef.current?.(transcript);
            processVoiceMessage(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('[Voice] Recognition error:', event.error);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                toast.error('Voice recognition failed');
            }

            // On error, retry if we should continue
            if (shouldContinueRef.current) {
                setTimeout(() => {
                    if (shouldContinueRef.current) {
                        startListening();
                    }
                }, 500);
            } else {
                setState('idle');
            }
        };

        recognition.onend = () => {
            // Recognition ended, but we're already transitioning to processing
            // Don't do anything here - let the onresult handler manage the flow
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (error) {
            console.error('[Voice] Failed to start recognition:', error);
            setState('idle');
        }
    }, [processVoiceMessage]);

    // Stop all voice activity
    const stopAll = useCallback(() => {
        shouldContinueRef.current = false;

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore
            }
            recognitionRef.current = null;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setState('idle');
    }, []);

    // Toggle voice mode
    const toggleVoiceMode = useCallback(() => {
        if (state === 'idle') {
            // Start continuous voice mode
            shouldContinueRef.current = true;
            startListening();
            toast.info('🎤 Voice mode activated');
        } else {
            // Stop voice mode
            stopAll();
            toast.info('Voice mode stopped');
        }
    }, [state, startListening, stopAll]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return {
        state,
        isListening: state === 'listening',
        isProcessing: state === 'processing',
        isSpeaking: state === 'speaking',
        isActive: state !== 'idle',
        toggleVoiceMode,
    };
}
