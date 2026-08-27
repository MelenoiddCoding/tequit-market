import { SavedList } from "@/components/saved-list";
export const metadata={title:"Guardados"};
export default function SavedPage(){return <main className="page"><div className="container"><p className="eyebrow">En este dispositivo</p><h1 style={{fontSize:"clamp(2.4rem,7vw,4.5rem)"}}>Tus guardados</h1><SavedList/></div></main>}
