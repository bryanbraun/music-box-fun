# Testing Approach

> "Write tests, not too many, mostly integration."
>
> [Guillermo Rauch](https://twitter.com/rauchg/status/807626710350839808)

Our approach is to favor high-quality tests that use the app [like the user would](https://twitter.com/kentcdodds/status/977018512689455106), and avoid testing implementation details.

Thus, we are favoring integration-style tests that run in a real browser. We're using [Cypress](https://www.cypress.io/) to run these tests.

These kinds of tests tend to be be slower, which is a good incentive to not write too many.

**Notes:**

- I try to choose selectors based on recommendations in the [Cypress docs](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements) and [Testing library docs](https://kentcdodds.com/blog/introducing-the-react-testing-library#this-solution). Specifically, I:
  - Favor id selectors, or targeting an element by it's label or textContent.
  - If neither of those will work I place `data-testid` attribute in the component code.
    - I don't put `data-testid` in the static initial page load, because my tests usually want the interactive component that loads later, and Cypress will wait for the `data-testid`s to appear before proceeding.
    - Note: it's ok to have multiple identical `data-testid`s on the same page, unlike html `id`s.
  - Avoid using class selectors. Those are for styling.
