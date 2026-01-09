const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    vehicleInfo: {
        make: String,
        model: String,
        year: Number,
        vin: String
    },
    requiredCert: {
        type: String,
        enum: ['EV', 'Engine', 'Brakes', 'Transmission', 'Electrical', 'HVAC', 'Diagnostics'],
        required: [true, 'Required certification is required']
    },
    bookTime: {
        type: Number,
        required: [true, 'Book time is required'],
        min: 1 // Minutes
    },
    actualTime: {
        type: Number,
        default: null // Minutes - set when job is completed
    },
    status: {
        type: String,
        enum: ['available', 'pending-approval', 'in-progress', 'completed', 'cancelled'],
        default: 'available'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTech: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Multi-shop support
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop is required']
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    incentiveEarned: {
        type: Number,
        default: 0
    },
    timeSaved: {
        type: Number,
        default: 0 // Minutes saved (bookTime - actualTime)
    },
    notes: {
        type: String,
        default: ''
    },
    serviceOrderNumber: {
        type: String,
        unique: true
    },
    // Job Request/Approval Workflow
    assignmentType: {
        type: String,
        enum: ['direct', 'requested'],
        default: null
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    requestStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectedReason: {
        type: String,
        default: ''
    },
    approvalToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Generate service order number before saving
jobSchema.pre('save', async function (next) {
    if (!this.serviceOrderNumber) {
        const count = await mongoose.model('Job').countDocuments();
        this.serviceOrderNumber = `SO-${String(count + 1001).padStart(6, '0')}`;
    }
    next();
});

// Calculate time saved and update on completion
jobSchema.methods.calculateIncentive = function (bonusPerUnit, timeSavedThreshold) {
    if (this.actualTime && this.actualTime < this.bookTime) {
        this.timeSaved = this.bookTime - this.actualTime;
        const bonusUnits = Math.floor(this.timeSaved / timeSavedThreshold);
        this.incentiveEarned = bonusUnits * bonusPerUnit;
        return this.incentiveEarned;
    }
    return 0;
};

// Index for efficient queries
jobSchema.index({ status: 1, requiredCert: 1 });
jobSchema.index({ assignedTech: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
