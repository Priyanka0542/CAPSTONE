import { useState } from 'react';

export default function GoalInputForm({ onSubmit, loading }) {
  const [goal, setGoal] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ age: '', degree: '', budget: '', country: 'India' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goal.trim().length < 3) {
      setError('Please describe your career goal (at least 3 characters)');
      return;
    }
    setError('');

    const profileData = {};
    if (profile.age) profileData.age = parseInt(profile.age);
    if (profile.degree) profileData.degree = profile.degree;
    if (profile.budget) profileData.budget = parseInt(profile.budget);
    if (profile.country) profileData.country = profile.country;

    onSubmit(goal.trim(), Object.keys(profileData).length > 0 ? profileData : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-starlight mb-2">
          What career do you want to pursue?
        </label>
        <textarea
          className="input-field"
          rows={3}
          placeholder='e.g. "I want to become a data scientist" or "I want to crack UPSC"'
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={loading}
          id="goal-input"
        />
        {error && <p className="text-meteor-red text-xs mt-1">{error}</p>}
      </div>

      <button
        type="button"
        className="text-sm text-dust-gray hover:text-comet-violet transition-colors"
        onClick={() => setShowProfile(!showProfile)}
      >
        {showProfile ? '− Hide' : '+ Add'} profile details (optional)
      </button>

      {showProfile && (
        <div className="grid grid-cols-2 gap-3 animate-fadeIn">
          <div>
            <label className="block text-xs text-dust-gray mb-1">Age</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 22"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              id="profile-age"
            />
          </div>
          <div>
            <label className="block text-xs text-dust-gray mb-1">Country</label>
            <input
              type="text"
              className="input-field"
              placeholder="India"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              id="profile-country"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-dust-gray mb-1">Current education / degree</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. B.Tech CSE, 3rd year"
              value={profile.degree}
              onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
              id="profile-degree"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-dust-gray mb-1">Budget (INR)</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 500000"
              value={profile.budget}
              onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
              id="profile-budget"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading || goal.trim().length < 3}
        id="generate-roadmap-btn"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Generating your roadmap...
          </span>
        ) : (
          'Generate career roadmap'
        )}
      </button>

      <p className="ai-disclaimer">
        Estimates are AI-generated based on stated assumptions and general data — not guarantees. Use this as a planning aid, not a prediction.
      </p>
    </form>
  );
}
