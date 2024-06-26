import { Component, Route, FrontworkMiddleware, FrontworkResponse, DocumentBuilder, FrontworkResponseRedirect, FrontworkContext, FrontworkInit, EnvironmentPlatform, EnvironmentStage, FW, LogType, HTMLElementWrapper, FrontworkForm } from "../frontwork.ts";
import { FrontworkClient } from "../frontwork-client.ts";
import { i18n } from "./test.i18n.ts";


class MyMainDocumentBuilder extends DocumentBuilder {
	main: HTMLElementWrapper<HTMLElement>;

	constructor(context: FrontworkContext) {
		super(context);
		const header = this.body_append( context.create_element("header") );
		context.ensure_text_element("a", "a-home", { href: "/" }).append_to(header);
		context.ensure_text_element("a", "a-test2",{ href: "/test2" }).append_to(header);
		context.ensure_text_element("a", "a-test3",{ href: "/test3" }).append_to(header);
		context.ensure_text_element("a", "a-german", { href: "/german" }).append_to(header);
		context.ensure_text_element("a", "a-crash", { href: "/crash" }).append_to(header);
		this.main = this.body_append(context.create_element("main"));
	}
}


class AnotherComponent implements Component {
    build(context: FrontworkContext): FrontworkResponse {
		const document_builder = new DocumentBuilder(context);
		const main = document_builder.body_append( context.create_element("main") );
		context.ensure_text_element("h1", "another_title1").append_to(main);
		context.ensure_text_element("p", "another_text1").append_to(main);
		return new FrontworkResponse(200, document_builder);
	}
    dom_ready(): void {}
}

class TestComponent implements Component {
	button_event: HTMLElementWrapper<HTMLButtonElement>;
	
	constructor(context: FrontworkContext) {
		this.button_event = context.ensure_text_element("button", "event_button_tester", { type: "button" });
		
	}

    build(context: FrontworkContext) {
		const document_builder = new MyMainDocumentBuilder(context);

		const title = context.ensure_text_element("h1", "title1").append_to(document_builder.main)
		const description = context.ensure_text_element("p", "text1").append_to(document_builder.main)
		
		this.button_event.append_to(document_builder.main);
		
		const section = context.create_element("section").append_to(document_builder.main);
		context.ensure_text_element("h2", "title2").append_to(section);

		// Test forms
		const action = context.request.GET.get("action");
		if (action !== null) {
			context.ensure_text_element("h3", "formtest_title_"+(FW.is_client_side? "ok" : "fail")).append_to(section);
			for (let i = 0; i < 3; i++) {
				const div = context.create_element("div").append_to(section);
				div.element.innerHTML = "text"+i+": "+context.request.GET.get("text"+i);
			}

		}

		const form = new FrontworkForm(context, "test_form", "", "GET").append_to(section);

		for (let i = 0; i < 3; i++) {
			context.ensure_element("input", "input"+i, { type: "text", name: "text"+i, value: "asdsad"+i }).append_to(form);
		}
		
		context.ensure_text_element("button", "submit_button", { type: "submit", name: "action", value: "sent" }).append_to(form);

		return new FrontworkResponse(200, 
			document_builder
				.add_head_meta_data(title.element.innerText, description.element.innerText, "noindex,nofollow")
		);
	}
	
    dom_ready(context: FrontworkContext, client: FrontworkClient): void {
		try {
			let times = 0;
			this.button_event.add_event("click", () => {
				times++;
				this.button_event.element.innerHTML = "Changed "+times+" times";
			})
		} catch (error) {
			console.error(error);
		}
	}
}

class TestGerman extends TestComponent {
    constructor(context: FrontworkContext) {
		context.i18n.set_locale("de");
		super(context);
	}
    build(context: FrontworkContext) {
		return super.build(context);
	}
    dom_ready(context: FrontworkContext, client: FrontworkClient): void { super.dom_ready(context, client); }
}

