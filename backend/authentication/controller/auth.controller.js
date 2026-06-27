import authService from '../service/auth.service.js';

class AuthController {

    register = async (req, res) => {
        try {
            const { username, password, email, role } = req.body;

            const result = await authService.register(
                username,
                password,
                email,
                role
            );

            if (result?.success === false) {
                return res.status(400).json(result);
            }

            return res.status(201).json({
                success: true,
                message: "User registered successfully"
            });

        } catch (error) {
            console.error("Register Controller Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            if (!result.success) {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error("Login Controller Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
}

export default new AuthController();