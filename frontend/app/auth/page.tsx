"use client";
import React, { useEffect, useState } from "react";
import { myAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
interface formData {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
}
const Auth: React.FC = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFormData] = useState<formData>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const { login, register, authToken, isLoading } = myAppHook();
    useEffect(() => {
        if (authToken) {
            router.push("home");
            return;
        }
    }, [authToken, isLoading]);
    const handleOnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }
    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLogin) {
            try {
                await login(formData.email, formData.password)
             } catch (error) {
                console.log(`Auth error: ${error}`)
            }
        }
        else {
            try {
                await register(formData.name!, formData.email, formData.password, formData.password_confirmation!)
            } catch (error) {
                console.log(`Auth error: ${error}`)
            }
        }
    }
    return (
        <>
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="card p-4" style={{ width: "400px" }}>
                    <h3 className="text-center">{isLogin ? "Login" : "Register"}</h3>
                    <form onSubmit={handleFormSubmit}>
                        {!isLogin && (
                            <input
                                className="form-control mb-2"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleOnChangeInput}
                                placeholder="Name"
                                required
                            />
                        )}
                        <input
                            className="form-control mb-2"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleOnChangeInput}
                            placeholder="Email"
                            required
                        />
                        <input
                            className="form-control mb-2"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleOnChangeInput}
                            placeholder="Password"
                            required
                        />
                        {!isLogin && (
                            <input
                                className="form-control mb-2"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={handleOnChangeInput}
                                placeholder="Confirm Password"
                                required
                            />
                        )}
                        <button className="btn btn-primary w-100" type="submit">
                            {isLogin ? "Login" : "Register"}
                        </button>
                    </form>
                    <p className="mt-3 text-center">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ cursor: "pointer", color: "#0d6efd" }}
                        >
                            {isLogin ? "Register" : "Login"}
                        </span>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Auth;
