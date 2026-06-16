import { createProxyMiddleware } from "http-proxy-middleware";

const authProxy = createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    proxyTimeout: 10000,
    timeout: 10000,
    // No fixRequestBody needed anymore! The stream is pristine.
    onError(err, req, res) {
        console.error("Proxy Error:", err);
        res.status(500).send("Proxy Error");
    }
});

export default authProxy;