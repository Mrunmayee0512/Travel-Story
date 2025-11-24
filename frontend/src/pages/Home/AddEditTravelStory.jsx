import React, { useState } from 'react'
import {MdAdd, MdDeleteOutline, MdUpdate, MdClose} from "react-icons/md"
import DateSelector from '../../components/Input/DateSelector'
import ImageSelector from '../../components/Input/ImageSelector'
import moment from 'moment'
import {toast} from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance'
import TagInput from '../../components/Input/TagInput'
import uploadImage from '../../utils/uploadImage'

const AddEditTravelStory = ({
    storyInfo,
    type,
    onClose,
    getAllTravelStories,
}) =>{

    const[title, setTitle] =useState(storyInfo?.title || '');
    const[storyImg, setStoryImg] =useState(storyInfo?.imageUrl || null);
    const[story, setStory] =useState(storyInfo?.story || '');
    const[visitedLocation, setVisitedLocation] =useState(storyInfo?.visitedLocation || []);
    const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null);
    
    const [error,setError]= useState("")
    //add new travel story
    const addNewTravelStory=async()=>{
            try{
                let imageUrl="";
                if(storyImg){
                    const imgUploadRes=await uploadImage(storyImg);
                    imageUrl=imgUploadRes.imageUrl || "";
                }
                const response=await axiosInstance.post("/add-travel-story",{
                    title,
                    story,
                    imageUrl: imageUrl || "",
                    visitedLocation,
                    visitedDate: visitedDate ? moment(visitedDate).valueOf()
                    : moment().valueOf(),
                });
                if(response.data && response.data.story){
                    toast.success("Story Added Successfully");
                    getAllTravelStories();
                    onClose();
                }
            }catch(error){
                if(error.response && error.response.data 
                    && error.response.data.message){
                        setError(error.response.data.message);
                } else{
                    setError("An unexpected error occurred. Please try again.");
                }
            }
        };
    //update travel story
    const updateTravelStory=async()=>{
            const storyId = storyInfo._id;
            try{
                let imageUrl="";
                
                let postData = {
                    title,
                    story,
                    imageUrl: storyInfo.imageUrl || "",
                    visitedLocation,
                    visitedDate: visitedDate ? moment(visitedDate).valueOf(): moment().valueOf(),
                };
    
                if(typeof storyImg === 'object'){
                    const imgUploadRes=await uploadImage(storyImg);
                    imageUrl=imgUploadRes.imageUrl || "";
                    postData={
                        ...postData,
                        imageUrl: imageUrl,
                    };
                }            
                const response=await axiosInstance.put("/edit-story/" + storyId,postData);
    
                if(response.data && response.data.story){
                    toast.success("Story Updated Successfully");
                    getAllTravelStories();
                    onClose();
                }
            }catch(error){
                console.log (error);
                if(error.response && error.response.data 
                    && error.response.data.message){
                        setError(error.response.data.message);
                } else{
                    setError("An unexpected error occurred. Please try again.");
                }
            }
        };
    const handleAddOrUpdateClick=() =>{
        console.log("Input Data:",{title,storyImg,story,
            visitedLocation,visitedDate})
        
        if (!title){
            setError("Please enter title");
            return;
        }
        if (!story){
            setError("Please enter story");
            return;
        }
        setError("");
        if (type === "edit"){
            updateTravelStory();
        }else{
            addNewTravelStory();
        }
    };
    const handleDeleteStoryImg = async()=>{
            const deleteImgRes= await axiosInstance.delete("/delete-image",{
                params:{ imageUrl: storyInfo.imageUrl },
            });
            if(deleteImgRes.data){
                const storyId=storyInfo._id;
                const postData={
                    title,
                    story,
                    visitedLocation,
                    visitedDate: moment().valueOf(),
                    imageUrl:"",
                };
                const response=await axiosInstance.put("/edit-story/" + storyId,postData);
                setStoryImg(null);
            }    
        };

    return(
        <div className='relative'>
            <button
                    className=''
                    onClick={onClose}
                    >
                        <MdClose className="text-xl text-slate-400" />
                    </button>
            
            <div className='flex-1 flex flex-col gap-2 pt-4'>
                <label className='input-label'>TITLE</label>
                <input
                type="text"
                className='text-2xl text-slate-950 outline-none'
                placeholder='Title'
                value={title}
                onChange={({target}) => setTitle(target.value)}
                />

              <div className='my-3'  >
                <DateSelector date={visitedDate} setDate={setVisitedDate}/>                
              </div>

              <ImageSelector
              image={storyImg}
              setImage={setStoryImg} 
              handleDeleteImg={handleDeleteStoryImg}
              />

            <div className='flex flex-col gap-2 mt-4'>
                <label className='input-label'>STORY</label>
                <textarea
                type="text"
                className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                placeholder="Your story"
                rows={10}
                value={story}
                onChange={({target}) => setStory(target.value)}
                />
            </div>
            <div className="pt-3">
                <label className="input-label">VISITED LOCATIONS</label>
                <TagInput tags={visitedLocation} setTags={setVisitedLocation}/>
            </div>
            </div>
            <div className='flex items-center justify-between'>
            {/* <h5 className='text-xl font-medium text-slate-700'>
                {type === "add" ? "Add Story" : "Update Story"}
            </h5> */}

            <div>
                <div className='flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg'>
                    {type==='add' ? <button className='btn-small' onClick={handleAddOrUpdateClick}>
                        <MdAdd className="text-lg" />ADD STORY
                    </button> : <>
                    <button className='btn-small' onClick={handleAddOrUpdateClick}>
                        <MdUpdate className='text-lg' /> UPDATE STORY
                        </button>
                        </>}
                    
                </div>

                {error && (<p className="text-red-500 text-xs pt-2 text-right">
                    {error}</p>)}
            </div>
            </div>
        </div>
    )
}

export default AddEditTravelStory