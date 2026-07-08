const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    googleId: { type: String, default: null },
    avatarUrl: { type: String, default: '' },

    // Profile
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    heightCm: Number,
    weightKg: Number,
    targetWeightKg: Number,
    goal: { type: String, enum: ['muscle_gain', 'fat_loss', 'maintenance'], default: 'maintenance' },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate',
    },
    dietaryPreference: {
      type: String,
      enum: ['none', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'halal', 'kosher'],
      default: 'none',
    },
    workoutExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    onboardingComplete: { type: Boolean, default: false },

    // Calculated targets
    bmr: Number,
    tdee: Number,
    dailyCalories: Number,
    dailyProtein: Number,
    dailyCarbs: Number,
    dailyFat: Number,
    dailyWaterMl: { type: Number, default: 3000 },
    dailySteps: { type: Number, default: 8000 },
    dailySleepHours: { type: Number, default: 8 },

    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    lastStreakDate: Date,
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
