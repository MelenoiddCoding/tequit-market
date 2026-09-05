import { describe, expect, it } from "vitest";
import { assertCanPublishService, canPublishService } from "@/lib/plan";
describe("límites de servicios", () => {
  it("rechaza el sexto servicio de un prestador Free", () => {
    expect(canPublishService("free", 5)).toBe(false);
    expect(() => assertCanPublishService("free", 5)).toThrow(/límite/);
  });
  it("permite más de cinco servicios a un prestador Pro", () => {
    expect(canPublishService("pro", 9)).toBe(true);
    expect(() => assertCanPublishService("pro", 9)).not.toThrow();
  });
  it("aplica los cuatro límites", () => {
    expect(canPublishService("basic", 5)).toBe(false);
    expect(canPublishService("pro", 14)).toBe(true);
    expect(canPublishService("pro", 15)).toBe(false);
    expect(canPublishService("premium", 1000)).toBe(true);
  });
});
