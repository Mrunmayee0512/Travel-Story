const express = require("express");
const router = express.Router();
const TravelStory = require("../models/travelStory.model");
const { authenticateToken } = require("../utilities");


// Get all travel stories of all users
router.get("/view-stories", async (req, res) => {
    try {
        const stories = await TravelStory.find({})
        res.status(200).json({ success: true, stories });
    } catch (error) {
        console.error("Error fetching travel stories:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// Create a new travel story
router.post("/", authenticateToken,async (req, res) => {
    try {
        const { title, details, images, itinerary, userId } = req.body;
        const newStory = new TravelStory({ title, details, images, itinerary, userId });
        await newStory.save();
        res.status(201).json(newStory);
    } catch (error) {
        res.status(500).json({ error: "Failed to create story" });
    }
});


// Get a specific travel story
router.get("/:id", authenticateToken,async (req, res) => {
    try {
        const story = await TravelStory.findById(req.params.id);
        if (!story) return res.status(404).json({ error: "Story not found" });
        res.json(story);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch story" });
    }
});

// Update a travel story
router.put("/:id", authenticateToken,async (req, res) => {
    try {
        const updatedStory = await TravelStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStory) return res.status(404).json({ error: "Story not found" });
        res.json(updatedStory);
    } catch (error) {
        res.status(500).json({ error: "Failed to update story" });
    }
});

// Delete a travel story
router.delete("/:id", authenticateToken,async (req, res) => {
    try {
        const deletedStory = await TravelStory.findByIdAndDelete(req.params.id);
        if (!deletedStory) return res.status(404).json({ error: "Story not found" });
        res.json({ message: "Story deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete story" });
    }
});

// Like a story
router.post("/travel-stories/:id/like", async (req, res) => {
    try {
        const story = await TravelStory.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        // Increment like count
        story.likes = (story.likes || 0) + 1;
        await story.save();

        res.status(200).json({ message: "Liked", likes: story.likes });
    } catch (err) {
        res.status(500).json({ message: "Error liking story", error: err.message });
    }
});
  


module.exports = router;
