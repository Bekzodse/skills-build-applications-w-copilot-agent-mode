import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; reason?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userEmail = 'mona@example.com';

  useEffect(() => {
    getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`)
      .then(({ suggestions: nextSuggestions }) => setSuggestions(nextSuggestions))
      .catch(() => setError('Unable to load workout suggestions.'));
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {error ? <p role="alert">{error}</p> : suggestions === null ? <p role="status">Loading workout suggestions...</p> : suggestions.length === 0 ? <p>No workout suggestions found.</p> : (
          <ul>
            {suggestions.map((workout) => <li key={workout.title}>{workout.title}{workout.reason ? `: ${workout.reason}` : ''}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
