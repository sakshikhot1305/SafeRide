const BusTracking = require("../models/BusTracking");
const Driver = require("../models/Driver");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Student = require("../models/Student");
const Notification = require("../models/Notification");

// Helper: Great-circle distance using Haversine formula in km
function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Driver updates the bus's current location
const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, speed, isTripStart } = req.body;

        const lat = Number(latitude);
        const lng = Number(longitude);
        const busSpeed = speed === undefined ? 0 : Number(speed);

        if (
            latitude === undefined ||
            longitude === undefined ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180 ||
            !Number.isFinite(busSpeed) ||
            busSpeed < 0
        ) {
            return res.status(400).json({
                message: "Please provide valid latitude, longitude and speed"
            });
        }

        const userId = req.user.id || req.user._id || req.user.userId;

        const driver = await Driver.findOne({ userId });

        if (!driver) {
            return res.status(404).json({
                message: "Driver profile not found"
            });
        }

        if (!driver.busId) {
            return res.status(400).json({
                message: "No bus is assigned to this driver yet"
            });
        }

        const bus = await Bus.findById(driver.busId);

        if (!bus || bus.status !== "Active") {
            return res.status(400).json({
                message: "Assigned bus not found or is inactive"
            });
        }

        // Determine if this is the beginning of a transit trip
        const priorTracking = await BusTracking.findOne({ busId: driver.busId });
        const lastUpdatedMs = priorTracking?.lastUpdated ? new Date(priorTracking.lastUpdated).getTime() : 0;
        const minutesSinceLastUpdate = (Date.now() - lastUpdatedMs) / (1000 * 60);

        const isNewTripSession = isTripStart || !priorTracking || minutesSinceLastUpdate > 15;

        const tracking = await BusTracking.findOneAndUpdate(
            { busId: driver.busId },
            {
                $set: {
                    driverId: driver._id,
                    latitude: lat,
                    longitude: lng,
                    speed: busSpeed,
                    lastUpdated: new Date()
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        // When a new trip broadcast begins, notify parents of all assigned students
        if (isNewTripSession) {
            try {
                const assignedStudents = await Student.find({ busId: driver.busId, status: "Active" });
                const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

                for (const student of assignedStudents) {
                    if (student.parentId) {
                        const recentAlert = await Notification.findOne({
                            parentId: student.parentId,
                            studentId: student._id,
                            type: "TRIP",
                            createdAt: { $gte: fifteenMinutesAgo }
                        });

                        if (!recentAlert) {
                            await Notification.create({
                                parentId: student.parentId,
                                studentId: student._id,
                                message: `Bus ${bus.busNumber} has started sharing live GPS location and begun its transit route.`,
                                type: "TRIP"
                            });
                        }
                    }
                }
            } catch (notifErr) {
                console.error("Notice: Could not dispatch trip start notification:", notifErr.message);
            }
        }

        return res.status(200).json({
            message: "Bus location updated successfully",
            tracking
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update bus location",
            error: error.message
        });
    }
};

// Get the latest location of a bus
const getBusLocation = async (req, res) => {
    try {
        const { busId } = req.params;

        if (!busId || !busId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        const tracking = await BusTracking.findOne({ busId })
            .populate("busId")
            .populate("driverId");

        if (!tracking) {
            return res.status(404).json({
                message: "Location not available for this bus yet"
            });
        }

        return res.status(200).json({
            message: "Bus location fetched successfully",
            tracking
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch bus location",
            error: error.message
        });
    }
};

// Get AI Arrival Prediction (ETA) and Route Delay Analysis for a bus
const getBusETA = async (req, res) => {
    try {
        const { busId } = req.params;
        const { stopId } = req.query;

        if (!busId || !busId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        // Retrieve latest GPS location
        const tracking = await BusTracking.findOne({ busId })
            .populate("busId")
            .populate("driverId");

        // If no GPS signal exists yet
        if (!tracking || !Number.isFinite(tracking.latitude) || !Number.isFinite(tracking.longitude)) {
            return res.status(200).json({
                busId: bus._id,
                busNumber: bus.busNumber,
                registrationNumber: bus.registrationNumber,
                predictionStatus: "Temporarily Unavailable",
                message: "GPS tracking signal not currently broadcasting for this bus.",
                currentLocation: null,
                nextStop: null,
                predictedEtaMinutes: null,
                expectedArrivalTime: null,
                scheduledArrivalTime: null,
                delayMinutes: 0,
                isDelayed: false,
                scheduleStatus: "NO_GPS_DATA"
            });
        }

        // Find route associated with this bus
        let route = null;
        const studentWithRoute = await Student.findOne({ busId, routeId: { $ne: null } }).populate("routeId");
        if (studentWithRoute && studentWithRoute.routeId) {
            route = studentWithRoute.routeId;
        } else {
            route = await Route.findOne({ status: "Active" });
        }

        const stops = (route && Array.isArray(route.stops))
            ? route.stops.filter(s => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
            : [];

        if (stops.length === 0) {
            return res.status(200).json({
                busId: bus._id,
                busNumber: bus.busNumber,
                registrationNumber: bus.registrationNumber,
                route: null,
                routeStops: [],
                predictionStatus: "Temporarily Unavailable",
                message: "No route stops configured for this bus transit.",
                currentLocation: {
                    latitude: tracking.latitude,
                    longitude: tracking.longitude,
                    speed: tracking.speed || 0,
                    lastUpdated: tracking.lastUpdated
                },
                nextStop: null,
                predictedEtaMinutes: null,
                expectedArrivalTime: null,
                scheduledArrivalTime: null,
                delayMinutes: 0,
                isDelayed: false,
                scheduleStatus: "NO_ROUTE_FOUND"
            });
        }

        // Determine target stop
        let targetStop = null;
        let targetStopIndex = 0;

        if (stopId && stopId.match(/^[0-9a-fA-F]{24}$/)) {
            const foundIndex = stops.findIndex(s => s._id.toString() === stopId);
            if (foundIndex !== -1) {
                targetStop = stops[foundIndex];
                targetStopIndex = foundIndex;
            }
        }

        // If no stopId specified, select the closest upcoming stop
        if (!targetStop) {
            let minDistance = Infinity;
            let closestIndex = 0;

            stops.forEach((stop, idx) => {
                const dist = getHaversineDistanceKm(
                    tracking.latitude,
                    tracking.longitude,
                    stop.latitude,
                    stop.longitude
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    closestIndex = idx;
                }
            });

            // If bus is within 80m of closest stop and there's a subsequent stop, advance
            if (minDistance < 0.08 && closestIndex < stops.length - 1) {
                targetStopIndex = closestIndex + 1;
            } else {
                targetStopIndex = closestIndex;
            }
            targetStop = stops[targetStopIndex];
        }

        const distanceKm = getHaversineDistanceKm(
            tracking.latitude,
            tracking.longitude,
            targetStop.latitude,
            targetStop.longitude
        );

        const stopsRemaining = Math.max(1, targetStopIndex + 1);

        // Call Python FastAPI ML Service
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
        let predictedEtaMinutes = null;
        let predictionSource = "RANDOM_FOREST_ML";
        let predictionStatus = "Available";
        let modelDetails = null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const pyRes = await fetch(`${AI_SERVICE_URL}/predict-eta`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current_lat: tracking.latitude,
                    current_lng: tracking.longitude,
                    speed: tracking.speed || 0,
                    stop_lat: targetStop.latitude,
                    stop_lng: targetStop.longitude,
                    stops_remaining: stopsRemaining,
                    stop_index: targetStopIndex,
                    timestamp: tracking.lastUpdated ? tracking.lastUpdated.toISOString() : new Date().toISOString()
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (pyRes.ok) {
                const pyData = await pyRes.json();
                predictedEtaMinutes = pyData.predicted_eta_minutes;
                predictionSource = pyData.prediction_source;
                modelDetails = pyData.details;
            } else {
                throw new Error(`ML microservice status ${pyRes.status}`);
            }
        } catch (mlErr) {
            // Graceful fallback to physics calculation
            const effectiveSpeed = Math.max((tracking.speed || 0) * 0.6 + 12.0, 15.0);
            const baseMinutes = (distanceKm / effectiveSpeed) * 60.0;
            const dwellMinutes = (stopsRemaining - 1) * 1.5;
            predictedEtaMinutes = Math.max(Math.round((baseMinutes + dwellMinutes) * 10) / 10, 0.5);
            predictionSource = "FALLBACK_PHYSICS";
            modelDetails = {
                note: "FastAPI ML microservice offline or unreachable; dynamic physics calculation used as fallback.",
                serviceError: mlErr.message
            };
        }

        // Expected arrival clock time
        const nowMs = Date.now();
        const expectedArrivalDate = new Date(nowMs + Math.round(predictedEtaMinutes * 60 * 1000));
        const expectedArrivalTimeStr = expectedArrivalDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        // Delay & Schedule Evaluation
        const DELAY_THRESHOLD_MINUTES = Number(process.env.DELAY_THRESHOLD_MINUTES) || 5;
        let isDelayed = false;
        let delayMinutes = 0;
        let scheduleStatus = "NO_SCHEDULE_DEFINED";
        let scheduledArrivalTimeStr = targetStop.scheduledTime || null;

        if (targetStop.scheduledTime) {
            const timeParts = targetStop.scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeParts) {
                let hours = parseInt(timeParts[1], 10);
                const minutes = parseInt(timeParts[2], 10);
                const meridiem = timeParts[3] ? timeParts[3].toUpperCase() : null;

                if (meridiem === "PM" && hours < 12) hours += 12;
                if (meridiem === "AM" && hours === 12) hours = 0;

                const scheduledDate = new Date();
                scheduledDate.setHours(hours, minutes, 0, 0);

                delayMinutes = Math.round((expectedArrivalDate.getTime() - scheduledDate.getTime()) / 60000);

                if (delayMinutes >= DELAY_THRESHOLD_MINUTES) {
                    isDelayed = true;
                    scheduleStatus = "DELAY_DETECTED";

                    // Trigger notification to authorized parents without duplicating recent alerts
                    const studentsOnBus = await Student.find({ busId: bus._id, status: "Active" });
                    for (const student of studentsOnBus) {
                        if (student.parentId) {
                            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
                            const existingAlert = await Notification.findOne({
                                parentId: student.parentId,
                                studentId: student._id,
                                type: "DELAY",
                                createdAt: { $gte: thirtyMinutesAgo }
                            });

                            if (!existingAlert) {
                                await Notification.create({
                                    parentId: student.parentId,
                                    studentId: student._id,
                                    message: `Route Delay Alert: Bus ${bus.busNumber} is running approx. ${delayMinutes} mins behind schedule for stop "${targetStop.name}". Expected arrival: ${expectedArrivalTimeStr}.`,
                                    type: "DELAY"
                                });
                            }
                        }
                    }
                } else {
                    scheduleStatus = "ON_TIME";
                    isDelayed = false;
                }
            }
        }

        return res.status(200).json({
            busId: bus._id,
            busNumber: bus.busNumber,
            registrationNumber: bus.registrationNumber,
            route: route ? {
                _id: route._id,
                routeName: route.routeName,
                startPoint: route.startPoint,
                endPoint: route.endPoint,
                stops
            } : null,
            routeStops: stops,
            currentLocation: {
                latitude: tracking.latitude,
                longitude: tracking.longitude,
                speed: tracking.speed || 0,
                lastUpdated: tracking.lastUpdated
            },
            nextStop: {
                _id: targetStop._id,
                name: targetStop.name,
                latitude: targetStop.latitude,
                longitude: targetStop.longitude,
                scheduledTime: targetStop.scheduledTime || null,
                stopIndex: targetStopIndex,
                totalStopsOnRoute: stops.length
            },
            distanceToNextStopKm: Math.round(distanceKm * 100) / 100,
            predictedEtaMinutes,
            expectedArrivalTime: expectedArrivalTimeStr,
            scheduledArrivalTime: scheduledArrivalTimeStr,
            delayMinutes: Math.max(0, delayMinutes),
            isDelayed,
            delayThresholdMinutes: DELAY_THRESHOLD_MINUTES,
            predictionStatus,
            predictionSource,
            scheduleStatus,
            details: modelDetails
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to generate bus arrival prediction",
            error: error.message
        });
    }
};

module.exports = {
    updateLocation,
    getBusLocation,
    getBusETA
};
