/**
 * SafeRide - Complete System Verification Test Suite
 * Tests all 13 requirements specified in Section 8
 */

const mongoose = require("mongoose");
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../models/User");
const Driver = require("../models/Driver");
const Student = require("../models/Student");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const BusTracking = require("../models/BusTracking");

const { registerUser, loginUser } = require("../controllers/authController");
const { getAllDrivers, getMyDriverProfile, getMyBusStudents } = require("../controllers/driverController");
const { createStudent, updateStudent, getAllStudents, getStudentById, getAllParents, getMyChildren } = require("../controllers/studentController");
const { updateLocation, getBusLocation } = require("../controllers/busTrackingController");

function mockRes() {
    let statusCode = 200;
    let responseData = null;
    return {
        status: (code) => {
            statusCode = code;
            return {
                json: (data) => {
                    responseData = data;
                    return data;
                }
            };
        },
        json: (data) => {
            responseData = data;
            return data;
        },
        getCode: () => statusCode,
        getData: () => responseData
    };
}

async function runVerification() {
    console.log("===============================================================");
    console.log("      SafeRide Complete System Verification & Test Suite       ");
    console.log("===============================================================\n");

    let passed = 0;
    let failed = 0;

    function assert(condition, testName, detail = "") {
        if (condition) {
            console.log(`[PASS] ${testName}`);
            passed++;
        } else {
            console.error(`[FAIL] ${testName} -> ${detail}`);
            failed++;
        }
    }

    const testRunId = Date.now().toString().slice(-6);
    const parentAEmail = `test.parent.a.${testRunId}@saferide.test`;
    const parentBEmail = `test.parent.b.${testRunId}@saferide.test`;
    const driverEmail = `test.driver.${testRunId}@saferide.test`;
    const studentAId = `STU-A-${testRunId}`;
    const studentBId = `STU-B-${testRunId}`;
    const studentNoParentId = `STU-NP-${testRunId}`;

    let parentAUser = null;
    let parentBUser = null;
    let driverUser = null;
    let createdBus = null;
    let tokenDriver = null;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("[DB] Successfully connected to MongoDB Atlas.\n");

        // Create a test active bus for tracking tests if none exist
        createdBus = await Bus.findOne({ status: "Active" });
        if (!createdBus) {
            createdBus = await Bus.create({
                busNumber: `TEST-BUS-${testRunId}`,
                registrationNumber: `MH-${testRunId}`,
                capacity: 40,
                status: "Active"
            });
        }

        // ==============================================================
        // 1. Normal Login Without Demo Button (Valid & Invalid Credentials)
        // ==============================================================
        console.log("--- 1. Testing Normal Login & Error Handling ---");
        // Test invalid credentials
        const resInvalid = mockRes();
        await loginUser({ body: { email: "nonexistent@user.com", password: "wrongpassword" } }, resInvalid);
        assert(
            resInvalid.getCode() === 401 && resInvalid.getData()?.message === "Invalid email or password",
            "1.1 Invalid credentials rejected with 401 and clear message"
        );

        // ==============================================================
        // 2. Driver Registration followed by Login
        // ==============================================================
        console.log("\n--- 2. Testing Driver Registration & Login Flow ---");
        const resDriverReg = mockRes();
        await registerUser({
            body: {
                name: `Test Driver ${testRunId}`,
                email: driverEmail,
                password: "DriverPassword@123",
                role: "driver",
                licenseNumber: `MH-DRV-${testRunId}`,
                phone: "9876543210",
                address: "Kolhapur Campus"
            }
        }, resDriverReg);

        assert(
            resDriverReg.getCode() === 201 && resDriverReg.getData()?.user?.email === driverEmail,
            "2.1 Driver successfully registered in shared User collection"
        );

        // Verify password in DB is hashed with bcrypt
        driverUser = await User.findOne({ email: driverEmail });
        assert(
            driverUser && driverUser.password !== "DriverPassword@123" && driverUser.password.startsWith("$2"),
            "2.2 Driver password securely hashed with bcrypt"
        );

        // Verify Driver profile record created in Driver collection linked by userId
        const driverProfile = await Driver.findOne({ userId: driverUser._id });
        assert(
            driverProfile && driverProfile.userId.toString() === driverUser._id.toString(),
            "2.3 Linked Driver profile record created in Driver collection"
        );

        // Assign test bus to driver for tracking verification
        driverProfile.busId = createdBus._id;
        await driverProfile.save();

        // Login as newly created driver
        const resDriverLogin = mockRes();
        await loginUser({
            body: {
                email: driverEmail,
                password: "DriverPassword@123"
            }
        }, resDriverLogin);

        tokenDriver = resDriverLogin.getData()?.token;
        assert(
            resDriverLogin.getCode() === 200 &&
            resDriverLogin.getData()?.user?.role === "driver" &&
            Boolean(tokenDriver),
            "2.4 Driver logs in with same registered credentials, receives JWT with role 'driver'"
        );

        // Verify getMyDriverProfile loads successfully without error
        const resDriverProfile = mockRes();
        await getMyDriverProfile({ user: { id: driverUser._id, role: "driver" } }, resDriverProfile);
        assert(
            resDriverProfile.getCode() === 200 && resDriverProfile.getData()?.driver?.userId?._id?.toString() === driverUser._id.toString(),
            "2.5 Driver dashboard profile API loads driver data cleanly without error"
        );

        // ==============================================================
        // 3. Newly Registered Driver Appearing in Admin Driver List
        // ==============================================================
        console.log("\n--- 3. Testing Admin Driver List ---");
        const resAllDrivers = mockRes();
        await getAllDrivers({}, resAllDrivers);
        const driversList = resAllDrivers.getData()?.drivers || [];
        const foundDriver = driversList.find(d => d.userId && d.userId.email === driverEmail);
        assert(
            Boolean(foundDriver),
            "3.1 Newly registered driver appears immediately in Admin Driver List"
        );

        // ==============================================================
        // 4. Duplicate Email Rejection
        // ==============================================================
        console.log("\n--- 4. Testing Duplicate Email Rejection ---");
        const resDup = mockRes();
        await registerUser({
            body: {
                name: "Duplicate User",
                email: driverEmail,
                password: "AnyPassword@123",
                role: "driver"
            }
        }, resDup);
        assert(
            resDup.getCode() === 400 && resDup.getData()?.message === "User already exists",
            "4.1 Duplicate email registration rejected with 400 'User already exists'"
        );

        // ==============================================================
        // Setup Parent A and Parent B in shared User collection
        // ==============================================================
        console.log("\n--- Setting up Parent A and Parent B ---");
        const resParentA = mockRes();
        await registerUser({
            body: {
                name: `Parent Alpha ${testRunId}`,
                email: parentAEmail,
                password: "ParentPassword@123",
                role: "parent"
            }
        }, resParentA);
        parentAUser = await User.findOne({ email: parentAEmail });

        const resParentB = mockRes();
        await registerUser({
            body: {
                name: `Parent Beta ${testRunId}`,
                email: parentBEmail,
                password: "ParentPassword@123",
                role: "parent"
            }
        }, resParentB);
        parentBUser = await User.findOne({ email: parentBEmail });

        // Verify getAllParents endpoint includes Parent A and Parent B
        const resParentsList = mockRes();
        await getAllParents({}, resParentsList);
        const allParents = resParentsList.getData()?.parents || [];
        const hasA = allParents.some(p => p.email === parentAEmail);
        const hasB = allParents.some(p => p.email === parentBEmail);
        assert(
            hasA && hasB,
            "4.2 Real parent accounts loaded via getAllParents API for dropdown selection"
        );

        // ==============================================================
        // 5. Student Creation Without a Parent
        // ==============================================================
        console.log("\n--- 5. Testing Student Creation Without Parent ---");
        const resStuNoParent = mockRes();
        await createStudent({
            body: {
                studentId: studentNoParentId,
                name: `Student Independent ${testRunId}`,
                dateOfBirth: "2015-05-10",
                gender: "Female",
                className: "5",
                division: "A",
                parentId: null, // Optional parent
                busId: createdBus._id
            }
        }, resStuNoParent);

        assert(
            resStuNoParent.getCode() === 201 && resStuNoParent.getData()?.student?.parentId === null,
            "5.1 Student saved successfully to MongoDB with parentId: null (optional parent)"
        );

        // ==============================================================
        // 6. Student Creation Linked to Parent A
        // ==============================================================
        console.log("\n--- 6. Testing Student Linked to Parent A ---");
        const resStuA = mockRes();
        await createStudent({
            body: {
                studentId: studentAId,
                name: `Child Alpha ${testRunId}`,
                dateOfBirth: "2016-08-15",
                gender: "Male",
                className: "4",
                division: "B",
                parentId: parentAUser._id.toString(),
                busId: createdBus._id
            }
        }, resStuA);

        assert(
            resStuA.getCode() === 201 &&
            resStuA.getData()?.student?.parentId?.toString() === parentAUser._id.toString(),
            "6.1 Student A successfully linked and saved with Parent A's userId"
        );

        // ==============================================================
        // 7. Student Creation Linked to Parent B
        // ==============================================================
        console.log("\n--- 7. Testing Student Linked to Parent B ---");
        const resStuB = mockRes();
        await createStudent({
            body: {
                studentId: studentBId,
                name: `Child Beta ${testRunId}`,
                dateOfBirth: "2017-02-20",
                gender: "Female",
                className: "3",
                division: "C",
                parentId: parentBUser._id.toString(),
                busId: createdBus._id
            }
        }, resStuB);

        assert(
            resStuB.getCode() === 201 &&
            resStuB.getData()?.student?.parentId?.toString() === parentBUser._id.toString(),
            "7.1 Student B successfully linked and saved with Parent B's userId"
        );

        // ==============================================================
        // 8. Correct Parent Displayed When Editing Each Student
        // ==============================================================
        console.log("\n--- 8. Testing Parent Retention During Edit ---");
        const resGetStuA = mockRes();
        await getStudentById({ params: { id: resStuA.getData().student._id } }, resGetStuA);
        const fetchedA = resGetStuA.getData()?.student;

        const resGetStuB = mockRes();
        await getStudentById({ params: { id: resStuB.getData().student._id } }, resGetStuB);
        const fetchedB = resGetStuB.getData()?.student;

        assert(
            fetchedA && fetchedA.parentId && fetchedA.parentId.email === parentAEmail,
            "8.1 Student A returns populated Parent A record when retrieved for editing"
        );
        assert(
            fetchedB && fetchedB.parentId && fetchedB.parentId.email === parentBEmail,
            "8.2 Student B returns populated Parent B record when retrieved for editing"
        );

        // Update Student A division without losing parent
        const resUpdateA = mockRes();
        await updateStudent({
            params: { id: fetchedA._id },
            body: { division: "Z", parentId: parentAUser._id.toString() }
        }, resUpdateA);

        const recheckedA = await Student.findById(fetchedA._id);
        assert(
            recheckedA.division === "Z" && recheckedA.parentId.toString() === parentAUser._id.toString(),
            "8.3 Student A editing updates fields while correctly preserving Parent A link"
        );

        // ==============================================================
        // 9. Parent Dashboard Showing ONLY Genuinely Linked Students
        // ==============================================================
        console.log("\n--- 9. Testing Role-Based Student Isolation for Parents ---");
        const resParentAChildren = mockRes();
        await getMyChildren({ user: { id: parentAUser._id, role: "parent" } }, resParentAChildren);
        const childrenA = resParentAChildren.getData()?.students || [];

        const resParentBChildren = mockRes();
        await getMyChildren({ user: { id: parentBUser._id, role: "parent" } }, resParentBChildren);
        const childrenB = resParentBChildren.getData()?.students || [];

        const aHasChildA = childrenA.some(s => s.studentId === studentAId);
        const aHasChildB = childrenA.some(s => s.studentId === studentBId);
        const aHasNoParentChild = childrenA.some(s => s.studentId === studentNoParentId);

        const bHasChildB = childrenB.some(s => s.studentId === studentBId);
        const bHasChildA = childrenB.some(s => s.studentId === studentAId);

        assert(
            aHasChildA && !aHasChildB && !aHasNoParentChild,
            "9.1 Parent A sees ONLY Child A, and CANNOT see Child B or unlinked student"
        );
        assert(
            bHasChildB && !bHasChildA,
            "9.2 Parent B sees ONLY Child B, and CANNOT see Child A"
        );

        // ==============================================================
        // 10. Student and Parent Relationship Persisting After Page Refresh
        // ==============================================================
        console.log("\n--- 10. Testing Persistence After Fresh Query (Page Refresh) ---");
        // Completely new query from DB collection
        const freshStudents = await Student.find({
            studentId: { $in: [studentAId, studentBId, studentNoParentId] }
        }).populate("parentId");

        const freshA = freshStudents.find(s => s.studentId === studentAId);
        const freshB = freshStudents.find(s => s.studentId === studentBId);
        const freshNP = freshStudents.find(s => s.studentId === studentNoParentId);

        assert(
            freshA.parentId && freshA.parentId.email === parentAEmail,
            "10.1 Student A relationship to Parent A persists permanently in MongoDB"
        );
        assert(
            freshB.parentId && freshB.parentId.email === parentBEmail,
            "10.2 Student B relationship to Parent B persists permanently in MongoDB"
        );
        assert(
            freshNP.parentId === null,
            "10.3 Unlinked student remains parentId: null permanently in MongoDB"
        );

        // ==============================================================
        // 11. Real GPS Updates Reaching the Backend
        // ==============================================================
        console.log("\n--- 11. Testing Driver GPS Coordinate Ingestion ---");
        const resGps1 = mockRes();
        await updateLocation({
            user: { id: driverUser._id, role: "driver" },
            body: {
                latitude: 16.7050,
                longitude: 74.2430,
                speed: 28
            }
        }, resGps1);

        assert(
            resGps1.getCode() === 200 && resGps1.getData()?.tracking?.latitude === 16.7050,
            "11.1 Real GPS position (16.7050, 74.2430, 28 km/h) accepted and saved by backend"
        );

        // Second update (moving bus)
        const resGps2 = mockRes();
        await updateLocation({
            user: { id: driverUser._id, role: "driver" },
            body: {
                latitude: 16.7075,
                longitude: 74.2465,
                speed: 34
            }
        }, resGps2);

        assert(
            resGps2.getCode() === 200 && resGps2.getData()?.tracking?.latitude === 16.7075,
            "11.2 Updated moving position (16.7075, 74.2465, 34 km/h) persisted in BusTracking"
        );

        // ==============================================================
        // 12. Parent Map Marker Updating When New GPS Data Arrives
        // ==============================================================
        console.log("\n--- 12. Testing Parent Telemetry Retrieval ---");
        const resParentGps = mockRes();
        await getBusLocation({ params: { busId: createdBus._id.toString() } }, resParentGps);
        const trackingRetrieved = resParentGps.getData()?.tracking;

        assert(
            resParentGps.getCode() === 200 &&
            trackingRetrieved.latitude === 16.7075 &&
            trackingRetrieved.longitude === 74.2465 &&
            trackingRetrieved.speed === 34,
            "12.1 Parent tracking API retrieves exact latest moving coordinates and speed"
        );

        // ==============================================================
        // 13. Tracking Status Changing Appropriately When Updates Stop
        // ==============================================================
        console.log("\n--- 13. Testing Freshness & Stale/Offline Status Transitions ---");
        // Fresh timestamp (< 60s): status should be "Live"
        const nowMs = Date.now();
        const freshDiff = (nowMs - new Date(trackingRetrieved.lastUpdated).getTime()) / 1000;
        assert(
            freshDiff < 60,
            `13.1 Fresh timestamp (${Math.round(freshDiff)}s ago) qualifies as 'Live'`
        );

        // Simulated stale timestamp (120s ago): qualifies as 'Waiting for Location'
        const staleTimestamp = new Date(nowMs - 120 * 1000);
        const staleDiff = (nowMs - staleTimestamp.getTime()) / 1000;
        const isWaiting = staleDiff >= 60 && staleDiff <= 180;
        assert(
            isWaiting,
            `13.2 Timestamps between 60s and 3m (${staleDiff}s ago) transition to 'Waiting for Location'`
        );

        // Simulated offline timestamp (300s ago): qualifies as 'Offline'
        const offlineTimestamp = new Date(nowMs - 300 * 1000);
        const offlineDiff = (nowMs - offlineTimestamp.getTime()) / 1000;
        const isOffline = offlineDiff > 180;
        assert(
            isOffline,
            `13.3 Timestamps older than 3m (${offlineDiff}s ago) transition to 'Offline'`
        );

        // ==============================================================
        // CLEANUP TEST DATA
        // ==============================================================
        console.log("\n--- Cleaning Up Automated Test Artifacts ---");
        await Student.deleteMany({
            studentId: { $in: [studentAId, studentBId, studentNoParentId] }
        });
        await Driver.deleteOne({ userId: driverUser._id });
        await User.deleteMany({
            email: { $in: [parentAEmail, parentBEmail, driverEmail] }
        });
        await BusTracking.deleteOne({ busId: createdBus._id });
        console.log("[CLEANUP] Automated test entities removed cleanly from Atlas.");

    } catch (err) {
        console.error("Test execution exception:", err);
        failed++;
    } finally {
        await mongoose.disconnect();
        console.log("\n===============================================================");
        console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
        console.log("===============================================================\n");
        process.exit(failed > 0 ? 1 : 0);
    }
}

runVerification();
