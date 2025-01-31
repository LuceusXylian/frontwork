

export function parse_url(url:string): {protocol:string, host:string, path:string, query_string:string, fragment:string} {
    const url_protocol_split = url.split("://");
    if(url_protocol_split.length < 2) throw new Error("Invalid URL: " + url);

    const protocol = url_protocol_split[0];

    const url_querystring_split = url_protocol_split[1].split("?");
    const url_host_path_split = url_querystring_split[0].split("/");

    const host = url_host_path_split[0];

    let path;
    if (url_host_path_split.length < 2) {
        path = "/";
    } else {
        path = "";
        for (let i = 1; i < url_host_path_split.length; i++) {
            path += "/" + url_host_path_split[i];
        }
    }

    let query_string;
    let fragment;
    if (url_querystring_split.length > 1) {
        const query_string_fragment_split = url_querystring_split[1].split("#");
        query_string = query_string_fragment_split[0];

        fragment = query_string_fragment_split.length > 1 ? query_string_fragment_split[1] : "";
    } else {
        query_string = "";
        fragment = "";
    }

    return {
        protocol: protocol,
        host: host,
        path: path,
        query_string: query_string,
        fragment: fragment,
    };
}


export function key_value_list_to_object(list: string, list_delimiter: string, key_value_delimiter: string): { [key: string]: string } {
    const result: { [key: string]: string } = {};

    const list_split = list.split(list_delimiter);
    for (let i = 0; i < list_split.length; i++) {
        const item = list_split[i];
        const item_split: string[] = item.split(key_value_delimiter);
        if (item_split[0] !== "") {
            if (item_split.length === 2) {
                result[item_split[0]] = item_split[1];
            } else {
                result[item_split[0]] = "";
            }
        }
    }
    return result;
}

export function html_element_set_attributes(html_element: HTMLElement, attributes: NamedNodeMap) {
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        html_element.setAttribute(attribute.name, attribute.value);
    }
}

export type Result<T, E> = {
    ok: true;
    val: T;
} | {
    ok: false;
    err: E;
};

export interface ObserverFunction<T> {
    (value: T): void;
}

export interface ObserverRetrieverFunction<T> {
    (): Promise<Result<T, string>>;
}

/**
 * Observers may execute their function multiple times then the notify method gets called.
 */
 export class Observer<T> {
    private observers: ObserverFunction<T>[] = [];
    private retriever: ObserverRetrieverFunction<T>|null = null;
    private value: T|null = null;
    private retriever_listeners: (() => void)[] = [];
    private error_listeners: ((error: string) => void)[] = [];
    renew_is_running = false;

    // Set the retriever function that will be used in the get function
    define_retriever(retriever: ObserverRetrieverFunction<T>) {
        this.retriever = retriever;
    }

    // Remove the retriever function
    remove_retriever() {
        this.retriever = null;
    }

    // Observer listener
    subscribe(fn: ObserverFunction<T>): void {
        if (this.value !== null) fn(this.value);
        this.observers.push(fn);
    }
    unsubscribe(fn: ObserverFunction<T>): void {
        this.observers = this.observers.filter(observer => observer !== fn);
    }

    /**
     * Retriever listener: executed before the retriever starts
     */
    add_retriever_listener(fn: () => void): void {
        this.retriever_listeners.push(fn);
    }
    remove_retriever_listener(fn: () => void): void {
        this.retriever_listeners = this.retriever_listeners.filter(listeners => listeners !== fn);
    }

    // Error listener
    add_error_listener(fn: (error: string) => void): void {
        this.error_listeners.push(fn);
    }
    remove_error_listener(fn: (error: string) => void): void {
        this.error_listeners = this.error_listeners.filter(listeners => listeners !== fn);
    }

    // Notify all observers with a value
    set(value: T): void {
        this.value = value;
        this.observers.forEach(observer => observer(value));
    }

    // Set value to null. DOES NOT NOTIFY.
    set_null(): void {
        this.value = null;
    }

    // Notify all observers with a value if value is unknown
    set_once(value: T): void {
        if (this.value === null) {
            this.set(value);
        }
    }

    // Get the value as Promise by this.value, with the retriever or by subscribe and unsubscribe
    get(): Promise<T> {
        return new Promise(async (resolve, reject) => {
            if (this.value === null) {
                if (this.retriever === null || this.renew_is_running) {
                    // Get the value by subscribe and unsubscribe
                    const sub: ObserverFunction<T> = (value: T) => { resolve(value); this.unsubscribe(sub); };
                    this.subscribe(sub);
                } else {
                    // Get the value using the retriever
                    this.get_renew().then(() => resolve(this.value!)).catch((error) => reject(error))
                }
            } else {
                resolve(this.value);
            }
        })
    }

    // Get the value as Promise with the retriever if set or by subscribe and unsubscribe
    get_renew(): Promise<T> {
        return new Promise(async (resolve, reject) => {
            if (this.renew_is_running) {
                const sub: ObserverFunction<T> = (value: T) => { resolve(value); this.unsubscribe(sub); };
                this.subscribe(sub);
            } else {
                this.renew().then(() => resolve(this.value!)).catch((error) => reject(error))
            }
        })
    }

    // Use the retriever function to get the value and notify all observers
    renew() {
        return new Promise(async (resolve, reject) => {
            if (this.retriever === null) {
                throw new Error("For Observer.renew() the retriever must be defined");
            } else {
                this.renew_is_running = true;
                this.retriever_listeners.forEach(listener => listener());

                const value = await this.retriever();
                if (value.ok) {
                    this.set(value.val);
                    this.renew_is_running = false;
                    resolve( value);
                } else {
                    this.renew_is_running = false;
                    console.error("ERROR executing Observer.retriever()", value.err);
                    this.error_listeners.forEach(listener => listener(value.err));
                    reject(value.err);
                }
            }
        })
    }

    // Get the current number of observers
    get count(): number {
        return this.observers.length;
    }

    // Clear all observers
    clear(): void {
        this.observers = [];
        this.value = null;
    }
}
