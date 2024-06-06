---
description: An introduction to integrate WebAssembly (WASM) — originating from Rust — within your regular frontend TypeScript or JavaScript code base.
categories:
    - rust
    - WebAssembly
    - wasm
    - vite
    - vite.js
    - node
    - typescript
permalink: rust-wasm-intro
editLink: true
outline: deep

readingTime: 720
---

# Creating a web application using Rust and WebAssembly

<script setup>
import "../../src/style/utils.scss";
import RustLogoBlack from "/assets/rust-logo.svg";
import RustLogoWhite from "/assets/rust-logo-white.svg";
import {useBlog} from "../../src/composables/useBlog";
import {computed} from "vue"; 
import {ReadingTime} from "../../src/components";  
import RustWasmIntroPng from './rust-wasm-intro.png';

const {categories, isDark} = useBlog();
const rustLogo = computed(() => isDark.value ? RustLogoWhite : RustLogoBlack);

const r = ReadingTime.toString()
</script>

<img :src="RustWasmIntroPng" class="mt-12" alt="Creating a web application using Rust and WebAssembly">

<div class="d-flex date_updated" style="align-items: baseline; gap: .5em;">
<div>Published: 19 Jun 2024, by Joris Aerts</div>
-
<div>Reading time: <ReadingTime /></div>
</div>

[[toc]]

## Introduction

