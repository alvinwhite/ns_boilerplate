# Getting started

Open command line in the proejct directory and run  `yarn install`

Then run `yarn run dev` to start a developemnt server
You also can use npm instead of yarn obviously ;)

# Other commands

package.json scripts are used to execute commands, to run one you should type 
`yarn run {command name}`

Comamnd name | Description
--- | ---
dev | Starts developing server
prod | Builds production version
create::component `{component name}` | Creates empty component with Pug, Stylus and JavaScript files
create::page `{component name}` | Creates page with the same files as for a component, but also adds `{component name}-critical.styl` file for inline styles 


# Notes

* All pages are included as Webpack entries automatically, directory name of the page should be the same as page name
* When importing files, you can use Webpack aliases option to avoid having ugly paths https://webpack.js.org/configuration/resolve/#resolve-alias Existing alieses are `Components` and `@` (see examples in `src/pages/index`), .js and .styl both support aliases.
