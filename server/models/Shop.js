const mongoose = require('mongoose');
const crypto = require('crypto');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide shop name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    code: {
        type: String,
        unique: true,
        uppercase: true
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate unique shop code before saving
shopSchema.pre('save', async function (next) {
    if (!this.code) {
        // Generate code: TEKGEAR-XXXX (random 4 chars)
        const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
        this.code = `TG-${randomPart}`;

        // Ensure uniqueness
        const Shop = this.constructor;
        let exists = await Shop.findOne({ code: this.code });
        while (exists) {
            const newRandom = crypto.randomBytes(2).toString('hex').toUpperCase();
            this.code = `TG-${newRandom}`;
            exists = await Shop.findOne({ code: this.code });
        }
    }
    next();
});

// Method to regenerate shop code
shopSchema.methods.regenerateCode = async function () {
    const Shop = this.constructor;
    let newCode;
    let exists = true;

    while (exists) {
        const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
        newCode = `TG-${randomPart}`;
        exists = await Shop.findOne({ code: newCode });
    }

    this.code = newCode;
    await this.save();
    return this.code;
};

module.exports = mongoose.model('Shop', shopSchema);
