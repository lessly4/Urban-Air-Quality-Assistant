import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyAQI, detectInversion } from "../src/services/openMeteo";

describe("classifyAQI", () => {
  it("classifies Good AQI (0-50)", () => {
    const res = classifyAQI(35);
    assert.equal(res.category, "Good");
    assert.equal(res.color, "#10b981");
  });

  it("classifies Moderate AQI (51-100)", () => {
    const res = classifyAQI(85);
    assert.equal(res.category, "Moderate");
    assert.equal(res.color, "#eab308");
  });

  it("classifies Unhealthy for Sensitive Groups (101-150)", () => {
    const res = classifyAQI(135);
    assert.equal(res.category, "Unhealthy for Sensitive Groups");
    assert.equal(res.color, "#f97316");
  });

  it("classifies Unhealthy AQI (151-200)", () => {
    const res = classifyAQI(185);
    assert.equal(res.category, "Unhealthy");
    assert.equal(res.color, "#ef4444");
  });

  it("classifies Very Unhealthy AQI (201-300)", () => {
    const res = classifyAQI(250);
    assert.equal(res.category, "Very Unhealthy");
    assert.equal(res.color, "#a855f7");
  });

  it("classifies Hazardous AQI (>300)", () => {
    const res = classifyAQI(420);
    assert.equal(res.category, "Hazardous");
    assert.equal(res.color, "#7f1d1d");
  });
});

describe("detectInversion Physics Logic", () => {
  it("detects severe thermal inversion when winds are calm, ceiling is compressed, and PM2.5 is very high", () => {
    // PM2.5 = 180 (very high), wind = 1.2 m/s (calm), boundary layer = 250m (compressed)
    const result = detectInversion(180, 1.2, 250);
    assert.equal(result.inversionDetected, true);
    assert.equal(result.severity, "severe");
    assert.ok(result.reason?.includes("Thermal inversion trapping"));
  });

  it("detects moderate inversion when PM2.5 is high and winds are calm", () => {
    // PM2.5 = 75, wind = 1.8 m/s, boundary layer = 380m
    const result = detectInversion(75, 1.8, 380);
    assert.equal(result.inversionDetected, true);
    assert.equal(result.severity, "moderate");
  });

  it("does not detect inversion when winds are brisk (>3.0 m/s)", () => {
    // PM2.5 = 60, wind = 4.5 m/s, boundary layer = 600m
    const result = detectInversion(60, 4.5, 600);
    assert.equal(result.inversionDetected, false);
    assert.equal(result.severity, "none");
  });

  it("does not detect inversion when boundary layer is well-mixed and high", () => {
    // PM2.5 = 25, wind = 2.0 m/s, boundary layer = 1200m
    const result = detectInversion(25, 2.0, 1200);
    assert.equal(result.inversionDetected, false);
    assert.equal(result.severity, "none");
  });
});
