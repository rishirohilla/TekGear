const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const IncentiveRule = require('../models/IncentiveRule');
const Shop = require('../models/Shop');

// Seed data configuration
const certifications = ['EV', 'Engine', 'Brakes', 'Transmission', 'Electrical', 'HVAC', 'Diagnostics'];

const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Nissan', 'Mazda'];
const vehicleModels = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Bronco'],
    'Chevrolet': ['Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Camaro'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M4'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'e-tron'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Leaf'],
    'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5']
};

const jobTitles = {
    'EV': ['EV Battery Diagnostic', 'Electric Motor Service', 'Charging System Repair', 'High Voltage Cable Inspection', 'Regenerative Brake Service'],
    'Engine': ['Engine Tune-Up', 'Oil Change Service', 'Timing Belt Replacement', 'Engine Overhaul', 'Fuel System Cleaning'],
    'Brakes': ['Brake Pad Replacement', 'Rotor Resurfacing', 'Brake Fluid Flush', 'Complete Brake System Service', 'Brake Line Inspection'],
    'Transmission': ['Transmission Fluid Change', 'Clutch Replacement', 'Transmission Rebuild', 'CVT Service', 'Gear Synchronizer Repair'],
    'Electrical': ['Alternator Replacement', 'Starter Motor Repair', 'Wiring Harness Repair', 'Battery System Check', 'Electrical Fault Diagnosis'],
    'HVAC': ['AC Recharge', 'Heater Core Replacement', 'Blower Motor Service', 'AC Compressor Replacement', 'Climate Control Repair'],
    'Diagnostics': ['Full Vehicle Scan', 'Check Engine Light Diagnosis', 'Emissions System Check', 'Computer Reprogramming', 'Sensor Calibration']
};

// Generate random technician names
const technicianNames = [
    'Marcus Johnson', 'David Chen', 'Michael Rodriguez', 'James Williams', 'Robert Thompson',
    'William Garcia', 'Christopher Martinez', 'Daniel Lee', 'Matthew Brown', 'Anthony Davis',
    'Joseph Wilson', 'Andrew Taylor', 'Joshua Moore', 'Ryan Anderson', 'Brandon Jackson',
    'Kevin White', 'Brian Harris', 'Jason Clark', 'Justin Lewis', 'Eric Walker'
];

// Helper functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Generate random certifications (1-4 certs)
const generateCertifications = () => {
    const numCerts = randomInt(1, 4);
    const shuffled = certifications.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numCerts);
};

// Generate VIN
const generateVIN = () => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let vin = '';
    for (let i = 0; i < 17; i++) {
        vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
};

// Seed the database
const seedDatabase = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Job.deleteMany({});
        await IncentiveRule.deleteMany({});
        await Shop.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Manager account first (without shop)
        const manager = await User.create({
            name: 'Sarah Mitchell',
            email: 'manager@tekgear.com',
            password: 'manager123',
            role: 'manager',
            certifications: [],
            shopStatus: 'approved',
            isActive: true
        });
        console.log('👔 Created Manager:', manager.email);

        // Create the Demo Shop
        const shop = await Shop.create({
            name: 'Downtown Auto Service',
            code: 'TG-DEMO',
            address: '123 Main Street, Downtown',
            phone: '555-0100',
            manager: manager._id
        });
        console.log('🏪 Created Shop:', shop.name, '| Code:', shop.code);

        // Update manager with shop reference
        manager.shop = shop._id;
        await manager.save();

        // Create Technicians (18 techs for the shop)
        const technicians = [];
        for (let i = 0; i < 18; i++) {
            const tech = await User.create({
                name: technicianNames[i],
                email: `tech${i + 1}@tekgear.com`,
                password: 'tech123',
                role: 'technician',
                certifications: generateCertifications(),
                baseRate: randomInt(20, 40),
                weeklyEarnings: randomFloat(0, 200),
                weeklyBonusGoal: randomInt(300, 600),
                totalJobsCompleted: randomInt(5, 50),
                totalTimeSaved: randomInt(30, 300),
                shop: shop._id,
                shopStatus: 'approved',
                isActive: true
            });
            technicians.push(tech);
        }
        console.log(`👨‍🔧 Created ${technicians.length} Technicians for ${shop.name}`);

        // Create Incentive Rule
        const incentiveRule = await IncentiveRule.create({
            name: 'Standard Efficiency Bonus',
            description: 'Earn $10 for every 30 minutes saved below book time',
            timeSavedThreshold: 30,
            bonusPerUnit: 10,
            isActive: true,
            applicableCerts: ['All'],
            createdBy: manager._id
        });
        console.log('💰 Created Incentive Rule:', incentiveRule.name);

        // Create Jobs (60 jobs for the shop)
        const jobs = [];
        const statuses = ['available', 'available', 'available', 'in-progress', 'completed', 'completed', 'completed', 'completed'];

        for (let i = 0; i < 60; i++) {
            const cert = randomElement(certifications);
            const make = randomElement(vehicleMakes);
            const model = randomElement(vehicleModels[make]);
            const title = randomElement(jobTitles[cert]);
            const status = randomElement(statuses);
            const bookTime = randomInt(30, 180);

            const jobData = {
                title,
                description: `${title} service for ${make} ${model}`,
                vehicleInfo: {
                    make,
                    model,
                    year: randomInt(2015, 2024),
                    vin: generateVIN()
                },
                requiredCert: cert,
                bookTime,
                status,
                priority: randomElement(['low', 'medium', 'medium', 'high', 'urgent']),
                createdBy: manager._id,
                shop: shop._id // Assign all jobs to the demo shop
            };

            // Assign tech and add completion data for in-progress/completed jobs
            if (status === 'in-progress' || status === 'completed') {
                // Find a tech with matching certification
                const eligibleTechs = technicians.filter(t => t.certifications.includes(cert));
                if (eligibleTechs.length > 0) {
                    const assignedTech = randomElement(eligibleTechs);
                    jobData.assignedTech = assignedTech._id;
                    jobData.startedAt = new Date(Date.now() - randomInt(1, 72) * 60 * 60 * 1000);

                    if (status === 'completed') {
                        // Simulate completion - sometimes faster, sometimes slower
                        const variance = randomFloat(0.6, 1.3);
                        const actualTime = Math.round(bookTime * variance);
                        jobData.actualTime = actualTime;
                        jobData.completedAt = new Date(jobData.startedAt.getTime() + actualTime * 60 * 1000);

                        if (actualTime < bookTime) {
                            const timeSaved = bookTime - actualTime;
                            jobData.timeSaved = timeSaved;
                            const bonusUnits = Math.floor(timeSaved / incentiveRule.timeSavedThreshold);
                            jobData.incentiveEarned = bonusUnits * incentiveRule.bonusPerUnit;
                        }
                    }
                }
            }

            const job = await Job.create(jobData);
            jobs.push(job);
        }
        console.log(`🔧 Created ${jobs.length} Jobs for ${shop.name}`);

        // Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 Database seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🏪 Shop Created:');
        console.log(`   Name: ${shop.name}`);
        console.log(`   Code: ${shop.code}`);
        console.log('\n📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Manager: manager@tekgear.com / manager123');
        console.log('Technician: tech1@tekgear.com / tech123');
        console.log('         (or tech2@tekgear.com through tech18@tekgear.com)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
