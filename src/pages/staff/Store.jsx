import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Modal,
  Card,
  message,
  Input,
  Divider,
  Popconfirm,
  Tag,
} from "antd";
import { IoAdd, IoCloseOutline } from "react-icons/io5";
import { RiSubtractFill } from "react-icons/ri";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import Receipt from "../../components/receipt/Receipt";
import product_default from "../../assets/product-default.png";
import { useAuthConfig } from "../../context/AppState";
import DotLoader from "react-spinners/DotLoader";

const Store = () => {
  const [loading, setLoading] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [receiptId, setReceiptId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const { baseUrl, token } = useAuthConfig();
  const receiptRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [receiptData, setReceiptData] = useState(null);

  const fetchProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data.products || []);
    } catch (error) {
      messageApi.error("Failed to fetch products.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [baseUrl, token]);

  const handleProductClick = (product) => {
    const index = cart.findIndex((item) => item._id === product._id);
    // console.log("selected product", product);
    // Parse dimensions if they exist (e.g., "1.6mx2.3m")
    let initialLength = 0;
    let initialWidth = 0;

    if (product.size && product.size.toLowerCase().includes("x")) {
      const dimensions = product.size
        .split(/x/i)
        .map((dim) => dim.replace(/[^\d.]/g, "").trim());
      initialLength = Number(dimensions[0]) || 0;
      initialWidth = Number(dimensions[1]) || 0;
    }

    if (index !== -1) {
      const updatedCart = [...cart];
      updatedCart[index].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          length: initialLength,
          width: initialWidth,
          // Use new 'price' field
          negotiatedPrice: product.price || 0,
        },
      ]);
    }
  };

  // Check if any SQM item has missing or zero dimensions
  const isInvalidCart = cart.some(
    (item) =>
      item.pricingType === "sqm" &&
      (Number(item.length) <= 0 || Number(item.width) <= 0),
  );

  const updateCartItem = (index, field, value) => {
    const updatedCart = [...cart];
    updatedCart[index][field] = value === "" ? "" : Number(value);
    setCart(updatedCart);
  };

  const calculateItemTotal = (item) => {
    if (item.pricingType === "sqm") {
      // Total = Length * Width * Negotiated Price * Quantity
      return (
        (item.length || 0) *
        (item.width || 0) *
        (item.negotiatedPrice || 0) *
        (item.quantity || 1)
      );
    } else {
      // Fixed: Total = Negotiated Price * Quantity
      return (item.negotiatedPrice || 0) * (item.quantity || 1);
    }
  };

  const logReceipt = async () => {
    if (cart.length === 0) return messageApi.warning("Cart is empty");

    setIsModalVisible(true);
    setReceiptLoading(true);

    try {
      const payload = {
        products: cart.map((item) => ({
          productId: item._id,
          quantitySold: Number(item.quantity) || 1,
          length: Number(item.length) || 0,
          width: Number(item.width) || 0,
          negotiatedPrice: Number(item.negotiatedPrice) || 0,
          pricingType: item.pricingType,
          // Explicitly passing type for backend calcs
        })),
        customerName: customerName || "Walking Customer",
        customerPhone: customerPhone || "N/A",
      };

      const { data } = await axios.post(
        `${baseUrl}/receipts/preview`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log(data)
      setReceiptData(data.receipt);
      setReceiptId(data.receipt._id);
      setReceiptNumber(data.receipt.receiptCode);
    } catch (error) {
      messageApi.error("Failed to generate receipt preview.");
      setIsModalVisible(false);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onBeforePrint: async () => {
      setLoading(true);
      try {
        await axios.post(
          `${baseUrl}/receipts/finalize`,
          { receiptId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        messageApi.success("Sale completed successfully!");
        fetchProducts(true);
        return true;
      } catch (error) {
        messageApi.error(error.response?.data?.message || "Sale failed.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    onAfterPrint: () => {
      setIsModalVisible(false);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
    },
  });

  // console.log("this is the cart items", cart)

  return (
    <div className="p-6 min-h-screen">
      {contextHolder}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Products List */}
        <div className="lg:w-2/3 w-full">
          <Input
            placeholder="Search rugs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="large"
            allowClear
            className="mb-5 shadow-sm"
          />

          {loading ? (
            <div className="flex justify-center py-20">
              <DotLoader color="#2563eb" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products
                .filter((p) =>
                  p.title.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((product) => (
                  <Card
                    key={product._id}
                    hoverable
                    onClick={() =>
                      product.quantity > 0 && handleProductClick(product)
                    }
                    className={`rounded-xl transition-all border-none shadow-sm ${
                      product.quantity === 0
                        ? "opacity-50 grayscale cursor-not-allowed"
                        : "hover:shadow-md"
                    }`}
                    cover={
                      <div className="bg-gray-50 rounded-t-xl p-2 h-36 flex items-center justify-center relative">
                        {/* {product.quantity <= 5 && product.quantity > 0 && (
                            <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                               Low Stock
                            </span>
                         )} */}
                        <img
                          alt="product"
                          src={product.image || product_default}
                          className="h-full object-cover w-fill"
                        />
                      </div>
                    }
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {product.category?.name || "Uncategorized"}
                      </div>
                      <div
                        className="font-bold text-sm truncate"
                        title={product.title}
                      >
                        {product.title}
                      </div>

                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-blue-600 font-extrabold text-sm">
                          ₦{(product.price || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {product.pricingType === "sqm" ? "/m²" : "/unit"}
                        </span>
                      </div>

                      <div className="text-[11px] font-medium text-gray-600">
                        Size:{" "}
                        <span className="text-black">
                          {product.size || "N/A"}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Checkout Cart Section */}
        <div className="lg:w-1/3 w-full">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
              Cart Items
              <Tag color="blue">{cart.length}</Tag>
            </h2>

            <div className="!space-y-3  mb-4">
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-md"
              />
              <Input
                placeholder="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="rounded-md"
              />
            </div>

            <Divider className="my-3" />

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {cart.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Cart is empty. Click a product to add.
                </div>
              )}
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-lg p-3 bg-gray-50 relative group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold text-gray-800 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-blue-600 uppercase">
                        {item.pricingType === "sqm"
                          ? "Measured (SQM)"
                          : "Fixed Unit"}
                      </div>
                    </div>

                    <IoCloseOutline
                      className="text-gray-400 hover:text-red-500 cursor-pointer text-lg transition-colors"
                      onClick={() =>
                        setCart(cart.filter((_, i) => i !== index))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="flex flex-col">
                      <label className="text-[9px] text-gray-500 ml-1">
                        L (m)
                      </label>
                      <Input
                        type="number"
                        min="0" // Stops the UI arrows from going below 0
                        disabled={item.pricingType === "fixed"}
                        value={item.length ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;

                          // BLOCK NEGATIVES: If the user types '-' or a number < 0,
                          // we stop the function here so updateCartItem never runs.
                          if (val !== "" && parseFloat(val) < 0) return;

                          updateCartItem(index, "length", val);
                        }}
                        className="!text-xs"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[9px] text-gray-500 ml-1">
                        W (m)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        disabled={item.pricingType === "fixed"}
                        value={item.width ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;

                          // BLOCK NEGATIVES
                          if (val !== "" && parseFloat(val) < 0) return;

                          updateCartItem(index, "width", val);
                        }}
                        className="!text-xs"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[9px] text-gray-500 ml-1">
                        Rate (₦)
                      </label>
                      <Input
                        type="number"
                        // size="small"
                        value={item.negotiatedPrice}
                        onChange={(e) =>
                          updateCartItem(
                            index,
                            "negotiatedPrice",
                            e.target.value,
                          )
                        }
                        className="!text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                    <div className="flex items-center gap-2">
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                        onClick={() =>
                          updateCartItem(
                            index,
                            "quantity",
                            Math.max(1, item.quantity - 1),
                          )
                        }
                      >
                        <RiSubtractFill size={14} />
                      </button>

                      <span className="min-w-[20px] text-center font-bold text-xs text-gray-700">
                        {item.quantity}
                      </span>

                      <button
                        className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition"
                        onClick={() =>
                          updateCartItem(index, "quantity", item.quantity + 1)
                        }
                      >
                        <IoAdd size={14} />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">Subtotal</div>
                      <div className="text-xs font-bold text-blue-700">
                        ₦{calculateItemTotal(item).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-bold text-lg text-black">
                  ₦
                  {cart
                    .reduce((sum, item) => sum + calculateItemTotal(item), 0)
                    .toLocaleString()}
                </span>
              </div>
              <Button
  type="primary"
  block
  size="large"
  className="h-12 border-none font-bold shadow-lg"
  onClick={logReceipt}
  // Disabled if: Cart is empty OR there's an invalid dimension
  disabled={cart.length === 0 || isInvalidCart}
>
  Proceed to Payment
</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={900}
        footer={[
          <Button
            key="close"
            onClick={() => setIsModalVisible(false)}
            className="rounded-md"
          >
            Back to Cart
          </Button>,

          <Popconfirm
            key="confirm"
            title="Confirm Transaction"
            description="Is payment confirmed?"
            okText="Yes, Finalize Sale"
            cancelText="Wait"
            onConfirm={handlePrint}
          >
            <Button
              type="primary"
              className="bg-blue-600 rounded-md font-bold"
              loading={loading}
            >
              Print Receipt & Close
            </Button>
          </Popconfirm>,
        ]}
      >
        {receiptLoading ? (
          <div className="h-60 flex justify-center items-center">
            <DotLoader color="#2563eb" />
          </div>
        ) : (
          <Receipt
            ref={receiptRef}
            receiptData={receiptData}
            receiptNumber={receiptNumber}
            product={cart}
          />
        )}
      </Modal>
    </div>
  );
};

export default Store;
