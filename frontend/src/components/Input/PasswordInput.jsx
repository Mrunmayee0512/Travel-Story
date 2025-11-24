import React, { useState } from 'react';
import '/src/index.css';
import {FaRegEye, FaRegEyeSlash} from "react-icons/fa6";

const PasswordInput=({ value, onChange, placeholder })=>{

    const [isShowPassword, setIsShowPassword] =useState(false);
    const toggleShowPassword = () =>{
        setIsShowPassword(!isShowPassword);
    };

    return(
        <div className='flex items-center bg-cyan-600/5 rounded mb-3'>
            <input 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder || "Password"}
            type={isShowPassword ? "text" : "password"}
            className='w-full text-sm bg-transparent mr-3 rounded outline-none rounded px-5 py-3 '/>

            {isShowPassword ? (
                <FaRegEye
                size={22} 
                className='text-primary cursor-pointer' 
                onClick={() =>toggleShowPassword()}/>
            ):(
                <FaRegEyeSlash
                size={22} 
                className='text-slate-400 cursor-pointer' 
                onClick={() =>toggleShowPassword()}/>
            )}
        </div>
    )
}

export default PasswordInput