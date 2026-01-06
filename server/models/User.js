const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['manager', 'technician'],
        default: 'technician'
    },
    certifications: {
        type: [String],
        enum: ['EV', 'Engine', 'Brakes', 'Transmission', 'Electrical', 'HVAC', 'Diagnostics'],
        default: []
    },
    baseRate: {
        type: Number,
        default: 25 // Base hourly rate in dollars
    },
    weeklyEarnings: {
        type: Number,
        default: 0
    },
    weeklyBonusGoal: {
        type: Number,
        default: 500 // Target weekly bonus goal
    },
    efficiencyHistory: [{
        weekStartDate: Date,
        flaggedHours: Number,
        clockedHours: Number,
        efficiencyRatio: Number,
        bonusEarned: Number
    }],
    totalJobsCompleted: {
        type: Number,
        default: 0
    },
    totalTimeSaved: {
        type: Number,
        default: 0 // In minutes
    },
    avatar: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate efficiency ratio
userSchema.methods.calculateEfficiencyRatio = function () {
    if (this.efficiencyHistory.length === 0) return 1;
    const latest = this.efficiencyHistory[this.efficiencyHistory.length - 1];
    return latest.clockedHours > 0 ? latest.flaggedHours / latest.clockedHours : 1;
};

module.exports = mongoose.model('User', userSchema);
