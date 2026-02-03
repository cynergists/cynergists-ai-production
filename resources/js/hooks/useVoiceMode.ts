import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface UseVoiceModeOptions {
  agentId: string | null;
  onTranscriptReceived?: (transcript: string) => void;
  onResponseReceived?: (response: { text: string; audio: string | null }) => void;
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

    console.log('[Voice] Sending message:', text, 'to agent:', currentAgentId);
    setIsProcessing(true);

    try {
      console.log('[Voice] Calling API:', `/api/portal/voice/${currentAgentId}`);
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
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('[Voice] Transcript received:', transcript);
        setTranscript(transcript);
        onTranscriptReceivedRef.current?.(transcript);
        
        // Automatically send the transcript
        sendVoiceMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('[Voice] Recognition error:', event.error);
        setIsRecording(false);
        toast.error('Voice recognition failed: ' + event.error);
      };

      recognitionRef.current.onend = () => {
        console.log('[Voice] Recognition ended');
        setIsRecording(false);
      };
      
      recognitionRef.current.onstart = () => {
        console.log('[Voice] Recognition started');
      };
      
      console.log('[Voice] Speech recognition initialized');
    } else {
      console.warn('[Voice] Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
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
      setIsRecording(true);
      recognitionRef.current.start();
      console.log('[Voice] Recording start() called');
      toast.info('🎤 Listening...', { duration: 2000 });
    } catch (error) {
      console.error('[Voice] Failed to start recording:', error);
      setIsRecording(false);
      toast.error('Failed to start voice recording');
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log('[Voice] Stop recording requested');
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('[Voice] Error stopping recognition:', e);
      }
      setIsRecording(false);
    }
  }, [isRecording]);

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
    console.log('[Voice] Toggle requested - recording:', isRecording, 'playing:', isPlaying);
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
