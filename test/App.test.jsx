import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "vitest-browser-react";
import App from "../src/App.jsx";

const gtfsMocks = vi.hoisted(() => ({
  useGtfsScheduleRoutes: vi.fn(),
  useGtfsRealtimeAlerts: vi.fn(),
}));

vi.mock("../src/hooks/useGtfsScheduleRoutes.js", () => ({
  default: gtfsMocks.useGtfsScheduleRoutes,
}));

vi.mock("../src/hooks/useGtfsRealtimeAlerts.js", () => ({
  default: gtfsMocks.useGtfsRealtimeAlerts,
}));

function mockGtfs({ schedule, alerts }) {
  gtfsMocks.useGtfsScheduleRoutes.mockReturnValue(schedule);
  gtfsMocks.useGtfsRealtimeAlerts.mockReturnValue(alerts);
}

function clearSearchParams() {
  history.replaceState({}, "", location.pathname);
}

function setSearchParams(options) {
  const url = new URL(location);
  const search = new URLSearchParams(url.search);
  for (const [key, value] of Object.entries(options)) {
    search.set(key, value);
  }
  url.search = search;
  history.pushState({}, "", url);
}

describe("App", () => {
  beforeEach(() => {
    setSearchParams({
      gtfsScheduleUrl: "schedule",
      gtfsRealtimeTripUpdatesUrl: "trip-updates",
    });
  });

  afterEach(() => {
    clearSearchParams();
  });

  it("renders nothing when no route has been configured", async () => {
    await page.render(<App />);
    expect(true).toBeTruthy();
  });

  it("renders an informing sentence when everything is null", async () => {
    mockGtfs({
      schedule: null,
      alerts: { entity: null },
    });

    await page.render(<App />);
    expect(
      page.getByRole("row").filter({ hasText: "Failed to load message information." }),
    ).toBeVisible();
  });

  it("renders an informing sentence when no detours", async () => {
    mockGtfs({
      schedule: [],
      alerts: { entity: [] },
    });

    await page.render(<App />);
    expect(
      page.getByRole("row").filter({ hasText: "There are no detours currently in effect." }),
    ).toBeVisible();
  });

  it("renders public messages", async () => {
    mockGtfs({
      schedule: [
        {
          routeId: "MY_ROUTE",
          routeShortName: "MR",
          routeColor: "111111",
          routeTextColor: "e7d8d4",
        },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage = page
      .getByRole("row")
      .filter({ hasText: "MR" })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " });
    expect(publicMessage).toBeVisible();
  });

  it("marks public messages with no informed entity as applying to all routes", async () => {
    mockGtfs({
      schedule: [
        {
          routeId: "MY_ROUTE",
          routeShortName: "MR",
          routeColor: "111111",
          routeTextColor: "e7d8d4",
        },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage = page
      .getByRole("row")
      .filter({ hasText: "ALL" })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " });
    expect(publicMessage).toBeVisible();
  });

  it("marks public messages applying agencywide as applying to all routes", async () => {
    mockGtfs({
      schedule: [{ routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111" }],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ agencyId: "some-agency", routeId: "" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage = page
      .getByRole("row")
      .filter({ hasText: "ALL" })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " });
    expect(publicMessage).toBeVisible();
  });

  it("renders public messages in order given sort order", async () => {
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111", routeSortOrder: 2 },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111", routeSortOrder: 1 },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
          {
            alert: {
              informedEntity: [{ routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "Other header" }] },
              descriptionText: { translation: [{ text: "Other description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage1 = await page
      .getByRole("row")
      .filter({ hasText: "OR" })
      .filter({ hasText: "Other header" })
      .filter({ hasText: "Other description " })
      .element();
    const publicMessage2 = await page
      .getByRole("row")
      .filter({ hasText: "MR" })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " })
      .element();

    expect(
      publicMessage1.compareDocumentPosition(publicMessage2) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders public messages in alphabetical order when no sort order", async () => {
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111" },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111" },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
          {
            alert: {
              informedEntity: [{ routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "Other header" }] },
              descriptionText: { translation: [{ text: "Other description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage1 = await page
      .getByRole("row")
      .filter({ hasText: "MR" })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " })
      .element();
    const publicMessage2 = await page
      .getByRole("row")
      .filter({ hasText: "OR" })
      .filter({ hasText: "Other header" })
      .filter({ hasText: "Other description " })
      .element();

    expect(
      publicMessage1.compareDocumentPosition(publicMessage2) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders route short names in sort order if provided", async () => {
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111", routeSortOrder: 2 },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111", routeSortOrder: 1 },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" }, { routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage = page
      .getByRole("row")
      .filter({ hasText: /OR.*MR/u })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " });
    expect(publicMessage).toBeVisible();
  });

  it("renders route short names in alphabetical order if not provided", async () => {
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111" },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111" },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" }, { routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage = page
      .getByRole("row")
      .filter({ hasText: /MR.*OR/u })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " });
    expect(publicMessage).toBeVisible();
  });

  it("renders public messages only for the selected routes", async () => {
    setSearchParams({ routes: ["MR"] });
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111" },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111" },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
          {
            alert: {
              informedEntity: [{ routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "Other header" }] },
              descriptionText: { translation: [{ text: "Other description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage = page
      .getByRole("row")
      .filter({ hasText: "MR" })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " });
    expect(publicMessage).toBeVisible();
  });

  it("always renders public messages that apply to all routes", async () => {
    setSearchParams({ routes: ["MR"] });
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111" },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111" },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
          {
            alert: {
              informedEntity: [{ routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "Other header" }] },
              descriptionText: { translation: [{ text: "Other description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const publicMessage = page
      .getByRole("row")
      .filter({ hasText: "ALL" })
      .filter({ hasText: "My header" })
      .filter({ hasText: "My description " });
    expect(publicMessage).toBeVisible();
  });
});
