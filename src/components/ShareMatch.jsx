export default function ShareMatch({ match, onClose }) {
  const shareUrl = `${window.location.origin}/share/${match.shareCode}`;
  const embedCode = `<iframe src="${shareUrl}/embed" width="800" height="600" frameborder="0"></iframe>`;
  
  const shareToSocial = (platform) => {
    const text = `🏐 Live Match: ${match.homeTeam.name} vs ${match.awayTeam.name}\nScore: ${match.homeScore} - ${match.awayScore}\nWatch live: ${shareUrl}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📤 Share Match</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Share Link</label>
            <div className="flex gap-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 p-2 border rounded bg-gray-50" />
              <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="bg-gray-600 text-white px-4 py-2 rounded">Copy</button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Embed Code</label>
            <div className="flex gap-2">
              <input type="text" readOnly value={embedCode} className="flex-1 p-2 border rounded bg-gray-50 text-xs" />
              <button onClick={() => navigator.clipboard.writeText(embedCode)} className="bg-gray-600 text-white px-4 py-2 rounded">Copy</button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Share on Social</label>
            <div className="flex gap-3">
              <button onClick={() => shareToSocial('twitter')} className="bg-black text-white px-4 py-2 rounded">🐦 X</button>
              <button onClick={() => shareToSocial('facebook')} className="bg-blue-800 text-white px-4 py-2 rounded">📘 Facebook</button>
              <button onClick={() => shareToSocial('whatsapp')} className="bg-green-500 text-white px-4 py-2 rounded">📱 WhatsApp</button>
            </div>
          </div>
          
          <div className="p-3 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">📊 Match Snapshot</h4>
            <p className="text-sm">{match.homeTeam.name} {match.homeScore} - {match.awayScore} {match.awayTeam.name}</p>
            <p className="text-xs text-gray-500">Set {match.currentSet} • {new Date(match.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <button onClick={onClose} className="mt-6 w-full bg-gray-200 py-2 rounded">Close</button>
      </div>
    </div>
  );
}