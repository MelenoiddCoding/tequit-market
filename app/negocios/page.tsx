import { BusinessCard } from "@/components/cards";
import { SearchBar } from "@/components/search-bar";
import { businesses } from "@/lib/demo-data";
export const metadata={title:"Negocios locales en Tepic"};
export default function BusinessesPage(){return <main><div className="search-page-head"><div className="container"><p className="eyebrow">Vertical complementario</p><h1>Negocios locales</h1><p className="muted">Comercios que venden productos, prestan servicios o ambas cosas.</p><SearchBar dark/></div></div><div className="container page"><div className="business-grid">{businesses.map(b=><BusinessCard key={b.id} business={b}/>)}</div></div></main>}
