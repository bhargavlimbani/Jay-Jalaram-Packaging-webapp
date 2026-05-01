import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { getProfile } from "../services/authService";
import { Link } from "react-router-dom";
import api from "../services/api";

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
      <div className="mt-3 rounded border bg-slate-50 p-3">
        <div className="max-h-48 overflow-y-auto rounded border bg-white p-3">
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
          className="mt-3 w-full rounded border p-2 text-sm"
          rows="2"
          placeholder="Type message to admin"
          value={chatInputs[orderId] || ""}
          onChange={(e) =>
            setChatInputs((prev) => ({ ...prev, [orderId]: e.target.value }))
          }
        />
        <button
          className="mt-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          onClick={() => sendChatMessage(orderId)}
        >
          Send Chat
        </button>
      </div>
    ) : null;

  return (
    <div>
      <Navbar />
      <div className="p-10">

        <div className="mb-6 rounded border border-blue-200 bg-blue-50 px-4 py-4">
          <h2 className="text-xl font-semibold">Welcome, {user?.name || "Customer"}</h2>
          <p className="mt-1 text-sm text-gray-700">
            Email: {user?.email || "-"} | Phone: {user?.phone || "-"}
          </p>
        </div>
        {message && <div className="mb-6 rounded bg-blue-100 px-4 py-3 text-blue-900">{message}</div>}
        <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-green-900">Selected Products</h2>
              <p className="mt-1 text-sm text-green-800">
                Add multiple products, review your order, then confirm once to place it.
              </p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
              <p>Total Items: {cartQuantity}</p>
              <p className="mt-1 font-semibold">Estimated Total: Rs. {cartTotal.toFixed(2)}</p>
            </div>
          </div>
          {cartItems.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full rounded-lg bg-white">
                <thead>
                  <tr className="bg-green-100 text-left">
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3">Action</th>
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
                          className="w-24 rounded border px-3 py-2"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.product_id, e.target.value)}
                        />
                      </td>
                      <td className="p-3">Rs. {Number(item.total_price).toFixed(2)}</td>
                      <td className="p-3">
                        <button
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
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
                  className="rounded bg-green-600 px-5 py-3 text-white hover:bg-green-700 disabled:opacity-60"
                  onClick={placeCartOrder}
                  disabled={placingCartOrder}
                >
                  {placingCartOrder ? "Placing Order..." : "Confirm And Place Order"}
                </button>
                <button
                  className="rounded bg-gray-500 px-5 py-3 text-white hover:bg-gray-600"
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
        <h2 className="mb-4 text-2xl font-bold">All Products</h2>
        <div className="mb-6">
          <Link to="/order">
            <button className="rounded bg-green-600 px-5 py-3 text-white hover:bg-green-700">
              Custom Box Order
            </button>
          </Link>
          <Link to="/invoices" className="ml-3">
            <button className="rounded bg-[var(--brand-ink)] px-5 py-3 text-white hover:bg-black">
              View Invoices
            </button>
          </Link>
        </div>
        <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const isCustomProduct =
              product.name === "Custom Size Box" || product.name === "Custom Design Box";
            return (
              <div key={product.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <img
                  src={product.image_url
                    ? product.image_url
                    : product.image_data
                    ? product.image_data
                  : "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="mb-4 h-40 w-full rounded bg-gray-100 object-contain p-2"
                />
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{product.description || "Standard packaging product"}</p>
                {product.name === "Custom Size Box" && <p className="mt-2 text-sm text-blue-700">Use the custom box order form for custom size requirement.</p>}
                {product.name === "Custom Design Box" && <p className="mt-2 text-sm text-blue-700">Use the custom box order form for custom design requirement.</p>}
                <p className="mt-3 font-semibold text-green-700">Price: Rs. {product.price}</p>
                <p className="mt-1 text-sm text-gray-700">Stock: {product.stock}</p>
                <div className="mt-4 flex gap-3">
                  <input
                    type="number"
                    min="1"
                    className="w-24 rounded border px-3 py-2"
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      setQuantities((prev) => ({ ...prev, [product.id]: e.target.value }))
                    }
                    disabled={isCustomProduct}
                  />
                  {isCustomProduct ? (
                    <Link to="/order" className="flex-1">
                      <button className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Custom Box Order
                      </button>
                    </Link>
                  ) : (
                    <button
                      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                      onClick={() => addToCart(product)}
                      disabled={Number(product.stock) <= 0}
                    >
                      {Number(product.stock) > 0 ? "Add To Order" : "Out of Stock"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <h2 className="mb-4 text-2xl font-bold">My Order History</h2>
        <table className="w-full border bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Date & Time</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total Price</th>
              <th className="border p-2">Approval Status</th>
              <th className="border p-2">Chat</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="border p-2 align-top">{order.id}</td>
                  <td className="border p-2 align-top">{formatOrderDateTime(order.createdAt)}</td>
                  <td className="border p-2 align-top">
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
                  <td className="border p-2 align-top">{order.quantity}</td>
                  <td className="border p-2 align-top">Rs. {order.total_price}</td>
                  <td className="border p-2 align-top">{order.status}</td>
                  <td className="border p-2 align-top">
                    {renderChatPanel(order.id)}
                  </td>
                  <td className="border p-2 align-top">
                    <button
                      className="mb-2 rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                      onClick={() => fetchOrderChat(order.id)}
                    >
                      Chat
                    </button>
                    <br />
                    {order.status === "Pending" ? (
                      <button
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-4 text-center" colSpan="8">No orders found yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerDashboard;
