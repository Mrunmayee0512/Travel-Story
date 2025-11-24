import React, { useState, useEffect } from "react";
import axios from "axios";

const Stories = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/stories")
            .then(res => setStories(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-3xl font-bold">Travel Stories</h1>
            {stories.map(story => (
                <div key={story._id} className="border p-4 my-4">
                    <h2 className="text-xl font-semibold">{story.title}</h2>
                    <p>{story.details}</p>
                </div>
            ))}
        </div>
    );
};

export default Stories;
