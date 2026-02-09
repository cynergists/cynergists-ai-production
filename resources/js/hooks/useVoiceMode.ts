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
    const shouldContinueRef = useRef(false);
    const isInitiatingRef = useRef(false);
    const isPlayingAudioRef = useRef(false);

    const agentIdRef = useRef(agentId);
    const onTranscriptReceivedRef = useRef(onTranscriptReceived);
    const onResponseReceivedRef = useRef(onResponseReceived);

    // Keep refs in sync
    useEffect(() => {
        agentIdRef.current = agentId;
        onTranscriptReceivedRef.current = onTranscriptReceived;
        onResponseReceivedRef.current = onResponseReceived;
    }, [agentId, onTranscriptReceived, onResponseReceived]);

    // Use refs for functions that reference each other to avoid stale closures
    const startListeningRef = useRef<() => void>(() => {});
    const processVoiceMessageRef = useRef<(transcript: string) => void>(
        () => {},
    );

    // Play audio response and continue listening when done
    const playAudioResponse = useCallback((audio: string) => {
        // Kill recognition BEFORE playing so mic doesn't pick up speaker audio
        isPlayingAudioRef.current = true;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore
            }
            recognitionRef.current = null;
        }

        setState('speaking');

        const binaryString = atob(audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audioEl = new Audio(audioUrl);
        audioRef.current = audioEl;

        audioEl.onended = () => {
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            isPlayingAudioRef.current = false;

            // Brief delay before listening for mic to settle
            if (shouldContinueRef.current) {
                setTimeout(() => {
                    if (shouldContinueRef.current) {
                        startListeningRef.current();
                    } else {
                        setState('idle');
                    }
                }, 300);
            } else {
                setState('idle');
            }
        };

        audioEl.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            isPlayingAudioRef.current = false;
            toast.error('Failed to play audio');

            if (shouldContinueRef.current) {
                startListeningRef.current();
            } else {
                setState('idle');
            }
        };

        audioEl.play();
    }, []);

    // Process voice message
    const processVoiceMessage = useCallback(
        async (transcript: string) => {
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
                    onResponseReceivedRef.current?.({
                        text: response.text,
                    });

                    if (response.audio) {
                        playAudioResponse(response.audio);
                    } else if (shouldContinueRef.current) {
                        startListeningRef.current();
                    } else {
                        setState('idle');
                    }
                }
            } catch (error) {
                console.error('[Voice] Error:', error);
                toast.error('Failed to process voice message');

                if (shouldContinueRef.current) {
                    startListeningRef.current();
                } else {
                    setState('idle');
                }
            }
        },
        [playAudioResponse],
    );

    // Start listening for user speech
    const startListening = useCallback(() => {
        // Never start listening while audio is playing
        if (isPlayingAudioRef.current) {
            console.log('[Voice] Skipping listen — audio is playing');
            return;
        }

        if (!agentIdRef.current) {
            toast.error('Please select an agent first');
            return;
        }

        if (
            !(
                'webkitSpeechRecognition' in window ||
                'SpeechRecognition' in window
            )
        ) {
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

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('[Voice] Listening started');
            setState('listening');
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('[Voice] Transcript:', transcript);

            onTranscriptReceivedRef.current?.(transcript);
            processVoiceMessageRef.current(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('[Voice] Recognition error:', event.error);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                toast.error('Voice recognition failed');
            }

            // On error, retry if we should continue (but not while audio is playing)
            if (shouldContinueRef.current && !isPlayingAudioRef.current) {
                setTimeout(() => {
                    if (
                        shouldContinueRef.current &&
                        !isPlayingAudioRef.current
                    ) {
                        startListeningRef.current();
                    }
                }, 500);
            } else if (!isPlayingAudioRef.current) {
                setState('idle');
            }
        };

        recognition.onend = () => {
            // Recognition ended naturally — restart if active and not playing audio
            if (
                shouldContinueRef.current &&
                !isPlayingAudioRef.current &&
                recognitionRef.current === recognition
            ) {
                setTimeout(() => {
                    if (
                        shouldContinueRef.current &&
                        !isPlayingAudioRef.current
                    ) {
                        startListeningRef.current();
                    }
                }, 300);
            }
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (error) {
            console.error('[Voice] Failed to start recognition:', error);
            setState('idle');
        }
    }, []);

    // Keep function refs up to date
    useEffect(() => {
        startListeningRef.current = startListening;
        processVoiceMessageRef.current = processVoiceMessage;
    }, [startListening, processVoiceMessage]);

    // Initiate conversation - agent speaks first
    const initiateConversation = useCallback(async () => {
        const currentAgentId = agentIdRef.current;
        if (!currentAgentId || isInitiatingRef.current) return;
        isInitiatingRef.current = true;

        console.log('[Voice] Initiating conversation');
        setState('processing');

        try {
            const response = await apiClient.post<{
                success: boolean;
                text: string;
                audio: string | null;
            }>(`/api/portal/voice/${currentAgentId}`, {
                initiate: true,
            });

            if (response.success) {
                onResponseReceivedRef.current?.({ text: response.text });

                if (response.audio) {
                    playAudioResponse(response.audio);
                } else if (shouldContinueRef.current) {
                    startListeningRef.current();
                } else {
                    setState('idle');
                }
            }
        } catch (error) {
            console.error('[Voice] Initiation error:', error);
            toast.error('Failed to start voice conversation');

            if (shouldContinueRef.current) {
                startListeningRef.current();
            } else {
                setState('idle');
            }
        } finally {
            isInitiatingRef.current = false;
        }
    }, [playAudioResponse]);

    // Stop all voice activity
    const stopAll = useCallback(() => {
        shouldContinueRef.current = false;
        isPlayingAudioRef.current = false;

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
            // Start continuous voice mode - agent speaks first
            shouldContinueRef.current = true;
            initiateConversation();
        } else {
            // Stop voice mode
            stopAll();
            toast.info('Voice mode stopped');
        }
    }, [state, initiateConversation, stopAll]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            shouldContinueRef.current = false;
            isPlayingAudioRef.current = false;
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
