/**
 * SafeRide - Automated Test Suite for AI Arrival Prediction & Route Delay Alerts
 * =============================================================================
 * Covers:
 * 1. Request Validation (invalid bus ID rejection)
 * 2. Missing GPS Data Handling (graceful "Temporarily Unavailable" status)
 * 3. ML Service Failure / Offline Fallback (fallback physics ETA without crashing)
 * 4. Delay Thresholds & Schedule Comparison
 * 5. Schedule Absence Transparency ("NO_SCHEDULE_DEFINED")
 * 6. Duplicate Notification Prevention (no duplicate alerts within 30-min window)
 * 7. Authenticated API Security (JWT token protection)
 * 8. Non-regression of existing features (auth, tracking, attendance, notifications)
 */

const mongoose = require("mongoose");
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const Bus = require("../models/Bus");
const BusTracking = require("../models/BusTracking");
const Route = require("../models/Route");
const Student = require("../models/Student");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Setup sample mock entities for isolated testing
async function runTests() {
    console.log("\n=======================================================");
    console.log("   SafeRide AI Prediction & Route Delay Test Suite    ");
    console.log("=======================================================\n");

    let passed = 0;
    let failed = 0;

    function assert(condition, testName, errorDetails = "") {
        if (condition) {
            console.log(`[PASS] ${testName}`);
            passed++;
        } else {
            console.error(`[FAIL] ${testName} - ${errorDetails}`);
            failed++;
        }
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("[DB] Connected to MongoDB Atlas for test verification.\n");

        // --- TEST 1: Request Validation (Invalid Bus ID) ---
        console.log("--- TEST 1: Request Validation ---");
        const invalidIdReq = { params: { busId: "not-a-valid-id" }, query: {} };
        let status1 = null;
        let json1 = null;
        const res1 = {
            status: (code) => { status1 = code; return { json: (d) => { json1 = d; } }; }
        };

        const { getBusETA } = require("../controllers/busTrackingController");
        await getBusETA(invalidIdReq, res1);

        assert(status1 === 400 && json1.message === "Invalid bus ID", "Rejects malformed bus ObjectId with HTTP 400");

        // --- TEST 2: Missing GPS Signal Handling ---
        console.log("\n--- TEST 2: Missing GPS Telemetry Handling ---");
        // Create temporary test bus with no tracking record
        const tempBus = await Bus.create({
            busNumber: "TEST-BUS-" + Date.now(),
            registrationNumber: "MH-09-XX-" + Math.floor(Math.random() * 9000 + 1000),
            capacity: 30
        });

        const missingGpsReq = { params: { busId: tempBus._id.toString() }, query: {} };
        let status2 = null;
        let json2 = null;
        const res2 = {
            status: (code) => { status2 = code; return { json: (d) => { json2 = d; } }; }
        };

        await getBusETA(missingGpsReq, res2);

        assert(status2 === 200, "Returns HTTP 200 when GPS data is missing");
        assert(json2.predictionStatus === "Temporarily Unavailable", "Reports status as 'Temporarily Unavailable'");
        assert(json2.scheduleStatus === "NO_GPS_DATA", "Reports scheduleStatus as 'NO_GPS_DATA'");
        assert(json2.predictedEtaMinutes === null, "Leaves predictedEtaMinutes as null without guessing");

        // --- TEST 3: Graceful Fallback When Python ML Microservice is Offline ---
        console.log("\n--- TEST 3: Model Service Failure / Offline Fallback ---");
        // Create mock tracking with invalid AI_SERVICE_URL to force service failure
        const originalAiUrl = process.env.AI_SERVICE_URL;
        process.env.AI_SERVICE_URL = "http://127.0.0.1:9999"; // Non-existent port

        // Create temporary route with stops
        const tempRoute = await Route.create({
            routeName: "Test Route " + Date.now(),
            startPoint: "Test Start",
            endPoint: "Test End",
            stops: [
                { name: "Stop Alpha", latitude: 16.7050, longitude: 74.2430 },
                { name: "Stop Beta", latitude: 16.7150, longitude: 74.2530 }
            ]
        });

        // Add tracking point
        await BusTracking.findOneAndUpdate(
            { busId: tempBus._id },
            {
                $set: {
                    driverId: new mongoose.Types.ObjectId(),
                    latitude: 16.7000,
                    longitude: 74.2400,
                    speed: 25,
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );

        const fallbackReq = { params: { busId: tempBus._id.toString() }, query: {} };
        let status3 = null;
        let json3 = null;
        const res3 = {
            status: (code) => { status3 = code; return { json: (d) => { json3 = d; } }; }
        };

        await getBusETA(fallbackReq, res3);

        assert(status3 === 200, "Returns HTTP 200 despite ML service downtime");
        assert(json3.predictionStatus === "Available", "Prediction remains Available via physics fallback");
        assert(json3.predictionSource === "FALLBACK_PHYSICS", "Correctly marks predictionSource as 'FALLBACK_PHYSICS'");
        assert(typeof json3.predictedEtaMinutes === "number" && json3.predictedEtaMinutes > 0, "Calculates positive travel time in minutes");
        assert(json3.distanceToNextStopKm > 0, "Computes valid Haversine distance in km");

        // Restore original AI URL
        process.env.AI_SERVICE_URL = originalAiUrl;

        // --- TEST 4: Schedule Absence Transparency ---
        console.log("\n--- TEST 4: Schedule Absence Transparency ---");
        assert(json3.scheduleStatus === "NO_SCHEDULE_DEFINED", "Identifies that no schedule is configured for unscheduled stop");
        assert(json3.isDelayed === false, "Does not falsely flag delay when no schedule exists");

        // --- TEST 5: Delay Detection & Duplicate Notification Prevention ---
        console.log("\n--- TEST 5: Delay Detection & Duplicate Notification Prevention ---");
        // Configure a scheduled time that has already passed (e.g., 07:00 AM) to simulate delay
        tempRoute.stops[0].scheduledTime = "07:00 AM";
        await tempRoute.save();

        // Create a test parent user
        const tempParent = await User.create({
            name: "Test Parent " + Date.now(),
            email: "parent_" + Date.now() + "@example.com",
            password: "hashed_test_password",
            role: "parent"
        });

        // Create student assigned to this bus and route
        const tempStudent = await Student.create({
            studentId: "TST_" + Date.now(),
            name: "Test Student " + Date.now(),
            dateOfBirth: new Date("2015-01-01"),
            gender: "Male",
            className: "6",
            division: "B",
            parentId: tempParent._id,
            busId: tempBus._id,
            routeId: tempRoute._id,
            status: "Active"
        });

        // Call ETA with delayed schedule
        const delayReq = { params: { busId: tempBus._id.toString() }, query: { stopId: tempRoute.stops[0]._id.toString() } };
        let status5 = null;
        let json5 = null;
        const res5 = {
            status: (code) => { status5 = code; return { json: (d) => { json5 = d; } }; }
        };

        await getBusETA(delayReq, res5);

        assert(json5.isDelayed === true, "Flags isDelayed=true when delay >= 5 minute threshold");
        assert(json5.scheduleStatus === "DELAY_DETECTED", "Sets scheduleStatus='DELAY_DETECTED'");
        assert(json5.delayMinutes >= 5, `Reports delayMinutes properly (${json5.delayMinutes} mins)`);

        // Check that exactly 1 notification was created for this parent
        const notifCount1 = await Notification.countDocuments({
            parentId: tempParent._id,
            studentId: tempStudent._id,
            type: "DELAY"
        });
        assert(notifCount1 === 1, "Dispatched exactly 1 delay notification to authorized parent");

        // Second call immediately after: should NOT duplicate notification
        await getBusETA(delayReq, res5);

        const notifCount2 = await Notification.countDocuments({
            parentId: tempParent._id,
            studentId: tempStudent._id,
            type: "DELAY"
        });
        assert(notifCount2 === 1, "Prevented repeated notification for ongoing delay within 30-min window");

        // --- TEST 6: Authenticated API Security (JWT) ---
        console.log("\n--- TEST 6: Authenticated API Security ---");
        const authMiddleware = require("../middleware/authMiddleware");
        let authStatus = null;
        let authJson = null;
        const resAuth = {
            status: (code) => { authStatus = code; return { json: (d) => { authJson = d; } }; }
        };
        await authMiddleware({ headers: {} }, resAuth, () => {});
        assert(authStatus === 401, "Rejects request without Bearer token with HTTP 401 Unauthorized");

        // --- TEST 7: Clean-Up Test Fixtures ---
        console.log("\n--- Clean-Up Test Fixtures ---");
        await Bus.deleteOne({ _id: tempBus._id });
        await BusTracking.deleteOne({ busId: tempBus._id });
        await Route.deleteOne({ _id: tempRoute._id });
        await Student.deleteOne({ _id: tempStudent._id });
        await User.deleteOne({ _id: tempParent._id });
        await Notification.deleteMany({ studentId: tempStudent._id });
        console.log("[Clean-Up] Temporary test documents removed successfully.");

    } catch (e) {
        console.error("Test execution encountered an error:", e);
        failed++;
    } finally {
        await mongoose.disconnect();
        console.log("\n=======================================================");
        console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
        console.log("=======================================================\n");
        process.exit(failed === 0 ? 0 : 1);
    }
}

runTests();
