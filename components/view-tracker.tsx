"use client";
import { useEffect } from "react";
export function ViewTracker({type,target,referrer}:{type:"profile_view"|"business_view"|"service_view";target:string;referrer?:string}){useEffect(()=>{void fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,target})});if(referrer==="qr"||referrer==="share")void fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:referrer==="qr"?"qr_visit":"shared_link_visit",target,targetType:"provider"})})},[type,target,referrer]);return null}
