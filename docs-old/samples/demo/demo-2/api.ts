import type { ApiInterceptorDefinition } from "xmlui";

const mock: ApiInterceptorDefinition = {
  type: "db",
  apiUrl: "/api",
  config: {
    database: "landing-page-5",
  },
  initialize: `
    $state.trafficMetrics = {
      total: 3500,
      breakdown: [
        {
          id: 0,
          site: "https://www.myblog.com",
          pageViews: 500,
          progress: 0.5,
          pageViewsPerVisit: 2,
        },
        {
          id: 1,
          site: "https://www.mysite.com",
          pageViews: 100,
          progress: 0.2,
          pageViewsPerVisit: 3,
        },
        {
          id: 2,
          site: "https://www.myapp.io",
          pageViews: 700,
          progress: 0.8,
          pageViewsPerVisit: 5,
        },
        {
          id: 3,
          site: "https://www.saas-company.com",
          pageViews: 2000,
          progress: 0.1,
          pageViewsPerVisit: 6,
        },
        {
          id: 4,
          site: "https://www.myotherapp.com",
          pageViews: 200,
          progress: 0.2,
          pageViewsPerVisit: 1,
        },
        {
          id: 5,
          site: "https://www.exampleapp.com",
          pageViews: 350,
          progress: 0.35,
          pageViewsPerVisit: 1.5,
        },
        {
          id: 6,
          site: "https://www.newappsite.com",
          pageViews: 120,
          progress: 0.12,
          pageViewsPerVisit: 0.8,
        },
      ]
    };
  `,
  operations: {
    "traffic-metrics-list": {
      url: "/traffic-metrics",
      method: "get",
      handler: `return $state.trafficMetrics.breakdown;`,
    },
    "traffic-metrics-total": {
      url: "/traffic-metrics/total",
      method: "get",
      handler: `return $state.trafficMetrics.total;`,
    },
  },
};

export default mock;
