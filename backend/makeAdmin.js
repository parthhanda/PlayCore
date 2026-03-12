const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('./models/User');

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const usernameArg = process.argv[2];

        if (!usernameArg) {
            console.error('Please provide a username! Example: node makeAdmin.js PlayerOne');
            process.exit(1);
        }

        const user = await User.findOne({ username: usernameArg });

        if (!user) {
            console.error(`User '${usernameArg}' not found in database.`);
            process.exit(1);
        }

        if (user.roles.includes('admin')) {
            console.log(`User '${usernameArg}' is already an admin.`);
            process.exit(0);
        }

        user.roles.push('admin');
        await user.save();

        console.log(`SUCCESS! User '${usernameArg}' has been promoted to Admin.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

makeAdmin();
