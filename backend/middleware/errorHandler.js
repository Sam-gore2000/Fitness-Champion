const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || err.statusCode || 500);
  let message = err.message;

  // The OpenAI SDK throws errors with a `.status` of 429 both for rate limits
  // and for "you have no billing/credits" — give a message that actually
  // tells the developer what to do instead of a generic failure.
  if (err.status === 429 || err.code === 'insufficient_quota') {
    statusCode = 429;
    message =
      'The AI service is unavailable: the OpenAI account behind OPENAI_API_KEY has no quota/credits left ' +
      '(or hit its rate limit). Add billing at platform.openai.com/settings/organization/billing, or wait and retry. ' +
      'This only affects AI features (chat coach, meal estimate, reports, budget planner) — the rest of the app still works.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
