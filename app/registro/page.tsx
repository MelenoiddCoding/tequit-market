import { RegisterForm } from "@/components/register-form";
export const metadata={title:"Crear perfil"};
export default function RegisterPage(){return <main className="page"><div className="container"><div className="form-card"><p className="eyebrow">Haz que te encuentren</p><h1 style={{fontSize:"clamp(2.4rem,7vw,4.5rem)"}}>Publica lo que sabes hacer</h1><p className="muted">Crea tu perfil Free. Sin comisiones, pagos ni contratos dentro de Tequit.</p><RegisterForm/></div></div></main>}
