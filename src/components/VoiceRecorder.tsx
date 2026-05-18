import { useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from './Button';

export function VoiceRecorder({ onSave }: { onSave: (blob: Blob) => Promise<void> }) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks.current = [];
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => chunks.current.push(event.data);
    mediaRecorder.current.onstop = async () => {
      await onSave(new Blob(chunks.current, { type: 'audio/webm' }));
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorder.current.start();
    setRecording(true);
  }

  function stop() {
    mediaRecorder.current?.stop();
    setRecording(false);
  }

  return recording ? (
    <Button variant="danger" onClick={stop}><Square size={16} /> Stop and upload</Button>
  ) : (
    <Button variant="secondary" onClick={start}><Mic size={16} /> Record reply</Button>
  );
}
