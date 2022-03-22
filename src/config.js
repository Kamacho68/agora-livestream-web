module.exports = function() {
    switch (process.env.NODE_ENV) {
        case 'development':
            return {
                // Pass your app ID here.
                appId: "15bd8f34ad054b3db9a2e133f8424e17",
                // Set the channel name.
                channel: "demo_channel_name",
                // Pass a token if your project enables the App Certificate.
                token: null,
                uid: null,
            };

        case 'production':
            return { // Pass your app ID here.
                appId: "15bd8f34ad054b3db9a2e133f8424e17",
                // Set the channel name.
                channel: "prod_channel_name",
                // Pass a token if your project enables the App Certificate.
                token: null,
                uid: null,
            };
        default:
            return null;
    }
};