import pool from '../db/postgres.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../db/redis.js';

class AuthService{
    async register(username,password,email,role){
        const hashedPassword=await bcrypt.hash(password,10);
        const client=await pool.connect();
        try{
            const role_id=await this.findRoleByRoleName(role);
            if(role_id==null){
                throw new Error("Invalid role");
            }
            if(await this.existByEmail(email)){
                throw new Error("Email already exists");
            }
            const query="INSERT INTO users (name,password,email,role_id) VALUES ($1,$2,$3,$4) RETURNING user_id";
            const values=[username,hashedPassword,email,role_id];
            const res=await client.query(query,values);

            return {success:true,message:"User registered successfully",user_id:res.rows[0].user_id};

        }catch(err){
            return {success:false,message:err.message};
        }
    }

    async login(email,password){
        const client = await pool.connect();
        const query = "SELECT user_id, password FROM users WHERE email=$1";
        const values = [email];
        try{
            const res = await client.query(query,values);
            if(res.rows.length==0){
                return {success:false,message:"Invalid email or password"};
            }
            const user=res.rows[0];
            const isMatch=await bcrypt.compare(password,user.password);
            if(!isMatch){
                return {success:false,message:"Invalid email or password"};
            }
            const token=await jwt.sign({user_id:user.user_id},"supersecretkeyforjwt",{expiresIn:'1h'});

            await redisClient.setEx(`auth:${user.user_id}`, 3600, token);
            return {success:true,message:"Login successful",token};
        }catch(err){
            console.error("Error during login:", err);
            return {success:false,message:"An error occurred during login"};
        }
    }

    async existByEmail(email){
        const client=await pool.connect();
        const query="SELECT email FROM users WHERE email=$1";
        const values=[email];
        try{
            const res=await client.query(query,values);
            return res.rows.length>0;
        }catch(err){
            console.error("Error checking email existence:", err);
            return false;
        }
    }

    async findRoleByRoleName(roleName){
        const client=await pool.connect();
        const query="SELECT role_id FROM role WHERE role_name=$1";
        const values=[roleName];
        try{
            const res=await client.query(query,values);
            if(res.rows.length>0){
                return res.rows[0].role_id;
            }else{
                return null;
            }
        }catch(err){
            console.error("Error finding role:", err);
            return null;
        }
    }
}

export default new AuthService();