import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { getProfile } from "../services/authService";
import { Link } from "react-router-dom";
import api from "../services/api";
import Tilt3D from "../components/Tilt3D";

function CustomerDashboard() {
  const { user, updateUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [openChatOrderId, setOpenChatOrderId] = useState(null);
  const [placingCartOrder, setPlacingCartOrder] = useState(false);
  const [message, setMessage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState(null);
  const [paymentOrderTotal, setPaymentOrderTotal] = useState(0);
  const [showQrCode, setShowQrCode] = useState(false);

  const formatOrderDateTime = (value) => {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const getOrderItems = (order) => {

    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items;
    }

    if (order.order_type === "product") {
      return [
        {
          product_id: order.product_id,
          product_name: order.Product?.name || "Product removed",
          quantity: order.quantity,
          product_price: Number(order.Product?.price || 0),
          total_price: Number(order.total_price || 0),
        },
      ];
    }

    return [];
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  const cartQuantity = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        updateUser(profile);
      } catch (error) {
        console.log(error);
      }
    };

    loadProfile();
    fetchProducts();
    fetchMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      const data = res.data;
      setOrders(Array.isArray(data) ? data : Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.log(error);
      setOrders([]);
    }
  };

  const fetchOrderChat = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/chat`);
      setChatMessages((prev) => ({ ...prev, [orderId]: res.data.messages || [] }));
      setOpenChatOrderId((prev) => (prev === orderId ? null : orderId));
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Something went wrong while loading chat.");
    }
  };

  const sendChatMessage = async (orderId) => {
    try {
      const text = chatInputs[orderId] || "";
      if (!text.trim()) {
        setMessage("Please write a chat message before sending.");
        return;
      }
      const res = await api.post(`/orders/${orderId}/chat`, { message: text });
      setChatInputs((prev) => ({ ...prev, [orderId]: "" }));
      setChatMessages((prev) => ({ ...prev, [orderId]: res.data.messages || [] }));
      setMessage("Chat message sent successfully.");
      fetchMyOrders();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Something went wrong while sending the chat message.");
    }
  };

  const addToCart = (product) => {
    const quantity = Number(quantities[product.id] || 1);

    if (!quantity || quantity < 1) {
      setMessage("Please enter a valid quantity.");
      return;
    }

    if (quantity > Number(product.stock)) {
      setMessage(`Only ${product.stock} items are available for ${product.name}.`);
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product_id === product.id);

      if (existingItem) {
        const nextQuantity = existingItem.quantity + quantity;

        if (nextQuantity > Number(product.stock)) {
          setMessage(`You cannot add more than ${product.stock} items for ${product.name}.`);
          return prev;
        }

        return prev.map((item) =>
          item.product_id === product.id
            ? {
              ...item,
              quantity: nextQuantity,
              total_price: Number((nextQuantity * Number(product.price)).toFixed(2)),
            }
            : item
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_price: Number(product.price),
          quantity,
          stock: Number(product.stock),
          total_price: Number((quantity * Number(product.price)).toFixed(2)),
        },
      ];
    });

    setMessage(`${product.name} added to your order selection.`);
  };

  const updateCartQuantity = (productId, value) => {
    const nextQuantity = Number(value);
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    if (!nextQuantity || nextQuantity < 1) {
      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
      return;
    }

    if (nextQuantity > Number(product.stock)) {
      setMessage(`Only ${product.stock} items are available for ${product.name}.`);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
            ...item,
            quantity: nextQuantity,
            stock: Number(product.stock),
            total_price: Number((nextQuantity * Number(product.price)).toFixed(2)),
          }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const placeCartOrder = async () => {
    if (cartItems.length === 0) {
      setMessage("Please add at least one product before confirming your order.");
      return;
    }

    const shouldProceed = window.confirm(
      "Please confirm your selected products. Once confirmed, your order will be placed for admin approval."
    );

    if (!shouldProceed) {
      return;
    }

    setPlacingCartOrder(true);
    setMessage("");

    try {
      await api.post("/orders", {
        order_type: "product",
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      setMessage("Order placed successfully. Your selected products are now waiting for admin approval.");
      setCartItems([]);
      setQuantities({});
      await fetchMyOrders();
      await fetchProducts();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Something went wrong while placing the order.");
    } finally {
      setPlacingCartOrder(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`);
      setMessage("Order cancelled successfully.");
      fetchMyOrders();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Something went wrong while cancelling the order.");
    }
  };

  const renderChatPanel = (orderId) =>
    openChatOrderId === orderId ? (
      <div className="brand-note mt-3 bg-slate-50/80 p-3">
        <div className="brand-input max-h-48 overflow-y-auto !py-3">
          {(chatMessages[orderId] || []).length > 0 ? (
            chatMessages[orderId].map((chat, index) => (
              <div key={`${orderId}-${index}`} className="mb-3">
                <p className="text-xs font-semibold uppercase text-gray-500">{chat.sender}</p>
                <p className="text-sm text-gray-800">{chat.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No chat messages yet.</p>
          )}
        </div>
        <textarea
          className="brand-input mt-3 text-sm"
          rows="2"
          placeholder="Type message to admin"
          value={chatInputs[orderId] || ""}
          onChange={(e) =>
            setChatInputs((prev) => ({ ...prev, [orderId]: e.target.value }))
          }
        />
        <button
          className="mt-2 brand-btn-3d brand-btn-blue px-3 py-1.5"
          onClick={() => sendChatMessage(orderId)}
        >
          Send Chat
        </button>
      </div>
    ) : null;

  return (
    <div className="brand-page">
      <Navbar />
      <div className="brand-container py-8 lg:py-12">

        <div className="brand-panel brand-reveal mb-6 px-6 py-7 md:px-8">
          <p className="brand-kicker">Customer Dashboard</p>
          <h2 className="brand-title mt-2 !text-3xl">Welcome, {user?.name || "Customer"}</h2>
          <p className="mt-3 text-sm text-slate-600">
            Email: {user?.email || "-"} | Phone: {user?.phone || "-"}
          </p>
        </div>
        {message && <div className="brand-note brand-note-blue mb-6">{message}</div>}
        <div className="brand-panel brand-reveal brand-reveal-2 mb-8 border-green-200/60 bg-gradient-to-b from-[#f2fbf5]/95 to-[#e6f7ec]/85 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-green-900">Selected Products</h2>
              <p className="mt-1 text-sm text-green-800">
                Add multiple products, review your order, then confirm once to place it.
              </p>
            </div>
            <div className="brand-tile px-4 py-3 text-sm">
              <p>Total Items: {cartQuantity}</p>
              <p className="mt-1 font-semibold">Estimated Total: Rs. {cartTotal.toFixed(2)}</p>
            </div>
          </div>
          {cartItems.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="brand-table">
                <thead>
                  <tr className="text-left">
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.product_id} className="border-t">
                      <td className="p-3">{item.product_name}</td>
                      <td className="p-3">Rs. {item.product_price}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          className="brand-input w-24 !px-3 !py-2"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.product_id, e.target.value)}
                        />
                      </td>
                      <td className="p-3">Rs. {Number(item.total_price).toFixed(2)}</td>
                      <td className="p-3">
                        <button
                          className="brand-btn-3d brand-btn-red px-3 py-1.5"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="brand-btn-3d brand-btn-green px-5 py-3"
                  onClick={placeCartOrder}
                  disabled={placingCartOrder}
                >
                  {placingCartOrder ? "Placing Order..." : "Confirm And Place Order"}
                </button>
                <button
                  className="brand-btn-3d brand-btn-gray px-5 py-3"
                  onClick={() => setCartItems([])}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-green-900">
              No products selected yet. Add products below to prepare one order with multiple items.
            </p>
          )}
        </div>
        <h2 className="brand-title mb-4 !text-3xl">All Products</h2>
        <div className="mb-6">
          <Link to="/order">
            <button className="brand-btn-3d brand-btn-green px-5 py-3">
              Custom Box Order
            </button>
          </Link>
          <Link to="/invoices" className="ml-3">
            <button className="brand-button-dark px-5 py-3">
              View Invoices
            </button>
          </Link>
        </div>
        <div className="brand-scene mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const isCustomProduct =
              product.name === "Custom Size Box" || product.name === "Custom Design Box";
            return (
              <Tilt3D key={product.id} max={8} lift={10} className="brand-tile h-full p-5">
                <img
                  src={product.image_url
                    ? product.image_url
                    : product.image_data
                    ? product.image_data
                  : "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="brand-image-3d mb-4 h-40 w-full rounded-2xl bg-white/70 object-contain p-2"
                />
                <h3 className="brand-layer-1 text-xl font-black tracking-tight">{product.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{product.description || "Standard packaging product"}</p>
                {product.name === "Custom Size Box" && <p className="mt-2 text-sm text-blue-700">Use the custom box order form for custom size requirement.</p>}
                {product.name === "Custom Design Box" && <p className="mt-2 text-sm text-blue-700">Use the custom box order form for custom design requirement.</p>}
                <p className="mt-3 text-lg font-black tracking-tight text-green-700">Rs. {product.price}</p>
                <p className="mt-1 text-sm text-gray-700">Stock: {product.stock}</p>
                <div className="mt-4 flex gap-3">
                  <input
                    type="number"
                    min="1"
                    className="brand-input w-24 !px-3 !py-2"
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      setQuantities((prev) => ({ ...prev, [product.id]: e.target.value }))
                    }
                    disabled={isCustomProduct}
                  />
                  {isCustomProduct ? (
                    <Link to="/order" className="flex-1">
                      <button className="brand-btn-3d brand-btn-blue w-full px-4 py-2">
                        Custom Box Order
                      </button>
                    </Link>
                  ) : (
                    <button
                      className="brand-btn-3d brand-btn-blue px-4 py-2"
                      onClick={() => addToCart(product)}
                      disabled={Number(product.stock) <= 0}
                    >
                      {Number(product.stock) > 0 ? "Add To Order" : "Out of Stock"}
                    </button>
                  )}
                </div>
              </Tilt3D>
            );
          })}
        </div>
        <h2 className="brand-title mb-4 !text-3xl">My Order History</h2>
        <table className="brand-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date & Time</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Approval Status</th>
              <th>Payment Status</th>
              <th>Chat</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{formatOrderDateTime(order.createdAt)}</td>
                  <td>
                    {order.order_type === "custom" ? (
                      `Custom Box (${order.box_length} x ${order.box_width} x ${order.box_height})`
                    ) : (
                      <div className="space-y-1">
                        {getOrderItems(order).map((item, index) => (
                          <p key={`${order.id}-${item.product_id || index}`}>
                            {item.product_name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>{order.quantity}</td>
                  <td>Rs. {order.total_price}</td>
                  <td>{order.status}</td>
                  <td className="font-semibold text-blue-700">{order.payment_status || "Unpaid"}</td>
                  <td>
                    {renderChatPanel(order.id)}
                  </td>
                  <td>
                    <button
                      className="brand-btn-3d brand-btn-blue mb-2 w-full px-3 py-1.5"
                      onClick={() => fetchOrderChat(order.id)}
                    >
                      Chat
                    </button>
                    {(order.payment_status !== "Paid" && order.status === "Completed") && (
                      <button
                        className="brand-btn-3d brand-btn-green mb-2 w-full px-3 py-1.5"
                        onClick={() => {
                          setPaymentOrderId(order.id);
                          setPaymentOrderTotal(order.total_price);
                          setShowQrCode(false);
                          setShowPaymentModal(true);
                        }}
                      >
                        Pay Now
                      </button>
                    )}
                    {order.status === "Pending" ? (
                      <button
                        className="w-full brand-btn-3d brand-btn-red px-3 py-1.5"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <></>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-8 text-center text-slate-500" colSpan="8">No orders found yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold">Choose Payment Method</h2>
              <p className="mb-4 text-sm text-gray-600">
                Order #{paymentOrderId} | Total (incl. 18% GST): Rs. {(paymentOrderTotal * 1.18).toFixed(2)}
              </p>
              
              {!showQrCode ? (
                <div className="flex flex-col gap-3">
                  <button
                    className="brand-btn-3d brand-btn-green px-4 py-3"
                    onClick={() => setShowQrCode(true)}
                  >
                    Pay Online (UPI QR)
                  </button>
                  <button
                    className="rounded border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                    onClick={async () => {
                      try {
                        await api.post(`/orders/${paymentOrderId}/chat`, {
                          message: "I have opted to pay Offline at the store."
                        });
                        setMessage("Offline payment selected. The admin has been notified. Please pay at the store.");
                        setShowPaymentModal(false);
                      } catch (err) {
                        setMessage("Offline payment selected, but failed to automatically notify admin.");
                        setShowPaymentModal(false);
                      }
                    }}
                  >
                    Pay Offline (Cash / Admin)
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="mb-3 text-center text-sm font-semibold text-gray-700">Scan this QR Code with any UPI App (GPay, PhonePe, Paytm)</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=limbanibhargavmaheshbhai-1@okhdfcbank&pn=Jay%20Jalaram%20Packaging&am=${(paymentOrderTotal * 1.18).toFixed(2)}&cu=INR`)}`} 
                    alt="UPI QR Code" 
                    className="brand-tile mb-4 h-56 w-56 p-2"
                  />
                  <button
                    className="brand-btn-3d brand-btn-blue mt-2 w-full px-4 py-2"
                    onClick={async () => {
                      try {
                        await api.post("/payments/self-report", {
                          order_id: paymentOrderId,
                          amount: (paymentOrderTotal * 1.18).toFixed(2)
                        });
                        setMessage("Payment successful! Your order is now Paid.");
                        setShowPaymentModal(false);
                        fetchMyOrders();
                      } catch(err) {
                        setMessage("Failed to record payment.");
                      }
                    }}
                  >
                    I have completed the payment
                  </button>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
