// import { useEffect, useState } from "react";
// import {
//   Button,
//   Table,
//   Input,
//   Modal,
//   Form,
//   Upload,
//   message,
//   Row,
//   Col,
//   DatePicker,
//   Dropdown,
//   Select,
// } from "antd";
// import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
// import dots from "../../assets/dots.png";
// import { NavLink } from "react-router";
// import { useAuthConfig } from "../../context/AppState";
// import axios from "axios";
// import productImg from "../../assets/product-default.png";
// import DotLoader from "react-spinners/DotLoader";
// import {
//   Dialog,
//   DialogBackdrop,
//   DialogPanel,
//   DialogTitle,
// } from "@headlessui/react";
// import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// import moment from "moment";
// import dayjs from "dayjs";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// dayjs.extend(isSameOrBefore);

// const Product = () => {
//   const { baseUrl, token, user } = useAuthConfig();
//   const [isOpen, setIsOpen] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [form] = Form.useForm();
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [messageApi, contextHolder] = message.useMessage();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [productToDelete, setProductToDelete] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [productBeingEdited, setProductBeingEdited] = useState(null);

//   const handleCancelProductModal = () => {
//     setIsOpen(false);
//     form.resetFields();
//     setImagePreview(null);
//     setImageFile(null);
//     setIsEditing(false);
//     setProductBeingEdited(null);
//   };

//   const onFinish = async (values) => {
//     const isEdit = isEditing && productBeingEdited?._id;

//     const productUrl = isEdit
//       ? `${baseUrl}/product/${productBeingEdited._id}`
//       : `${baseUrl}/add-product`;

//     const formData = new FormData();

//     formData.append("title", values.title);
//     formData.append("description", values.description);
//     formData.append("pricePerSquareMeter", values.pricePerSquareMeter);
//     formData.append("bulkPrice", values.bulkPrice);
//     formData.append("isTrending", values.isTrending || false);
//     formData.append("isDiscount", values.isDiscount || false);
//     formData.append("discountAmount", values.discountAmount || 0);
//     formData.append("quantity", values.quantity);
//     formData.append("size", values.size);

//     formData.append("category", values.category);

//     if (imageFile) {
//       formData.append("image", imageFile);
//     }

//     try {
//       setLoading(true);

//       const method = isEdit ? "patch" : "post";

//       const res = await axios[method](productUrl, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       messageApi.success(
//         `Product ${isEdit ? "updated" : "added"} successfully`,
//       );

//       await fetchProducts();
//       handleCancelProductModal();
//     } catch (error) {
//       messageApi.error(
//         error.response?.data?.message ||
//           `Error ${isEdit ? "updating" : "adding"} product`,
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCategories = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}/get-cat`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCategories(
//         Array.isArray(response.data.categories) ? response.data.categories : [],
//       );
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message ||
//         "An error occurred while fetching categories";
//       messageApi.open({ type: "error", content: errorMessage });
//     }
//   };

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${baseUrl}/products`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setProducts(response.data.products);
//       setFilteredProducts(response.data.products);
//     } catch (error) {
//       messageApi.open({
//         type: "error",
//         content: error.response?.data?.message || "Failed to fetch products",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       getCategories();
//       fetchProducts();
//     }
//   }, [baseUrl, token]);

//   const dataSource = filteredProducts.map((product, index) => ({
//     key: product._id || index.toString(),
//     title: product.title,
//     pricePerSquareMeter: product.pricePerSquareMeter,
//     bulkPrice: product.bulkPrice,
//     quantity: product.quantity,
//     size: product.size,
//     manufacturingDate: moment(product.manufacturingDate).format("YYYY-MM-DD"),
//     image: product.image,
//     category: product.category?.name || "N/A",
//   }));

//   const columns = [
//     {
//       title: "S/N",
//       dataIndex: "key",
//       key: "key",
//       render: (_text, _record, index) => index + 1,
//     },
//     {
//       title: "Product Image",
//       key: "image",
//       render: (_text, record) => (
//         <img
//           src={record.image ? `${record.image}` : productImg}
//           alt={record.title}
//           style={{ width: 50, height: 50, objectFit: "cover" }}
//         />
//       ),
//     },
//     { title: "Product Name", dataIndex: "title", key: "title" },
//     { title: "Category", dataIndex: "category", key: "category" },

