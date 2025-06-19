gulp package -en to build with english language


# ESP3D-WEBUI 
[Latest stable release ![Release Version](https://img.shields.io/github/v/release/luc-github/ESP3D-WEBUI?color=green&include_prereleases&style=plastic) ![Release Date](https://img.shields.io/github/release-date/luc-github/ESP3D-WEBUI.svg?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/releases/latest/) [![Travis (.org) branch](https://img.shields.io/travis/luc-github/ESP3D-WEBUI/2.1?style=plastic)](https://travis-ci.org/github/luc-github/ESP3D-WEBUI)   

[Latest development version ![Development Version](https://img.shields.io/badge/Devt-v3.0-yellow?style=plastic) ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/luc-github/ESP3D-WEBUI/3.0?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/tree/3.0) [![Travis (.org) branch](https://img.shields.io/travis/luc-github/ESP3D-WEBUI/3.0?style=plastic)](https://travis-ci.org/github/luc-github/ESP3D-WEBUI)     

## What is it?
A web configuration tool for ESP3D 2.1
Originally based on great UI from Jarek Szczepanski (imrahil): [smoothieware-webui](http://imrahil.github.io/smoothieware-webui/) to get a multi firmware support for [Repetier](https://github.com/repetier/Repetier-Firmware), [Repetier for Davinci printer](https://github.com/luc-github/Repetier-Firmware-0.92), [Marlin](https://github.com/MarlinFirmware), [Marlin Kimbra](https://github.com/MagoKimbra/MarlinKimbra) and of course [Smoothieware](https://github.com/Smoothieware/Smoothieware)
But then heavily modified to support the Maslow M4, and upgraded to avoid using gulp (which is now abandonware).

## Why do it?
Originally [smoothieware-webui](http://imrahil.github.io/smoothieware-webui/) was ported to support [ESP3D firmware](https://github.com/luc-github/ESP3D) and it was working pretty well and gave :[smoothieware-webui-for-ESP3D](https://github.com/luc-github/smoothieware-webui-for-ESP3D) 
But this UI had 2 big limitations:    
1 - it needed internet access to get all libraries available to download, which may not happen when ESP is in AP mode for configuration if you do not have all js/css in your browser cache, or if you want to use in local environment, in that case not only ESP AP mode is not displaying UI properly but also STA mode - so it made the ESP useless

2 - it relied on server availability and certificate check, there were several certificate failures for unknown reasons that made the UI not work

So the solution was to make all resources available - easy no ?

Yes but!  ESP webserver is a convenient but also a very light webserver, allowing no more than 5 active connections at once and with a pretty limited filesystem space, so even concatenating all resources like bootstrap, icons and other libraries does not work as expected and does not fit the available space.

So a full rewrite using pure javascript and resized resources:    
1 - a compressed css based on [bootstrap](http://getbootstrap.com/css/)   
2 - a local limited version of svg based of [Glyphicons Halflings](http://glyphicons.com/) to get a small footprint.    
3 - a customized version of [smoothiecharts](http://smoothiecharts.org/) is used to display temperatures charts, it is simple and perfectly sized for the current purpose   

The result is a monolithic file with a minimal size allowing almost full control of ESP3D board and your 3D printer / CNC machine

## Build it yourself
* Package managing, building, bundling, testing all rely on [bun](https://bun.sh/) so start by getting bun.
* Get a clone of this repository in whatever way suits you best.
* Package Management: From the command line in your newly cloned copy of this repo, run `bun install` to get all of the dependencies.
* Build and Bundle: From the command line run `bun build:en` to build and bundle an English language only version. You'll find it in the `dist` folder.

## Become a sponsor or a supporter
 * A sponsor is a recurent donater [<img src="https://raw.githubusercontent.com/luc-github/ESP3D/3.0/images/sponsors-supporters/sponsor.PNG" />](https://github.com/sponsors/luc-github)
 The github sponsors are automaticaly displayed by github, if your tier is `A big hug` or more, to thank you for your support, your logo / avatar will be also added to the readme page with eventually with a link to your site.    

 * A supporter is one time donater [<img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG_global.gif" border="0" alt="PayPal – The safer, easier way to pay online.">](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y8FFE7NA4LJWQ)    
 If your donation is over a per year sponsor tier `A big hug`, to thank you for your support, your logo / avatar will be added to the readme page with eventually with a link to your site    

 Every support is welcome, giving support/ developing new features need time and devices, donations contribute a lot to make things happen, thank you.

## Features
- It supports several firmwares based on Repetier, Marlin, Smoothieware and GRBL.
- It allows to fully configure ESP wifi
- It has a macro support to add custom commands in UI by adding buttons launching some GCODE files from SD or ESP 
- It supports several languages, check list [here](https://github.com/luc-github/ESP3D-WEBUI/wiki/Translation-support)
- It allows to display a web camera in UI or detached
- It allows to edit the Repetier EEPROM, Smoothieware config file, Marlin and GRBL settings
- It allows to update the ESP3D by uploading the FW
- it allows to control and monitor your 3D printer in every aspect (position, temperature, print, SD card content, custom command

Please look at screenshots:
Main tab and menu:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Full1.PNG'/>   
Control panel:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/controls.PNG'/>  
Macro dialog:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Macro.PNG'/>   
Temperatures panel:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/temperatures.PNG'/>   
Extruder panel:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/esxtruders.PNG'/>  
SD card panel:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD1.PNG'/>  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD1.5.PNG'/>   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD2.PNG'/>  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD-Dir.PNG'/>  
Camera Tab:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Camera.PNG'/>  
Repetier EEPROM Editor tab:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Repetier.PNG'/>  
Smoothieware config Editor tab:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/smoothieware.PNG'/>  
Marlin config Editor tab:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Marlin.PNG'/>  
GRBL config Editor tab: 
<img src='https://user-images.githubusercontent.com/8822552/37540735-60bada08-2958-11e8-92ee-69aee4b83e7a.png'/> 
ESP3D settings Editor:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/ESP3D1.PNG'/>  
ESP3D Status:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/status.PNG'/>   
ESP3D SPIFFS:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SPIFFS.PNG'/>   


## Installation
Please use the latest [ESP3D firmware](https://github.com/luc-github/ESP3D/tree/2.1.x) and copy the index.html.gz file on root of SPIFFS, in theory ESP3D have a version of web-ui but it may not be the latest one

## Contribution / development
Check wiki section [Contribution/Development](https://github.com/luc-github/ESP3D-WEBUI/wiki/Compilation---Development)

## Issues / Questions
You can submit ticket [here](https://github.com/luc-github/ESP3D-WEBUI/issues) or open discussion if it is not an issue [here](https://github.com/luc-github/ESP3D-WEBUI/discussions) or Join the chat at [![Discord server](https://img.shields.io/discord/752822148795596940?color=blue&label=discord&logo=discord)](https://discord.gg/Z4ujTwE)   


 
