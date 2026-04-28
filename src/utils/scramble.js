/**
 * Rapidly replaces characters with random uppercase letters and resolves to original text left-to-right.
 * @param {HTMLElement} element - The DOM element containing the text.
 * @param {boolean} hasCursor - Whether to append a terminal cursor span.
 * @param {number} speed - Iterations per resolve (default 1/3).
 * @param {number} intervalMs - Frequency of updates in milliseconds.
 */
export const scrambleText = (element, hasCursor = false, speed = 0.35, intervalMs = 30) => {
  if (!element) return;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const originalText = element.dataset.value || element.innerText;
  if (!originalText) return;

  // Set the data-value if not present for subsequent runs
  if (!element.dataset.value) {
    element.dataset.value = originalText;
  }

  let iteration = 0;
  
  // Clear any existing interval to prevent conflicts
  if (element._scrambleInterval) {
    clearInterval(element._scrambleInterval);
  }

  // Initial noise
  element.innerHTML = originalText
    .split("")
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("") + (hasCursor ? '<span class="intro-name-cursor" aria-hidden="true">_</span>' : '');

  const interval = setInterval(() => {
    element.innerHTML = originalText
      .split("")
      .map((letter, index) => {
        if (index < iteration) return originalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("") + (hasCursor ? '<span class="intro-name-cursor" aria-hidden="true">_</span>' : '');

    if (iteration >= originalText.length) {
      clearInterval(interval);
      element._scrambleInterval = null;
    }

    iteration += speed;
  }, intervalMs);

  element._scrambleInterval = interval;
  return interval;
};
