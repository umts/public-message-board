import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import 'vitest-browser-react';
import App from '../src/App.jsx';

const gtfsReactHooksMocks = vi.hoisted(() => ({
  useGtfsRealtime: vi.fn((data) => data),
  useGtfsScheduleCsv: vi.fn((data) => data),
  useFetchResolver: vi.fn(() => null),
}));

const helpers = vi.hoisted(() => ({
  useScheduleRouteResolver: vi.fn(),
  useRealtimeAlertsResolver: vi.fn(),
  useConfig: vi.fn(),
}));

vi.mock("../src/hooks/useScheduleRouteResolver.js", () => ({
  default: helpers.useScheduleRouteResolver, 
}));

vi.mock("../src/hooks/useRealtimeAlertsResolver.js", () => ({
  default: helpers.useRealtimeAlertsResolver,
}));

vi.mock("../src/hooks/useConfig.js", () => ({
  default: helpers.useConfig,
}));

vi.mock("gtfs-react-hooks", () => ({
  useGtfsRealtime: gtfsReactHooksMocks.useGtfsRealtime,
  useGtfsScheduleCsv: gtfsReactHooksMocks.useGtfsScheduleCsv,
  useFetchResolver: gtfsReactHooksMocks.useFetchResolver,
}));

function mockGtfs ({ schedule, alerts }) {
  helpers.useScheduleRouteResolver.mockReturnValue(schedule);
  helpers.useRealtimeAlertsResolver.mockReturnValue(alerts);
}

describe('App', () => {
  it('renders nothing when no route has been configured', async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });

    await page.render(<App />)
    expect(true).toBeTruthy()
  })

  it('renders an informing sentence when everything is null', async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
    mockGtfs({
      schedule: null,
      alerts: { entity: null },
    });

    await page.render(<App />);
    expect(document.body).toHaveTextContent("Failed to load message information.");
  })

  it('renders an informing sentence when no detours', async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
    mockGtfs({
      schedule: [],
      alerts: { entity: [] },
    });

    await page.render(<App />);
    expect(document.body).toHaveTextContent("There are no detours currently in effect.");
  })

  it("renders detours for all routes when no entity provided", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: ["MR"],
    });
    mockGtfs({
      schedule: [{ routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111", routeTextColor: 'e7d8d4' } ],
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
    const routeAbbreviation = page.getByRole("article");
    expect(routeAbbreviation).toHaveTextContent("ALL");
  });

  it("renders detours when a route is configured", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
    mockGtfs({
      schedule: [{ routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111", routeTextColor: 'e7d8d4' } ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [
                { routeId: "MY_ROUTE" },
              ],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const routeAbbreviation = page.getByRole("article");
    expect(routeAbbreviation).toHaveTextContent("MR");
    expect(routeAbbreviation).toHaveStyle("background-color: #111111");
    expect(routeAbbreviation).toHaveStyle("color: #e7d8d4");

    const detourBody = page.getByRole("cell");
    expect(detourBody).toHaveTextContent("My header");
    expect(detourBody).toHaveTextContent("My description");
  });

  it("renders agencywide detours", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
    mockGtfs({
      schedule: [{ routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111" } ],
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
    const detourBody = page.getByRole("cell");
    expect(detourBody).toHaveTextContent("My header");
    expect(detourBody).toHaveTextContent("My description");
  });

  it("renders the detours in order given sort order", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
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
  const detourBodies = page.getByRole("cell").all();
  expect(detourBodies[0]).toHaveTextContent("Other header");
  expect(detourBodies[1]).toHaveTextContent("My header");
  });

  it("renders the detours in alphabetical order when no sort order", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
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
  const detourBodies = page.getByRole("cell").all();
  expect(detourBodies[0]).toHaveTextContent("My header");
  expect(detourBodies[1]).toHaveTextContent("Other header");
  });

  it("renders route short names in order if provided", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111", routeSortOrder: 2 },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111", routeSortOrder: 1 },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" },
                               { routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const routeNames = page.getByRole("article").all();
    expect(routeNames[0]).toHaveTextContent("OR");
    expect(routeNames[1]).toHaveTextContent("MR");
  });

  it("renders route short names in alphabetical order if not provided", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: null,
    });
    mockGtfs({
      schedule: [
        { routeId: "MY_ROUTE", routeShortName: "MR", routeColor: "111111" },
        { routeId: "OTHER_ROUTE", routeShortName: "OR", routeColor: "111111" },
      ],
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: "MY_ROUTE" },
                               { routeId: "OTHER_ROUTE" }],
              headerText: { translation: [{ text: "My header" }] },
              descriptionText: { translation: [{ text: "My description" }] },
            },
          },
        ],
      },
    });

    await page.render(<App />);
    const routeNames = page.getByRole("article").all();
    expect(routeNames[0]).toHaveTextContent("MR");
    expect(routeNames[1]).toHaveTextContent("OR");
  });

  it("renders detours only for the selected routes", async () => {
    helpers.useConfig.mockReturnValue({
      gtfsScheduleRoutesUrl: "",
      gtfsRealtimeAlertsUrl: "",
      routesFilter: ["MR"],
    });
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
    const detourBodies = page.getByRole("cell").all();
    expect(detourBodies[0]).toHaveTextContent("My header");
  });
})
