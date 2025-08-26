"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ProductType } from "@/types";

const Dashboard: React.FC = () => {
    const router = useRouter();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const { authToken } = useMyAppHook();
    const [products, setProducts] = useState<ProductType[]>([]);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [formData, setFormData] = useState<ProductType>({
        title: "",
        description: "",
        cost: 0,
        image_Url: "",
        banner_image: null
    })
    useEffect(() => {
        if (!authToken) {
            router.push("/auth");
            return;
        }
        fetchAllProducts();
    }, [authToken])

    const fetchAllProducts = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            setProducts(response.data.product)
        } catch (error) {
            console.log("fetch all product error : " + error);
        }
    }
    const handleOnChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFormData({
                ...formData,
                banner_image: event.target.files[0],
                image_Url: URL.createObjectURL(event.target.files[0])
            })
        } else {
            setFormData({
                ...formData,
                [event.target.name]: event.target.value,
            })
        }
    }
    const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            if (isEdit) {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products/${formData.id}`, {
                    ...formData,
                    "_method": "PUT"
                }, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${authToken}`
                    }
                })
                toast.success(response.data.message);
                fetchAllProducts();
            } else {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products/`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${authToken}`
                    }
                })
                if (response.data.status) {
                    fetchAllProducts();
                    toast.success(response.data.message)
                    setFormData({
                        title: "",
                        description: "",
                        cost: 0,
                        image_Url: "",
                        banner_image: null
                    })
                    if (fileRef.current) {
                        fileRef.current.value = "";
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    const handleDeleteProduct = async (id: number | undefined) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                        headers: {
                            Authorization: `Bearer ${authToken}`
                        }
                    })
                    if (response.data.status) {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Your file has been deleted.",
                            icon: "success"
                        });
                        fetchAllProducts();
                    }
                } catch (error) {
                    console.log(error)
                }

            }
        });
    }
    return <>
        <div className="container mx-auto mt-8 px-4">
            <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h4 className="text-xl font-semibold mb-4">{isEdit ? "Edit" : "Add"} Product</h4>
                        <form onSubmit={handleOnSubmit} >
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                name="title"
                                placeholder="Title"
                                value={formData.title}
                                onChange={handleOnChangeEvent}
                                required />
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleOnChangeEvent}
                                required />
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                name="cost"
                                placeholder="Cost"
                                type="number"
                                value={formData.cost}
                                onChange={handleOnChangeEvent}
                                required />
                            <div className="mb-4">
                                {formData.image_Url && typeof formData.image_Url === 'string' && <Image
                                    src={formData.image_Url}
                                    alt="Preview"
                                    id="bannerPreview"
                                    width={100} height={100} />
                                }
                            </div>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                type="file"
                                ref={fileRef}
                                onChange={handleOnChangeEvent}
                                id="bannerInput" />
                            <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300" type="submit">{isEdit ? "Update" : "Add"} Product</button>
                        </form>
                    </div>
                </div>

                <div className="w-full md:w-1/2 px-4">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Title</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Banner</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Cost</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                products.map((singleProduct) => (
                                    <tr key={singleProduct.id}>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-700">{singleProduct.id}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-700">{singleProduct.title}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-700">
                                            {
                                                singleProduct.banner_image && typeof singleProduct.banner_image === 'string' ?
                                                    <Image src={singleProduct.banner_image} alt="Product" width={50} height={50} /> : "no image"
                                            }
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-700">${singleProduct.cost}</td>
                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-700">
                                            <button className="bg-yellow-500 text-white py-1 px-3 rounded-md text-sm hover:bg-yellow-600 transition-colors duration-300 mr-2" onClick={() => {
                                                setFormData({
                                                    id: singleProduct.id,
                                                    title: singleProduct.title,
                                                    cost: singleProduct.cost || 0, // Ensure cost is a number
                                                    description: singleProduct.description,
                                                    image_Url: singleProduct.banner_image && typeof singleProduct.banner_image === 'string' ? singleProduct.banner_image : ""
                                                })
                                                setIsEdit(true)
                                            }}>Edit</button>
                                            <button className="bg-red-600 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700 transition-colors duration-300" onClick={() => handleDeleteProduct(singleProduct.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}

export default Dashboard;
