# Hijack.js

Hijack.js is a small script that grabs a web page and appends it to the current page.
It allows you to modify/extend a site without modifying it directly or requiring any browser plugins.

### Here be dragons

This script does terrible things to your web pages and is probably full of bugs.
Don't use it until you are absolutely sure it really is the best solution to your problem.


### Usage
Hijack.js defines two global functions:

`hijack(url)`: Simply pass a url. Done.

`Hijack(url)`: Constructor function. Use it to overwrite any prototype properties.
