describe("charts", () => {
  const timeout = 12000;
  it("bar chart", () => {
    cy.visit(
      `public/storybook/iframe.html?id=bar-charts--story&viewMode=story`
    );
    cy.waitUntil(() => cy.get("canvas.loaded"), { timeout });
    cy.get("canvas").screenshot();
    cy.get("canvas").matchImageSnapshot();
  });
  it("line chart", () => {
    cy.visit(
      `public/storybook/iframe.html?id=line-charts--story&viewMode=story`
    );
    cy.waitUntil(() => cy.get("canvas.loaded"), { timeout });
    cy.get("canvas").screenshot();
    cy.get("canvas").matchImageSnapshot();
  });
  it("scoreboard", () => {
    cy.visit(
      `public/storybook/iframe.html?id=scoreboard--story&viewMode=story`
    );
    cy.waitUntil(() => cy.get("canvas.loaded"), { timeout });
    cy.get("canvas").screenshot();
    cy.get("canvas").matchImageSnapshot();
  });
});
