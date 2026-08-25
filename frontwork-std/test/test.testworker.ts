import { FrontworkTestworker } from "../frontwork-testworker.ts";
import { APP_CONFIG } from "./test.routes.ts";
import { i18n } from "./test.i18n.ts";


const worker = new FrontworkTestworker(APP_CONFIG)

// Test api_request_json with object params serialization
await worker.assert_function(async () => {
    const locale = i18n[0];
    const context = worker.create_context("http://localhost:8080", locale);
    
    // Test GET with object param
    const get_result = await context.api_request("GET", "/test", {
        search: "hello",
    });
    // API is not running, so we expect a 503 error, but the request should not throw
    
    // Test POST with object param (sent as application/json)
    const post_result = await context.api_request_json("POST", "/test", {
        data: { nested: true, items: [1, 2, 3] },
        name: "test",
    });
    // Same expectation: 503 from no server, but no encoding crash
});

worker.print_summary();
worker.exit();