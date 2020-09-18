# Architecture

## Architecture goals
- Low cost
- Low maintenance
- [No nonsense](https://www.bryanbraun.com/2019/04/16/nonsense/)
- Prioritize user experience

(These goals are occasionally in conflict with each other. For example, a search feature is a good user experience, but increases cost and maintenance. When conflict happens, I sit on it for a while, and then do what feels best.)

## Decisions

Here are some architecture decisions based on the goals above.

- The frontend is built in a custom JS framework [based on ReactJS](https://www.bryanbraun.com/2019/09/11/web-dev-nirvana-and-why-I-needed-to-let-go-of-reactjs-to-reach-it/) that has no build process and no dependencies. It's written in plain, modern, Javascript, organized into ES6 modules, which is supported by all modern web browsers.
- We avoid unit tests. We want our tests to resemble the way the software is used, so we test in a real browser, with Cypress ([more details here.](../site/cypress/readme.md)).
- A backend is needed for some things. Backend-as-a-service for everything is expensive, and while serverless is low-stress, serverless development is awkward (plus, our site is small and wouldn't benefit from the scalability aspects). Thus we need a backend framework. We went with Rails in API-only mode because it's productive, easy to automate, and mature (with minimal dependency churn).
- We're keeping the front-end separate from the backend for now, to simplify frontend development, and keep the site resilient. If the API server were to go down, we'd want the frontend to remain useable.
- We use a monorepo, because multiple repos tend to make things a big hassle.
- Lean on Cloudflare to reduce backend complexity. Using their SSL, caching, means I can postpone setting up things like NGINX and Varnish.

