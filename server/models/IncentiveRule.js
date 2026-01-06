const mongoose = require('mongoose');

const incentiveRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Rule name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    timeSavedThreshold: {
        type: Number,
        required: [true, 'Time saved threshold is required'],
        min: 1, // Minutes
        default: 30 // Default: every 30 mins saved
    },
    bonusPerUnit: {
        type: Number,
        required: [true, 'Bonus per unit is required'],
        min: 0,
        default: 10 // Default: $10 per unit
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCerts: {
        type: [String],
        enum: ['EV', 'Engine', 'Brakes', 'Transmission', 'Electrical', 'HVAC', 'Diagnostics', 'All'],
        default: ['All']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    effectiveUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Ensure only one active rule at a time (optional - can have multiple)
incentiveRuleSchema.statics.getActiveRule = async function (certType = 'All') {
    return await this.findOne({
        isActive: true,
        $or: [
            { applicableCerts: 'All' },
            { applicableCerts: certType }
        ],
        $or: [
            { effectiveUntil: null },
            { effectiveUntil: { $gte: new Date() } }
        ]
    }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('IncentiveRule', incentiveRuleSchema);
