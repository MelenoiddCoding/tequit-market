import {describe,expect,it} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {DEFAULT_DISCOVERY_LOCATION,ipCitySuggestion,marketCityForDiscovery,parseDiscoveryLocation,serializeDiscoveryLocation} from "@/lib/location";

describe("descubrimiento por ubicación",()=>{
  it("acepta ubicación del navegador y zona manual",()=>{
    expect(parseDiscoveryLocation(serializeDiscoveryLocation({source:"browser",lat:21.5,lng:-104.9,label:"Cerca de ti"}))).toMatchObject({source:"browser",lat:21.5,lng:-104.9});
    expect(parseDiscoveryLocation(serializeDiscoveryLocation({source:"manual",areaSlug:"centro",label:"Centro, Tepic"}))).toMatchObject({source:"manual",areaSlug:"centro"});
    expect(parseDiscoveryLocation("malformed")).toBeNull();
  });
  it("mantiene puntos privados y aplica alcance por plan",()=>{
    const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202610090001_location_discovery.sql"),"utf8");
    expect(sql).toContain("revoke all on public.provider_locations");
    expect(sql).toContain("candidate.plan_code in ('pro','premium')");
    expect(sql).toContain("candidate.distance_value<=cfg.free_radius_km*1000");
    expect(sql).toContain("candidate.distance_value<=cfg.basic_radius_km*1000");
  });
  it("rechaza GPS fuera de las zonas configuradas",()=>{
    const sql=fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202610090004_reject_out_of_market_gps.sql"),"utf8");
    expect(sql).toContain("st_dwithin(area.center,raw_input.gps_point,area.gps_match_radius_km*1000)");
    expect(sql).toContain("OUT_OF_MARKET_GPS_MUST_NOT_RETURN_PROVIDERS");
  });
  it("inicia en Tepic, distingue ciudad de punto preciso y respeta colonias",()=>{
    const areas=[{slug:"tepic",name:"Tepic",city:"Tepic",state:"Nayarit",type:"municipality" as const},{slug:"centro-uruapan",name:"Centro",city:"Uruapan",state:"Michoacán",type:"neighborhood" as const}];
    expect(DEFAULT_DISCOVERY_LOCATION).toMatchObject({source:"default",areaSlug:"tepic"});
    expect(marketCityForDiscovery(DEFAULT_DISCOVERY_LOCATION,areas)).toBe("tepic");
    expect(marketCityForDiscovery({source:"manual",areaSlug:"centro-uruapan",label:"Centro, Uruapan"},areas)).toBe("uruapan");
    expect(marketCityForDiscovery({source:"browser",lat:19.4163,lng:-102.0528,label:"Cerca de ti"},areas)).toBe("uruapan");
    expect(marketCityForDiscovery({source:"browser",lat:19.4204,lng:-102.0627,label:"Cerca de ti"},areas)).toBe("uruapan");
    expect(marketCityForDiscovery({source:"browser",lat:19.4148,lng:-101.5,label:"Cerca de ti"},areas)).toBeNull();
  });
  it("la IP sólo determina el texto de una sugerencia",()=>{
    expect(ipCitySuggestion(null)).toBe("none");
    expect(ipCitySuggestion("Tepic")).toBe("none");
    expect(ipCitySuggestion("Uruapan")).toBe("uruapan");
    expect(ipCitySuggestion("Ciudad%20de%20M%C3%A9xico")).toBe("elsewhere");
  });
});
