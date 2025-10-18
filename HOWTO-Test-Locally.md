# WebUI Development and Test

## Compiling

WebUI is compiled with the "gulp" packager program that runs on top of nodejs.  Search the
web for how to install nodejs and gulp on your system.  Once gulp is present, run this in
the top-level directory.

```
$ gulp package --lang en
```

That will create an "index.html.gz" file in the top directory, and an non-compressed
version in "dist/index.html".

If you omit `--lang en`, it will create a file with support for many different languages,
but the file will probably be too large to fit on an ESP32's local flash filesystem.
A single alternative language might fit.  For example, you could add German support
with `gulp package --lang de`

## Testing

You can upload index.html.gz to a FluidNC ESP32 machine and run it
from there by browsing to the FluidNC IP address.  That is the normal
way of using WebUI.

Alternatively, for a quicker test of a new build, you can avoid the upload step by
starting a proxy server with:

```
$ python fluidnc-web-sim.py
```

Then browse to "localhost:8080" instead of directly to the FluidNC IP address.

The proxy serves the "dist/index.html" file directly for the initial
load of WebUI, bypassing the FluidNC system for the index file.  The
proxy forwards all other communication over to the FluidNC machine.

By default, the proxy tries to find the FluidNC machine by using MDNS
to "fluidnc.local".  If that does not work, you can supply the FluidNC
IP address on the command line, as with:

```
$ python fluidnc-web-sim.py 192.168.1.25
```

