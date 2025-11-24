import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import {useNavigate} from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import {MdAdd} from "react-icons/md"
import Modal from "react-modal"
import TravelStoryCard from '../../components/Cards/TravelStoryCard'
import { ToastContainer, toast } from 'react-toastify';
import AddEditTravelStory from './AddEditTravelStory'
import ViewTravelStory from './ViewTravelStory'
import EmptyCard from '../../components/Cards/EmptyCard'
import { DayPicker } from 'react-day-picker'
import moment from 'moment'
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle'
import { getEmptyCardImg, getEmptyCardMessage } from '../../utils/helper'
import ViewStory from './ViewStory'
import OtherCard from '../../components/Cards/OtherCard'

const Home = () => {

    const navigate = useNavigate()
    const [userInfo, setUserInfo] = useState(null)
   const  [allStories, setAllStories] = useState([])
   const [myStories, setMyStories] = useState([]);
    const [otherStories, setOtherStories] = useState([]);

    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('')
    const [dateRange, setDateRange] = useState({form: null, to:null})

    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown: false,
        type: "add",
        data: null,
    });

    const [openViewModal,setOpenViewModal]= useState({
        isShown: false,
        data: null,
    })
    

    //Get User Info
    const getUserInfo = async () => {
        try {
            const response = await axiosInstance.get("/get-user");
            if(response.data && response.data.user){
                //Set user info if data exists
                setUserInfo(response.data.user)
            }

        } catch(error){
           if(error.response.status===401){
            //Clear storage if unauthorized
            localStorage.clear();
            navigate("/login"); //Redirect to login
           } 
        }
    }

    useEffect(() => {
        getUserInfo();
    }, []);
    
    //Get All Travel Stories
    const getAllTravelStories = async () => {
        if (!userInfo || !userInfo._id) return;
        try {
            const response = await axiosInstance.get("/get-all-stories");
            if(response.data && response.data.stories){
                setFilterType("");
                //Set all stories if data exists
                //setAllStories(response.data.stories);
                const allStories = response.data.stories;
                
                console.log("All fetched stories:", allStories);
                // console.log("Current user ID:", userInfo._id);
                const myStories = allStories.filter(
                    story => story.userId?.toString() === userInfo._id.toString()
                );
                const otherStories = allStories.filter(
                    story => story.userId?.toString() !== userInfo._id.toString()
                );
                
            setMyStories(myStories);
            setOtherStories(otherStories);
            setAllStories(allStories);
            
            }
        } catch(error){
            console.log(error)
        }
    }
    
    
    useEffect(() => {
        if (userInfo) {
            getAllTravelStories();
        }
    }, [userInfo]);
  

    //Handle Edit Story Click
    const handleEdit = (data) => {
        setOpenAddEditModal({isShown:true,type:"edit",data:data})
    };

    //Handle Travel Story Click
    const handleViewStory = (data) => {
        setOpenViewModal({ isShown:true,data});
    };

    const handleViewStory1 = (data) => {
        setOpenViewModal1({ isShown:true,data});
    };

    //Handle Update Favourite
    const updateIsFavourite = async (story) => {
        try {
          const response = await axiosInstance.post(`/travel-stories/${story._id}/like`);
          getAllTravelStories(); // refresh data
        } catch (error) {
          console.error("Failed to like story", error);
        }
      };
    // const updateIsFavourite = async(storyData) => {
    //     const storyId = storyData._id;
    //     try {
    //         const response = await axiosInstance.put("/update-is-favourite/" + storyId,
    //             {
    //                 isFavourite: !storyData.isFavourite,
    //             }
    //         );
    //         if(response.data && response.data.story){
    //             toast.success("Story Updated Successfully");

    //             if(filterType==="search" && searchQuery){
    //                 onSearchStory(searchQuery)
    //             } else if(filterType==="date"){
    //                 filterStoriesByDate(dateRange);
    //             }else{
    //             getAllTravelStories();
    //         }
    //         }
            
    //     } catch(error){
    //         console.log(error)
    //     }
    // }

    //delete Story
    const deleteTravelStory = async (data) => {
        const storyId = data._id;
        setAllStories(prevStories => prevStories.filter(story => story._id !== storyId));
        try{
            const response = await axiosInstance.delete("/delete-story/" + storyId);
            if(response.data && !response.data.error){
                toast.success("Story Deleted Successfully");
                getAllTravelStories();
                }
                
            } catch(error){
                    console.log("An unexpected error occurred. Please try again.");
                }
            }

    //Search Story
    const onSearchStory = async(query) => {
        try{
            const response = await axiosInstance.get("/search/",{
                params: {
                    query,
                },
            });

            if (response.data?.stories) {
                const allStories = response.data.stories;
    
                const myStories = allStories.filter(
                    story => story.userId?.toString() === userInfo._id.toString()
                );
                const otherStories = allStories.filter(
                    story => story.userId?.toString() !== userInfo._id.toString()
                );
    
                setMyStories(myStories);
                setOtherStories(otherStories);
                setAllStories(allStories);
            }

            } catch(error){
                    console.log("An unexpected error occurred. Please try again.");
                }

    }
    const handleClearSearch=()=>{
        setFilterType("");
        getAllTravelStories();
    }
    const [openViewModal1,setOpenViewModal1]= useState({
        isShown: false,
        data: null,
    })

    //Handle Filter Travel Story By Date Range
    const filterStoriesByDate= async(day) =>{
        if (!userInfo || !userInfo._id) return;
        try{
            const startDate = day.from ? moment(day.from).valueOf():null;
            const endDate = day.to ? moment(day.to).valueOf():null;

            if(startDate && endDate){
                const response = await axiosInstance.get("/travel-stories/filter",{
                    params:{ startDate, endDate},
                });
                if (response.data?.stories) {
                    setFilterType("date");
                    const allStories = response.data.stories;
        
                    const myStories = allStories.filter(
                        story => story.userId?.toString() === userInfo._id.toString()
                    );
                    const otherStories = allStories.filter(
                        story => story.userId?.toString() !== userInfo._id.toString()
                    );
        
                    setMyStories(myStories);
                    setOtherStories(otherStories);
                    setAllStories(allStories);
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
        getAllTravelStories();
    }

    useEffect(()=>{
        getAllTravelStories()
        getUserInfo()
        return() =>{};
            },[])
        

    return (
        <>
        <Navbar  userInfo={userInfo} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}/>

        <div className='container mx-auto py-10'>

            <FilterInfoTitle filterType={filterType} filterDates={dateRange} onClear={() => {
                resetFilter();
            }}
            />

<div className='flex gap-5'>
    {/* My Stories */}
    <div className='flex-1'>
        <h2 className="text-xl font-semibold mb-4">My Stories</h2>
        {myStories.length > 0 ? (
            <div className='grid grid-cols-2 gap-4'>
                {myStories.map((item) => (
                    <TravelStoryCard
                        key={item._id}
                        imgUrl={item.imageUrl}
                        title={item.title}
                        story={item.story}
                        date={item.visitedDate}
                        visitedLocation={item.visitedLocation}
                        isFavourite={item.isFavourite}
                        likes={item.likes||0}
                        onEdit={() => handleEdit(item)}
                        onClick={() => handleViewStory(item)}
                        onFavouriteClick={() => updateIsFavourite(item)}
                    />
                ))}
            </div>
        ) : (
            <EmptyCard imgSrc={getEmptyCardImg(filterType)} message={getEmptyCardMessage(filterType)}/>
        )}
    </div>

{/* Date Filter Box */}
<div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg h-90'>
            <div className='p-1'>
                <DayPicker
                    captionLayout='dropdown-buttons'
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDayClick}
                    pagedNavigation
                />
            </div>
        </div>

    {/* Other Stories */}
    <div className='w-[400px]'>
        <h2 className="text-xl font-semibold mb-4">Some More Stories To Explore...</h2>
        {otherStories.length > 0 ? (
            <div className='grid grid-cols-1 gap-4'>
                {otherStories.sort((a, b) => (b.likes || 0) - (a.likes || 0)).map((item) => (
                    <OtherCard
                        key={item._id}
                        imgUrl={item.imageUrl}
                        title={item.title}
                        story={item.story}
                        date={item.visitedDate}
                        visitedLocation={item.visitedLocation}
                        isFavourite={item.isFavourite}
                        likes={item.likes||0}
                        onClick={() => handleViewStory1(item)}
                        onFavouriteClick={() => updateIsFavourite(item)}
                    />
                ))}
            </div>
        ) : (
            <EmptyCard imgSrc={getEmptyCardImg(filterType)} message="No stories from other users yet!" />
        )}
        
    </div>
</div>

        </div>

    {/*Add and Edit Travel Story Model */}   
    <Modal
    isOpen={openAddEditModal.isShown}
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
        <AddEditTravelStory
        type={openAddEditModal.type}
        storyInfo={openAddEditModal.data}
        onClose={() =>{
            setOpenAddEditModal({isShown: false, type: 'add', data: null});
        }}
        getAllTravelStories={getAllTravelStories}
        />
    </Modal>

    {/*View Travel Story Model */}
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
        <ViewTravelStory storyInfo={openViewModal.data || null}
        onClose={()=>{
            setOpenViewModal((prevState)=>({...prevState,isShown:false}));
        }}
        onEditClick={()=>{
            setOpenViewModal((prevState)=>({...prevState,isShown:false}));
            handleEdit(openViewModal.data || null)
        }}
        onDeleteClick={()=>{
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false}));
            deleteTravelStory(openViewModal.data || null);
        }}
        />
    </Modal>


    <Modal
    isOpen={openViewModal1.isShown}
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
                storyInfo={openViewModal1.data || null}
                onClose={() => setOpenViewModal1((prev) => ({ ...prev, isShown: false }))}
                />
    </Modal>

    <button className='w-16 h-16 flex items-center justify-center rounded-full bg-cyan-400 hover:bg-cyan-200 fixed right-10 bottom-10'
    onClick={()=>{
        setOpenAddEditModal({isShown:true, type: "add", data:null});
    }}>
        <MdAdd className="text-[32px] text-white" />
    </button>

    <ToastContainer />               
        </>
    )
}

export default Home 