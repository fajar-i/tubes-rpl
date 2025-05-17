"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { myAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
interface ProductType {
    id?: number,
    title?: string,
    description?: string,
    cost?: number,
    image_Url?: string | null,
    banner_image?: File | null
}

const Dashboard: React.FC = () => {
    const router = useRouter();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const { isLoading, authToken } = myAppHook();
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
            console.log(response)
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
                console.log(formData)
                console.log(response)
            }
        } catch (error) {
            console.log(error);
        }
    }
    const handleDeleteProduct = async (id: number) => {
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
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6">
                    <div className="card p-4">
                        <h4>{isEdit ? "Edit" : "Add"} Product</h4>
                        <form onSubmit={handleOnSubmit} >
                            <input
                                className="form-control mb-2"
                                name="title"
                                placeholder="Title"
                                value={formData.title}
                                onChange={handleOnChangeEvent}
                                required />
                            <input
                                className="form-control mb-2"
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleOnChangeEvent}
                                required />
                            <input
                                className="form-control mb-2"
                                name="cost"
                                placeholder="Cost"
                                type="number"
                                value={formData.cost}
                                onChange={handleOnChangeEvent}
                                required />
                            <div className="mb-2">
                                {formData.image_Url && <Image
                                    src={formData.image_Url}
                                    alt="Preview"
                                    id="bannerPreview"
                                    width={100} height={100} />
                                }
                            </div>
                            <input
                                className="form-control mb-2"
                                type="file"
                                ref={fileRef}
                                onChange={handleOnChangeEvent}
                                id="bannerInput" />
                            <button className="btn btn-primary" type="submit">{isEdit ? "Update" : "Add"} Product</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-6">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Banner</th>
                                <th>Cost</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                products.map((singleProduct, index) => (
                                    <tr key={singleProduct.id}>
                                        <td>{singleProduct.id}</td>
                                        <td>{singleProduct.title}</td>
                                        <td>
                                            {
                                                singleProduct.banner_image ?
                                                    <Image src={singleProduct.banner_image} alt="Product" width={50} height={50} /> : "no image"
                                            }
                                        </td>
                                        <td>${singleProduct.cost}</td>
                                        <td>
                                            <button className="btn btn-warning btn-sm me-2" onClick={() => {
                                                setFormData({
                                                    id: singleProduct.id,
                                                    title: singleProduct.title,
                                                    cost: singleProduct.cost,
                                                    description: singleProduct.description,
                                                    image_Url: singleProduct.banner_image
                                                })
                                                setIsEdit(true)
                                            }}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(singleProduct.id)}>Delete</button>
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