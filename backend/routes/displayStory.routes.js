const express = require('express');
const router = express.Router();
const TravelStory = require("../models/travelStory.model");  // Import Story Model
const { authenticateToken } = require('../utilities');

// Get all travel stories
router.get("/view-stories",authenticateToken, async (req, res) => {
    try {
        const stories = await TravelStory.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stories" });
    }
});


module.exports = router;
