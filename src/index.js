import inquirer from "inquirer";
import clipboardy from "clipboardy";

let lastSearchResults;
let searchTerm;
let dependencyFormat;

function formatDependency(dependency) {
    switch (dependencyFormat.toLowerCase()) {
        case 'gradlekts':
        case 'gradle':
            return formatDependencyGradleKotlin(dependency);
        case 'gradlegroovy':
            return formatDependencyGradleGroovy(dependency);
        case 'sbt':
            return formatDependencySbt(dependency);
        case 'maven':
        default:
            return formatDependencyXml(dependency);
    }
}

function formatDependencyXml(dependency) {
    return `
        <dependency>
            <groupId>${dependency.groupId}</groupId>
            <artifactId>${dependency.artifactId}</artifactId>
            <version>${dependency.versions[0]}</version>
        </dependency>
        `;
}

function formatDependencyGradleKotlin(dependency) {
    return `
        implementation("${dependency.groupId}:${dependency.artifactId}:${dependency.versions[0]}")
        `;
}

function formatDependencyGradleGroovy(dependency) {
    return `
        implementation '${dependency.groupId}:${dependency.artifactId}:${dependency.versions[0]}'
        `;
}

function formatDependencySbt(dependency) {
    return `
        libraryDependencies += "${dependency.groupId}" % "${dependency.artifactId}" % "${dependency.versions[0]}"
        `;
}

function versionSearchResponseArrived(resp) {
    const hits = JSON.parse(resp).response.docs;
    if (hits.length === 0) {
        console.log("no result");
        return;
    }
    let needle = hits[0];
    const filtered = lastSearchResults.filter(e => e.groupId === needle.g && e.artifactId === needle.a);
    if (filtered.length === 0) {
        console.warn(`could not find ${needle.groupId}:${needle.artifactId}`);
        return;
    }
    const target = filtered[0];
    hits.forEach(e => target.versions.push(e.v));
    console.log(target.versions)
}

function mvnSearchResponseArrived(resp) {
    const hits = JSON.parse(resp).response.docs;

    if (hits.length === 0) {
        console.error(`no results`)
        newSearch();
        return;
    }

    lastSearchResults = hits.map(val => {
        return {
            groupId: val.g,
            artifactId: val.a,
            packaging: val.p,
            versions: [val.latestVersion]
        };
    });

    const choices = lastSearchResults.map(result => {
        return {
            name: result.groupId + ":" + result.artifactId + ":" + result.versions[0],
            value: result
        };

    });
    inquirer.prompt({
        type: "list",
        name: "coordinates",
        "pageSize": 30,
        choices
    }).then(answers => {
        const ans = answers.coordinates;
        console.log(formatDependency(ans));
        inquirer.prompt([
            {
                "type": "list",
                "name": "action",
                "choices": [
                    {
                        "name": "Copy to clipboard",
                        "value": "copyToClipboard"
                    },
                    {
                        "name": "Search older versions",
                        "value": "searchOlderVersions"
                    },
                    {
                        "name": "Start a new search",
                        "value": "newSearch"
                    },
                    {
                        "name": "quit",
                        "value": "quit"
                    }
                ]
            }
        ]).then(answers => {
            const action = answers.action;
            switch (action) {
                case "quit":
                    break;
                case "newSearch":
                    newSearch();
                    break;
                case "copyToClipboard":
                    clipboardy.writeSync(formatDependency(ans))
                    break;
                case "searchOlderVersions":
                    fetch("https://search.maven.org/solrsearch/select?rows=98&q=g:" + ans.groupId + "+AND+a:" + ans.artifactId + "&core=gav")
                        .then(resp => resp.text())
                        .then(versionSearchResponseArrived);
                    break;
            }
        });
    });
}

function newSearch() {
    inquirer.prompt([
        {
            "type": "input",
            "name": "search term"
        }
    ]).then(answer => startSearch(answer["search term"]));
}

function startSearch(searchTerm) {
    fetch("https://search.maven.org/solrsearch/select?rows=100&q=" + searchTerm).then(resp => resp.text())
    .then(mvnSearchResponseArrived);
}

export function search(term, format) {
    searchTerm = term || '';
    dependencyFormat = format || 'maven';
    if (searchTerm.trim() === "") {
        newSearch();
    } else {
        startSearch(searchTerm);
    }
}
