import "server-only";
import {createHmac,randomInt,timingSafeEqual} from "node:crypto";

function secret(){
  const value=process.env.REGISTRATION_OTP_SECRET;
  if(!value)throw new Error("Missing REGISTRATION_OTP_SECRET");
  return value;
}

export function createRegistrationOtp(){
  const code=randomInt(0,1_000_000).toString().padStart(6,"0");
  return{code,digest:digestRegistrationOtp(code),expiresAt:new Date(Date.now()+5*60_000).toISOString()};
}

export function digestRegistrationOtp(code:string){return createHmac("sha256",secret()).update(code).digest("hex")}

export function registrationOtpMatches(code:string,expected:string){
  const actual=Buffer.from(digestRegistrationOtp(code),"hex");
  const stored=Buffer.from(expected,"hex");
  return actual.length===stored.length&&timingSafeEqual(actual,stored);
}