//     {
//       title: "Price / m²",
//       dataIndex: "pricePerSquareMeter",
//       key: "pricePerSquareMeter",
//     },
//     { title: "Size", dataIndex: "size", key: "size" },
//     { title: "Quantity", dataIndex: "quantity", key: "quantity" },
//     {
//       title: "Maf. Date",
//       dataIndex: "manufacturingDate",
//       key: "manufacturingDate",
//     },

//     {
//       title: "Actions",
//       key: "operations",
//       render: (_record) => (
//         <Dropdown
//           menu={{
//             items: [
//               {
//                 key: "view",
//                 label: (
//                   <NavLink
//                   // to={`/product/${_record.key}`}
//                   // state={{ record: _record }}
//                   >
//                     View Product
//                   </NavLink>
//                 ),
//               },
//               {
//                 key: "edit",
//                 label: (
//                   <span
//                     onClick={() => {
//                       const selectedProduct = products.find(
//                         (p) => p._id === _record.key,
//                       );
//                       if (selectedProduct) {
//                         setIsEditing(true);
//                         setIsOpen(true);
//                         setProductBeingEdited(selectedProduct);
//                         form.setFieldsValue({
//                           ...selectedProduct,
//                           manufacturingDate: dayjs(
//                             selectedProduct.manufacturingDate,
//                           ),
//                           expiryDate: dayjs(selectedProduct.expiryDate),
//                           category:
//                             selectedProduct.category?._id ||
//                             selectedProduct.category,
//                           sizes: selectedProduct.sizes || [],
//                           isTrending: selectedProduct.isTrending || false,
//                           isDiscount: selectedProduct.isDiscount || false,
//                           discountAmount: selectedProduct.discountAmount || 0,
//                         });
//                         setImagePreview(selectedProduct.image || null);
//                       }
//                     }}
//                   >
//                     Edit
//                   </span>
//                 ),
//               },

//               {
//                 key: "delete",
//                 label: (
//                   <span
//                     onClick={() => {
//                       setProductToDelete(_record);
//                       setIsModalVisible(true);
//                     }}
//                   >
//                     Delete
//                   </span>
//                 ),
//               },
//             ],
//           }}
//           trigger={["click"]}
//         >
//           <Button>
//             <img src={dots} alt="Actions" className="w-1" />
//           </Button>
//         </Dropdown>
//       ),
//     },
//   ];

//   const handleCancel = () => {
//     setIsModalVisible(false);
//     setProductToDelete(null);
//   };

//   const deleteProduct = async (_record) => {
//     setLoading(true);
//     if (loading) return;
//     if (!_record || !_record.key) return;

//     const productId = _record.key;
//     try {
//       const response = await axios.delete(`${baseUrl}/product/${productId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       messageApi.open({
//         type: "success",
//         content: "Product deleted successfully",
//       });
//       fetchProducts();
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message ||
//         "An error occurred while deleting the product";
//       messageApi.open({ type: "error", content: errorMessage });
//     } finally {
//       setIsModalVisible(false);
//       setProductToDelete(null);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-2">
//       {contextHolder}
//       <Dialog
//         open={isModalVisible}
//         onClose={handleCancel}
//         className="relative z-10"
//       >
//         <DialogBackdrop
//           transition
//           className="fixed inset-0 bg-gray-500/75 transition-opacity"
//         />

//         <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//             <DialogPanel
//               transition
//               className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
//             >
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
//                     <ExclamationTriangleIcon
//                       aria-hidden="true"
//                       className="size-6 text-red-600"
//                     />
//                   </div>
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                     <DialogTitle
//                       as="h3"
//                       className="text-base font-semibold text-gray-900"
//                     >
//                       Are you sure you want to delete this product?
//                     </DialogTitle>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
//                 <button
//                   type="button"
//                   onClick={() => deleteProduct(productToDelete)}
//                   className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
//                 >
//                   {loading ? "Deleting..." : "Delete"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </DialogPanel>
//           </div>
//         </div>
//       </Dialog>
//       <div className="flex justify-between items-center my-4">
//         <Button
//           type="primary"
//           onClick={() => setIsOpen(true)}
//           className="!bg-black"
//           size="midium"
//         >
//           Add Product <PlusOutlined />
//         </Button>
//       </div>
//       {loading ? (
//         <div className="flex justify-center items-center my-4 h-60 bg-white">
//           <DotLoader />
//         </div>
//       ) : (
//         // Show the table only after the data has been fetched
//         <Table
//           columns={columns}
//           dataSource={dataSource}
//           size="small"
//           pagination={{
//             pageSize: 7,
//             position: ["bottomCenter"],
//             className: "custom-pagination",
//           }}
//           className="custom-table"
//           scroll={{ x: "max-content" }}
//         />
//       )}

