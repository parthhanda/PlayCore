const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

const runVerification = async () => {
    console.log('--- STARTING PROJECT VERIFICATION ---');
    let success = true;

    // 1. Verify Backend Health
    try {
        process.stdout.write('[ ] Checking Backend Health... ');
        const healthRes = await axios.get(`${BACKEND_URL}/health`);
        if (healthRes.data.status === 'ok') {
            console.log('✅ OK');
        } else {
            console.log('❌ FAILED (Invalid Status)');
            success = false;
        }
    } catch (error) {
        console.log(`❌ FAILED (${error.message})`);
        success = false;
    }

    // 2. Verify Frontend Availability
    try {
        process.stdout.write('[ ] Checking Frontend Availability... ');
        const frontendRes = await axios.get(FRONTEND_URL);
        if (frontendRes.status === 200 && frontendRes.data.includes('Vite')) {
            console.log('✅ OK');
        } else {
            console.log('❌ FAILED (Unexpected Content)');
            success = false;
        }
    } catch (error) {
        console.log(`❌ FAILED (${error.message})`);
        success = false;
    }

    // 3. Verify Auth Flow
    try {
        const testUser = {
            username: `verify_${Date.now()}`,
            email: `verify_${Date.now()}@example.com`,
            password: 'password123'
        };

        // Register
        process.stdout.write('[ ] Testing Registration... ');
        const regRes = await axios.post(`${BACKEND_URL}/auth/register`, testUser);
        if (regRes.data.token) {
            console.log('✅ OK');
        } else {
            console.log('❌ FAILED (No Token)');
            success = false;
        }

        // Login
        process.stdout.write('[ ] Testing Login... ');
        const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        const token = loginRes.data.token;
        if (token) {
            console.log('✅ OK');
        } else {
            console.log('❌ FAILED (No Token)');
            success = false;
        }

        // Protected Route
        process.stdout.write('[ ] Testing Protected Route (/me)... ');
        const meRes = await axios.get(`${BACKEND_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (meRes.data.email === testUser.email) {
            console.log('✅ OK');
        } else {
            console.log('❌ FAILED (Data Mismatch)');
            success = false;
        }

    } catch (error) {
        console.log(`❌ FAILED Auth Flow (${error.message})`);
        if (error.response) console.log(error.response.data);
        success = false;
    }

    console.log('--- VERIFICATION COMPLETE ---');
    if (success) {
        console.log('Result: All Systems Operational 🟢');
    } else {
        console.log('Result: Issues Detected 🔴');
    }
};

runVerification();
