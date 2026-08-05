import { useState } from 'react';

export default function GoalInputForm({ onSubmit, loading }) {
  const [goal, setGoal] = useState('');
  const [timelineType, setTimelineType] = useState('duration'); // 'duration' | 'date'
  const [targetDuration, setTargetDuration] = useState('6');
  const [durationUnit, setDurationUnit] = useState('Months');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');

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

    const profileData = {
      targetDuration: timelineType === 'duration' ? parseInt(targetDuration) || 6 : undefined,
      durationUnit: timelineType === 'duration' ? durationUnit : undefined,
      targetCompletionDate: timelineType === 'date' && targetCompletionDate ? targetCompletionDate : undefined,
    };

    if (profile.age) profileData.age = parseInt(profile.age);
    if (profile.degree) profileData.degree = profile.degree;
    if (profile.budget) profileData.budget = parseInt(profile.budget);
    if (profile.country) profileData.country = profile.country;

    onSubmit(goal.trim(), profileData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-starlight mb-2">
          What career do you want to pursue? <span className="text-meteor-red">*</span>
        </label>
        <textarea
          className="input-field"
          rows={3}
          placeholder='e.g. "I want to become a software engineer at a top tech firm" or "I have 18 months to prepare for UPSC"'
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={loading}
          required
          id="goal-input"
        />
        {error && <p className="text-meteor-red text-xs mt-1">{error}</p>}
      </div>

      {/* Target Timeline Section (Required) */}
      <div className="p-4 rounded-xl border" style={{ background: 'var(--secondary-surface)', borderColor: 'var(--input-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-semibold text-starlight uppercase tracking-wider">
            ⏱ Target Timeline <span className="text-meteor-red">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                timelineType === 'duration'
                  ? 'bg-comet-violet text-white font-medium'
                  : 'text-dust-gray hover:text-starlight'
              }`}
              onClick={() => setTimelineType('duration')}
            >
              Duration
            </button>
            <button
              type="button"
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                timelineType === 'date'
                  ? 'bg-comet-violet text-white font-medium'
                  : 'text-dust-gray hover:text-starlight'
              }`}
              onClick={() => setTimelineType('date')}
            >
              Target Date
            </button>
          </div>
        </div>

        {timelineType === 'duration' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-dust-gray mb-1">Available Duration</label>
              <input
                type="number"
                min="1"
                max="60"
                className="input-field"
                placeholder="e.g. 6"
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                required
                id="target-duration"
              />
            </div>
            <div>
              <label className="block text-xs text-dust-gray mb-1">Unit</label>
              <select
                className="input-field cursor-pointer"
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                id="duration-unit"
              >
                <option value="Months">Months</option>
                <option value="Years">Years</option>
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-dust-gray mb-1">Target Completion Date</label>
            <input
              type="date"
              className="input-field"
              value={targetCompletionDate}
              onChange={(e) => setTargetCompletionDate(e.target.value)}
              required
              id="target-date"
            />
          </div>
        )}
      </div>

      {/* Optional Profile Section */}
      <button
        type="button"
        className="text-sm text-dust-gray hover:text-comet-violet transition-colors flex items-center gap-1"
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
            Generating AI roadmap...
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
