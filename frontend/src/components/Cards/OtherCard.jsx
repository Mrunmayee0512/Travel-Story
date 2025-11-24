import React, { useState } from 'react'
import moment from "moment/moment"
import {FaHeart } from "react-icons/fa6"
import {GrMapLocation} from "react-icons/gr"

const OtherCard = ({imgUrl, title, date, story, visitedLocation, isFavourite, onClick,onFavouriteClick,likes}) =>{
    return (
        <div className='border rounded-lg overflow-hidden bg-white hover:shadow-lg hover:shadow-slate-200 transition-all ease-in-out relative cursor-pointer'>
            <img src={imgUrl} alt={title} className='w-full h-56 object-cover rounded-lg' onClick={onClick}/>

            <div className='p-4' onClick={onClick}>
                <div className='flex items-center gap-3'>
                    <div className='flex-1'>
                        <h6 className='text-sm font-medium'>{title}</h6>
                        <span className='text-xs text-slate-500'>
                            {date ? moment(date).format("DD MMM YYYY"): "-"}
                        </span>
                    </div>
                </div>
                <p className='text-xs text-slate-600 mt-2'>{story?.slice(0,60)}</p>
                <div className='inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded mt3 px-2 py-1'>
                    <GrMapLocation className='text-sm' />
                    {visitedLocation.map((item,index)=>visitedLocation.length==index + 1 ? `${item}` : `${item},`)}
                </div>                    
            </div>      
            {/* Like button */}
                       <div className="flex items-center gap-2 text-red-500 mt-2 px-4 pb-2">
              <button onClick={onFavouriteClick}>
                <FaHeart className="w-5 h-5 hover:scale-110 transition-transform" />
              </button>
              <span className="text-sm">{likes} Likes</span>
            </div>      
        </div>
        );
}

export default OtherCard