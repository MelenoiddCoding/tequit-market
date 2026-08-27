"use client";
import { useEffect } from "react";
export function ViewTracker({type,target}:{type:"profile_view"|"business_view"|"service_view";target:string}){useEffect(()=>{void fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,target})})},[type,target]);return null}
