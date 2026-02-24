import {Links, Meta, Outlet, Scripts, ScrollRestoration} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {InlineScripts} from "./InlineScripts";
import {metaFunction} from "./metaFunction";
import {linksFunction} from "./linksFunction";
import {externalScriptsFunction} from "./externalScriptsFunction";

export const links: LinksFunction = () => {
    return linksFunction();
}

export const meta: MetaFunction = () => {
    return metaFunction();
};

export default function App() {
    return (
        <html lang="en">
        <head>
            <Meta/>
            <Links/>
            {externalScriptsFunction().map((props, idx)=>{
                const normalizedProps = {};
                Object.entries(props).forEach(([key, value])=> {
                    normalizedProps[key] = value === "" ? true : value;
                })
                return <script key={idx} {...normalizedProps}/>;
            })}
        </head>
        <body>
        <Outlet/>
        <ScrollRestoration/>
        <Scripts/>
        <InlineScripts />
        </body>
        </html>
    );
}