//       <Modal
//         title={isEditing ? "Edit Product" : "Add Product"}
//         open={isOpen}
//         onCancel={handleCancelProductModal}
//         footer={null}
//       >
//         <Form form={form} name="product" layout="vertical" onFinish={onFinish}>
//           <Row gutter={[16, 16]}>
//             <Col span={12}>
//               <Form.Item
//                 label="Product Name"
//                 name="title"
//                 className="mb-2"
//                 rules={[
//                   { required: true, message: "Please input product name!" },
//                 ]}
//               >
//                 <Input placeholder="Enter product name" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 label="Price / sqm"
//                 name="pricePerSquareMeter"
//                 className="mb-2"
//                 rules={[
//                   { required: true, message: "Please input unit price!" },
//                 ]}
//               >
//                 <Input placeholder="Enter unit price" type="number" />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={[16, 16]}>
//             <Col span={12}>
//               <Form.Item
//                 label="Quantity"
//                 name="quantity"
//                 className="mb-2"
//                 rules={[{ required: true, message: "Please input quantity!" }]}
//               >
//                 <Input placeholder="Enter quantity" type="number" />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item
//                 label="Size"
//                 name="size"
//                 className="mb-2"
//                 // normalize processes the value every time it changes
//                 normalize={(value) => {
//                   if (!value) return value;

//                   // 1. Convert to lowercase
//                   // 2. Remove all spaces (removes space even if user hits spacebar)
//                   let cleaned = value.toLowerCase();

//                   // 3. Auto-insert "mx" logic (Optional but helpful)
//                   // If user types "2.3" and it doesn't have 'm' yet, make it "2.3mx"
//                   if (/^\d+(\.\d+)?$/.test(cleaned) && cleaned.length >= 3) {
//                     return `${cleaned}mx`;
//                   }

//                   return cleaned;
//                 }}
//               >
//                 <Input
//                   placeholder="e.g. 1.6mx2.3m"
//                   type="text"
//                   className="lowercase"
//                 />
//               </Form.Item>
//             </Col>
//           </Row>

//           {/* Image Upload Section */}
//           <Row gutter={[16, 16]}>
//             <Col span={12}>
//               <Form.Item label="Product Image">
//                 <Upload
//                   accept="image/*"
//                   name="image"
//                   showUploadList={false} // Prevent the automatic upload
//                   beforeUpload={(file) => {
//                     const isJpgOrPng =
//                       file.type === "image/jpeg" || file.type === "image/png";
//                     if (!isJpgOrPng) {
//                       message.error("You can only upload JPG/PNG file!");
//                     }
//                     const isLt2M = file.size / 1024 / 1024 < 2;
//                     if (!isLt2M) {
//                       message.error("Image must smaller than 2MB!");
//                     }
//                     setImageFile(file); // Store the file in state
//                     const reader = new FileReader();
//                     reader.onload = () => {
//                       setImagePreview(reader.result); // Set the preview of the image
//                     };
//                     reader.readAsDataURL(file);
//                     return false; // Prevent file from being uploaded automatically
//                   }}
//                 >
//                   <Button icon={<UploadOutlined />}>Click to Upload</Button>
//                 </Upload>
//                 {imagePreview && (
//                   <img
//                     src={imagePreview}
//                     alt="preview"
//                     style={{
//                       width: "100px",
//                       marginTop: "10px",
//                       height: "100px",
//                     }}
//                   />
//                 )}
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item
//                 label="Category"
//                 name="category"
//                 className="mb-2"
//                 rules={[
//                   { required: true, message: "Please select a category!" },
//                 ]}
//               >
//                 <Select
//                   placeholder="Select category"
//                   options={categories.map((cat) => ({
//                     value: cat._id,
//                     label: cat.name,
//                   }))}
//                 />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row>
//             <Form.Item
//               label="Is Trending"
//               name="isTrending"
//               valuePropName="checked"
//               className="!-mb-0"
//             >
//               <Input type="checkbox" />
//             </Form.Item>
//           </Row>

