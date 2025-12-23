const PaymentSettings = require("../models/PaymentSettings");
const b2Service = require("../utils/b2Service");

// Public getter for payment settings (students/clients)
exports.getPublicSettings = async (req, res) => {
    try {
        const settings = await PaymentSettings.findOne();
        res.status(200).json(settings || {});
    } catch (err) {
        console.error("Get Payment Settings Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// Admin getter (optional - returns same as public but kept for parity)
exports.getSettings = async (req, res) => {
    try {
        const settings = await PaymentSettings.findOne();
        res.status(200).json(settings || {});
    } catch (err) {
        console.error("Get Payment Settings Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// Admin update
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        let settings = await PaymentSettings.findOne();
        if (!settings) {
            settings = new PaymentSettings(updates);
        } else {
            Object.assign(settings, updates);
            settings.updatedAt = Date.now();
            settings.updatedBy = req.user ? req.user.id : settings.updatedBy;
        }
        await settings.save();
        res.status(200).json(settings);
    } catch (err) {
        console.error("Update Payment Settings Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// Admin upload QR image (multipart)
exports.uploadQR = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        // Upload to B2
        const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "payment-qr");

        // Save to settings
        let settings = await PaymentSettings.findOne();
        if (!settings) settings = new PaymentSettings();
        settings.qrUrl = uploadResult.url;
        settings.updatedAt = Date.now();
        settings.updatedBy = req.user ? req.user.id : settings.updatedBy;
        await settings.save();

        res.status(200).json({ message: "QR uploaded", url: uploadResult.url, settings });
    } catch (err) {
        console.error("Upload QR Error:", err);
        res.status(500).json({ message: err.message });
    }
};
