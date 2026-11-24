import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Mic, Square } from 'lucide-react';

interface AudioBlockProps {
  id: string;
  audioUrl?: string;
  title?: string;
}

export const AudioBlock: React.FC<AudioBlockProps> = ({ id, audioUrl, title = 'Audio Recording' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-3 bg-[#FAF8FD] border border-[#DFD1F0] rounded-md flex items-center justify-between space-x-3">
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[#6941A5] text-white flex items-center justify-center hover:bg-[#563588] transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div>
          <div className="text-xs font-medium text-[#242424]">{title}</div>
          <div className="text-[10px] text-[#616161]">Voice Memo &bull; Playback ready</div>
        </div>
      </div>

      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <a
            href={audioUrl}
            download="audio-note.webm"
            className="p-1.5 hover:bg-white rounded text-[#616161] hover:text-[#6941A5] transition-colors"
            title="Download Recording"
          >
            <Download className="w-4 h-4" />
          </a>
        </>
      )}
    </div>
  );
};

