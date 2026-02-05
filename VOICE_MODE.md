# Voice Mode Implementation for All Agents

## Overview
Implemented voice mode functionality using ElevenLabs API for all agents. The system uses browser's Web Speech API for speech-to-text (transcription) and ElevenLabs for text-to-speech (audio response).

## Components Created

### 1. Backend Services

**app/Services/ElevenLabsService.php**
- `textToSpeech()`: Converts AI response text to speech using agent's ElevenLabs API key
- `getVoices()`: Retrieves available ElevenLabs voices
- Supports customizable voice settings (stability, similarity_boost, model_id)

**app/Http/Controllers/Api/Portal/VoiceController.php**
- `processVoiceMessage()`: Processes voice messages from frontend
- Retrieves agent-specific ElevenLabs API key from database
- Routes messages to appropriate agent handler (Cynessa, Apex, etc.)
- Returns both text response and base64-encoded audio

### 2. Frontend Components

**resources/js/hooks/useVoiceMode.ts**
- React hook for managing voice mode state
- Uses browser's Web Speech API for speech recognition
- Handles recording, processing, and playback states
- Automatically sends transcribed text to backend
- Plays audio responses from ElevenLabs

**Updated Chat Components:**
- `CynessaChat.tsx`: Added voice mode integration with visual state indicators
- `ApexChat.tsx`: Added voice mode integration with visual state indicators
- Both components show: "Recording...", "Processing...", or "Playing..." states

### 3. Configuration

**config/services.php**
- Added ElevenLabs API key configuration

**config/elevenlabs.php**
- Default voice ID and model ID settings
- Can be overridden per agent via database

**routes/api.php**
- Added POST `/api/portal/voice/{agentId}` endpoint

## Database Structure

Agents are linked to ElevenLabs API keys via the `agent_api_keys` table:
- **provider**: 'elevenlabs'
- **key**: Encrypted API key
- **metadata**: JSON with voice_id, stability, similarity_boost, model_id

## User Flow

1. User clicks "Voice Mode" button in chat
2. Browser requests microphone permission
3. User speaks, browser transcribes speech to text
4. Text is sent to backend with agent ID
5. Backend:
   - Retrieves agent's ElevenLabs API key
   - Processes message through agent handler (e.g., Cynessa)
   - Converts text response to speech via ElevenLabs
   - Returns both text and audio (base64)
6. Frontend:
   - Displays text message in chat
   - Plays audio response through browser
   - Shows visual indicators (microphone pulse, loading spinner)

## Button States

- **Normal**: Mic icon + "Voice Mode"
- **Recording**: Pulsing square + "Recording..."
- **Processing**: Spinning loader + "Processing..."
- **Playing**: Pulsing square + "Playing..."

## Features

✅ Works with all agents (Cynessa, Apex, and any future agents)
✅ Uses agent-specific ElevenLabs API keys from database
✅ Automatic speech-to-text via browser Web Speech API
✅ Text-to-speech via ElevenLabs
✅ Visual feedback for all states
✅ Seamless integration with existing chat interface
✅ Messages appear in chat history just like typed messages
✅ Error handling and fallbacks

## Agent Configuration

To enable voice mode for an agent:
1. Add an ElevenLabs API key in admin panel
2. Assign the API key to the agent
3. Optionally configure metadata:
   - `voice_id`: Specific ElevenLabs voice
   - `stability`: Voice stability (0.0-1.0)
   - `similarity_boost`: Voice similarity (0.0-1.0)
   - `model_id`: ElevenLabs model (e.g., 'eleven_monolingual_v1')

## Current Status

- ✅ Backend services implemented
- ✅ Frontend hook implemented
- ✅ Chat components updated
- ✅ API routes configured
- ✅ Build successful (Workspace-DV_puyCd.js - 44.99 kB)
- 🔧 Cynessa already has ElevenLabs API key configured
- 🔧 Ready for testing with real voices

## Next Steps

1. Test voice mode with Cynessa
2. Configure voice_id in metadata for better voice quality
3. Add voice mode to other agents as needed
4. Consider adding push-to-talk option
5. Add voice settings UI in agent configuration panel