class Test2Component implements Component {
    build(context: FrontworkContext) {
		const document_builder = new MyMainDocumentBuilder(context);

		const title1 = context.ensure_text_element("h1", "test-page2").append_to(document_builder.main);
		const description = context.ensure_element("p", "description").append_to(document_builder.main);
		description.element.innerHTML = "This is a test page <b>2</b> for the Frontwork framework. I will redirect you with js to the home page in 1 second.";
		
		FW.reporter(LogType.Warn, "TEST", "Warn counter test for Testworker", context, null);
		return new FrontworkResponse(200, 
			document_builder
				.add_head_meta_data(title1.element.innerText, description.element.innerText, "noindex,nofollow")
		);
	}
    dom_ready(context: FrontworkContext, client: FrontworkClient): void {
		setTimeout(() => {
			client.page_change_to("/")
		}, 1000);
	}
}

class Test3Component implements Component {
    build() {
		return new FrontworkResponseRedirect("/");	
	}
    dom_ready(): void {}
}


class ElementTestComponent implements Component {
    build(context: FrontworkContext) {
		const document_builder = new MyMainDocumentBuilder(context);
		return new FrontworkResponse(200, 
			document_builder
				.add_head_meta_data("element_test", "element_test", "noindex,nofollow")
		);
	}
    dom_ready(): void {}
}

class HelloWorldPrioTestComponent implements Component {
    build(context: FrontworkContext) {
		const content = "Hello this is indeed first come, first served basis";
		return new FrontworkResponse(200, content);
	}
    dom_ready(context: FrontworkContext): void {}
}

class HelloWorldComponent implements Component {
    build(context: FrontworkContext) {
		const content = "Hello "+context.request.path_dirs[2];
		return new FrontworkResponse(200, content);
	}
    dom_ready(context: FrontworkContext): void {}
}

class CollisionHandlerComponent implements Component {
    build(context: FrontworkContext) {
		if (context.request.path_dirs[2] === "first-come-first-served") {
			return new HelloWorldPrioTestComponent().build(context);
		}
		return new HelloWorldComponent().build(context);
	}
    dom_ready(context: FrontworkContext): void {
		if (context.request.path_dirs[2] === "first-come-first-served") {
			new HelloWorldPrioTestComponent().dom_ready(context);
		}
		new HelloWorldComponent().dom_ready(context);
	}
}

class CrashComponent implements Component {
    build() {
		throw new Error("Crash Test");
		// deno-lint-ignore no-unreachable
		return new FrontworkResponse(200, "this text shall never be seen in the browser");
	}
    dom_ready(): void {}
}

class NotFoundComponent implements Component {
    build(context: FrontworkContext) {
		const document_builder = new MyMainDocumentBuilder(context);
		const h1 = context.document_body.appendChild(document.createElement("h1"));
		h1.innerText = "ERROR 404 - Not found";

		return new FrontworkResponse(404,
			document_builder
				.add_head_meta_data(h1.innerText, h1.innerText, "noindex,nofollow")
		);
	}
    dom_ready(): void {}
}

const default_routes: Route[] = [
	new Route("/", TestComponent),
	new Route("/test2", Test2Component),
	new Route("/test3", Test3Component),
	new Route("/german", TestGerman),
	new Route("/crash", CrashComponent),
	new Route("/element_test", ElementTestComponent),
	new Route("/hello/first-come-first-served", HelloWorldPrioTestComponent),
	new Route("/hello/*", HelloWorldComponent),
	new Route("/hi/*", CollisionHandlerComponent),
];

const another_routes: Route[] = [
	new Route("/", AnotherComponent),
];

const middleware = new FrontworkMiddleware({
	before_route: {
		build: (context: FrontworkContext) => {
			context.i18n.set_locale("en");
		},
		dom_ready: () => { }
	},
	error_handler: (context: FrontworkContext): FrontworkResponse => {
		const document_builder = new MyMainDocumentBuilder(context);
		const h1 = context.document_body.appendChild(document.createElement("h1"));
		h1.innerText = "ERROR 500 - Internal server error";

		return new FrontworkResponse(500,
			document_builder
				.add_head_meta_data(h1.innerText, h1.innerText, "noindex,nofollow")
		);
	},
	not_found_handler: NotFoundComponent,
});



export const APP_CONFIG: FrontworkInit = {
	platform: EnvironmentPlatform.Web, 
	stage: EnvironmentStage.Development,
	port: 8080,
	domain_to_route_selector: (context: FrontworkContext) => {
		const domain = context.request.host.split(":")[0];
		
		if (domain === "127.0.0.1") return another_routes;
		return default_routes;
	},
	middleware: middleware,
	i18n: i18n,
	build_on_page_load: false
};
