/* HelpBuddy technician experience model
 * Stars and levels personalize recommendations without granting permissions.
 * Authorization remains controlled by role/permission systems.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'om-helpbuddy-experience-v1';
  const LEVELS = Object.freeze([
    { level: 1, name: 'New Technician', minStars: 0 },
    { level: 2, name: 'Developing Technician', minStars: 50 },
    { level: 3, name: 'Capable Technician', minStars: 150 },
    { level: 4, name: 'Experienced Technician', minStars: 300 },
    { level: 5, name: 'Advanced Technician', minStars: 500 },
    { level: 6, name: 'Senior Technician', minStars: 800 },
    { level: 7, name: 'Expert Technician', minStars: 1200 }
  ]);

  const read = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (_) { return {}; }
  };
  const write = value => localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

  function get(userId) {
    const all = read();
    return all[userId] || { userId, stars: 0, completedWork: 0, verifiedResolutions: 0, byCategory: {}, rating: 0 };
  }

  function levelFor(stars) {
    return [...LEVELS].reverse().find(x => stars >= x.minStars) || LEVELS[0];
  }

  function award(userId, stars, category, metadata = {}) {
    if (!userId) throw new Error('userId is required');
    const amount = Math.max(0, Number(stars) || 0);
    const profile = get(userId);
    profile.stars += amount;
    profile.completedWork += metadata.completedWork ? 1 : 0;
    profile.verifiedResolutions += metadata.verifiedResolution ? 1 : 0;
    if (category) {
      profile.byCategory[category] = profile.byCategory[category] || { stars: 0, completed: 0 };
      profile.byCategory[category].stars += amount;
      profile.byCategory[category].completed += metadata.completedWork ? 1 : 0;
    }
    const all = read();
    all[userId] = profile;
    write(all);
    return summary(userId);
  }

  function setRating(userId, rating, actorId) {
    if (!userId || !actorId) throw new Error('userId and actorId are required');
    const profile = get(userId);
    profile.rating = Math.max(0, Math.min(5, Number(rating) || 0));
    profile.ratingUpdatedBy = actorId;
    profile.ratingUpdatedAt = new Date().toISOString();
    const all = read();
    all[userId] = profile;
    write(all);
    return summary(userId);
  }

  function summary(userId) {
    const profile = get(userId);
    const level = levelFor(profile.stars);
    return Object.freeze({ ...profile, level: level.level, levelName: level.name });
  }

  function recommendationSignals(userId, category) {
    const profile = summary(userId);
    const categoryStats = profile.byCategory[category] || { stars: 0, completed: 0 };
    return {
      userId,
      level: profile.level,
      levelName: profile.levelName,
      stars: profile.stars,
      rating: profile.rating,
      categoryStars: categoryStats.stars,
      categoryCompleted: categoryStats.completed,
      canRecommend: true
    };
  }

  global.HelpBuddyExperience = Object.freeze({ LEVELS, get, levelFor, award, setRating, summary, recommendationSignals });
})(window);
