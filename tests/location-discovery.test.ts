import {describe,expect,it} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {parseDiscoveryLocation,serializeDiscoveryLocation} from "@/lib/location";

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
});
