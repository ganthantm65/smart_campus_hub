import { createProxyMiddleware } from "http-proxy-middleware";

const userProxy = createProxyMiddleware({
    target: "http://localhost:8002",
    changeOrigin: true,
    proxyTimeout: 10000,
    timeout: 10000,

    onError(err, req, res) {
        console.error("User Service Proxy Error:", err);

        res.status(500).json({
            success: false,
            message: "User Service Unavailable"
        });
    }
});

export default userProxy;