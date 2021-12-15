import fetch from 'node-fetch';

const core = require('@actions/core');
const github = require('@actions/github');
const EventSource = require('eventsource');

// most @actions toolkit packages have async methods
async function run() {
    try {
        const image = core.getInput('image', { required: true });
        if ( image == "" ) {
            core.setFailed("image is a required input");
            return;
        }
        const ghrepo = github.context.repo;
        const ref = `github.com/${ghrepo.owner}/${ghrepo.repo}%${image}#${github.context.sha}`
        const b5apisrv = core.getInput('barney-api-server', { required: true });
        if ( b5apisrv == "" ) {
            core.setFailed("barney-api-server is a required input");
            return;
        }
        core.info( `building ${ref} on ${b5apisrv}` )
        fetch(`${b5apisrv}/job`, {
            method: 'post',
            body: `{ "snapshot-spec": "${ref}" }`,
            headers: {'Content-Type': 'application/json; version=v0'}
        }).then(res => {
            if (!res.ok) {
                core.setFailed(`job creation failed: ${res.status}`)
                return;
            }
            const jobStatus = res.headers.get('location');
            core.info(`Created job: ${jobStatus}`);
            var es = new EventSource(`${b5apisrv}${jobStatus}`, {
                headers: {'Accept': 'text/event-stream; version=v0'}
            });
            function waitForJobCompletion(resolve, reject) {
                es.addEventListener('replace', function (event) {
                    var jobrec = JSON.parse(event.data);
                    var jobrecPretty = JSON.stringify(jobrec, null, 2);
                    core.info(`Job ${jobrec.id} ${jobrec.status}\nJob record: ${jobrecPretty}`);
                    if (jobrec.status == 'passed') {
                        resolve(jobrec.status);
                    } else if (jobrec.status != 'running') {
                        reject(jobrec.status);
                    }
                });
            }
            var waiter = new Promise(waitForJobCompletion);
            waiter.then((status) => {
                core.info(`Job ${status}`);
                es.close();
            }).catch(status => {
                core.setFailed(`Job \u001b[38;2;255;0;0m${status}`);
                es.close();
            })
        }).catch(error => {
            core.setFailed(error);
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