//           <Col>
//             <Form.Item
//               label="Description"
//               name="description"
//               className="mb-2"
//               rules={[
//                 {
//                   required: true,
//                   message: "Please input product description!",
//                 },
//               ]}
//             >
//               <Input.TextArea
//                 placeholder="Enter product description"
//                 style={{ resize: "none" }}
//               />
//             </Form.Item>
//           </Col>

//           <div className="flex justify-end mt-4">
//             <Form.Item>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 loading={loading}
//                 block
//                 className="!bg-black"
//               >
//                 {isEditing ? "Update Product" : "Add Product"}
//               </Button>
//             </Form.Item>
//           </div>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default Product;


import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Input,
  Modal,
  Form,
  Upload,
  message,
  Row,
  Col,
  Dropdown,
  Select,
  Tag,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import dots from "../../assets/dots.png";
import { NavLink } from "react-router";
import { useAuthConfig } from "../../context/AppState";
import axios from "axios";
import productImg from "../../assets/product-default.png";
import DotLoader from "react-spinners/DotLoader";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const Product = () => {
  const { baseUrl, token } = useAuthConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [productBeingEdited, setProductBeingEdited] = useState(null);

  const pricingType = Form.useWatch("pricingType", form);

  const handleCancelProductModal = () => {
    setIsOpen(false);
    form.resetFields();
    setImagePreview(null);
    setImageFile(null);
    setIsEditing(false);
    setProductBeingEdited(null);
  };

  const onFinish = async (values) => {
    const isEdit = isEditing && productBeingEdited?._id;
    const productUrl = isEdit ? `${baseUrl}/product/${productBeingEdited._id}` : `${baseUrl}/add-product`;
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("pricingType", values.pricingType);
    formData.append("isTrending", values.isTrending || false);
    formData.append("quantity", values.quantity);
    formData.append("size", values.size || "N/A");
    formData.append("category", values.category);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setLoading(true);
      const method = isEdit ? "patch" : "post";
      await axios[method](productUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      messageApi.success(`Product ${isEdit ? "updated" : "added"} successfully`);
      await fetchProducts();
      handleCancelProductModal();
    } catch (error) {
      messageApi.error(error.response?.data?.message || `Error ${isEdit ? "updating" : "adding"} product`);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/get-cat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(response.data.categories) ? response.data.categories : []);
    } catch (error) {
      messageApi.error("An error occurred while fetching categories");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getCategories();
      fetchProducts();
    }
  }, [baseUrl, token]);

  const dataSource = filteredProducts.map((product, index) => ({
    key: product._id || index.toString(),
    title: product.title,
    // Fallback to old field name if new one is missing to prevent UI crashes
    price: product.price || product.pricePerSquareMeter || 0, 
    pricingType: product.pricingType || "sqm",
    quantity: product.quantity,
    size: product.size,
    createdAt: moment(product.createdAt).format("YYYY-MM-DD"),
    image: product.image,
    category: product.category?.name || "N/A",
  }));

  const columns = [
    {
      title: "S/N",
      key: "sn",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Image",
      key: "image",
      render: (_text, record) => (
        <img
          src={record.image ? `${record.image}` : productImg}
          alt={record.title}
          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "4px" }}
        />
      ),
    },
    { title: "Product Name", dataIndex: "title", key: "title" },
    { 
      title: "Type", 
      dataIndex: "pricingType", 
      key: "pricingType",
      render: (type) => (
        <Tag color={type === "sqm" ? "blue" : "green"}>
          {type === "sqm" ? "Per SQM" : "Fixed Price"}
        </Tag>
      )
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      // FIXED: Added (val || 0) to prevent toLocaleString error
      render: (val, record) => `₦${(val || 0).toLocaleString()} ${record.pricingType === 'sqm' ? '/m²' : ''}`
    },
    { title: "Size", dataIndex: "size", key: "size" },
    { title: "Qty", dataIndex: "quantity", key: "quantity" },
    {
      title: "Actions",
      key: "operations",
      render: (_record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: (
                  <span
                    onClick={() => {
                      const selectedProduct = products.find((p) => p._id === _record.key);
                      if (selectedProduct) {
                        setIsEditing(true);
                        setIsOpen(true);
                        setProductBeingEdited(selectedProduct);
                        form.setFieldsValue({
                          ...selectedProduct,
                          price: selectedProduct.price || selectedProduct.pricePerSquareMeter,
                          pricingType: selectedProduct.pricingType || "sqm",
                          category: selectedProduct.category?._id || selectedProduct.category,
                        });
                        setImagePreview(selectedProduct.image || null);
                      }
                    }}
                  >
                    Edit
                  </span>
                ),
              },
              {
                key: "delete",
                label: (
                  <span
                    className="text-red-600"
                    onClick={() => {
                      setProductToDelete(_record);
                      setIsModalVisible(true);
                    }}
                  >
                    Delete
                  </span>
                ),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text">
            <img src={dots} alt="Actions" className="w-1" />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const handleDeleteConfirmed = async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`${baseUrl}/product/${productToDelete.key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      messageApi.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setIsModalVisible(false);
      setProductToDelete(null);
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      {contextHolder}
      
      <Dialog open={isModalVisible} onClose={() => setIsModalVisible(false)} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                    <ExclamationTriangleIcon className="size-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle className="text-base font-semibold text-gray-900">
                      Delete Product
                    </DialogTitle>
                    <p className="text-sm text-gray-500">Are you sure? This action cannot be undone.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <div className="flex justify-between items-center my-4">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <Button
          type="primary"
          onClick={() => {
            setIsEditing(false);
            form.resetFields();
            form.setFieldsValue({ pricingType: "sqm" });
            setIsOpen(true);
          }}
          className="!bg-black"
        >
          Add Product <PlusOutlined />
        </Button>
      </div>

      {loading && !isOpen ? (
        <div className="flex justify-center items-center my-4 h-60 bg-white">
          <DotLoader color="#000" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={dataSource}
          size="small"
          pagination={{ pageSize: 7, position: ["bottomCenter"] }}
          scroll={{ x: "max-content" }}
        />
      )}

      <Modal
        title={isEditing ? "Edit Product" : "Add Product"}
        open={isOpen}
        onCancel={handleCancelProductModal}
        footer={null}
      >
        <Form form={form} name="product" layout="vertical" onFinish={onFinish} initialValues={{ pricingType: "sqm" }}>
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Form.Item label="Pricing Type" name="pricingType" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: "sqm", label: "Sold by Square Meter (Carpets)" },
                    { value: "fixed", label: "Fixed Unit Price (Center Rugs)" },
                  ]}
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item label="Product Name" name="title" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={pricingType === "sqm" ? "Price / m²" : "Unit Price"} name="price" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="0.00" type="number" prefix="₦" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Stock Quantity" name="quantity" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="0" type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Size Description"
                name="size"
                normalize={(value) => {
                  if (!value) return value;
                  let cleaned = value.toLowerCase();
                  if (/^\d+(\.\d+)?$/.test(cleaned) && cleaned.length >= 3) {
                    return `${cleaned}mx`;
                  }
                  return cleaned;
                }}
              >
                <Input placeholder="e.g. 1.6mx2.3m or Large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Category" name="category" rules={[{ required: true, message: "Required" }]}>
                <Select
                  placeholder="Select"
                  options={categories.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Product Image">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      message.error("Image must be smaller than 2MB!");
                      return false;
                    }
                    setImageFile(file);
                    const reader = new FileReader();
                    reader.onload = () => setImagePreview(reader.result);
                    reader.readAsDataURL(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} className="w-full">Upload Image</Button>
                </Upload>
                {imagePreview && (
                  <div className="mt-2 text-center">
                    <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover inline-block rounded border" />
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Trending Item" name="isTrending" valuePropName="checked">
                <Select options={[{value: true, label: 'Yes'}, {value: false, label: 'No'}]} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Description" name="description" rules={[{ required: true, message: "Required" }]}>
                <Input.TextArea placeholder="Enter details..." style={{ resize: "none" }} rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" loading={loading} block className="!bg-black h-10 mt-2">
            {isEditing ? "Update Product" : "Save Product"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Product;