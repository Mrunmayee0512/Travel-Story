import React, { useState } from "react";
import axios from "axios";

const CreateStory = () => {
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [itinerary, setItinerary] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/stories", { title, details, itinerary });
            alert("Story added successfully!");
        } catch (error) {
            console.error("Failed to create story", error);
        }
    };

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-2xl font-bold">Create Travel Story</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input className="border p-2 w-full" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea className="border p-2 w-full" placeholder="Details" value={details} onChange={(e) => setDetails(e.target.value)} />
                <textarea className="border p-2 w-full" placeholder="Itinerary" value={itinerary} onChange={(e) => setItinerary(e.target.value)} />
                <button className="bg-blue-500 text-white p-2" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default CreateStory;
