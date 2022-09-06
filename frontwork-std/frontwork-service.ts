import { } from "./dom.ts";
import { Frontwork, FrontworkRequest, PostScope, FrontworkResponse, FrontworkInit, EnvironmentStage } from "./frontwork.ts";
import { key_value_list_to_array } from "./utils.ts";

export class FrontworkWebservice extends Frontwork {
    private assets_folder_path = "";
    private assets_relative_path_files: string[] = [];
    private style_css_absolute_path = "";
    private main_js_absolute_path = "";

    constructor (init: FrontworkInit) {
        super(init);
        //this.start_service();
    }
    
    private async start_service() {
        const service = Deno.listen({ port: this.port });
        for await (const connection of service) {
            const httpConnection = Deno.serveHttp(connection);
            for await (const requestEvent of httpConnection) {
                this.handler(requestEvent);
            }
        }

        //TODO: add websocket for hot-reload check
    }

    async start() {
        const server = Deno.listen({ port: 8080 });
        console.log("Deno started webservice on http://localhost:" + this.port);

        // Connections to the server will be yielded up as an async iterable.
        for await (const conn of server) {
            // In order to not be blocking, we need to handle each connection individually
            // without awaiting the function
            this.serveHttp(conn);
        }
    }

    async serveHttp(conn: Deno.Conn) {
        // This "upgrades" a network connection into an HTTP connection.
        const httpConn = Deno.serveHttp(conn);
        // Each request sent over the HTTP connection will be yielded as an async
        // iterator from the HTTP connection.
        for await (const requestEvent of httpConn) {
            // The native HTTP server uses the web standard `Request` and `Response`
            // objects.
            const body = `<DOCTYPE html>
                <body>
                <form id="test_form" action="" method="post"><input type="text" name="text0" value="aabbcc"><input type="text" name="text1" value="aabbcc"><input type="text" name="text2" value="aabbcc"><button type="submit" name="action" value="sent">Submit</button></form>
                    Your user-agent is:\n\n${requestEvent.request.headers.get("user-agent") ?? "Unknown"}
                </body>`;
            // The requestEvent's `.respondWith()` method is how we send the response
            // back to the client.
            const response = new Response(body, {
                status: 200,
            });
            response.headers.set('content-type', "text/html");
        
            //requestEvent.respondWith(response);
            this.handler(requestEvent);
        }
    }

    setup_assets_resolver(assets_folder_path: string) {
        this.assets_folder_path = assets_folder_path;
        // remove last slash if exists
        if (this.assets_folder_path.charAt(this.assets_folder_path.length -1) === '/') {
            this.assets_folder_path.substring(0, this.assets_folder_path.length -2)
        }

        for (const dirEntry of Deno.readDirSync(assets_folder_path)) {
            if (dirEntry.isFile) {
                this.assets_relative_path_files.push('/' + dirEntry.name.replace(this.assets_folder_path, ""));
            }
        }
        return this;
    }

    setup_style_css(style_css_absolute_path: string) {
        this.style_css_absolute_path = style_css_absolute_path;
        return this;
    }

    setup_main_js(main_js_absolute_path: string) {
        this.main_js_absolute_path = main_js_absolute_path;
        return this;
    }

    private assets_resolver (request: FrontworkRequest): Response|null {
        if(request.path === "/assets/style.css") {
            try {
                const file = Deno.readFileSync(this.style_css_absolute_path);
                return new Response(file);
            } catch (error) {
                console.log("ERROR can not load style.css from '" + this.style_css_absolute_path + "'\n", error);
                return null;
            }
        } else if(request.path === "/assets/main.js") {
            try {
                const file = Deno.readFileSync(this.main_js_absolute_path);
                return new Response(file);
            } catch (error) {
                console.log("ERROR can not load main.js from '" + this.main_js_absolute_path + "'\n", error);
                return null;
            }
        }

        for (const relative_file_path of this.assets_relative_path_files) {
            if (relative_file_path === request.path) {
                const file = Deno.readFileSync(this.assets_folder_path + request.path);
                return new Response(file);
            }
        }
        return null;
    }
    
    // TODO: no response after POST
    private async handler (request_event: Deno.RequestEvent) {
        // FormData is too complicated, so we decode it here and put it into PostScope
        let post_data: { key: string, value: string }[] = [];


        let content_type = request_event.request.headers.get("content-type");
        if (content_type !== null) {
            content_type = content_type.split(";")[0];
            
            if (request_event.request.body !== null) {
                if (content_type === "application/x-www-form-urlencoded") {
                    const reader = request_event.request.body.getReader();
                    if (reader !== null) {
                        await reader.read().then((body) => {
                            if (body.value !== null) {
                                const body_string = new TextDecoder().decode(body.value);
                                post_data = key_value_list_to_array(body_string, "&", "=");
                            }
                        });
                    }
                } else if(content_type === "multipart/form-data") {
                    // _TODO: supporting multipart/form-data
                }
            }
        }
        
        const POST = new PostScope(post_data)
        const request = new FrontworkRequest(request_event.request.method, request_event.request.url, request_event.request.headers, POST);

        try {
            // Assets resolver
            const resolved_asset = this.assets_resolver(request);
            if(resolved_asset !== null) {
                this.log(request, "[ASSET]");
                return request_event.respondWith(resolved_asset);
            }

            // Route
            const context = { request: request, i18n: this.i18n, platform: this.platform, stage: this.stage };
            const resolved_component = this.routes_resolver(context);
            
            if(resolved_component !== null) {
                const resolved_response = resolved_component;
                if(resolved_response.response !== null) {
                    return request_event.respondWith(resolved_response.response.into_response());
                }
            }
    
            this.log(request, "[NOT FOUND]");
            const not_found_response = <FrontworkResponse> this.middleware.not_found_handler.build(context, this);
            request_event.respondWith(not_found_response.into_response());
        } catch (error) {
            console.error(error);
            
            try {
                return request_event.respondWith(this.middleware.error_handler(request, error).into_response());
            } catch (error) {
                console.error("ERROR in middleware.error_handler", error);
            }
        }
        
        return request_event.respondWith(new Response("ERROR in error_handler", { status: 500 }));
    }
}

