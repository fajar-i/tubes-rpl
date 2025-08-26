"use client";
import Loader from "@/components/Loader";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from 'js-cookie';
import { usePathname, useRouter } from "next/navigation";
import { AppProviderType, UserType } from "@/types"; // Import UserType
import { AxiosInstance } from "@/lib/axios";

const AppContext = createContext<AppProviderType | undefined>(undefined)

export const AppProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [authToken, setAuthToken] = useState<string | null>(null)
    const [user, setUser] = useState<UserType | null>(null); // Added user state
    const router = useRouter()
    const pathname = usePathname();

    const fetchUser = async (token: string) => {
        try {
            const response = await AxiosInstance.get(`/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.status) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.log("Error fetching user data:", error);
            // Optionally, log out if user data cannot be fetched
            logout();
        }
    };

    useEffect(() => {
        const token = Cookies.get("authToken")
        if (token) {
            setAuthToken(token);
            fetchUser(token); // Fetch user data if token exists
        }
        setIsLoading(false);
    }, [pathname, router]);
    
    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const response = await AxiosInstance.post(`/login`, { email, password })

            if (response.data.status) {
                Cookies.set("authToken", response.data.token, { expires: 7 });
                setAuthToken(response.data.token);
                await fetchUser(response.data.token); // Fetch user data after successful login
                router.push("/dashboard");
                toast.success("Login successfull");
            } else {
                toast.error("Invalid login details");
            }
        } catch (error) {
            console.log(`Auth error: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }
    const register = async (name: string, email: string, password: string, password_confirmation: string) => {
        setIsLoading(true)
        try {
            const response = await AxiosInstance.post(`/register`, { name, email, password, password_confirmation })
            toast.success(response.data.message);
        } catch (error) {
            toast.error("registration failed, username already exist");
            console.log(`Auth error: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }
    const logout = () => {
        setAuthToken(null);
        setUser(null); // Clear user data on logout
        Cookies.remove("authToken");
        setIsLoading(false);
        toast.success("User Logged Out");
        router.push("/auth")
    }
    return (
        <AppContext.Provider value={{ login, register, isLoading, setIsLoading, authToken, logout, user }}>
            {isLoading ? <Loader /> : children}
        </AppContext.Provider>
    )
}

export const useMyAppHook = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("Context will be wrapped inside AppProvider")
    return context
}
