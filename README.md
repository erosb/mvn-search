# `mvn-search` - command-line tool for searching maven central

This is a utility for developers who prefer searching maven dependencies in the command line instead of the web UI of
search.maven.org

![Searching demo](output.gif "Searching demo")

## Installation 

Prerequisite: node `10.9.0` or newer should be installed.

<!-- Installation:
 - download the latest release from the [releases page](https://github.com/erosb/mvn-search/releases)
 - extract the zip
 - optional: set up the following alias: `alias mvn-search="node <ZIP-EXTRACTION-DIR>/index.js"`
  -->

```bash
npm install -g @erosb/mvn-search
```

## Usage: `mvn-search <query-string>`

This will list the found artifacts with their latest version numbers. After selecting the coordinates the tool displays
the maven `<dependency>` tag to be pasted into the `pom.xml`.


### Examples:

 * `mvn-search hibernate-validator`
 * `mvn-search g:org.slf4j`
 
## Screenshots

![Searching by coordinates](https://github.com/erosb/mvn-search/raw/master/screenshot-1.png "Searching by coordinates")
![Displaying dependency](https://github.com/erosb/mvn-search/raw/master/screenshot-2.png "Displaying dependency")
