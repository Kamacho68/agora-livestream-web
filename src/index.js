import style from './main.css';
import component from './component.js';
import AgoraRTC from "agora-rtc-sdk-ng";
import "regenerator-runtime/runtime";
var Config = require('./config'),
    conf = new Config();

document.body.append(component());

/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err) {
    console.log("Error : ", err);
};

var localTracks = {
    videoTrack: null,
    audioTrack: null
};
var remoteUsers = {};

const rtc = {
    // For the local client.
    client: null,
    // For the local audio and video tracks.
    localAudioTrack: null,
    localVideoTrack: null,
};

const options = {
    // Pass your app ID here.
    appId: conf.appId,
    // Set the channel name.
    channel: conf.channel,
    // Pass a token if your project enables the App Certificate.
    token: null,
};

function handleUserPublished(user, mediaType) {
    const uid = user.uid;
    remoteUsers[uid] = user;
    subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
    const uid = user.uid;
    delete remoteUsers[uid];
    if (!!document.querySelector('[id="remote-playerlist"]')) {
        document.querySelector('[id="remote-playerlist"]').innerHTML = '';
    }
}

async function startBasicCall() {

    /**
     * mode determines the channel profile. 
     *  1) "rtc" mode for one-to-one or group calls
     *  2) "live" mode for live broadcasts.
     * 
     * codec specifies the codec that the web browser uses for encoding and decoding.
     * If Safari 12.1 or earlier is involved in the call, set codec as "h264". In all other cases, 
     * Agora recommends setting codec as "vp8".
     */
    rtc.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });


    window.onload = function() {

        disableButton(document.querySelector('[id="leave"]'));

        document.getElementById("join").onclick = async function(event) {
                if (!!document.querySelector('[id="channel"]').value) {
                    event.preventDefault();
                    conf.channel = (!!document.querySelector('[id="channel"]').value) ? document.querySelector('[id="channel"]').value : conf.channel;

                    rtc.client.setClientRole("host");
                    await join();
                }
            }
            // document.getElementById("audience-join").onclick = async function() {
            //     console.log('Troubleshooting on audience-join > Join as audience');
            // }
        document.getElementById("leave").onclick = async function() {
            leaveCall();
        }
    }
}

async function subscribe(user, mediaType) {

    const uid = user.uid;
    // subscribe to a remote user
    await rtc.client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        const playerContainer = document.createElement("div");
        playerContainer.id = 'player-wrapper-' + user.uid.toString();
        playerContainer.className = 'player-wrapper';
        const p = document.createElement("p");
        p.className = "player-name";
        p.innerHTML = 'Guest: ' + user.uid.toString();
        const div = document.createElement("div");
        div.id = 'player-' + user.uid.toString();
        div.className = 'player';
        playerContainer.appendChild(p);
        playerContainer.appendChild(div);
        const remotePlayerlist = document.querySelector('[id="remote-playerlist"]');
        remotePlayerlist.append(playerContainer);
        user.videoTrack.play(`player-${uid}`);
    }
    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}

async function join() {

    rtc.client.on("user-published", handleUserPublished);
    rtc.client.on("user-unpublished", handleUserUnpublished);

    [options.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
        // join the channel
        rtc.client.join(options.appId, conf.channel, options.token || null),
        // create local tracks, using microphone and camera
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
    ]);
    // play local video track
    localTracks.videoTrack.play("local-player");
    document.querySelector('[id="local-player-name"]').textContent = 'Host: ' + options.uid;

    // publish local tracks to channel
    await rtc.client.publish(Object.values(localTracks));
    disableButton(document.querySelector('[id="join"]'));
    enableButton(document.querySelector('[id="leave"]'));
}

/**
 * Leave the channel
 * 1) Destroy the local audio and video tracks that you have created and disable access to the camera and microphone.
 * 2)n Destroy the dynamically created DIV container.
 * Call leave to leave the channel.
 */
async function leaveCall() {
    // Destroy the local audio and video tracks.
    for (var trackName in localTracks) {
        var track = localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            localTracks[trackName] = undefined;
        }
    }
    // remove all remoteUsers
    // remoteUsers = {};

    // Traverse all remote users.
    rtc.client.remoteUsers.forEach(user => {
        // Destroy the dynamically created DIV container.
        const playerContainer = document.getElementById('player-wrapper-' + user.uid);
        playerContainer && playerContainer.remove();
        delete remoteUsers[user.uid];
    });

    // Leave the channel.
    await rtc.client.leave();
    disableButton(document.querySelector('[id="leave"]'));
    enableButton(document.querySelector('[id="join"]'));
    document.querySelector('[id="local-player-name"]').textContent = '';
    document.querySelector('[id="remote-playerlist"]').innerHTML = '';
}

async function disableButton(element) {
    element.disabled = true;
    element.style.opacity = '.65';
    element.style.cursor = 'default';
}

async function enableButton(element) {
    element.disabled = false;
    element.style.opacity = '1';
    element.style.cursor = 'pointer';
}

startBasicCall();