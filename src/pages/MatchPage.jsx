import ProMatchView from '../components/MatchView';
import { useMatch } from '../context/MatchContext';

export default function MatchPage() {
  const { match } = useMatch();
  
  if (!match) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500 mb-4">No active match</p>
        <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded">Start a Match</a>
      </div>
    );
  }
  
  return <ProMatchView />;
}