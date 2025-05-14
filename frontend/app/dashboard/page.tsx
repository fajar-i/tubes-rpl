import React from "react";
import Image from "next/image";
const Dashboard: React.FC = () => {
    return <>
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6">
                    <div className="card p-4">
                        <h4>Add Product</h4>
                        <form>
                            <input className="form-control mb-2" name="title" placeholder="Title" required />
                            <input className="form-control mb-2" name="description" placeholder="Description" required />
                            <input className="form-control mb-2" name="cost" placeholder="Cost" type="number" required />
                            <div className="mb-2">
                                {/* <Image src="#" alt="Preview" id="bannerPreview" width={100} height={100} style={{display: "none"}} /> */}
                            </div>
                            <input className="form-control mb-2" type="file" id="bannerInput" />
                            <button className="btn btn-primary" type="submit">Add Product</button>
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
                            <tr>
                                <td>1</td>
                                <td>Sample Product</td>
                                <td></td>
                                {/* <td><Image src="#" alt="Product" style={{width: "50px", height: "50px"}}/></td> */}
                                <td>$100</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2">Edit</button>
                                    <button className="btn btn-danger btn-sm">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}

export default Dashboard;