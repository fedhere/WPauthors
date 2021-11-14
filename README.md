# Rubin LSST Science Collaborations Cadence White Paper by SC

https://observablehq.com/@f7f7156e50925896/rubin-lsst-science-collaborations-cadence-white-paper-by-s@694

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@4
npm install https://api.observablehq.com/d/3a9d15f30115a092@694.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "@f7f7156e50925896/rubin-lsst-science-collaborations-cadence-white-paper-by-s";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
