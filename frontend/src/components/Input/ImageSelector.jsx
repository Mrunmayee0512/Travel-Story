import React,{useEffect, useRef, useState} from "react";
import { FaRegFileImage } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

const ImageSelector=({image,setImage,handleDeleteImg}) =>{
    const inputRef =useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
          setImage(file);
        }
      };
    const onChooseFile =()=>{
        inputRef.current.click();
    };
    const handleRemoveImage=()=>{
        setImage(null);
        handleDeleteImg()
    }

    useEffect( () => {
        let objectUrl;
        if(typeof image === 'string'){
            setPreviewUrl(image);
        } else if(image instanceof File){
            objectUrl = URL.createObjectURL(image);
            setPreviewUrl(objectUrl);
        } else{
            setPreviewUrl(null);
        }
        return () => {
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
            }
          };
        }, [image]);

    return(
        <div>
            <input type="file" accept="image/*" ref={inputRef}
            onChange={handleImageChange} className="hidden"/>
            {!image ?(<button className="" onClick={()=>onChooseFile()}>
                <div className="">
                    <FaRegFileImage className="text-xl text-cyan-500"/>
                </div>
                <p className="text-sm text-slate-500">Browse image files to upload</p>
            </button> 
            ):(
                <div className="w-full relative">
                    <img src={previewUrl} alt="Selected" className="w-full 
                    h-[300px] object-cover rounded-lg"/>                
                <button className="btn-small btn-delete absolute top-2 
                right-2" onClick={handleRemoveImage}>
                    <MdDeleteOutline className="text-lg"/>
                </button>
                </div>
            )}
        </div>
    );
};

export default ImageSelector