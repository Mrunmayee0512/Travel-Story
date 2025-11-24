import React, { useState, useEffect } from 'react';
import '/src/index.css';
import axiosInstance from '../../utils/axiosInstance';
import HPNavbar from '../../components/HPNavbar';
import moment from 'moment';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import { DayPicker } from 'react-day-picker';
import Modal from "react-modal"
import ViewStory from '../Home/ViewStory'
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle';
import EmptyCard from '../../components/Cards/EmptyCard';
import { getEmptyCardImg, getEmptyCardMessage } from '../../utils/helper'


// Load all images once
const imageModules = import.meta.glob('/public/images/*.{jpg,jpeg,png,webp}', { eager: true });

const images = {};
Object.keys(imageModules).forEach((path) => {
    const filename = path.split('/').pop();
    images[filename] = imageModules[path].default;
});

const getImagePath = (filename) => images[filename] || '';


const trips = [
    { 
        id: 1, 
        name: "Kyoto, Japan", 
        date: "April 29, 2025", 
        image: "kyoto.jpg",
        details: "Explore cherry blossoms, visit ancient temples like Kinkaku-ji and Fushimi Inari Shrine, and enjoy traditional kaiseki cuisine.",
        duration: "5 Days / 4 Nights",
        price: "₹1,10,000 / $1,300",
        contact: {
        name: "Aiko Tanaka",
        email: "aiko.t@example.com",
        phone: "+81-90-1234-5678"
        } 
    },
    { 
        id: 2, 
        name: "Rome, Italy", 
        date: "May 20, 2025", 
        image: "rome.jpg",
        details: "Tour historical sites like the Colosseum and Vatican City, and savor authentic Italian pizza and gelato.",
        duration: "5 Days / 4 Nights",
        price: "₹1,10,000 / $1,300",
        contact: {
        name: "Marco Romano",
        email: "marco.r@example.com",
        phone: "+39-06-123-4567"
        } 
    },
    { 
        id: 3, 
        name: "Manali, Himachal Pradesh", 
        date: "April 30, 2025", 
        image: "Manali.jpg",
        details: "Enjoy snow-capped mountains, river rafting in Beas, and local Himachali cuisine.",
        duration: "4 Days / 3 Nights",
        price: "₹18,000",
        contact: {
        name: "Ravi Mehta",
        email: "ravi.m@example.com",
        phone: "+91-98765-43210"
        } 
    },
    { 
        id: 4, 
        name: "Varanasi, Uttar Pradesh", 
        date: "June 30, 2025", 
        image: "varanasi.jpg",
        details: "Experience the spiritual aura of Ganga Aarti, explore narrow lanes, and taste famous street food.",
        duration: "3 Days / 2 Nights",
        price: "₹12,000",
        contact: {
        name: "Anjali Verma",
        email: "anjali.v@example.com",
        phone: "+91-91234-56789"
        } 
    },
    { 
        id: 5, 
        name: "Leh-Ladakh", 
        date: "October 10, 2025", 
        image: "leh ladakh.jpg",
        details: "Ride through mountain passes, visit Pangong Lake, and explore ancient monasteries.",
        duration: "6 Days / 5 Nights",
        price: "₹28,000",
        contact: {
        name: "Tashi Namgyal",
        email: "tashi.n@example.com",
        phone: "+91-97970-54321"
        } 
    },

];

