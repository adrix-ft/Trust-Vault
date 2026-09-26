import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function VideoModal() {
  const { playingTrailerUrl, setPlayingTrailerUrl } = useStore();

  if (!playingTrailerUrl) return null;

  // Attempt to parse YouTube URL for embed
  let embedUrl = playingTrailerUrl;
  if (playingTrailerUrl.includes('youtube.com/watch?v=')) {
    const videoId = playingTrailerUrl.split('v=')[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (playingTrailerUrl.includes('youtu.be/')) {
    const videoId = playingTrailerUrl.split('youtu.be/')[1].split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  const isMp4 = playingTrailerUrl.toLowerCase().endsWith('.mp4');

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
        onClick={() => setPlayingTrailerUrl(null)}
      >
        <button 
          className="absolute top-4 right-4 text-[#9BA8AB] hover:text-white bg-[#11212D] p-2 rounded-full transition-colors z-[110]"
          onClick={() => setPlayingTrailerUrl(null)}
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-[#253745]"
          onClick={(e) => e.stopPropagation()}
        >
          {isMp4 ? (
            <video 
              src={embedUrl}
              autoPlay 
              controls 
              className="w-full h-full object-cover"
            />
          ) : (
            <iframe
              src={embedUrl}
              title="Trailer"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
