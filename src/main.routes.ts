import { routes } from "@stricjs/app";

import { file_get, main_func } from "..";
import {
  text,
  json,
  html,
  file,
  head,
  redirect,
  status,
  
} from "@stricjs/app/send";

import * as send from '@stricjs/app/send';
import _ from "lodash";
// import { any } from "superagent/lib/request-base";

// Define and export your routes
export default routes()
  .get("/", () => text("Welcome to Stric!"))
  .get("/movie/:tmdbId", async (ctx) => {
    const resp = await main_func(`embed/movie/${ctx.params.tmdbId}`);

    if (resp) {
      return json(resp);
    } else {
      return json({});
    }
  })
  .get("/tv/:tmdbId/:season/:episode", async (ctx) => {
    const resp = await main_func(
      `embed/tv/${ctx.params.tmdbId}/${ctx.params.season}/${ctx.params.episode}`
    );
    if (resp) {
 
        return json(resp);
     
      
    }
    // else if(){

    // }
    else {
      console.log("hello")
      return json({}) ;
    }
  })
  // .get("/file/:url",async (ctx)=>{
  //   const resp = await file_get(ctx.params.url)

  //   if(resp){
  //       ctx.body = resp.body;
  //       ctx.status = resp.status;
  //       ctx.statusText = resp.statusText;
  //       ctx.headers["Content-Type"] = resp.headers.contenttype;
  //       ctx.headers['Access-Control-Allow-Origin'] = "*";

  //       return send.ctx(ctx)
  //   }
  // })
