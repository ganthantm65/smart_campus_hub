import { createProxyMiddleware } from "http-proxy-middleware";

const courseProxy=createProxyMiddleware({
    target:"http://localhost:8003",
    changeOrigin:true,
    proxyTimeout:10000,
    timeout:10000,
    onError(err,req,res){
        console.error("User Service Proxy Error:", err);

        res.status(500).json({
            success: false,
            message: "Course Service Unavailable"
        });
    }
})

export default courseProxy