This article will illustrate the usage of [Rust](https://www.rust-lang.org/) (compiled
to [WebAssembly](https://webassembly.org/)) in a [Node.js](https://nodejs.org/) web project.
We'll be using [Vite.js](https://vitejs.dev/) as build tool and development server.
In contrast to [Webpack](https://webpack.js.org/), using Vite.js will allow us to create a project with as little
overhead as possible.

We will have a look at some basic stuff, like exporting variables from Rust to JavaScript and exposing some of the JavaScript
API to Rust.
This way, we can use native JavaScript functionality within our Rust codebase.

We'll also cover some of the data types, together with some perks and examine how performant the WebAssembly code runs
in your browser.

### What is WebAssembly?

WebAssembly, abbreviated **WASM**, is a binary-code format that enables near native runtime performance in the browser.
It's not assembler as such — surely it closely resembles to it — and it's platform independent.
WASM is much more powerful than JavaScript, as it doesn't have to be interpreted anymore.
JavaScript is a high-level programming language, where Rust is a low-level programming language.
When the Rust code is compiled to low-level WASM code and looking at the size, there doesn't seem to be much overhead.
It's very compact.

Data types and structures are much more efficient in Rust (thus eventually in WASM), for example, than in JavaScript.
So WASM provides a much richer experience when memory and CPU usage come into play,
when dealing with complex and expensive calculations, for example.

[Figma](https://www.figma.com/) is an example of an application that is written in C++ and Rust, compiled to WASM.  
But also heavy 3D games (using [Unity](https://unity.com/), for example) run in WASM.
In many of these cases I would assume that WASM is used for interacting with
a [canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas)-element.

Either way, when using WASM for 3D applications running in a canvas, in the resources I found,
the GLSL that has to be sent to your GPU's isn't compiled to binary code but is still just a String containing your GLSL code,
just the same as in JavaScript.
So if the weight of your operations lays in the GLSL shaders, then WASM wouldn't provide that much of a benefit.
On the contrary, you'll be missing out on fine node packages such as Three.js.

You may also know WebAssembly from [Emscripten](https://emscripten.org/) – or the numerous *browser ports* made by Emscripten –
which also uses LLVM to compile binary code to WASM.

### Why Rust?

There are a number of languages which are able to compile to WASM, but Rust and [Go](https://go.dev/) are the really
popular
ones here.
The reason I chose Rust over Go is compilation size. Compiling a Go project to WASM will at least take up to 2MB for a
simple project and grows larger quickly, while with Rust this will only be a couple of kilobytes.

This means that Go either needs a lot more boilerplate WASM code to make your Go-code to compile to WASM, or that
it's way worse at translating GO to assembly. Either way, it's a lot less efficient in compiling code to WASM.

Rust, on the other hand, only has a small footprint, which implies that your generated WASM code will remain much closer to the
code you've originally written in Rust.

### About this article

In this article, we'll be handling the concept of writing code in Rust and running it in the browser.
Along this journey we will create a (vanilla web application) project together, which will run some WASM code that was
originally written in Rust.
This WASM code will be built into a npm package, which will then be integrated in the frontend JavaScript (or TypeScript) code.

At first, we'll start with setting everything up.
I'm using a mac, so I'll be installing things in a way that's maybe different from yours.
I will be using [Homebrew](https://brew.sh/) as my OS package manager.

## Project setup

### Prerequisites

Let's quickly go through installing the necessary tooling for this project; you'll need both Rust and Node.js
tooling.

For Rust, you'll be needing [rustup](https://rustup.rs/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/).

For Node.js, we'll be using [Yarn](https://yarnpkg.com/) as our package manager. Yarn provides support for monorepos and keeps
the dependencies archived, so you don't end up with tons of JavaScript files in one or more *node_modules*-directories. All
yarn-dependencies are stored in a folder in the root of your project, called `.yarn/cache`.  
I personally like Yarn very much, but I'm sure all of this can be achieved using [pnpm](https://pnpm.io/) too.

> **_TIP:_** If you enable [Corepack](https://nodejs.org/api/corepack.html), you can use yarn or pnpm without having to install
> external packages or binaries. It's all shipped with Node.js, but you'll need to call `corepack enable` first.

> **_TIP (follow up):_** If you installed Node.js using Homebrew, you'll need to install Corepack
> separately (`brew install corepack`), for it is not shipped along with `node` in the same _formula_.

### Directory structure

We will be creating a monorepo, which also contains our Rust workspace.
This Rust workspace will then be compiled to a npm package using wasm-pack.

First of all, let's create our project structure:

````
├── .yarnrc.yml
├── package.json
├── crates
│   └── rust-lib
│       ├── build.sh
│       ├── Cargo.toml
│       └── src
│           └── lib.rs
├── packages
│   ├── app
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src
│   │       └── main.ts
│   └── rust-lib
│       └── package.json
└── dist
````

Below, you can find the original contents of the files:

::: code-group

```YAML [.yarnrc.yml]
# vite-plugin-top-level-await wants to access rollup, 
# but it hasn't declared a dependency upon it.
# So we have to fix it ourselves.

packageExtensions:
    "vite-plugin-top-level-await@*":
        dependencies:
            rollup: "*"
```

```JSON [package.json]
{
    "name": "rust-test",
    "version": "0.0.1",
    "type": "module",
    "devDependencies": {
        "typescript": "^5.4.5"
    },
    "scripts": {
        "build": "cd crates/rust-lib && ./build.sh",
        "dev": "cd packages/app && yarn dev"
    },
    "workspaces": [
        "packages/*"
    ],
    "packageManager": "yarn@4.3.0"
}
```

```shell [crates/rust-lib/build.sh]
#!/bin/bash

OUTDIR="$(cd ../../packages; pwd)/rust-lib"
wasm-pack build --target bundler --out-dir "$OUTDIR"
```

```TOML [crates/rust-lib/Cargo.toml]
[package]
name = "rust-lib"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2.92"
js-sys = "0.3.69"

[dependencies.web-sys]
version = "0.3.4"
```

```Rust [crates/rust-lib/src/lib.rs]
// Leave empty
```

```JSON [packages/app/package.json]
{
    "name": "rust-test-app",
    "version": "0.0.1",
    "type": "module",
    "scripts": {
        "dev": "vite"
    },
    "dependencies": {
        "rust-lib": "workspace:*"
    },
    "devDependencies": {
        "typescript": "^5.4.5",
        "vite": "^5.3.1",
        "vite-plugin-top-level-await": "^1.4.1",
        "vite-plugin-wasm": "^3.3.0"
    }
}
```

```JSON [packages/app/tsconfig.json]
{
    "include": [
        "vite.config.*",
        "src/**/*"
    ],
    "compilerOptions": {
        "composite": true,
        "noEmit": true,
        "module": "ESNext",
        "moduleResolution": "Bundler"
    }
}
```

```TypeScript [packages/app/vite.config.ts]
import {defineConfig} from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    plugins: [
        // this will enable importing of WASM files
        wasm(),

        // this will take care of the async loading of the WASM files
        topLevelAwait()
    ]
})
```

```HTML [packages/app/index.html]
<!DOCTYPE html>
<html>
<script type="module" src="/src/main.ts"></script>
</html>
```

```Rust [packages/app/src/main.ts]
// Leave empty
```

```JSON [packages/rust-lib/package.json]
{
    "name": "rust-lib",
    "version": "0.0.1",
    "type": "module",
    "description": "This packages will be overwritten when running ./build.sh in crates/rust-lib"
}
```

:::

In our root-project's `package.json`, you can find two scripts which we will be using:

- "**build**" will compile our Rust project into a WASM package. The output will be generated in the `packages/rust-lib`
  directory. This target actually generates a complete package onto which `packages/app` depends.
  It's not a watcher, so you'll have to run this script manually after you make changes to your Rust code.
- "**dev**" will start our Vite.js development server at port 5173 (by default)

You may also have noticed two Vite.js plugins in `packages/app/package.json`:

- **vite-plugin-wasm** provides support for loading `.wasm`-files in your scripts.  
  This way Vite.js knows how to handle them and where to _dist_ them.
- **vite-plugin-top-level-await** helps us take care of the asynchronous nature when working with WASM resources;
  they have to be loaded somehow some when.
  I would consider not using this plugin in a production environment,
  in favor of having more control over which resources get loaded when.
  For this post, it will do just fine.

### Prepare the workspace

To start with, you want to run the next command to install the necessary node dependencies:

```shell
yarn install
```

Next, you may want to add Visual Studio Code support by running:

```shell
yarn dlx @yarnpkg/sdks vscode
```

This will create a `.vscode`-directory in the root of your project, which contains some Visual Studio configuration files.
It will have support for your yarn-workspace (by
adding [vscode-zipfs](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs)),
but we may want to add support for Rust too:

::: code-group

```JSON [.vscode/extensions.json]{3:4}
{
    "recommendations": [
        "rust-lang.rust-analyzer",
        "arcanis.vscode-zipfs"
    ]
}
```

:::

Next time you'll start Visual Studio Code, it will ask you to use the workspace version of TypeScript,
which you want to _Allow_:

<img src="/2024/rust-wasm-intro/vscode-workspace-typescript.png" width="465" class="my-8" alt="Visual Studio Code popup" />

## Hands on

### The basics

It's time to start writing some very basic Rust code which we will then access in our TypeScript code.
Take a look at the following example:

::: code-group

```Rust [crates/rust-lib/src/lib.rs]
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = getNumber)]
pub fn get_number() -> i32 {
  123
}
```

:::

The code above creates a *pub*lic function called `get_number` and exports it as `getNumber`.
We're exporting this function using a different name, because Rust has different naming conventions (snake_case)
from TypeScript (camelCase).

The function does nothing else than return the number 123, which is a 32-bit signed integer (`i32`) in Rust
and will become a `Number` in TypeScript.

The `wasm_bindgen`-attribute above the function tells wasm-pack to export this function to TypeScript.
`pub` means that we're creating a public function. Like mentioned before, this is very basic Rust code.

Next, we want to compile the code using our previously mentioned "build"-script:

```shell
yarn build
```

This will start our `./build.sh` script using Node.js.

Again, remember that this script does not have a watcher, which looks for file changes.
Therefore, you'll need to run this command each time you make changes to the Rust code.
When the script has successfully finished its job, you should typically see something like:

```shell
[INFO]: ✨   Done in 0.15s
[INFO]: 📦   Your wasm pkg is ready to publish at /your-folder/wasm-test-lib/packages/rust-lib.
```

So far so good, let's now use this generated code in our TypeScript:

::: code-group

```TypeScript [packages/app/src/main.ts]
import {getNumber} from 'rust-lib'

console.log("hello", getNumber()) // hello 123
```

:::

It's time to start the development server and check the console.
Run the following command, which will start the vite.js development server by default at http://localhost:5173:

```shell
yarn dev
```

Open your browser and navigate to your freshly started local development server.
In the console, you'll see `hello 123` popping up.

Congratulations, you've successfully invoked some Rust code — _compiled to WASM_ — in your browser!  
Now let's have a look at the code that has been magically generated for us.

### The generated WASM package

The directory structure of the _generated_ WASM package will look like this:

````
└── packages
    └── rust-lib
        ├── package.json
        ├── rust_lib_bg.js
        ├── rust_lib_bg.wasm
        ├── rust_lib_bg.wasm.d.ts
        ├── rust_lib.d.ts
        └── rust_lib.js
````

The `.js`-files are the ones which contain actual JavaScript code.  
The `.d.ts`-files are just TypeScript declarations, converting the `.js`-files into `.ts`-files, so to speak.
See `"types"` in `package.json`.  
The `.wasm`-files on the other hand are the binaries that contain the compiled Rust code into WASM.

Taking a look at the `.d.ts`-files will tell us a lot; it will provide us with useful TypeScript types and declaration, saving
us from getting too distracted from the code itself.

```TypeScript
/* tslint:disable */

/* eslint-disable */
/**
 * @returns {number}
 */
export function getNumber(): number;
```

As you can see, we have indeed created a function called `getNumber()` that returns a `number`.
So, the package contains correct TypeScript type information too, how beautiful!

> **_NOTE:_** These WASM files need to be loaded from somewhere, and that somewhere is in the JavaScript.
> Packages which use WASM are therefore asynchronous from the start on.  
> As mentioned above, for us `vite-plugin-top-level-await` takes care of that.

Next, we'll have a look into creating some bindings between our browser's API (the DOM) and our Rust-code.

### Define some "Externals" in Rust

In Rust, we can define externals which will expose objects from _JavaScript_ to Rust,
so you can use these JavaScript globals in your Rust code.
Actually, these objects are not really JavaScript objects, but as mentioned before,
a browser API which gets exposed to JavaScript.
This way we can access `console.log` for example, in our Rust code.

To make things accessible from Rust, we have to create an `external`-block in our Rust code,
and define the functionality we want to expose.

Take a look at the following example:

```Rust
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    pub fn log(s: &str);
}
```

The example above will make the `console.log` JavaScript function accessible in Rust.  
Notice that we're only providing a String as argument for `console.log`,
while `console.log` in JavaScript has variable arguments (_varargs_).

The problem is that Rust doesn't support varargs _internally_. <u>Rust doesn't even support function overloading</u>.
How should we use this method then?

One way is to provide multiple access points to `console.log`, like this:

```Rust
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    pub fn logString(s: &str);
    
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    pub fn logNumber(s: i32);
}
```

For external bindings — in normal conditions — Rust makes an exception and allows us to bind to an <u>external</u> function
which *does* have varargs. This behaviour is then treated as *[unsafe](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)*
for Rust.

Anyhow, *wasm_bindgen* doesn't like to see this kind of construction; so when using *wasm_bindgen*, we need to declare an array
as argument instead.

Let's test the following code:

::: code-group

```Rust [crates/rust-lib/src/console_log.rs]
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(variadic, js_namespace = console, js_name = log)]
    fn console_log(arr: &[i32]);
}

pub fn log_num(s: i32) {
    console_log(&[s]);
}

pub fn log_num2(s: i32, s2: i32) {
    console_log(&[s, s2]);
}
```

```Rust [crates/rust-lib/src/lib.rs]
mod console_log;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn hello() {
    console_log::log_num(1);
    console_log::log_num2(123,456);
}
```

```TypeScript [packages/app/src/main.ts]
import {hello} from 'rust-lib'

// This will first log "1" to the console and then "123 456".
hello()
```

:::

The code above illustrates the declaration of an external varargs function.
Notice the `variadic` keyword in the wasm_bindgen attribute, it defines that the external function has a varargs-signature.

> **_NOTE:_** wasm_bindgen currently doesn't allow complex types as varargs, such as an array of strings (`&[&str]`).
> Varargs only seem to work with primitive values for the moment.

Let's move on and export some objects from Rust to JavaScript and see what WASM makes out of them.

### Exporting objects

*wasm_bindgen* allows us to export Rust structs to JavaScript (or TypeScript) too; they will be converted to classes.  
Take a look at the following example (with some added functionality to *console_log.rs*):

::: code-group

```Rust [crates/rust-lib/src/lib.rs]
mod console_log;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct TestStruct {

}

#[wasm_bindgen]
impl TestStruct {

    #[wasm_bindgen]
    pub fn foo() {
        console_log::log_str(&"Foo");
    }

    #[wasm_bindgen]
    pub fn bar(&self) {
        console_log::log_str(&"Bar");
    }

}

#[wasm_bindgen]
pub fn create() -> TestStruct {
    TestStruct {}
}
```

```Rust [crates/rust-lib/src/console_log.rs]{8-9,20-23}
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(variadic, js_namespace = console, js_name = log)]
    fn console_log_num(arr: &[i32]);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn console_log_str(s: &str);
}

pub fn log_num(s: i32) {
    console_log_num(&[s]);
}

pub fn log_num2(s: i32, s2: i32) {
    console_log_num(&[s, s2]);
}

pub fn log_str(s: &str) {
    console_log_str(s);
}
```

```TypeScript [packages/app/src/main.ts]
import {TestStruct, create} from 'rust-lib'

const test = create()

TestStruct.foo() // will log "Foo" to the console
test.bar() // will log "Bar" to the console

console.log({TestStruct}) // will log the TestStruct class to the console
```

:::

As you can see, *wasm_bindgen* exported our `TestStruct` as a class to JavaScript.
The class has two functions, one static and one instance function.

To create an instance function, add `&self` as the first argument of the function.
This will denote that it's an instance function.

### Working with dates

As you continue your Rust journey, at some point, you may want to work with Dates, or system time, for example.
Take a look at the following example:

::: code-group

```Rust [crates/rust-lib/src/lib.rs]
use std::time::SystemTime;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn now() -> u64 {
    SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs()
}
```

```TypeScript [packages/app/src/main.ts]
import {now} from 'rust-lib'

console.log(now())
```

:::

When you try to run this, you'll notice an error message in the console:
<img src="/2024/rust-wasm-intro/date-error.png" width="427" class="mt-2 mb-8" />

The reason is that the `SystemTime` object in Rust isn't handled very well by *wasm_bindgen*,
resulting into panic. The solution here is to use `js_sys::Date` instead:

::: code-group

```Rust [crates/rust-lib/src/lib.rs]
use js_sys::Date;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn now() -> f64 {
    Date::now()
}
```

```TypeScript [packages/app/src/main.ts]
import {now} from 'rust-lib'

console.log(now())
```

:::

As you can see, now you get the correct timestamp since epoch (*1 Jan 1970*), without any panic involved.
> **_NOTE:_** As you may have noticed, `Date::now()` returns an `f64` instead of an `u64`.
> That is because JavaScript really only knows `Number`, which can be any type of number.

Date is one example of a type which can't be compiled from Rust to WASM just like that,
so it may be worthwhile to explore the perks of `wasm_bindgen` and `wasm-pack` a little bit deeper in another post.

### Accessing the DOM in Rust

Rust has an interesting library `web_sys` which allows us to access and manipulate the DOM
in the same way as we're used to in JavaScript.
Of course, it's all cooked into a Rust paradigm, but you'll soon notice the obvious similarities.

First, we'll have to add some dependencies to `Cargo.toml`. Take a look at the following example:

::: code-group

```Rust [crates/rust-lib/src/lib.rs]
use web_sys::*;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(js_name = createHello)]
pub fn create_hello() -> Result<web_sys::Node, JsValue> {
    let document = web_sys::window().unwrap().document().expect("Document should be present.");
    let body = document.body().unwrap();

    let div = document.create_element("div").unwrap();
    div.set_text_content(Some("Hello World"));

    body.append_child(&div)
}
```

```TOML [crates/rust-lib/Cargo.toml]{15-21}
[package]
name = "rust-lib"
version = "0.1.0"
edition = "2021"
    
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2.92"
js-sys = "0.3.69"

[dependencies.web-sys]
version = "0.3.4"
features = [
    'Document',
    'Element',
    'HtmlElement',
    'Node',
    'Window',
]
```

```TypeScript [packages/app/src/main.ts]
import {createHello} from 'rust-lib'

createHello()
```

:::

When running the example above, instead of a blank page, you should now notice that a DIV-element has been added,
containing the text "Hello World":

<img src="/2024/rust-wasm-intro/browser-with-hello-world.png" width="612" class="ml-n12 mb-n8" />

### Some benchmarking

Now that we have some basics, let's write some benchmarking code.
Let's see if Rust (compiled to WASM) really can speed things up:

::: code-group

```Rust [crates/rust-lib/src/lib.rs]
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(js_name = benchmarkWasm)]
pub fn benchmark_wasm(n: i32) -> i32 {
    if n == 1 || n == 2 { return 1; }
    return benchmark_wasm(n - 1) + benchmark_wasm(n - 2);
}
```

```TypeScript [packages/app/src/main.ts]
import {benchmarkWasm} from 'rust-lib'

/**
 * The JavaScript variant of our WASM benchmark
 */
function benchmarkJs(n: number) {
    if (n === 1 || n === 2) return 1;
    return benchmarkJs(n - 1) + benchmarkJs(n - 2);
}

/**
 * The test executor
 * @param fn
 */
function runTest(fn: typeof benchmarkWasm) {
    fn(40) // warmup

    const start = Date.now()
    let result: unknown = 0

    for (let n = 0; n < 5; n++) {
        result = fn(40)
    }

    return {
        result,
        time: `${Date.now() - start}ms`
    }
}

// run the tests
console.log(
    [benchmarkJs, benchmarkWasm].map(runTest)
)
```

:::

In the example above, we've created the exact same function once in Rust and once in TypeScript.
The script will loop 5 times (+1 warmup) and calculates a Fibonacci sequence.

Let's look at the console what the outcome is:

```console
Array(2)
  ▼ 0: 
    result: 102334155
    time: "3316ms"
  ▼ 1: 
    result: 102334155
    time: "770ms"
```

In this case, measured on an Apple M2 with 8GB RAM, our Rust WASM-code is about 5× faster than the JavaScript counterpart.

## Conclusion

During this article, we have explored how to run Rust code in your browser and have it interact with your daily JavaScript, or
TypeScript.
It became clear that using Rust, compiled to WASM, can deliver huge performance improvements to web applications.
WASM can outperform JavaScript in every way when having to do heavy calculations.  
Operations on large sets of data, or operations which require efficient memory management, are goods candidates to move to WASM.
For example, when you have to process a lot of JSON data that needs to be rendered onto some chart.

WASM is binary assembler-like code, which renders it as good as unreadable for a mere mortal.
That too may be a consideration for moving code towards Rust.
