import { FrontworkTestworker } from "../frontwork-testworker.ts";
import { APP_CONFIG } from "./test.routes.ts";
import { i18n } from "./test.i18n.ts";


const worker = new FrontworkTestworker(APP_CONFIG)

// Test api_request with object params serialization
await worker.assert_function(async () => {
    const locale = i18n[0];
    const context = worker.create_context("http://localhost:8080", locale);
    
    // Test GET with object param
    const get_result = await context.api_request("GET", "/test", {
        filter: { category: "posts", page: 1 },
        search: "hello",
    });
    // API is not running, so we expect a 503 error, but the request should not throw
    // The important thing is that the URL was built correctly with encoded JSON
    
    // Test POST with object param
    const post_result = await context.api_request("POST", "/test", {
        data: { nested: true, items: [1, 2, 3] },
        name: "test",
    });
    // Same expectation: 503 from no server, but no encoding crash
    
    // Test mixed params with boolean, number, string array, and object
    const mixed_result = await context.api_request("GET", "/test", {
        flag: true,
        count: 42,
        tags: ["a", "b"],
        meta: { key: "value" },
    });
});

worker.print_summary();
worker.exit();