export function parse_url(url:string): {protocol:string, hostname:string, port:number, path:string, query_string:string, fragment:string} {
    const url_protocol_split = url.split("://");
    const protocol = url_protocol_split[0];

    const url_querystring_split = url_protocol_split[1].split("?");
    const url_host_path_split = url_querystring_split[0].split("/");

    const hostname_port_split = url_host_path_split[0].split(":");
    const hostname = hostname_port_split[0];

    let port: number;
    if (hostname_port_split.length === 2) {
        port = parseInt(hostname_port_split[1]);
    } else {
        switch (protocol) {
            case "http": port = 80; break;
            case "https": port = 443; break;
            default: throw new Error("[frontwork-std > utils.ts > parse_url] Unknown protocol: " + protocol);
        }
    }

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
        hostname: hostname,
        port: port,
        path: path,
        query_string: query_string,
        fragment: fragment,
    };
}


export function key_value_list_to_array(list: string, list_delimiter: string, key_value_delimiter: string): { key: string, value: string }[] {
    const result: { key: string, value: string }[] = [];

    const list_split = list.split(list_delimiter);
    for (let i = 0; i < list_split.length; i++) {
        const item = list_split[i];
        const item_split: string[] = item.split(key_value_delimiter);
        if (item_split.length === 2 && item_split[0] !== "") {
            result.push({ key: item_split[0], value: item_split[1] });
        }
    }
    return result;
}