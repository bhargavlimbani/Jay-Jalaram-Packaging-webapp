import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { Bar } from "react-chartjs-2";
import api from "../services/api";
import { defaultBranding, defaultHome } from "../utils/siteSettingsDefaults";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ..
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const [productTypes, setProductTypes] = useState([]);
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_IMAGE_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "svg",
    "avif",
    "jfif",
  ];
  const formatContactLines = (items) =>
    Array.isArray(items)
      ? items
          .map((item) => `${item.name || ""}|${item.phone || ""}`.trim())
          .filter((line) => line !== "|")
          .join("\n")
      : "";
  const formatStatsLines = (items) =>
    Array.isArray(items)
      ? items
          .map((item) => `${item.value || ""}|${item.label || ""}`.trim())
          .filter((line) => line !== "|")
          .join("\n")
      : "";
  const formatCollectionLines = (items) =>
    Array.isArray(items)
      ? items
          .map((item) => `${item.title || ""}|${item.text || ""}`.trim())
          .filter((line) => line !== "|")
          .join("\n")
      : "";

  const parseLines = (value) =>
    (value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const parsePairLines = (value) =>
    parseLines(value).map((line) => {
      const [left, ...rest] = line.split("|");
      return { left: (left || "").trim(), right: rest.join("|").trim() };
    });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [openChatOrderId, setOpenChatOrderId] = useState(null);
  const [productForm, setProductForm] = useState({
    box_type: "corrugated-box",
    name: "",
    description: "",
    image_data: "",
    price: "",
    stock: "",
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    name: "",
    unit: "kg",
    quantity: "",
    unit_price: "",
  });
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("customers");
  const [loadingOrderActionId, setLoadingOrderActionId] = useState(null);
  const [brandingForm, setBrandingForm] = useState(defaultBranding);
  const [homeForm, setHomeForm] = useState({
    heroKicker: defaultHome.heroKicker,
    heroTitle: defaultHome.heroTitle,
    heroSubtitle: defaultHome.heroSubtitle,
    primaryCtaLabel: defaultHome.primaryCtaLabel,
    secondaryCtaLabel: defaultHome.secondaryCtaLabel,
    statsText: formatStatsLines(defaultHome.stats),
    featureTitle: defaultHome.featureTitle,
    featureDescription: defaultHome.featureDescription,
    collectionText: formatCollectionLines(defaultHome.collectionItems),
    benefitsTitle: defaultHome.benefitsTitle,
    benefitsText: defaultHome.benefitsPoints.join("\n"),
    footerKicker: defaultHome.footerKicker,
    footerTitle: defaultHome.footerTitle,
    footerSubtitle: defaultHome.footerSubtitle,
    contactsText: formatContactLines(defaultHome.contacts),
    addressText: defaultHome.addressText,
    addressLink: defaultHome.addressLink,
  });

  const fallbackBoxTypes = [
    { label: "Carton Box", value: "carton-box" },
    { label: "Corrugated Box", value: "corrugated-box" },
    { label: "Printed Corrugated Box", value: "printed-corrugated-box" },
    { label: "Duplex Box", value: "duplex-box" },
  ];

  const boxTypeOptions =
    productTypes.length > 0
      ? productTypes.map((type) => ({ label: type.label, value: type.value }))
      : fallbackBoxTypes;

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
        },
      ];
    }

    return [];
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders");
      const data = res.data;
      setOrders(Array.isArray(data) ? data : Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.log(error);
      setOrders([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  }, []);

  const fetchProductTypes = useCallback(async () => {
    try {
      const res = await api.get("/product-types");
      setProductTypes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      setProductTypes([]);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setCustomers([]);
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await api.get("/materials");
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      setMaterials([]);
    }
  }, []);

  const fetchSiteSettings = useCallback(async () => {
    try {
      const res = await api.get("/site-settings");
      const branding = res.data?.branding || defaultBranding;
      const home = res.data?.home || defaultHome;
      setBrandingForm({ ...defaultBranding, ...branding });
      setHomeForm({
        heroKicker: home.heroKicker || defaultHome.heroKicker,
        heroTitle: home.heroTitle || defaultHome.heroTitle,
        heroSubtitle: home.heroSubtitle || defaultHome.heroSubtitle,
        primaryCtaLabel: home.primaryCtaLabel || defaultHome.primaryCtaLabel,
        secondaryCtaLabel: home.secondaryCtaLabel || defaultHome.secondaryCtaLabel,
        statsText: formatStatsLines(home.stats || defaultHome.stats),
        featureTitle: home.featureTitle || defaultHome.featureTitle,
        featureDescription: home.featureDescription || defaultHome.featureDescription,
        collectionText: formatCollectionLines(
          home.collectionItems || defaultHome.collectionItems
        ),
        benefitsTitle: home.benefitsTitle || defaultHome.benefitsTitle,
        benefitsText: (home.benefitsPoints || defaultHome.benefitsPoints).join(
          "\n"
        ),
        footerKicker: home.footerKicker || defaultHome.footerKicker,
        footerTitle: home.footerTitle || defaultHome.footerTitle,
        footerSubtitle: home.footerSubtitle || defaultHome.footerSubtitle,
        contactsText: formatContactLines(home.contacts || defaultHome.contacts),
        addressText: home.addressText || defaultHome.addressText,
        addressLink: home.addressLink || defaultHome.addressLink,
      });
    } catch (error) {
      console.log(error);
      setBrandingForm(defaultBranding);
      setHomeForm({
        heroKicker: defaultHome.heroKicker,
        heroTitle: defaultHome.heroTitle,
        heroSubtitle: defaultHome.heroSubtitle,
        primaryCtaLabel: defaultHome.primaryCtaLabel,
        secondaryCtaLabel: defaultHome.secondaryCtaLabel,
        statsText: formatStatsLines(defaultHome.stats),
        featureTitle: defaultHome.featureTitle,
        featureDescription: defaultHome.featureDescription,
        collectionText: formatCollectionLines(defaultHome.collectionItems),
        benefitsTitle: defaultHome.benefitsTitle,
        benefitsText: defaultHome.benefitsPoints.join("\n"),
        footerKicker: defaultHome.footerKicker,
        footerTitle: defaultHome.footerTitle,
        footerSubtitle: defaultHome.footerSubtitle,
        contactsText: formatContactLines(defaultHome.contacts),
        addressText: defaultHome.addressText,
        addressLink: defaultHome.addressLink,
      });
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchProductTypes();
    fetchCustomers();
    fetchMaterials();
    fetchSiteSettings();
  }, [
    fetchOrders,
    fetchProducts,
    fetchProductTypes,
    fetchCustomers,
    fetchMaterials,
    fetchSiteSettings,
  ]);

  const addProductType = async () => {
    const label = newTypeLabel.trim();
    if (!label) {
      setMessage("Please enter a product type name.");
      return;
    }
    try {
      await api.post("/product-types", { label });
      setNewTypeLabel("");
      setMessage("Product type added successfully.");
      fetchProductTypes();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to add product type.");
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to load customer details.");
        return;
      }
      setSelectedCustomer(data);
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while loading customer details.");
    }
  };

  const fetchOrderChat = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/chat`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to load chat.");
        return;
      }
      setChatMessages((prev) => ({ ...prev, [orderId]: data.messages || [] }));
      setOpenChatOrderId((prev) => (prev === orderId ? null : orderId));
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while loading chat.");
    }
  };

  const sendChatMessage = async (orderId) => {
    try {
      const text = chatInputs[orderId] || "";
      if (!text.trim()) {
        setMessage("Please write a chat message before sending.");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to send chat message.");
        return;
      }
      setChatInputs((prev) => ({ ...prev, [orderId]: "" }));
      setChatMessages((prev) => ({ ...prev, [orderId]: data.messages || [] }));
      setMessage("Chat message sent successfully.");
      fetchOrders();
      if (selectedCustomer?.id) {
        fetchCustomerDetails(selectedCustomer.id);
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while sending the chat message.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setLoadingOrderActionId(id);
      const res = await api.put(`/orders/${id}/status`, { status });
      setMessage(res.data?.message || `Order ${status.toLowerCase()} successfully.`);
      fetchOrders();
      fetchProducts();
      fetchCustomers();
      await fetchOrderChat(id);
      if (selectedCustomer?.id) {
        fetchCustomerDetails(selectedCustomer.id);
      }
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Something went wrong while updating order status.");
    } finally {
      setLoadingOrderActionId(null);
    }
  };

  const generateInvoice = async (orderId) => {
    try {
      setLoadingOrderActionId(orderId);
      await api.post(`/invoices/order/${orderId}`);
      setMessage("Invoice generated successfully.");
      await fetchOrders();
      if (selectedCustomer?.id) {
        await fetchCustomerDetails(selectedCustomer.id);
      }
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to generate invoice.");
    } finally {
      setLoadingOrderActionId(null);
    }
  };

  const resetForm = () => {
    setProductForm({
      box_type: "corrugated-box",
      name: "",
      description: "",
      image_data: "",
      price: "",
      stock: "",
    });
    setEditingProductId(null);
  };

  const resetMaterialForm = () => {
    setMaterialForm({
      name: "",
      unit: "kg",
      quantity: "",
      unit_price: "",
    });
    setEditingMaterialId(null);
  };

  const handleMaterialSelect = (event) => {
    const selectedId = event.target.value;
    if (!selectedId) {
      resetMaterialForm();
      return;
    }
    const selectedMaterial = materials.find(
      (material) => String(material.id) === String(selectedId)
    );
    if (!selectedMaterial) {
      return;
    }
    setEditingMaterialId(selectedMaterial.id);
    setMaterialForm({
      name: selectedMaterial.name || "",
      unit: selectedMaterial.unit || "kg",
      quantity: selectedMaterial.quantity ?? "",
      unit_price: selectedMaterial.unit_price ?? "",
    });
  };

  const addNewMaterial = async () => {
    const name = newMaterialName.trim();
    if (!name) {
      setMessage("Please enter a material name.");
      return;
    }
    try {
      const res = await api.post("/materials", {
        name,
        unit: "kg",
        quantity: 0,
        unit_price: 0,
      });
      const created = res.data;
      setMessage("Material added successfully.");
      setNewMaterialName("");
      await fetchMaterials();
      if (created?.id) {
        setEditingMaterialId(created.id);
        setMaterialForm({
          name: created.name || name,
          unit: created.unit || "kg",
          quantity: created.quantity ?? "",
          unit_price: created.unit_price ?? "",
        });
      }
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to add material.");
    }
  };

  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setProductForm((prev) => ({ ...prev, image_data: "" }));
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const isImageMime = file.type.startsWith("image/");
    const isAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension);

    if (!isImageMime && !isAllowedExtension) {
      setMessage("Please upload a valid image file for product photo.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setMessage("Product image size must be 10 MB or smaller.");
      setProductForm((prev) => ({ ...prev, image_data: "" }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProductForm((prev) => ({ ...prev, image_data: reader.result }));
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleBrandLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setBrandingForm((prev) => ({ ...prev, logoData: "" }));
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const isImageMime = file.type.startsWith("image/");
    const isAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension);

    if (!isImageMime && !isAllowedExtension) {
      setMessage("Please upload a valid image file for the logo.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setMessage("Logo image size must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBrandingForm((prev) => ({ ...prev, logoData: reader.result }));
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const saveBrandingSettings = async () => {
    try {
      const payload = {
        companyName: brandingForm.companyName?.trim() || defaultBranding.companyName,
        kicker: brandingForm.kicker?.trim() || defaultBranding.kicker,
        description: brandingForm.description?.trim() || defaultBranding.description,
        logoData: brandingForm.logoData || "",
        logoAlt: brandingForm.logoAlt?.trim() || defaultBranding.logoAlt,
      };
      const res = await api.put("/site-settings/branding", payload);
      setBrandingForm({ ...defaultBranding, ...(res.data?.data || payload) });
      setMessage("Branding settings updated successfully.");
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to update branding settings.");
    }
  };

  const saveHomeSettings = async () => {
    try {
      const stats = parsePairLines(homeForm.statsText).filter(
        (item) => item.left && item.right
      );
      const collectionItems = parsePairLines(homeForm.collectionText).filter(
        (item) => item.left && item.right
      );
      const contacts = parsePairLines(homeForm.contactsText).filter(
        (item) => item.left && item.right
      );

      const payload = {
        heroKicker: homeForm.heroKicker?.trim() || defaultHome.heroKicker,
        heroTitle: homeForm.heroTitle?.trim() || defaultHome.heroTitle,
        heroSubtitle: homeForm.heroSubtitle?.trim() || defaultHome.heroSubtitle,
        primaryCtaLabel: homeForm.primaryCtaLabel?.trim() || defaultHome.primaryCtaLabel,
        secondaryCtaLabel:
          homeForm.secondaryCtaLabel?.trim() || defaultHome.secondaryCtaLabel,
        stats: stats.map((item) => ({ value: item.left, label: item.right })),
        featureTitle: homeForm.featureTitle?.trim() || defaultHome.featureTitle,
        featureDescription:
          homeForm.featureDescription?.trim() || defaultHome.featureDescription,
        collectionItems: collectionItems.map((item) => ({
          title: item.left,
          text: item.right,
        })),
        benefitsTitle: homeForm.benefitsTitle?.trim() || defaultHome.benefitsTitle,
        benefitsPoints: parseLines(homeForm.benefitsText),
        footerKicker: homeForm.footerKicker?.trim() || defaultHome.footerKicker,
        footerTitle: homeForm.footerTitle?.trim() || defaultHome.footerTitle,
        footerSubtitle: homeForm.footerSubtitle?.trim() || defaultHome.footerSubtitle,
        contacts: contacts.map((item) => ({ name: item.left, phone: item.right })),
        addressText: homeForm.addressText?.trim() || defaultHome.addressText,
        addressLink: homeForm.addressLink?.trim() || defaultHome.addressLink,
      };

      const res = await api.put("/site-settings/home", payload);
      setHomeForm({
        heroKicker: payload.heroKicker,
        heroTitle: payload.heroTitle,
        heroSubtitle: payload.heroSubtitle,
        primaryCtaLabel: payload.primaryCtaLabel,
        secondaryCtaLabel: payload.secondaryCtaLabel,
        statsText: formatStatsLines(payload.stats),
        featureTitle: payload.featureTitle,
        featureDescription: payload.featureDescription,
        collectionText: formatCollectionLines(payload.collectionItems),
        benefitsTitle: payload.benefitsTitle,
        benefitsText: payload.benefitsPoints.join("\n"),
        footerKicker: payload.footerKicker,
        footerTitle: payload.footerTitle,
        footerSubtitle: payload.footerSubtitle,
        contactsText: formatContactLines(payload.contacts),
        addressText: payload.addressText,
        addressLink: payload.addressLink,
      });
      setMessage(res.data?.message || "Home settings updated successfully.");
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to update home settings.");
    }
  };

  const saveProduct = async () => {
    try {
      const url = editingProductId
        ? `http://localhost:5000/api/products/${editingProductId}`
        : "http://localhost:5000/api/products";
      const method = editingProductId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(productForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(data?.message || data?.error || `Unable to save product. (${res.status})`);
        return;
      }
      setMessage(editingProductId ? "Product updated successfully." : "Product added successfully.");
      resetForm();
      fetchProducts();
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while saving the product.");
    }
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      box_type: product.box_type || "corrugated-box",
      name: product.name || "",
      description: product.description || "",
      image_data: product.image_data || "",
      price: product.price || "",
      stock: product.stock || "",
    });
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to delete product.");
        return;
      }
      setMessage("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while deleting the product.");
    }
  };

  const saveMaterial = async () => {
    try {
      if (!editingMaterialId) {
        setMessage("Please select a material to update.");
        return;
      }
      const payload = {
        name: materialForm.name.trim(),
        unit: materialForm.unit.trim() || "kg",
        quantity: materialForm.quantity,
        unit_price: materialForm.unit_price,
      };

      if (!payload.name) {
        setMessage("Please select a material name.");
        return;
      }

      await api.put(`/materials/${editingMaterialId}`, payload);
      setMessage("Material updated successfully.");

      resetMaterialForm();
      fetchMaterials();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to save material.");
    }
  };

  const startEditMaterial = (material) => {
    setEditingMaterialId(material.id);
    setMaterialForm({
      name: material.name || "",
      unit: material.unit || "kg",
      quantity: material.quantity ?? "",
      unit_price: material.unit_price ?? "",
    });
  };

  const deleteMaterial = async (id) => {
    try {
      await api.delete(`/materials/${id}`);
      setMessage("Material deleted successfully.");
      if (editingMaterialId === id) {
        resetMaterialForm();
      }
      fetchMaterials();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to delete material.");
    }
  };

  const pending = orders.filter((order) => order.status === "Pending").length;
  const accepted = orders.filter((order) => order.status === "Accepted").length;
  const rejected = orders.filter((order) => order.status === "Rejected").length;

  const chartData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        label: "Orders",
        data: [pending, accepted, rejected],
        backgroundColor: ["orange", "green", "red"],
      },
    ],
  };

  const totalSales = Array.isArray(orders)
    ? orders
        .filter((order) => order.status === "Completed")
        .reduce((sum, order) => sum + Number(order.total_price || 0), 0)
    : 0;

  const totalMaterialValue = Array.isArray(materials)
    ? materials.reduce(
        (sum, material) =>
          sum + Number(material.quantity || 0) * Number(material.unit_price || 0),
        0
      )
    : 0;

  const viewPdf = (fileData, fileName) => {
    const pdfWindow = window.open("", "_blank");

    if (!pdfWindow) {
      setMessage("Popup blocked. Please allow popups to view the PDF.");
      return;
    }

    pdfWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${fileName || "Design PDF"}</title>
          <style>
            html, body { margin: 0; height: 100%; background: #111827; }
            iframe { border: 0; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <iframe src="${fileData}" title="${fileName || "Design PDF"}"></iframe>
        </body>
      </html>
    `);
    pdfWindow.document.close();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
          placeholder="Type message to customer"
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

  const renderOrdersTable = (ordersToRender, title, emptyMessage, showActionButtons = true) => (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="mb-2 w-full border bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Customer</th>
              <th className="border p-2">Date & Time</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total Price</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Chat</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {ordersToRender.length > 0 ? (
              ordersToRender.map((order) => (
                <tr key={order.id}>
                  <td className="border p-2 align-top">{order.User?.name || "Customer"}</td>
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
                    {order.customer_reply && (
                      <p className="mb-2 text-sm text-blue-700">Customer reply: {order.customer_reply}</p>
                    )}
                    {order.design_file_data && (
                      <div className="mt-2 text-sm">
                        <button
                          type="button"
                          className="mr-3 text-blue-700 underline"
                          onClick={() =>
                            viewPdf(order.design_file_data, order.design_file_name)
                          }
                        >
                          View PDF
                        </button>
                        <a
                          className="text-blue-700 underline"
                          href={order.design_file_data}
                          download={order.design_file_name || "design.pdf"}
                        >
                          Download PDF
                        </a>
                      </div>
                    )}
                    {renderChatPanel(order.id)}
                    {order.Invoice && (
                      <div className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        Invoice: {order.Invoice.invoice_number}
                        {order.Invoice.is_shared_with_customer ? " (Shared)" : " (Not Shared)"}
                      </div>
                    )}
                  </td>
                  <td className="border p-2 align-top">
                    {showActionButtons ? (
                      <select
                        className="w-full rounded border px-3 py-2 text-sm"
                        defaultValue=""
                        onChange={(event) => {
                          const action = event.target.value;
                          event.target.value = "";
                          if (!action) return;
                          if (action === "chat") fetchOrderChat(order.id);
                          if (action === "accept") updateStatus(order.id, "Accepted");
                          if (action === "complete") updateStatus(order.id, "Completed");
                          if (action === "invoice") generateInvoice(order.id);
                          if (action === "reject") updateStatus(order.id, "Rejected");
                        }}
                      >
                        <option value="" disabled>
                          Select Action
                        </option>
                        <option value="chat">Open Chat</option>
                        <option
                          value="accept"
                          disabled={
                            loadingOrderActionId === order.id ||
                            order.status === "Accepted" ||
                            order.status === "Completed"
                          }
                        >
                          Accept
                        </option>
                        <option
                          value="complete"
                          disabled={
                            loadingOrderActionId === order.id || order.status !== "Accepted"
                          }
                        >
                          Complete Order
                        </option>
                        <option
                          value="invoice"
                          disabled={
                            loadingOrderActionId === order.id ||
                            order.status !== "Completed" ||
                            Boolean(order.Invoice)
                          }
                        >
                          Make Invoice
                        </option>
                        <option
                          value="reject"
                          disabled={
                            loadingOrderActionId === order.id ||
                            order.status === "Rejected" ||
                            order.status === "Completed"
                          }
                        >
                          Reject
                        </option>
                      </select>
                    ) : (
                      <span className="text-sm text-slate-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="border p-4 text-center" colSpan="8">{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-3 text-3xl font-bold">Admin Dashboard</h1>
          {message && <div className="mb-6 rounded bg-blue-100 px-4 py-3 text-blue-900">{message}</div>}
          <div className="mb-6 rounded bg-green-500 p-4 text-white">Total Sales: Rs. {totalSales}</div>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="rounded bg-blue-500 p-4 text-white">Total Orders: {orders.length}</div>
            <div className="rounded bg-cyan-500 p-4 text-white">Total Customers: {customers.length}</div>
            <div className="rounded bg-yellow-500 p-4 text-white">Pending: {pending}</div>
            <div className="rounded bg-green-500 p-4 text-white">Accepted: {accepted}</div>
            <div className="rounded bg-red-500 p-4 text-white">Rejected: {rejected}</div>
            <div className="rounded bg-indigo-500 p-4 text-white">
              Material Value: Rs. {Number(totalMaterialValue.toFixed(2))}
            </div>
          </div>
          <div className="w-full max-w-xl">
            <Bar data={chartData} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-72">
            <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-sm lg:sticky lg:top-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Menu
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  className={`w-full rounded-lg px-4 py-3 text-left transition ${
                    activeSection === "orders" ? "bg-white text-slate-900" : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveSection("orders")}
                >
                  Customer Orders
                </button>
                <button
                  type="button"
                  className={`w-full rounded-lg px-4 py-3 text-left transition ${
                    activeSection === "customers" ? "bg-white text-slate-900" : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveSection("customers")}
                >
                  All Customers
                </button>
                <button
                  type="button"
                  className={`w-full rounded-lg px-4 py-3 text-left transition ${
                    activeSection === "products" ? "bg-white text-slate-900" : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveSection("products")}
                >
                  Product Management
                </button>
                <button
                  type="button"
                  className={`w-full rounded-lg px-4 py-3 text-left transition ${
                    activeSection === "materials" ? "bg-white text-slate-900" : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveSection("materials")}
                >
                  Material Stock
                </button>
                <button
                  type="button"
                  className={`w-full rounded-lg px-4 py-3 text-left transition ${
                    activeSection === "site-settings"
                      ? "bg-white text-slate-900"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveSection("site-settings")}
                >
                  Site Settings
                </button>
                <Link
                  to="/invoices"
                  className="block w-full rounded-lg px-4 py-3 text-left transition bg-slate-800 hover:bg-slate-700"
                >
                  Invoice Management
                </Link>
                <button
                  type="button"
                  className="w-full rounded-lg bg-red-600 px-4 py-3 text-left text-white transition hover:bg-red-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {activeSection === "orders" && (
              renderOrdersTable(orders, "Customer Orders", "No customer orders found.")
            )}

            {activeSection === "customers" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">All Customers</h2>
                <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {customers.length > 0 ? customers.map((customer) => (
                    <button key={customer.id} className="rounded-xl border bg-white p-5 text-left shadow-sm hover:border-blue-400" onClick={() => fetchCustomerDetails(customer.id)}>
                      <h3 className="text-lg font-semibold">{customer.name}</h3>
                      <p className="mt-1 text-sm text-gray-700">{customer.email}</p>
                      <p className="mt-1 text-sm text-gray-700">{customer.phone || "No phone"}</p>
                    </button>
                  )) : <div className="rounded border bg-white p-4">No customers found.</div>}
                </div>
                {selectedCustomer && (
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-2xl font-bold">{selectedCustomer.name}</h3>
                    <p className="mt-2 text-sm text-gray-700">Email: {selectedCustomer.email}</p>
                    <p className="mt-1 text-sm text-gray-700">Phone: {selectedCustomer.phone || "-"}</p>
                    <p className="mt-1 text-sm text-gray-700">Address: {selectedCustomer.address || "-"}</p>
                    <h4 className="mb-3 mt-6 text-xl font-semibold">Customer Order History</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border bg-white">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border p-2">Order ID</th>
                            <th className="border p-2">Product</th>
                            <th className="border p-2">Quantity</th>
                            <th className="border p-2">Total Price</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Chat Summary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCustomer.Orders?.length > 0 ? selectedCustomer.Orders.map((order) => (
                            <tr key={order.id}>
                              <td className="border p-2">{order.id}</td>
                              <td className="border p-2">
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
                              <td className="border p-2">{order.quantity}</td>
                              <td className="border p-2">Rs. {order.total_price}</td>
                              <td className="border p-2">{order.status}</td>
                              <td className="border p-2">
                                {order.admin_comment || "-"}
                                {order.customer_reply && <p className="mt-2 text-sm text-blue-700">Customer reply: {order.customer_reply}</p>}
                                {order.design_file_data && (
                                  <div className="mt-2 text-sm">
                                    <button
                                      type="button"
                                      className="mr-3 text-blue-700 underline"
                                      onClick={() =>
                                        viewPdf(order.design_file_data, order.design_file_name)
                                      }
                                    >
                                      View PDF
                                    </button>
                                    <a
                                      className="text-blue-700 underline"
                                      href={order.design_file_data}
                                      download={order.design_file_name || "design.pdf"}
                                    >
                                      Download PDF
                                    </a>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )) : <tr><td className="border p-4 text-center" colSpan="6">No order history for this customer.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "products" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Product Management</h2>
                <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className="rounded border p-2"
                    placeholder="New product type name (e.g. Rigid Box)"
                    value={newTypeLabel}
                    onChange={(e) => setNewTypeLabel(e.target.value)}
                  />
                  <button
                    className="rounded bg-indigo-700 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-800"
                    onClick={addProductType}
                  >
                    Add Type
                  </button>
                </div>
                <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <select
                    className="rounded border p-2"
                    value={productForm.box_type}
                    onChange={(e) => setProductForm({ ...productForm, box_type: e.target.value })}
                  >
                    {boxTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input className="rounded border p-2" placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  <input className="rounded border p-2" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  <input className="rounded border p-2" type="file" accept="image/*" onChange={handleProductImageChange} />
                  <input className="rounded border p-2" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                  <input className="rounded border p-2" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                </div>
                <p className="mb-4 text-xs text-gray-500">
                  Upload product photo in common image formats. Maximum size: 10 MB.
                </p>
                {productForm.image_data && (
                  <div className="mb-4">
                    <img
                      src={productForm.image_data}
                      alt="Product preview"
                      className="h-24 w-24 rounded border object-cover"
                    />
                  </div>
                )}
                <div className="mb-6">
                  <button className="mr-2 rounded bg-green-600 px-4 py-2 text-white" onClick={saveProduct}>{editingProductId ? "Update Product" : "Add Product"}</button>
                  <button className="rounded bg-gray-500 px-4 py-2 text-white" onClick={resetForm}>Clear</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border bg-white">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">Photo</th>
                        <th className="border p-2">Box Type</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Stock</th>
                        <th className="border p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? products.map((product) => (
                        <tr key={product.id}>
                          <td className="border p-2">
                            {product.image_data ? (
                              <img
                                src={product.image_data}
                                alt={product.name}
                                className="h-14 w-14 rounded object-cover"
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="border p-2">
                            {boxTypeOptions.find((option) => option.value === product.box_type)?.label || "-"}
                          </td>
                          <td className="border p-2">{product.name}</td>
                          <td className="border p-2">{product.description || "-"}</td>
                          <td className="border p-2">Rs. {product.price}</td>
                          <td className="border p-2">{product.stock}</td>
                          <td className="border p-2">
                            <button className="mr-2 rounded bg-blue-600 px-3 py-1 text-white" onClick={() => startEdit(product)}>Edit</button>
                            <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => deleteProduct(product.id)}>Delete</button>
                          </td>
                        </tr>
                      )) : <tr><td className="border p-4 text-center" colSpan="7">No products found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === "materials" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Material Stock</h2>
                <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className="rounded border p-2"
                    placeholder="Add new material name (e.g. Paper Roll)"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                  />
                  <button
                    className="rounded bg-indigo-700 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-800"
                    onClick={addNewMaterial}
                  >
                    Add Material
                  </button>
                </div>
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  <select
                    className="rounded border p-2"
                    value={editingMaterialId ? String(editingMaterialId) : ""}
                    onChange={handleMaterialSelect}
                  >
                    <option value="">Select Existing Material</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded border p-2"
                    placeholder="Unit (kg)"
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                  />
                  <input
                    className="rounded border p-2"
                    placeholder="Quantity"
                    value={materialForm.quantity}
                    onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                  />
                  <input
                    className="rounded border p-2"
                    placeholder="Price per Unit"
                    value={materialForm.unit_price}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, unit_price: e.target.value })
                    }
                  />
                </div>
                <div className="mb-6">
                  <button
                    className="mr-2 rounded bg-green-600 px-4 py-2 text-white"
                    onClick={saveMaterial}
                  >
                    Update Material
                  </button>
                  <button
                    className="rounded bg-gray-500 px-4 py-2 text-white"
                    onClick={resetMaterialForm}
                  >
                    Clear
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border bg-white">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">Material</th>
                        <th className="border p-2">Unit</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Price / Unit</th>
                        <th className="border p-2">Total Value</th>
                        <th className="border p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.length > 0 ? (
                        materials.map((material) => (
                          <tr key={material.id}>
                            <td className="border p-2">{material.name}</td>
                            <td className="border p-2">{material.unit}</td>
                            <td className="border p-2">{material.quantity}</td>
                            <td className="border p-2">Rs. {material.unit_price}</td>
                            <td className="border p-2">
                              Rs. {Number(
                                (Number(material.quantity || 0) * Number(material.unit_price || 0)).toFixed(2)
                              )}
                            </td>
                            <td className="border p-2">
                              <button
                                className="mr-2 rounded bg-blue-600 px-3 py-1 text-white"
                                onClick={() => startEditMaterial(material)}
                              >
                                Edit
                              </button>
                              <button
                                className="rounded bg-red-600 px-3 py-1 text-white"
                                onClick={() => deleteMaterial(material.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border p-4 text-center" colSpan="6">
                            No materials found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === "site-settings" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Site Settings</h2>
                <div className="grid gap-6">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-xl font-semibold">Branding</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded border p-2"
                        placeholder="Company Name"
                        value={brandingForm.companyName || ""}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({
                            ...prev,
                            companyName: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Kicker"
                        value={brandingForm.kicker || ""}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({
                            ...prev,
                            kicker: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Logo Alt Text"
                        value={brandingForm.logoAlt || ""}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({
                            ...prev,
                            logoAlt: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        type="file"
                        accept="image/*"
                        onChange={handleBrandLogoChange}
                      />
                    </div>
                    <textarea
                      className="mt-3 w-full rounded border p-2"
                      rows="3"
                      placeholder="Short description"
                      value={brandingForm.description || ""}
                      onChange={(e) =>
                        setBrandingForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    {brandingForm.logoData && (
                      <div className="mt-4">
                        <img
                          src={brandingForm.logoData}
                          alt="Logo preview"
                          className="h-20 w-auto rounded border bg-white p-2"
                        />
                      </div>
                    )}
                    <div className="mt-4">
                      <button
                        className="rounded bg-indigo-700 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-800"
                        onClick={saveBrandingSettings}
                      >
                        Save Branding
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-xl font-semibold">Home Page</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded border p-2"
                        placeholder="Hero Kicker"
                        value={homeForm.heroKicker}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, heroKicker: e.target.value }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Hero Title"
                        value={homeForm.heroTitle}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, heroTitle: e.target.value }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Primary Button Label"
                        value={homeForm.primaryCtaLabel}
                        onChange={(e) =>
                          setHomeForm((prev) => ({
                            ...prev,
                            primaryCtaLabel: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Secondary Button Label"
                        value={homeForm.secondaryCtaLabel}
                        onChange={(e) =>
                          setHomeForm((prev) => ({
                            ...prev,
                            secondaryCtaLabel: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <textarea
                      className="mt-3 w-full rounded border p-2"
                      rows="3"
                      placeholder="Hero Subtitle"
                      value={homeForm.heroSubtitle}
                      onChange={(e) =>
                        setHomeForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                      }
                    />
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded border p-2"
                        placeholder="Featured Title"
                        value={homeForm.featureTitle}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, featureTitle: e.target.value }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Benefits Title"
                        value={homeForm.benefitsTitle}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, benefitsTitle: e.target.value }))
                        }
                      />
                    </div>
                    <textarea
                      className="mt-3 w-full rounded border p-2"
                      rows="2"
                      placeholder="Featured Description"
                      value={homeForm.featureDescription}
                      onChange={(e) =>
                        setHomeForm((prev) => ({
                          ...prev,
                          featureDescription: e.target.value,
                        }))
                      }
                    />
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <textarea
                        className="rounded border p-2"
                        rows="4"
                        placeholder="Stats list (Value|Label per line)"
                        value={homeForm.statsText}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, statsText: e.target.value }))
                        }
                      />
                      <textarea
                        className="rounded border p-2"
                        rows="4"
                        placeholder="Collection list (Title|Description per line)"
                        value={homeForm.collectionText}
                        onChange={(e) =>
                          setHomeForm((prev) => ({
                            ...prev,
                            collectionText: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <textarea
                      className="mt-3 w-full rounded border p-2"
                      rows="4"
                      placeholder="Benefits points (one per line)"
                      value={homeForm.benefitsText}
                      onChange={(e) =>
                        setHomeForm((prev) => ({ ...prev, benefitsText: e.target.value }))
                      }
                    />
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded border p-2"
                        placeholder="Footer Kicker"
                        value={homeForm.footerKicker}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, footerKicker: e.target.value }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Footer Title"
                        value={homeForm.footerTitle}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, footerTitle: e.target.value }))
                        }
                      />
                    </div>
                    <textarea
                      className="mt-3 w-full rounded border p-2"
                      rows="2"
                      placeholder="Footer Subtitle"
                      value={homeForm.footerSubtitle}
                      onChange={(e) =>
                        setHomeForm((prev) => ({ ...prev, footerSubtitle: e.target.value }))
                      }
                    />
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded border p-2"
                        placeholder="Address Text"
                        value={homeForm.addressText}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, addressText: e.target.value }))
                        }
                      />
                      <input
                        className="rounded border p-2"
                        placeholder="Address Link"
                        value={homeForm.addressLink}
                        onChange={(e) =>
                          setHomeForm((prev) => ({ ...prev, addressLink: e.target.value }))
                        }
                      />
                    </div>
                    <textarea
                      className="mt-3 w-full rounded border p-2"
                      rows="4"
                      placeholder="Contacts list (Name|Phone per line)"
                      value={homeForm.contactsText}
                      onChange={(e) =>
                        setHomeForm((prev) => ({ ...prev, contactsText: e.target.value }))
                      }
                    />
                    <div className="mt-4">
                      <button
                        className="rounded bg-indigo-700 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-800"
                        onClick={saveHomeSettings}
                      >
                        Save Home Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
