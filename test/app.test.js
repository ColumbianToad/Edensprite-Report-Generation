const request = require("supertest");
const app = require("../app");

describe("Application security tests", () => {
    test("redirects unauthenticated users from dashboard", async () => {
        const res = await request(app).get("/dashboard");
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe("/login");
    }); // test

    test("rejects SQL injection login attempt", async () => {
        const res = await request(app)
            .post("/login")
            .send({
                email: "' OR 1=1 --",
                password: "anything"
            });

        expect(res.text).toContain("Invalid email or password");
    });

    test("rejects invalid report date range", async () => {
        const agent = request.agent(app);

        await agent
            .post("/login")
            .send({
                email: "admin@example.com",
                password: "AdminPassword123!"
            });

        const res = await agent
            .post("/generate-report")
            .send({
                project: "1",
                startDate: "2026-06-20",
                endDate: "2026-06-10"
            });

        expect(res.statusCode).toBe(400);
    });
});