// source.config.ts
import { defineDocs } from "fumadocs-mdx/macro";
import { defineConfig } from "fumadocs-mdx/config";
var userDocs = defineDocs({
  dir: "content/docs/user"
});
var adminDocs = defineDocs({
  dir: "content/docs/admin"
});
var source_config_default = defineConfig();
export {
  adminDocs,
  source_config_default as default,
  userDocs
};