const Homepage = () => {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const  [allStories, setAllStories] = useState([])
    const [filterType, setFilterType] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [dateRange, setDateRange] = useState({form: null, to:null})

        //Search Story
    const onSearchStory = async(query) => {
        try{
            const response = await axiosInstance.get("/search_home/",{
                params: {
                    query,
                },
            });

            if(response.data && response.data.stories){
                setFilterType("search");
                setAllStories(response.data.stories);
            }

            } catch(error){
                    console.log("An unexpected error occurred. Please try again.");
                }

    }
    const handleClearSearch=()=>{
        setFilterType("");
        getTravelStories();
    }

    const [openViewModal,setOpenViewModal]= useState({
            isShown: false,
            data: null,
        })
        //Handle Filter Travel Story By Date Range
        const filterStoriesByDate= async(day) =>{
            try{
                const startDate = day.from ? moment(day.from).valueOf():null;
                const endDate = day.to ? moment(day.to).valueOf():null;
    
                if(startDate && endDate){
                    const response = await axiosInstance.get("/travel-stories/filter_home",{
                        params:{ startDate, endDate},
                    });
                    if(response.data && response.data.stories){
                        setFilterType("date");
                        setAllStories(response.data.stories);
                        }
                }
    
            }catch(error){
                console.log("An unexpected error occurred. Please try again.");
            }
        };
    
        //Handle Date Range Select
        const handleDayClick=(day) =>{
            setDateRange(day);
            filterStoriesByDate(day);
        }
    
        const resetFilter=() =>{
            setDateRange({from: null, to: null});
            setFilterType("");
            getTravelStories();
        }
        useEffect(()=>{
                getTravelStories()
                return() =>{};
                    },[])
    
        

    //Get All Travel Stories without bearer token
    const getTravelStories = async () => {
        try {
            const response = await axiosInstance.get("/view-stories");
            if (response.data && response.data.stories) {
                setAllStories(response.data.stories);
                setFilterType("");
                console.log("Fetched Stories: ", response.data);
                }
            } catch (error) {
                console.error("Error fetching stories:", error.response?.data || error.message);
                    }
        
    };
        useEffect(()=>{
            getTravelStories()},[])

        //Handle Travel Story Click
    const handleViewStory = (data) => {
        setOpenViewModal({ isShown:true,data});
    };

    const updateIsFavourite = async (story) => {
        try {
          const response = await axiosInstance.post(`/travel-stories/${story._id}/like`);
          getTravelStories(); // refresh data
        } catch (error) {
          console.error("Failed to like story", error);
        }
      };
      
    
    return (
        <div className='h-screen w-full bg-cyan-50 overflow-x-hidden '>
            <HPNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}/>

        <FilterInfoTitle filterType={filterType} filterDates={dateRange} onClear={() => {
                resetFilter();
            }}
        />

            {/* Main Content */}
            <div className="h-screen flex items-center justify-between px-20 mx-auto ">


                
                {/* Welcome Section with Recommended Stories */}
                <div className="w-2/4 h-screen bg-cyan-50 rounded-lg p-16"> 
                    {/* <h2 className="text-3xl font-semibold text-gray-800">Welcome to Travel Blog</h2> */}
                    <h2 className="text-2xl mt-4 text-gray-600">Discover amazing travel experiences and plan your next adventure!</h2>
                    <div className='flex gap-7'>
                        <div className='flex-1'>
                            {allStories.length > 0 ? (
                                <div className='grid grid-cols-2 gap-4'>
                                    {allStories
                                    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                                    .map((item) => (
                                        <TravelStoryCard
                                            key={item._id}
                                            imgUrl={item.imageUrl}
                                            title={item.title}
                                            story={item.story}
                                            date={item.visitedDate}
                                            visitedLocation={item.visitedLocation}
                                            isFavourite={item.isFavourite}
                                            likes={item.likes||0}
                                            onClick={() => handleViewStory(item)}
                                            onFavouriteClick={() => updateIsFavourite(item)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyCard imgSrc={getEmptyCardImg(filterType)} message={getEmptyCardMessage(filterType)} />
                            )}
                        </div>
                    </div>
                </div>
                    <div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg h-90'>
                    <div className='p-2'>
                        <DayPicker captionLayout='dropdown-buttons' mode="range" selected={dateRange} onSelect={handleDayClick} pagedNavigation />
                    </div>
                    </div>
                <Modal
                isOpen={openViewModal.isShown}
                onRequestClose={() =>{}}   
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        zIndex: 999
                },
                }}   
                appElement={document.getElementById("root")}   
                className="model-box scrollbar-custom"
                >
                <ViewStory 
                storyInfo={openViewModal.data || null}
                onClose={() => setOpenViewModal((prev) => ({ ...prev, isShown: false }))}
                />

                </Modal>
                {/* Upcoming Trips Section */}
                <div className="w-1/4 h-screen  bg-white rounded-lg p-5 shadow-lg shadow-cyan-200/20 overflow-y-auto">
                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Upcoming Trips</h3>
                    <ul className="space-y-4">
                        {trips.map((trip) => (
                            <li 
                                key={trip.id} 
                                className="border p-2 rounded-lg bg-cyan-100 shadow cursor-pointer hover:bg-cyan-200 transition h-50"
                                onClick={() => setSelectedTrip(trip)}
                            >
                               <img
                                src={getImagePath(trip.image)}
                                alt={trip.name}
                                className="rounded-lg w-full h-35 object-cover"
                                />
                                <h4 className="font-semibold">{trip.name}</h4>
                                <p className="text-sm text-gray-600">{trip.date}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Popup Modal for Trip Details */}
            {selectedTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg relative">
                        {/* Close Button */}
                        <button 
                            className="absolute top-2 right-3 text-gray-600 hover:text-gray-900 text-xl"
                            onClick={() => setSelectedTrip(null)}
                        >
                            &times;
                        </button>

                        {/* Trip Image */}
                        {selectedTrip.image && (
                            <img src={getImagePath(selectedTrip.image)} alt={selectedTrip.name} className="w-full h-64 object-cover rounded-lg" />
                        )}

                        {/* Trip Details */}
                        <h2 className="text-2xl font-bold mt-4">{selectedTrip.name}</h2>
                        <p className="text-gray-600">{selectedTrip.date}</p>
                        <br/>
                        <p className="text-gray-600">{selectedTrip.details}</p>
                        <br/>
                        <p className="text-gray-600">{selectedTrip.duration}</p>
                        <p className="text-gray-600">{selectedTrip.price}</p>
                        <br/>
                        <h6>Contact : </h6>
                        <p className="text-gray-600">{selectedTrip.contact.name}</p>
                        <p className="text-gray-600">{selectedTrip.contact.email}</p>
                        <p className="text-gray-600">{selectedTrip.contact.phone}</p>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Homepage;
