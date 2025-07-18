import { api } from './api';

export async function transcribeWithWhisper(audioBlob, onStatusChange) {
    console.log('transcribeWithWhisper called with:', {
        blobSize: audioBlob?.size,
        blobType: audioBlob?.type,
        hasOnStatusChange: typeof onStatusChange === 'function'
    });

    const formData = new FormData();
    const fileName = `recording_${Date.now()}.webm`;
    const file = new File([audioBlob], fileName, { type: audioBlob.type });
    
    console.log('Created file:', {
        name: file.name,
        size: file.size,
        type: file.type
    });
    
    formData.append('audio', file);
    
    const whisperMode = window.localStorage.getItem('whisperMode') || 'default';
    formData.append('mode', whisperMode);

    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
  
    try {
      if (onStatusChange) {
        onStatusChange('transcribing');
      }
  
      const response = await api.transcribe(formData);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `Transcription error: ${response.status} ${response.statusText}`
        );
      }
  
      const data = await response.json();
      return data.text || '';
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
}